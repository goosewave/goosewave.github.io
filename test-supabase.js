// Use CommonJS syntax for Node.js compatibility
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Supabase configuration (copied from supabaseClient.js)
const supabaseUrl = 'https://xggfntnpabhuijtdingq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZ2ZudG5wYWJodWlqdGRpbmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0Njk4MjIsImV4cCI6MjA1OTA0NTgyMn0.Fis701SsfegDQjbt6ldBY95lnmsbvFrTfinjin7HUnc';

// Create a supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple test to check if Supabase connection works
async function testSupabase() {
  try {
    // Test authentication
    console.log('Testing Supabase authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth result:', authData ? 'Success' : 'No session', authError ? `Error: ${authError.message}` : 'No error');
    
    // Test listing all tables in the database
    console.log('\nListing all tables in the database...');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.log('Error listing tables:', tablesError.message);
    } else {
      console.log('Tables in database:', tablesData);
    }
    
    // Try different ways to access the tables
    console.log('\nTrying different ways to access the profiles table...');
    
    // Try with public schema
    const { data: publicProfilesData, error: publicProfilesError } = await supabase
      .from('public.profiles')
      .select('*')
      .limit(1);
    console.log('Public schema result:', publicProfilesData ? `Found ${publicProfilesData.length} profiles` : 'No profiles', 
                publicProfilesError ? `Error: ${publicProfilesError.message}` : 'No error');
    
    // Try with no schema
    const { data: noSchemaProfilesData, error: noSchemaProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    console.log('No schema result:', noSchemaProfilesData ? `Found ${noSchemaProfilesData.length} profiles` : 'No profiles', 
                noSchemaProfilesError ? `Error: ${noSchemaProfilesError.message}` : 'No error');
    
    // Try direct REST API call
    console.log('\nTrying direct REST API call...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const status = response.status;
      const text = await response.text();
      console.log(`REST API response: Status ${status}, Body: ${text}`);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabase();
