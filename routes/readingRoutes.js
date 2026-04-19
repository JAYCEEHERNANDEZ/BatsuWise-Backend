import express from 'express';
import { recordReading } from '../controllers/readingController.js';

const router = express.Router();

router.post('/readings', recordReading);

export default router;