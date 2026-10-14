import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env.local');

let envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = 'doubtfixeradmin@gmail.com';
const password = 'admin12345';

async function fixAdmin() {
  console.log(`\n⏳ Logging into existing account ${email}...`);

  // 1. Login
  const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error('❌ Login failed (Maybe email confirmation is required, or rate limited):', loginData);
    return;
  }

  const token = loginData.access_token;
  const userId = loginData.user.id;
  console.log(`✅ Logged in successfully! User ID: ${userId}`);

  // 2. Insert into profiles table
  console.log('⏳ Creating Admin Profile record...');
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      id: userId,
      email: email,
      full_name: 'System Admin',
      role: 'admin'
    })
  });

  if (!insertRes.ok) {
    const errorBody = await insertRes.text();
    if (errorBody.includes('duplicate key')) {
      console.log('✅ Profile already exists! Making sure it is Admin...');
      
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'admin' })
      });
      console.log('✅ Role updated to Admin!');
    } else {
      console.error('❌ Failed to insert profile:', errorBody);
      return;
    }
  } else {
    console.log('✅ Profile successfully created with Admin role!');
  }

  console.log('\n🎉 DONE! You can now login to the website with:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);
}

fixAdmin();
