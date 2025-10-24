import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const email = 'admin@muponi.co.za';
  const password = 'Demo!234';

  console.log('Testing direct Supabase query...');
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return;
  }

  console.log('User found:', {
    email: user.email,
    role: user.role,
    hasHash: !!user.password_hash
  });

  const valid = await bcrypt.compare(password, user.password_hash);
  console.log('Password valid:', valid);
}

test();
