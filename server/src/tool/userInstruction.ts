import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import type { userInstructionT } from '../context/context.js';

export const userInstruction = tool({
    name: 'user instructions',
    description:
        'this tool returns the name and intructions(given by user) of the user',
    parameters: z.object({}),
    execute: async (
        _args,
        runContext?: RunContext<userInstructionT>,
    ): Promise<string> => {
        return `user name is ${runContext?.context.name} and his speacial instructions are ${runContext?.context.instruction}`;
    },
});
