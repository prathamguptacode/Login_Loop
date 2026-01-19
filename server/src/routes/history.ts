import express from 'express'
import getHistory from '../controller/getHistory.js';
const router = express.Router();

router.get('/history',getHistory)

export default router