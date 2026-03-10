const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking esummit_settings columns...');
    const { data, error } = await supabase.from('esummit_settings').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('No rows found in esummit_settings');
        // Try to fetch just the columns
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'esummit_settings' });
        if (colError) console.log('Could not fetch columns via RPC, table might be empty but column missing');
    }
}
check();
