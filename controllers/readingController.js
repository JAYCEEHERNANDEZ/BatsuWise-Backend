import { insertReading, getLastReading } from '../models/readingModel.js';

export const recordReading = async (req, res) => {
  try {
    const { submeter_id, reading_value, image_url } = req.body;

    if (!submeter_id || !reading_value) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const readingValue = Number(reading_value);

    const previous = await getLastReading(submeter_id);

    if (readingValue < previous) {
      return res.status(400).json({
        message: 'Reading cannot be lower than previous',
      });
    }

    const saved = await insertReading({
      submeter_id,
      reading_value: readingValue,
      image_url,
      created_at: new Date(),
    });

    res.json({
      message: 'Saved successfully',
      data: saved,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};