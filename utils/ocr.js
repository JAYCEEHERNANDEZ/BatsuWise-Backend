import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (buffer) => {
  const result = await Tesseract.recognize(buffer, 'eng');
  return result.data.text;
};