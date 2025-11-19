import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
