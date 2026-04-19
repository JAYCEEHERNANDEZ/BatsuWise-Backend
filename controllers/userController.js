import {
  registerUserModel,
  loginUserModel,
  sendOtpModel,
  verifyOtpModel,
  updatePasswordModel
} from '../models/userModel.js';

// =======================
// REGISTER
// =======================
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const user = await registerUserModel({ email, password, name, role });

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =======================
// LOGIN
// =======================
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim().toLowerCase();

    const data = await loginUserModel({ email, password });

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =======================
// SEND OTP (SUPABASE)
// =======================
export const sendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    email = email.trim().toLowerCase();

    await sendOtpModel(email);

    res.json({ message: 'OTP sent to your email' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =======================
// VERIFY OTP (SUPABASE)
// =======================
export const verifyOtp = async (req, res) => {
  try {
    let { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    email = email.trim().toLowerCase();

    await verifyOtpModel(email, token);

    res.json({ message: 'OTP verified' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =======================
// UPDATE PASSWORD
// =======================
export const updatePassword = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    email = email.trim().toLowerCase();

    await updatePasswordModel(email, password);

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};