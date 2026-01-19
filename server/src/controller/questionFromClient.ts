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
import blockedUsers from '../model/blockedUsers.js';
import messages from '../model/messages.js';
import type { userInstructionT } from '../context/context.js';

async function askQuestion(req: Request, res: Response) {
    const question = req.body?.question;
    if (!question) {
        return res.status(400).json({ message: 'question not found' });
    }
    let session: OpenAIConversationsSession;
    let userId: string;

    let userContext: userInstructionT = {
        name: '',
        instruction: '',
    };

    const userTokenCookie = req.cookies.userToken;
    if (userTokenCookie) {
        try {
            const userToken = jwt.verify(
                userTokenCookie,
                env.USERIDTOKEN,
            ) as jwt.JwtPayload;
            userId = userToken.userId;
            const myUser = await user.findOne({ userId: userId });
            //blocking logic (start)
            const blockedUser = await blockedUsers.findOne({ userId: userId });
            if (blockedUser) {
                return res.status(403).json({
                    message:
                        'please buy subscription to continue or come after 24hr',
                });
            }
            if (myUser?.messageNumber && myUser?.messageNumber > 10) {
                const newBlockedUser = new blockedUsers({
                    userId: myUser?.userId,
                    conversationId: myUser?.conversationId,
                });
                await newBlockedUser.save();
                await user.updateOne({ userId: userId }, { messageNumber: 1 });
                return res.status(403).json({
                    message:
                        'please buy subscription to continue or come after 24hr',
                });
            }
            //blocking logic (end)
            if (myUser?.name && myUser.instruction) {
                userContext = {
                    name: myUser?.name,
                    instruction: myUser?.instruction,
                };
            }
            await user.updateOne(
                { userId: userId },
                { $inc: { messageNumber: 1 } },
            );
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
        userId = randomUserId;
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
        const result = await run(codingAgent, question, {
            session: session,
            context: userContext
        });
        const myMessage = new messages({
            userId: userId,
            coversation: {
                user: question,
                logicLoop: result.finalOutput,
            },
        });
        await myMessage.save();
        res.json({ result: result.finalOutput });
    } catch (error) {
        if (error instanceof InputGuardrailTripwireTriggered) {
            const myMessage = new messages({
                userId: userId,
                coversation: {
                    user: question,
                    logicLoop: error.result.output.outputInfo,
                },
            });
            await myMessage.save();
            return res.json({ result: error.result.output.outputInfo });
        } else if (error instanceof OutputGuardrailTripwireTriggered) {
            const myMessage = new messages({
                userId: userId,
                coversation: {
                    user: question,
                    logicLoop: error.result.output.outputInfo,
                },
            });
            await myMessage.save();
            return res.json({ result: error.result.output.outputInfo });
        } else {
            return res.status(500).json({ message: 'Something went wrong ' });
        }
    }
}

export default askQuestion;
