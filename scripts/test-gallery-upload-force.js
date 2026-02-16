const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nizhsrbjmsoauqohujmk.supabase.co';
const supabaseKey = 'sb_publishable_j9YSPlDG6IpvTSjMJOu-qw_p4Le5ouC'; // This looks like it might be invalid/truncated based on the prefix 'sb_publishable_'? Usually they are long JWTs. But let's assume it's correct from .env.local

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload to gallery bucket (FORCE)...');

    // Try to upload a test file directly without listing buckets
    const fileName = `test-${Date.now()}.txt`;
    const fileBody = 'This is a test file to verify gallery upload permissions.';

    const { data, error } = await supabase.storage
        .from('gallery')
        .upload(fileName, fileBody, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error('ERROR: Upload failed:', error);
    } else {
        console.log('SUCCESS: File uploaded:', data.path);

        // Clean up
        const { error: deleteError } = await supabase.storage
            .from('gallery')
            .remove([fileName]);

        if (deleteError) {
            console.error('Warning: Failed to delete test file:', deleteError);
        } else {
            console.log('SUCCESS: Test file deleted.');
        }
    }
}

testUpload();
