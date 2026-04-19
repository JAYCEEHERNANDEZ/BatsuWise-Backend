import express from 'express';
import { ocrReading } from '../controllers/ocrController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/ocr', upload.single('image'), ocrReading);

export default router;