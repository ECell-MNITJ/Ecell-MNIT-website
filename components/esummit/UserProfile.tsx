'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiEdit2, FiSave, FiCamera, FiGlobe, FiPhone, FiUser, FiX, FiTrash2, FiAward, FiColumns, FiPower } from 'react-icons/fi';
import toast from 'react-hot-toast';

import QRCodeCard from './QRCodeCard';

export default function ESummitUserProfile({ user }: { user: any }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        website: '',
        phone: '',
        avatar_url: '',
    });

    useEffect(() => {
        if (user) {
            getProfile();
            getRegistrations();
        }
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
                const metaName = user.user_metadata?.name || user.user_metadata?.full_name || '';
                const tempProfile = {
                    full_name: metaName,
                    avatar_url: user.user_metadata?.avatar_url || '',
                    // ... other fields empty
                };
                setProfile(tempProfile); // Set profile state so it renders immediately
                setFormData({
                    full_name: metaName,
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

    async function getRegistrations() {
        try {
            const { data, error } = await supabase
                .from('event_registrations')
                .select(`
                    *,
                    events!inner(*)
                `)
                .eq('user_id', user.id)
                .eq('events.is_esummit', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching registrations:', error);
            } else {
                // Filter for e-summit events if needed, depending on how "events" table distinguishes them
                // Assuming all events here are fine, or we filter by is_esummit if that field exists
                // The broken file just showed all registrations, so we'll keep it broad for now, 
                // but maybe we should filter if this is strictly E-Summit profile.
                // However, the previous code seemed to just show them.
                setRegistrations(data || []);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
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

                // Update local state
                setProfile((prev: any) => ({ ...prev, ...updates }));
                toast.success('Avatar updated!');
            }

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Error uploading avatar!');
        } finally {
            setUploading(false);
        }
    }

    const router = useRouter(); // Need to import useRouter

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Error logging out");
            return;
        }
        toast.success("Logged out successfully");
        router.push("/esummit"); // Redirect to E-Summit home
        router.refresh();
    };

    if (loading && !profile && !editing) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-esummit-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Profile Header Card */}
            <div className="bg-esummit-card/60 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-esummit-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-esummit-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                {/* Logout Button Removed from Absolute */}


                <div className="flex flex-col lg:flex-row items-start gap-10 relative z-10">
                    {/* QR Code Section (Mobile: Order 2, Desktop: Order 3) */}
                    <div className="order-2 lg:order-3 w-full lg:w-auto flex justify-center">
                        <QRCodeCard user={user} profile={profile} />
                    </div>

                    {/* Avatar Section (Order 1) */}
                    <div className="relative group order-1 flex-shrink-0 mx-auto lg:mx-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-esummit-primary/30 shadow-[0_0_20px_rgba(157,78,221,0.3)] overflow-hidden bg-esummit-bg flex items-center justify-center group-hover:border-esummit-accent transition-colors duration-500">
                            {formData.avatar_url ? (
                                <img
                                    src={formData.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <span className="text-5xl font-bold text-esummit-primary">
                                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="absolute bottom-0 right-0 flex gap-2">
                            <label className="p-2.5 bg-esummit-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-white hover:text-esummit-primary transition-all duration-300 hover:scale-110" title="Change Avatar">
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
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

                    {/* Details Section (Order 2) */}
                    <div className="flex-1 text-center lg:text-left w-full order-3 lg:order-2">
                        {editing ? (
                            <div className="space-y-6 max-w-2xl bg-black/20 p-6 rounded-2xl border border-white/5">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 text-left">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-esummit-primary focus:ring-1 focus:ring-esummit-primary transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 text-left">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-esummit-primary focus:ring-1 focus:ring-esummit-primary transition-all"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 text-left">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-esummit-primary focus:ring-1 focus:ring-esummit-primary transition-all resize-none h-28"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={updateProfile}
                                        className="bg-esummit-primary text-white px-8 py-2.5 rounded-full hover:bg-white hover:text-esummit-primary transition-all font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg hover:shadow-esummit-primary/50"
                                    >
                                        <FiSave /> Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            // Reset form
                                            setFormData({
                                                full_name: profile?.full_name || '',
                                                bio: profile?.bio || '',
                                                website: profile?.website || '',
                                                phone: profile?.phone || '',
                                                avatar_url: profile?.avatar_url || '',
                                            });
                                        }}
                                        className="px-8 py-2.5 border border-white/20 text-gray-300 rounded-full hover:bg-white/10 transition-colors font-bold uppercase tracking-wide"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                            {profile?.full_name || user.user_metadata?.name || user.user_metadata?.full_name || 'Anonymous User'}
                                        </h1>
                                        <p className="text-esummit-primary font-medium">{user.email}</p>
                                    </div>
                                    <div className="flex gap-2 self-center md:self-start">
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="bg-white/5 text-gray-300 hover:bg-esummit-primary hover:text-white px-6 py-2.5 rounded-full transition-all flex items-center gap-2 border border-white/10 hover:border-esummit-primary font-bold uppercase tracking-wide text-sm"
                                        >
                                            <FiEdit2 /> Edit Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-full transition-all flex items-center gap-2 border border-red-500/20 hover:border-red-500 font-bold uppercase tracking-wide text-sm"
                                        >
                                            <FiPower /> Log Out
                                        </button>
                                    </div>
                                </div>

                                {profile?.bio && (
                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8">
                                        <p className="text-gray-300 max-w-2xl leading-relaxed italic">
                                            "{profile.bio}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium">
                                    {profile?.phone && (
                                        <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                                            <FiPhone className="text-esummit-accent" /> {profile.phone}
                                        </span>
                                    )}
                                    {profile?.website && (
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg hover:text-esummit-accent transition-colors hover:bg-white/10">
                                            <FiGlobe className="text-esummit-accent" /> {profile.website}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Registrations Section */}
            <div>
                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wide">
                    <span className="w-2 h-8 bg-esummit-primary rounded-full"></span>
                    <span className="flex items-center gap-3">
                        Your Registrations
                    </span>
                </h2>

                {registrations.length === 0 ? (
                    <div className="bg-esummit-card/40 border border-white/5 rounded-3xl p-16 text-center backdrop-blur-sm">
                        <div className="text-6xl mb-6 opacity-80 decoration-slice">🎫</div>
                        <h3 className="text-2xl font-bold text-white mb-3">No Registrations Yet</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">You haven't registered for any E-Summit events yet. Explore our events to get started!</p>
                        <a href="/esummit/events" className="inline-block bg-esummit-primary text-white px-8 py-3 rounded-full hover:bg-purple-600 transition-all font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(157,78,221,0.4)] hover:shadow-[0_0_30px_rgba(157,78,221,0.6)] hover:-translate-y-1">
                            Explore Events
                        </a>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {registrations.map((reg) => (
                            <div key={reg.id} className="bg-esummit-card/50 border border-white/5 rounded-2xl p-6 hover:border-esummit-primary/50 transition-all duration-300 group hover:bg-esummit-card hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(157,78,221,0.2)]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 pr-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${reg.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                            reg.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {reg.status}
                                        </span>
                                        <h3 className="text-xl font-bold text-white group-hover:text-esummit-accent transition-colors">
                                            {reg.events?.title || 'Unknown Event'}
                                        </h3>
                                    </div>
                                    {reg.events?.image_url && (
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                            <img src={reg.events.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 pt-4 border-t border-white/5 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Registered on:</span>
                                        <span className="text-gray-300 font-medium">{new Date(reg.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {reg.team_id && (
                                        <div className="flex justify-between">
                                            <span>Team ID:</span>
                                            <span className="text-esummit-primary font-mono font-bold tracking-wider">{reg.team_id}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
