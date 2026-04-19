import express from 'express';
import {
  createLabResult,
  getLabResults
} from '../controllers/labController.js';

const router = express.Router();

// CREATE (multiple faucets)
router.post('/create', createLabResult);

// GET all results
router.get('/', getLabResults);

export default router;