import { extractTextFromImage } from '../utils/ocr.js';
import { extractReading } from '../utils/extractNumber.js';
import { uploadToSupabase } from '../utils/uploadImage.js';
import { insertReading, getLastReading } from '../models/readingModel.js';

export const ocrReading = async (req, res) => {
  try {
    const { submeter_id } = req.body;
    const file = req.file;

    if (!file || !submeter_id) {
      return res.status(400).json({
        message: 'Image and submeter_id required',
      });
    }

    // upload image
    const imageUrl = await uploadToSupabase(file);

    // OCR
    const text = await extractTextFromImage(file.buffer);

    // extract number
    const readingValue = extractReading(text);

    if (!readingValue) {
      return res.status(400).json({
        message: 'No valid number detected',
        raw_text: text,
      });
    }

    const previous = await getLastReading(submeter_id);

    if (readingValue < previous) {
      return res.status(400).json({
        message: 'Invalid reading (lower than previous)',
      });
    }

    const saved = await insertReading({
      submeter_id,
      reading_value: readingValue,
      image_url: imageUrl,
      created_at: new Date(),
    });

    res.json({
      message: 'OCR success',
      data: saved,
    });

  } catch (error) {
    console.log('OCR ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};