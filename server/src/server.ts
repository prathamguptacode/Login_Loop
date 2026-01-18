import 'dotenv/config'
import { env } from './config/evn.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { run } from '@openai/agents';
import { codingAgent } from './agent/codingAgent.js';

const app = express();
app.use(cors());
app.use(cookieParser());
mongoose
    .connect(env.DBURL)
    .then(() => console.log('Connected to the database'));


app.get('/', (req: Request, res: Response) => {
    return res.json({ message: 'Hello world welcome to logic_loop' });
});

app.listen(env.PORT, () => console.log(`Server on PORT ${process.env.PORT}`));


// const result = await run(codingAgent,'tell me the important concepts of c',{stream: true})

// result
//   .toTextStream({
//     compatibleWithNodeStreams: true,
//   })
//   .pipe(process.stdout);