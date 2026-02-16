const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nizhsrbjmsoauqohujmk.supabase.co';
const supabaseKey = 'sb_publishable_j9YSPlDG6IpvTSjMJOu-qw_p4Le5ouC';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload to gallery bucket...');

    // 1. Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        return;
    }

    const galleryBucket = buckets.find(b => b.name === 'gallery');
    if (!galleryBucket) {
        console.error('ERROR: "gallery" bucket NOT FOUND!');
        console.log('Available buckets:', buckets.map(b => b.name));
        return;
    } else {
        console.log('SUCCESS: "gallery" bucket found.');
    }

    // 2. Try to upload a test file
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

        // 3. Clean up (delete the test file)
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
