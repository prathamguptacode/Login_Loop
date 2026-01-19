import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/evn.js';
import messages from '../model/messages.js';
async function getHistory(req: Request, res: Response) {
    const userTokenCookie = req.cookies.userToken;
    if (!userTokenCookie) {
        return res.status(400).json({ message: 'no history found' });
    }
    try {
        const userToken = jwt.verify(
            userTokenCookie,
            env.USERIDTOKEN,
        ) as jwt.JwtPayload;
        const userId = userToken.userId;
        const userMessage=await messages.find({userId: userId},{userId: 1, coversation: 1})
        return res.json(userMessage)
    } catch (error) {
        res.clearCookie('userToken');
        return res.status(403).json({ message: 'token got corrupted' });
    }
}

export default getHistory
