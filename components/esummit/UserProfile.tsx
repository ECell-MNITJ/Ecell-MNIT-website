'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiEdit2, FiSave, FiCamera, FiGlobe, FiPhone, FiUser, FiX, FiTrash2, FiAward, FiColumns } from 'react-icons/fi';
import toast from 'react-hot-toast';

import QRCodeCard from './QRCodeCard';

// ... (existing imports)

export default function ESummitUserProfile({ user }: { user: any }) {
    // ... (existing component logic)

    return (
        <div className="flex flex-col gap-10">
            {/* Profile Header Card */}
            <div className="bg-esummit-card/60 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                {/* ... (background effects) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-esummit-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-esummit-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="flex flex-col lg:flex-row items-start gap-10 relative z-10">
                    {/* QR Code Section (Mobile: Order 2, Desktop: Order 3) */}
                    <div className="order-2 lg:order-3 w-full lg:w-auto flex justify-center">
                        <QRCodeCard user={user} profile={profile} />
                    </div>

                    {/* Avatar Section (Order 1) */}
                    <div className="relative group order-1 flex-shrink-0 mx-auto lg:mx-0">
                        {/* ... (avatar code) ... */}
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
                            {/* ... (upload button) ... */}
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
                        {/* ... (rest of details) ... */}
                        {editing ? (
                            // ... (editing form) ...
                            <div className="space-y-6 max-w-2xl bg-black/20 p-6 rounded-2xl border border-white/5">
                                {/* ...form fields... */}
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
                                            {profile?.full_name || 'Anonymous User'}
                                        </h1>
                                        <p className="text-esummit-primary font-medium">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="self-center md:self-start bg-white/5 text-gray-300 hover:bg-esummit-primary hover:text-white px-6 py-2.5 rounded-full transition-all flex items-center gap-2 border border-white/10 hover:border-esummit-primary font-bold uppercase tracking-wide text-sm"
                                    >
                                        <FiEdit2 /> Edit Profile
                                    </button>
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
