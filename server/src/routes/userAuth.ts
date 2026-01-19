import express from 'express';
import { getName, login, signUp, verify } from '../controller/userAuth.js';
const router = express.Router();

router.post('/signup', signUp);
router.post('/verify', verify);
router.post('/login', login);
router.post('/name', getName);

export default router;
