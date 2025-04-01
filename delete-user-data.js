// Script to delete user data from Supabase
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xggfntnpabhuijtdingq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZ2ZudG5wYWJodWlqdGRpbmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0Njk4MjIsImV4cCI6MjA1OTA0NTgyMn0.Fis701SsfegDQjbt6ldBY95lnmsbvFrTfinjin7HUnc';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to delete user data
async function deleteUserData(email, password) {
  try {
    // Sign in with the user's credentials
    console.log(`Signing in as ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('Error signing in:', authError.message);
      return;
    }
    
    const userId = authData.user.id;
    console.log(`Signed in successfully. User ID: ${userId}`);
    
    // Delete user's Mii character data from both schemas
    console.log('Deleting Mii character data...');
    
    // Try deleting from api schema
    const { error: apiMiiError } = await supabase
      .schema('api')
      .from('mii_characters')
      .delete()
      .eq('user_id', userId);
      
    if (apiMiiError) {
      console.error('Error deleting Mii data from api schema:', apiMiiError.message);
    } else {
      console.log('Successfully deleted Mii data from api schema');
    }
    
    // Try deleting from public schema
    const { error: publicMiiError } = await supabase
      .from('mii_characters')
      .delete()
      .eq('user_id', userId);
      
    if (publicMiiError) {
      console.error('Error deleting Mii data from public schema:', publicMiiError.message);
    } else {
      console.log('Successfully deleted Mii data from public schema');
    }
    
    // Delete user's profile data from both schemas
    console.log('Deleting profile data...');
    
    // Try deleting from api schema
    const { error: apiProfileError } = await supabase
      .schema('api')
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (apiProfileError) {
      console.error('Error deleting profile data from api schema:', apiProfileError.message);
    } else {
      console.log('Successfully deleted profile data from api schema');
    }
    
    // Try deleting from public schema
    const { error: publicProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (publicProfileError) {
      console.error('Error deleting profile data from public schema:', publicProfileError.message);
    } else {
      console.log('Successfully deleted profile data from public schema');
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('Signed out successfully');
    
    console.log('User data deletion complete. You can now sign up again with the same email.');
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
  console.error('Usage: node delete-user-data.js <email>');
  process.exit(1);
}

// Prompt for password
rl.question('Enter your password: ', (password) => {
  // Run the deletion function
  deleteUserData(email, password);
  rl.close();
});
