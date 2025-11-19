require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectAbstras() {
    console.log('Fetching abstras...');
    const { data, error } = await supabase
        .from('abstras')
        .select('*');

    if (error) {
        console.error('Error fetching abstras:', error);
    } else {
        console.log('Abstras found:', data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

inspectAbstras();
