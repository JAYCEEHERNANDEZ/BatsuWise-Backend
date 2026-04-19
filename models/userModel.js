import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// =======================
// REGISTER USER
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

  // HASH PASSWORD
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

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .ilike('email', email);

  if (!existingUser || existingUser.length === 0) {
    throw new Error('Email not found');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error('Invalid password');
  }

  const user = data.user;

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
// SEND OTP (SUPABASE)
// =======================
export const sendOtpModel = async (email) => {

  email = email.trim().toLowerCase();

  const { data } = await supabase
    .from('users')
    .select('email')
    .ilike('email', email);

  if (!data || data.length === 0) {
    throw new Error('Email not registered');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false
    }
  });

  if (error) throw new Error(error.message);

  return true;
};

// =======================
// VERIFY OTP (SUPABASE)
// =======================
export const verifyOtpModel = async (email, token) => {

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) throw new Error('Invalid or expired OTP');

  return data;
};

// =======================
// UPDATE PASSWORD
// =======================
export const updatePasswordModel = async (email, newPassword) => {

  if (!email || !newPassword) {
    throw new Error('Email and new password are required');
  }

  email = email.trim().toLowerCase();

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

  const { data, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email);

  if (fetchError) throw new Error(fetchError.message);

  if (!data || data.length === 0) {
    throw new Error('User not found');
  }

  const userId = data[0].id;

  // UPDATE AUTH PASSWORD
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (authError) throw new Error(authError.message);

  // UPDATE HASHED PASSWORD (OPTIONAL)
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: dbError } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('email', email);

  if (dbError) throw new Error(dbError.message);

  return true;
};