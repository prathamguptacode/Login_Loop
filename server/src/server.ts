import 'dotenv/config'
import { env } from './config/evn.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import questionRoute from './routes/questionRoute.js'
import history from './routes/history.js'
import userAuth from './routes/userAuth.js'

const app = express();
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
));
app.use(cookieParser());
app.use(express.json())
mongoose
    .connect(env.DBURL)
    .then(() => console.log('Connected to the database'));


app.get('/', (req: Request, res: Response) => {
    return res.json({ message: 'Hello world welcome to logic_loop' });
});

app.use(questionRoute)
app.use(history)
app.use(userAuth)

app.listen(env.PORT, () => console.log(`Server on PORT ${process.env.PORT}`));