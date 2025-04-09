import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xggfntnpabhuijtdingq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZ2ZudG5wYWJodWlqdGRpbmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0Njk4MjIsImV4cCI6MjA1OTA0NTgyMn0.Fis701SsfegDQjbt6ldBY95lnmsbvFrTfinjin7HUnc';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  headers: {
    // Add proper Accept header to fix 406 errors
    'Accept': 'application/json'
  },
  // Enable auto-refresh of auth tokens
  autoRefreshToken: true,
  // Use localStorage by default
  persistSession: true
});

export default supabase;
