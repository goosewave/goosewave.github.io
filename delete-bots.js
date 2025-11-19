require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const emailsToDelete = [
    'djluccool19@gmail.com',
    'jacques.dancause+spam@gmail.com',
    'jacquesdancause+whosithis@gmail.com',
    'actualdiscordmoderator@gmail.com'
];

async function deleteBotUsers() {
    console.log('Deleting bot users...');

    // We can't delete from auth.users with the anon key usually, 
    // but we can try to delete from the profiles table if RLS allows it.
    // If these users are in the profiles table, we'll remove them.

    const { data, error } = await supabase
        .from('profiles')
        .delete()
        .in('email', emailsToDelete)
        .select();

    if (error) {
        console.error('Error deleting users:', error);
    } else {
        console.log('Deleted users:', data.length);
        data.forEach(user => {
            console.log(`Deleted: ${user.email}`);
        });
    }
}

deleteBotUsers();
