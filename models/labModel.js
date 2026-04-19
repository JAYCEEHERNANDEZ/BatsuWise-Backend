import { supabase } from '../config/supabase.js';

// =======================
// CREATE LAB RESULTS (MULTIPLE)
// =======================
export const createLabResultModel = async (faucets, date_tested, date_released) => {

  if (!faucets || faucets.length === 0) {
    throw new Error('No faucet data provided');
  }

  const payload = faucets.map(f => ({
    faucet: f.faucet,
    status: f.status,
    date_tested,
    date_released
  }));

  const { error } = await supabase
    .from('lab_results')
    .insert(payload);

  if (error) throw new Error(error.message);

  return true;
};

// =======================
// GET ALL RESULTS
// =======================
export const getLabResultsModel = async () => {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data;
};