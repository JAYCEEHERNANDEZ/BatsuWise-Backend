import { supabase } from '../config/supabase.js';
import sgMail from '@sendgrid/mail';
import bcrypt from 'bcryptjs';
import validator from 'validator';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// =======================
// REGISTER USER MODEL
// =======================
export const registerUserModel = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    throw new Error('All fields are required');
  }

  email = email.trim().toLowerCase();

  if (!validator.isEmail(email)) {
    throw new Error('Invalid email address');
  }

  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    throw new Error('Weak password');
  }

  // CHECK EXISTING
  const { data: existing } = await supabase
    .from('users')
    .select('email')
    .ilike('email', email);

  if (existing.length > 0) {
    throw new Error('Email already used');
  }

  // HASH
  const hashedPassword = await bcrypt.hash(password, 10);

  // CREATE AUTH
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw new Error(error.message);

  const user = data.user;

  // SAVE TO TABLE
  await supabase.from('users').insert([
    {
      id: user.id,
      name,
      email,
      role,
      password: hashedPassword
    }
  ]);

  // ✅ RETURN CLEAN DATA ONLY
  return {
    id: user.id,
    email,
    name,
    role
  };
};

// =======================
// LOGIN
// =======================
export const loginUserModel = async ({ email, password }) => {
  email = email.trim().toLowerCase();

  // 🔥 STEP 1: CHECK IF EMAIL EXISTS
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .ilike('email', email);

  if (!existingUser || existingUser.length === 0) {
    throw new Error('Email not found');
  }

  // 🔥 STEP 2: TRY LOGIN
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error('Invalid password');
  }

  const user = data.user;

  // 🔥 STEP 3: GET ROLE
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single();

  if (roleError || !userData) {
    throw new Error('User data not found');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: userData.role,
      name: userData.name
    },
    session: data.session
  };
};
// =======================
// SEND OTP
// =======================
export const sendOtpModel = async (email) => {

  email = email.trim().toLowerCase();

  const { data } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email);

  if (!data || data.length === 0) {
    throw new Error('Email not registered');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await supabase.from('otp_codes').upsert([
    {
      email,
      otp,
      created_at: new Date()
    }
  ]);

  const msg = {
  to: email,
  from: {
    email: process.env.EMAIL_FROM,
    name: "BATSU-Wise System"
  },
  subject: "Your BATSU-Wise Verification Code",
  html: `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color:#d32f2f;">BATSU-Wise Verification</h2>

      <p>Hello,</p>

      <p>Your One-Time Password (OTP) is:</p>

      <div style="
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 6px;
        margin: 15px 0;
      ">
        ${otp}
      </div>

      <p>This code will expire in 5 minutes.</p>

      <br/>

      <p style="color: gray; font-size: 12px;">
        If you did not request this, please ignore this email.
      </p>
    </div>
  `
};

  await sgMail.send(msg);

  return true;
};

// =======================
// VERIFY OTP
// =======================
export const verifyOtpModel = async (email, token) => {

  const { data } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('otp', token)
    .single();

  if (!data) throw new Error('Invalid OTP');

  return true;
};

// =======================
// UPDATE PASSWORD (🔥 FIXED FINAL)
// =======================
// =======================
// UPDATE PASSWORD
// =======================
export const updatePasswordModel = async (email, newPassword) => {

  // =======================
  // VALIDATION
  // =======================
  if (!email || !newPassword) {
    throw new Error('Email and new password are required');
  }

  email = email.trim().toLowerCase();

  // 🔥 STRONG PASSWORD VALIDATION
  const isStrong = validator.isStrongPassword(newPassword, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    throw new Error(
      'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol'
    );
  }

  // =======================
  // CHECK USER
  // =======================
  const { data, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email);

  if (fetchError) throw new Error(fetchError.message);

  if (!data || data.length === 0) {
    throw new Error('User not found');
  }

  const userId = data[0].id;

  // =======================
  // HASH PASSWORD
  // =======================
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // =======================
  // UPDATE AUTH (REAL LOGIN)
  // =======================
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (authError) throw new Error(authError.message);

  // =======================
  // UPDATE USERS TABLE
  // =======================
  const { error: dbError } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('email', email);

  if (dbError) throw new Error(dbError.message);

  return true;
};
