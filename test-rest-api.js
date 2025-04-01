// Script to test Supabase REST API calls
const fetch = require('node-fetch');

// Supabase configuration
const supabaseUrl = 'https://xggfntnpabhuijtdingq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZ2ZudG5wYWJodWlqdGRpbmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0Njk4MjIsImV4cCI6MjA1OTA0NTgyMn0.Fis701SsfegDQjbt6ldBY95lnmsbvFrTfinjin7HUnc';

// Function to test REST API calls
async function testRestApi(email, password) {
  try {
    // Sign in with the user's credentials
    console.log(`Signing in as ${email}...`);
    const signInResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const signInData = await signInResponse.json();
    
    if (!signInResponse.ok) {
      console.error('Error signing in:', signInData.error_description || signInData.error || 'Unknown error');
      return;
    }
    
    const accessToken = signInData.access_token;
    const userId = signInData.user.id;
    console.log(`Signed in successfully. User ID: ${userId}`);
    
    // Test different REST API calls
    
    // 1. Test querying mii_characters without schema
    console.log('\nTest 1: Querying mii_characters without schema');
    const test1Response = await fetch(`${supabaseUrl}/rest/v1/mii_characters?select=*&user_id=eq.${userId}`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${test1Response.status}`);
    const test1Headers = {};
    test1Response.headers.forEach((value, name) => {
      test1Headers[name] = value;
    });
    console.log('Headers:', test1Headers);
    
    const test1Text = await test1Response.text();
    console.log('Response:', test1Text);
    
    // 2. Test querying mii_characters with api schema
    console.log('\nTest 2: Querying mii_characters with api schema');
    const test2Response = await fetch(`${supabaseUrl}/rest/v1/api/mii_characters?select=*&user_id=eq.${userId}`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${test2Response.status}`);
    const test2Headers = {};
    test2Response.headers.forEach((value, name) => {
      test2Headers[name] = value;
    });
    console.log('Headers:', test2Headers);
    
    const test2Text = await test2Response.text();
    console.log('Response:', test2Text);
    
    // 3. Test querying mii_characters with schema parameter
    console.log('\nTest 3: Querying mii_characters with schema parameter');
    const test3Response = await fetch(`${supabaseUrl}/rest/v1/mii_characters?select=*&user_id=eq.${userId}&schema=api`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${test3Response.status}`);
    const test3Headers = {};
    test3Response.headers.forEach((value, name) => {
      test3Headers[name] = value;
    });
    console.log('Headers:', test3Headers);
    
    const test3Text = await test3Response.text();
    console.log('Response:', test3Text);
    
    // 4. Test querying mii_characters with Prefer header
    console.log('\nTest 4: Querying mii_characters with Prefer header');
    const test4Response = await fetch(`${supabaseUrl}/rest/v1/mii_characters?select=*&user_id=eq.${userId}`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'schema=api'
      }
    });
    
    console.log(`Status: ${test4Response.status}`);
    const test4Headers = {};
    test4Response.headers.forEach((value, name) => {
      test4Headers[name] = value;
    });
    console.log('Headers:', test4Headers);
    
    const test4Text = await test4Response.text();
    console.log('Response:', test4Text);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Use readline to get password interactively
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: node test-rest-api.js <email>');
  process.exit(1);
}

// Prompt for password
rl.question('Enter your password: ', (password) => {
  // Run the test function
  testRestApi(email, password);
  rl.close();
});
