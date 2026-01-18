import {
    InputGuardrailTripwireTriggered,
    OutputGuardrailTripwireTriggered,
    run,
    user,
    type AgentInputItem,
} from '@openai/agents';

import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { codingAgent } from '../agent/codingAgent.js';
import { env } from '../config/evn.js';

async function askQuestion(req: Request, res: Response) {
    const question = req.body?.question;
    if (!question) {
        return res.status(400).json({ message: 'question not found' });
    }

    let history: AgentInputItem[] = [];
    const token = req.cookies?.tokenUserId;
    if (!req.cookies?.tokenUserId) {
        const tempUserId = crypto.randomUUID();
        const token = jwt.sign({ userId: tempUserId }, env.USERIDKEY, {
            expiresIn: '23h',
        });
        res.cookie('tokenUserId', token, { httpOnly: true });
        history.push(user(question));
    } else {
        try {
            const tokenVal = jwt.verify(token, env.USERIDKEY) as jwt.JwtPayload;
        } catch (error) {
            res.clearCookie('tokenUserId');
            return res
                .status(400)
                .json({ message: 'token corrupted and cookies cleared' });
        }
    }

    try {
        const result = await run(codingAgent, history);
        res.json({ result: result.finalOutput });
    } catch (error) {
        if (error instanceof InputGuardrailTripwireTriggered) {
            return res.json({ result: error.result.output.outputInfo });
        } else if (error instanceof OutputGuardrailTripwireTriggered) {
            return res.json({ result: error.result.output.outputInfo });
        } else {
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }
}

export default askQuestion;
