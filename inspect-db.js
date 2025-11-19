require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectProfiles() {
    console.log('Fetching profiles...');
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log('Profiles found:', data.length);
        console.log(JSON.stringify(data, null, 2));
        fs.writeFileSync('profiles.json', JSON.stringify(data, null, 2));
        console.log('Profiles written to profiles.json');
    }
}

inspectProfiles();
