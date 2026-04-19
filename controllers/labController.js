import {
  createLabResultModel,
  getLabResultsModel
} from '../models/labModel.js';

// =======================
// CREATE
// =======================
export const createLabResult = async (req, res) => {
  try {
    const { faucets, date_tested, date_released } = req.body;

    if (!faucets || !date_tested || !date_released) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    await createLabResultModel(faucets, date_tested, date_released);

    res.status(201).json({
      message: 'Lab results saved successfully'
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =======================
// GET ALL
// =======================
export const getLabResults = async (req, res) => {
  try {
    const data = await getLabResultsModel();

    res.json(data);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};