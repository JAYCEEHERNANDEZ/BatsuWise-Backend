import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadToSupabase = async (file) => {
  const fileName = `meter-${uuidv4()}.jpg`;

  const { error } = await supabase.storage
    .from('meter-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('meter-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};