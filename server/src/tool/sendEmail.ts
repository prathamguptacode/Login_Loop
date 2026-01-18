import { tool } from '@openai/agents';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { env } from '../config/evn.js';

const sendEmailtool = tool({
    name: 'send email tool',
    description: 'this tool is used to send emails to the users',
    parameters: z.object({
        email: z
            .string()
            .email()
            .describe(
                'this is the email of the user to whom we want to send the email',
            ),
        subjectOfEmail: z.string().describe('this is the subject of the email'),
        text: z.string().describe('this is the body of the email'),
    }),
    execute: async ({ email, subjectOfEmail, text }) => {
        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'prathamgupta.wk@gmail.com',
                pass: env.EMAILPASS,
            },
        });

        let mailDetails = {
            from: 'prathamgupta.wk@gmail.com',
            to: email,
            subject: subjectOfEmail,
            text: text,
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                return 'Error Occurs';
            } else {
                return 'Email sent successfully';
            }
        });
    },
});

export default sendEmailtool
