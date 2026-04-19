import { supabase } from '../config/supabase.js';

export const getLastReading = async (submeter_id) => {
  const { data, error } = await supabase
    .from('readings')
    .select('reading_value')
    .eq('submeter_id', submeter_id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  return data.length ? data[0].reading_value : 0;
};

export const insertReading = async (payload) => {
  const { data, error } = await supabase
    .from('readings')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.log('INSERT ERROR:', error);
    throw error;
  }

  return data;
};