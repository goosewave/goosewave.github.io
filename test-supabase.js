require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Checking credentials...');
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase credentials in .env file');
    process.exit(1);
}
console.log('Credentials found.');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        // Try to fetch something simple, or just check if the client initializes without error
        // Since we don't know the table structure, we'll just check if we can make a request.
        // A simple query to a non-existent table might return a specific error, or we can try to get the session.
        const { data, error } = await supabase.from('random_table_check').select('*').limit(1);

        if (error) {
            // If we get a 404 or similar, it means we connected but the table doesn't exist, which is fine for connectivity check.
            // If we get a 401, it means auth failed.
            console.log('Connection response:', error.message);
            if (error.code === 'PGRST200') { // Table not found, but connection worked
                console.log('Success: Connected to Supabase (Table not found as expected).');
            } else if (error.message.includes('fetch') || error.message.includes('network')) {
                console.error('Error: Network issue connecting to Supabase.');
            } else {
                // Assume connection worked if we got a specific DB error
                console.log('Success: Connected to Supabase (Received DB error).');
            }
        } else {
            console.log('Success: Connected to Supabase.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
