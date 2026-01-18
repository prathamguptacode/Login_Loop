import {
    InputGuardrailTripwireTriggered,
    OpenAIConversationsSession,
    OutputGuardrailTripwireTriggered,
    run,
} from '@openai/agents';

import type { Request, Response } from 'express';
import { codingAgent } from '../agent/codingAgent.js';
import { env } from '../config/evn.js';
import jwt from 'jsonwebtoken';
import user from '../model/users.js';

async function askQuestion(req: Request, res: Response) {
    const question = req.body?.question;
    if (!question) {
        return res.status(400).json({ message: 'question not found' });
    }
    let session: OpenAIConversationsSession;

    const userTokenCookie = req.cookies.userToken;
    if (userTokenCookie) {
        try {
            const userToken = jwt.verify(
                userTokenCookie,
                env.USERIDTOKEN,
            ) as jwt.JwtPayload;
            const userId = userToken.userId;
            const myUser = await user.findOne({ userId: userId });
            const coversationId = myUser?.conversationId;
            if (coversationId) {
                session = new OpenAIConversationsSession({
                    conversationId: coversationId,
                });
            } else {
                res.clearCookie('userToken');
                return res.status(500).json({ message: 'Try again' });
            }
        } catch (error) {
            res.clearCookie('userToken');
            return res.status(500).json({ message: 'Try again' });
        }
    } else {
        const randomUserId = crypto.randomUUID();
        const newUserToken = jwt.sign(
            { userId: randomUserId },
            env.USERIDTOKEN,
        );
        res.cookie('userToken', newUserToken, { httpOnly: true });
        session = new OpenAIConversationsSession();
        const conversationId = await session.getSessionId();
        const newUser = new user({
            userId: randomUserId,
            conversationId: conversationId,
        });
        await newUser.save();
    }

    try {
        const result = await run(codingAgent, question,{
            session: session
        });
        res.json({ result: result.finalOutput });
    } catch (error) {
        if (error instanceof InputGuardrailTripwireTriggered) {
            return res.json({ result: error.result.output.outputInfo });
        } else if (error instanceof OutputGuardrailTripwireTriggered) {
            return res.json({ result: error.result.output.outputInfo });
        } else {
            return res.status(500).json({ message: 'Something went wrong ' });
        }
    }
}

export default askQuestion;
