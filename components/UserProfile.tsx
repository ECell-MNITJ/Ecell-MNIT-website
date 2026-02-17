'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiEdit2, FiSave, FiCamera, FiGlobe, FiPhone, FiUser, FiX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UserProfile({ user }: { user: any }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        website: '',
        phone: '',
        avatar_url: '',
    });

    useEffect(() => {
        getProfile();
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);

            // First check if profile exists
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, try to create one or just use defaults
                console.log("Profile not found, using defaults");
                data = null;
            } else if (error) {
                console.error('Error fetching profile:', error);
            }

            if (data) {
                setProfile(data);
                setFormData({
                    full_name: data.full_name || '',
                    bio: data.bio || '',
                    website: data.website || '',
                    phone: data.phone || '',
                    avatar_url: data.avatar_url || '',
                });
            } else {
                // Initialize with auth metadata if available
                setFormData({
                    full_name: user.user_metadata?.full_name || '',
                    bio: '',
                    website: '',
                    phone: '',
                    avatar_url: user.user_metadata?.avatar_url || '',
                });
            }
        } catch (error) {
            console.error('Error loading user data!', error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        if (!formData.full_name?.trim() || !formData.phone?.trim()) {
            toast.error('Full Name and Phone Number are required!');
            return;
        }

        try {
            setLoading(true);

            const updates = {
                id: user.id,
                ...formData,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            setProfile(updates);
            setEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile!');
        } finally {
            setLoading(false);
        }
    }

    async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setFormData({ ...formData, avatar_url: data.publicUrl });

            // If satisfied with the upload immediately save it if not in edit mode
            if (!editing) {
                const updates = {
                    id: user.id,
                    avatar_url: data.publicUrl,
                    updated_at: new Date().toISOString(),
                };
                const { error: updateError } = await supabase.from('profiles').upsert(updates);
                if (updateError) throw updateError;
                setProfile({ ...profile, ...updates });
                toast.success('Avatar updated!');
            }

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Error uploading avatar!');
        } finally {
            setUploading(false);
        }
    }

    async function deleteAvatar() {
        if (!confirm('Are you sure you want to delete your profile picture?')) return;

        try {
            setUploading(true);

            // 1. Delete from storage (optional, if you want to clean up)
            if (formData.avatar_url) {
                const path = formData.avatar_url.split('/').pop();
                if (path) {
                    await supabase.storage.from('avatars').remove([path]);
                }
            }

            // 2. Update profile with null avatar_url
            const updates = {
                id: user.id,
                avatar_url: null,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            // 3. Update state
            setFormData({ ...formData, avatar_url: '' });
            setProfile({ ...profile, ...updates });
            toast.success('Avatar deleted!');
        } catch (error) {
            console.error('Error deleting avatar:', error);
            toast.error('Failed to delete avatar.');
        } finally {
            setUploading(false);
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action is irreversible and will delete all your data including registrations.')) {
            return;
        }

        const confirmName = prompt(`Please type "${user.user_metadata?.full_name || profile?.full_name || 'DELETE'}" to confirm deletion:`);
        if (confirmName !== (user.user_metadata?.full_name || profile?.full_name || 'DELETE')) {
            toast.error('Confirmation failed. Account deletion cancelled.');
            return;
        }

        try {
            setLoading(true);
            const { deleteAccount } = await import('@/app/actions');
            await deleteAccount();
        } catch (error: any) {
            console.error('Error deleting account:', error);
            toast.error(error.message || 'Failed to delete account');
            setLoading(false);
        }
    };

    if (loading && !profile && !editing) {
        return <div className="text-center py-10 text-white">Loading profile...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 relative">
            {/* Avatar Section */}
            <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-primary-golden flex items-center justify-center">
                    {formData.avatar_url ? (
                        <img
                            src={formData.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-5xl font-bold text-white">
                            {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="absolute bottom-0 right-0 flex gap-2">
                    {formData.avatar_url && (
                        <button
                            onClick={deleteAvatar}
                            className="p-2 bg-white text-red-500 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                            title="Delete Avatar"
                            disabled={uploading}
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </button>
                    )}
                    <label className="p-2 bg-white text-primary-green rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors" title="Change Avatar">
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FiCamera className="w-5 h-5" />
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={uploadAvatar}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 text-center md:text-left w-full md:w-auto">
                {editing ? (
                    <div className="space-y-4 max-w-md bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                        <div>
                            <label className="block text-white/80 text-sm mb-1 text-left">Full Name <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1 text-left">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden resize-none"
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-white/80 text-sm mb-1 text-left">Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-white/80 text-sm mb-1 text-left">Phone <span className="text-red-400">*</span></label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="+91..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={updateProfile}
                                className="flex-1 bg-primary-golden text-white py-2 rounded-lg font-semibold hover:bg-white hover:text-primary-golden transition-colors flex items-center justify-center gap-2"
                            >
                                <FiSave /> Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setFormData({
                                        full_name: profile?.full_name || '',
                                        bio: profile?.bio || '',
                                        website: profile?.website || '',
                                        phone: profile?.phone || '',
                                        avatar_url: profile?.avatar_url || '',
                                    });
                                }}
                                className="px-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <FiX />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">


                        <h1 className="text-3xl md:text-5xl font-heading mb-2 text-white">
                            {profile?.full_name || 'Anonymous User'}
                        </h1>
                        <p className="text-white/80 text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                            {user.email}
                        </p>

                        {profile?.bio && (
                            <p className="text-white/80 max-w-2xl leading-relaxed mb-6">
                                {profile.bio}
                            </p>
                        )}

                        <div className="flex items-center justify-center md:justify-start gap-6 text-white/70">
                            {profile?.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-golden transition-colors">
                                    <FiGlobe /> Website
                                </a>
                            )}
                            {profile?.phone && (
                                <span className="flex items-center gap-2">
                                    <FiPhone /> {profile.phone}
                                </span>
                            )}
                        </div>
                        <div className="mt-8 flex flex-col gap-3 items-center md:items-start">
                            <button
                                onClick={() => setEditing(true)}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm backdrop-blur-sm border border-white/10 justify-center"
                            >
                                <FiEdit2 /> Edit Profile
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-sm border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-400/10"
                            >
                                <FiTrash2 /> Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
