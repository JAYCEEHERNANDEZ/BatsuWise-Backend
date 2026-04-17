import express from 'express';
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  updatePassword
} from '../controllers/userController.js';

const router = express.Router();

// AUTH
router.post('/register', registerUser);
router.post('/login', loginUser);

// OTP RESET
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/update-password', updatePassword);

export default router;
