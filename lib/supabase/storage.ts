import { createClient } from './client';

export async function uploadImage(
    file: File,
    bucket: 'team-images' | 'event-images' | 'startup-logos' | 'gallery',
    existingUrl?: string | null
): Promise<string> {
    const supabase = createClient();

    // Delete existing image if provided
    if (existingUrl) {
        const oldPath = existingUrl.split('/').slice(-1)[0];
        await supabase.storage.from(bucket).remove([oldPath]);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

    // Upload new image
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
}

export async function deleteImage(
    url: string,
    bucket: 'team-images' | 'event-images' | 'startup-logos' | 'avatars' | 'gallery'
): Promise<void> {
    const supabase = createClient();
    const path = url.split('/').slice(-1)[0];

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
        console.error('Failed to delete image:', error);
    }
}
