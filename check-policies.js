require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPolicies() {
    console.log('Checking policies...');
    // This usually requires admin access, but let's try
    const { data, error } = await supabase
        .from('pg_policies')
        .select('*');

    if (error) {
        console.error('Error fetching policies:', error.message);
    } else {
        console.log('Policies found:', data);
    }
}

checkPolicies();
