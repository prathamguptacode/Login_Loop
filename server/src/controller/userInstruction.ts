import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/evn.js';
import users from '../model/users.js';

async function userInstruction(req: Request, res: Response) {
    const instructions = req.body?.instructions;
    if (!instructions) {
        return res.status(400).json({ message: 'invalid input' });
    }
    const userTokenCookie = req.cookies.userToken;
    if (!userTokenCookie) {
        return res.status(400).json({ message: 'token not found' });
    }
    try {
        const userToken = jwt.verify(
            userTokenCookie,
            env.USERIDTOKEN,
        ) as jwt.JwtPayload;
        const userId = userToken.userId;
        await users.updateOne(
            { userId: userId },
            { instruction: instructions },
        );
        return res.json({ message: 'user instructions set' });
    } catch (error) {
        res.clearCookie('userToken');
        return res.status(403).json({ message: 'token corrupted' });
    }
}

