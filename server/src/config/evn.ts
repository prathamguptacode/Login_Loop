import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        PORT: z.string(),
        OPENAI_API_KEY: z.string(),
        DBURL: z.string(),
        EMAILPASS: z.string(),
    },
    runtimeEnv: process.env,
});
