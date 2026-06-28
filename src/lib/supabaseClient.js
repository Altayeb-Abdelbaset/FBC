import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fsjzizzxyqnporutxyuv.supabase.co';
const supabaseAnonKey = "sb_publishable_ilopGOooC8hRG1P-Ybo1Qg_QrupHZD0"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// التست المباشر
supabase.from('workers').select('*').then(({ data, error }) => {
  if (error) console.error('نتيجة التست - خطأ:', error);
  else console.log('نتيجة التست - نجاح (الداتا):', data);
});
// جرب تضيف داتا من الكود وتشوف هيرد بإيه
supabase.from('workers').insert([
  { full_name: 'test user', employee_id: '123', department: 'HR', role: 'admin', phone: '000' }
]).then(({ data, error }) => {
  if (error) console.log('خطأ في الإضافة:', error);
  else console.log('تمت الإضافة بنجاح!');
});