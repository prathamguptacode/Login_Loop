import { tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';

const getInfo = tool({
    name: 'get information',
    description:
        'this tool will give you detailed information on a broad topics (like pizza, italy,quantum_computing) from wikipedia. this tool is not 100% stable and sometimes do not provide results (never give spaces in parameter use underscore)',
    parameters: z.object({
        title: z.string().describe('never give space between the words'),
    }),
    execute: async ({ title }) => {
        const res=await axios.get(
            `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&titles=${title}&format=json`,
            {
                headers: {
                    Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyMWJhMzgxZGQ1NmNkMzVkN2I2ZjJmN2Y1NzY3N2UxNiIsImp0aSI6IjI5NjVkOTYzN2M1NWI2NWU4OWQ2OTMxM2JjNTQ3MTBlMzFmNmY4NDNlYWE3YmQxNDg4NDg4ZDJjZmZhOTEyY2U2OTZlZTk4MTU5ZjRlZDU1IiwiaWF0IjoxNzY4NzEyMzcyLjE5MjIxNCwibmJmIjoxNzY4NzEyMzcyLjE5MjIxOCwiZXhwIjozMzMyNTYyMTE3Mi4xODk2OTcsInN1YiI6IjgxOTMyODQwIiwiaXNzIjoiaHR0cHM6Ly9tZXRhLndpa2ltZWRpYS5vcmciLCJyYXRlbGltaXQiOnsicmVxdWVzdHNfcGVyX3VuaXQiOjUwMDAsInVuaXQiOiJIT1VSIn0sInNjb3BlcyI6WyJiYXNpYyJdfQ.UA402mJkFuc6SYCcybkGvF_3pXcDCSaVrQN5xJSA-7fgaxz-AvYKoKrMlbaH8u7O6Eq1CToPKTLT4G3G8hBEa2IoU-J08rgzGMWmmSGwkha7l6HIRgKYM1ZIigh9OB0wnM-CNfFTgDwjS53r4lFQXEiuBJDSEraqvCYK3SQjoEd96yWtgVk4OY3Y9vprSr-7isFAaS8FogoDQan5SjFDZGW9lcOxTZ4mUfI_Dh2ACRqfQdkWJ_iMIlo65_FsCCXXgKHTIIRex3IJ2dGZtS7FuCHOhaql5B24Zsygsut6g0QXgroFTezqcmhjmlL-1zEPAK6mBHGlIRSmRXJftC3tbnt4C1mKy9YMdIvHtP4ZBbJlUzH0kGPMA-jnqFB9zR6jxW5yDEkRqG0b2r2INjhtN8tklXKyfy46ALA2j1_6mrVrdemrWDQjpEYFhP3UzyPW1QS5n5XpjRFxRJR4AiCbg3RUTL07v___2_RUVmFsZdegLuU76ZQhGTCmM8AY9G2KBUnUZc7QAV43x0bHE4oVX_ScgeSoSHA4otXB2512r-Ecf2Z4BRJVuK7p3Z5HHJAs5JynLZT3A5jFd8hUSXgy5IwTTaXuaAWchSIxO_oFy9L5ZwgxXhaUnm1KnTfzZAGIsG5nSofa024JA2ViSH_Zfkzge8MB7yZegTnynGRsSvk`,
                    "User-Agent": "MySaaS/1.0 (prathamgupta.wk@gmail.com)"
                },
            },
        );
        return res
    },
});

export default getInfo