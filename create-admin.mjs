import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env.local');

console.log("Loading environment variables...");
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error("Error: Could not find .env.local file.");
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase URL or Anon Key is missing in .env.local");
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] || 'System Admin';

async function createAdmin() {
  console.log(`\n⏳ Creating Admin Account for: ${email}...`);

  // 1. Sign Up via Supabase Auth API
  const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      data: {
        full_name: fullName,
        role: 'admin'
      }
    })
  });

  const authData = await signupResponse.json();

  if (!signupResponse.ok) {
    console.error('❌ Failed to create user:', authData.msg || authData.message);
    return;
  }

  const userId = authData.id || (authData.user && authData.user.id);
  if (!userId) {
    console.error('❌ Could not retrieve user ID after signup.');
    return;
  }

  console.log('✅ User created in Auth! Updating profile role to Admin...');

  // Wait for SQL trigger to create the profile row
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 2. Force update to admin role via Supabase REST API
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ role: 'admin' })
  });

  if (!updateResponse.ok) {
    const errorBody = await updateResponse.text();
    console.error('⚠️ Could not force update profile role (It might already be admin via trigger):', errorBody);
  } else {
    console.log('✅ Profile role successfully set to Admin!');
  }

  console.log('\n🎉 DONE! You can now login to the website with these credentials:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

createAdmin();
