import {
    InputGuardrailTripwireTriggered,
    OutputGuardrailTripwireTriggered,
    run,
} from '@openai/agents';

import type { Request, Response } from 'express';
import { codingAgent } from '../agent/codingAgent.js';
import { env } from '../config/evn.js';

async function askQuestion(req: Request, res: Response) {
    const question = req.body?.question;
    if (!question) {
        return res.status(400).json({ message: 'question not found' });
    }
    
    try {
        const result = await run(codingAgent, question);
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
