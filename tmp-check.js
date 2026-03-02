import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('events').select('*').limit(1);
    if (error) console.error(error);
    else if (data && data.length > 0) console.log(Object.keys(data[0]));
    else console.log('no events');
}
check();
