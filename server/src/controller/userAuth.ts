//login signup verify forgot
import type { Request, Response } from 'express';
import otpGenerator from 'otp-generator';
import brcypt from 'bcrypt';
import tempUser from '../model/tempUser.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/evn.js';
import user from '../model/users.js';
import { OpenAIConversationsSession } from '@openai/agents';
import nodemailer from 'nodemailer';

export async function signUp(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ message: 'req body not found' });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'invalid input' });
    }

    const myUser = await user.findOne({ email: email });
    if (myUser) {
        return res.status(400).json({ message: 'you already have a account' });
    }

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: true,
        digits: true,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    sendEmail(email, otp);
    const hashedPass = await brcypt.hash(password, 10);
    const newTempUser = new tempUser({
        name,
        email,
        password: hashedPass,
        otp,
    });
    await newTempUser.save();
    const emailToken = jwt.sign({ email }, env.EMAILTOKEN, {
        expiresIn: '10m',
    });
    return res.status(201).json({
        message: 'please verify your email (otp expires in 10m)',
        emailToken,
    });
}

const sendEmail = async (email: string, otp: string) => {
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'prathamgupta.wk@gmail.com',
            pass: env.EMAILPASS,
        },
    });

    let mailDetails = {
        from: 'prathamgupta.wk@gmail.com',
        to: email,
        subject: `Your OTP Verification Code is ${otp}`,
        text: `Thank you for signing up with us. To verify your email, please enter the following \n
One Time Password (OTP): ${otp}\n
This OTP is valid for 10 minutes from the receipt of this email.\n

Regards, \n
Logic Loop
`,
    };

    mailTransporter.sendMail(mailDetails);
};

export async function verify(req: Request, res: Response) {
    const otp = req.body?.otp;
    if (!otp) {
        return res.status(400).json({ message: 'invalid input' });
    }
    const authHeaders = req.headers?.authorization;
    if (!authHeaders) {
        return res.status(400).json({ message: 'headers not found' });
    }
    const emailToken = authHeaders.split(' ')[1];
    if (!emailToken) {
        return res
            .status(400)
            .json({ message: 'invalid format of authHeader' });
    }
    let email = '';
    try {
        const emailT = jwt.verify(emailToken, env.EMAILTOKEN) as jwt.JwtPayload;
        email = emailT.email;
    } catch (error) {
        return res.status(403).json({ message: 'token corrupted' });
    }
    const newTempUserArray = await tempUser
        .where('email')
        .equals(email)
        .sort({ createdAt: -1 });
    const newTempUser = newTempUserArray[0];
    if (!newTempUser) {
        return res.status(400).json({ message: 'user not found' });
    }
    if (otp == newTempUser.otp) {
        const userTokenCookie = req.cookies.userToken;
        if (userTokenCookie) {
            try {
                const userToken = jwt.verify(
                    userTokenCookie,
                    env.USERIDTOKEN,
                ) as jwt.JwtPayload;
                const userId = userToken.userId;
                await user.updateOne(
                    { userId: userId },
                    {
                        name: newTempUser.name,
                        email: newTempUser.email,
                        password: newTempUser.password,
                    },
                );
                return res.status(201).json({ message: 'account created' });
            } catch (error) {
                res.clearCookie('userToken');
                return res.status(500).json({ message: 'Try again' });
            }
        } else {
            try {
                const session = new OpenAIConversationsSession();
                const conversationId = await session.getSessionId();
                const userId = crypto.randomUUID();
                const newUser = new user({
                    name: newTempUser.name,
                    email: newTempUser.email,
                    password: newTempUser.password,
                    conversationId: conversationId,
                    userId: userId,
                });
                await newUser.save();
                return res.status(201).json({
                    message: 'account created',
                    name: newTempUser.name,
                });
            } catch (error) {
                return res
                    .status(500)
                    .json({ message: 'something went wrong' });
            }
        }
    } else {
        return res.status(400).json({ message: 'invalid OTP' });
    }
}

export async function login(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ message: 'req body not found' });
    }
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'invalid input' });
    }
    const myUser = await user.findOne({ email: email });
    if (!myUser) {
        res.status(403).json({ message: 'you do not have a account' });
    }
    if(!myUser?.password){
        return res.status(500).json({message: 'something went wrong'})
    }
    const result = brcypt.compareSync(password, myUser?.password);
    if (!result) {
        return res.status(403).json({ message: 'invalid password' });
    }
    const userToken = jwt.sign({ userId: myUser?.userId }, env.USERIDTOKEN);
    res.cookie('userToken', userToken, { httpOnly: true });
    return res.json({
        message: 'you signed in successfully',
        name: myUser?.name,
    });
}

export async function logout(req: Request, res: Response) {
    res.clearCookie('userToken');
    return res.json('logged out successfully');
}

export async function getName(req: Request, res: Response) {
    const userTokenCookie = req.cookies.userToken;
    if (!userTokenCookie) {
        return res.status(400).json({ message: 'name not found' });
    }
    try {
        const userToken = jwt.verify(
            userTokenCookie,
            env.USERIDTOKEN,
        ) as jwt.JwtPayload;
        const userId = userToken.userId;
        const myUser = await user.findOne({ userId });
        if (!myUser?.name) {
            return res.status(400).json({ message: 'name not found' });
        }
        return res.json({ message: 'success', name: myUser?.name });
    } catch (error) {
        res.clearCookie('userToken');
        return res.status(500).json({ message: 'Try again' });
    }
}
