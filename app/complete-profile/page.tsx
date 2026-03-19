'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiUser, FiSmartphone, FiCalendar, FiSave, FiInfo, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';

function CompleteProfileForm() {
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get('next') || '/profile';

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        age: '',
        gender: '',
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/login?next=/complete-profile`);
                return;
            }
            setUser(user);

            // Pre-fill name from metadata if available
            const fullName = user.user_metadata?.full_name || '';
            if (fullName) {
                const parts = fullName.split(' ');
                setFormData(prev => ({
                    ...prev,
                    first_name: parts[0] || '',
                    last_name: parts.slice(1).join(' ') || '',
                }));
            }

            // Check if profile already exists
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single() as any;

            if (profile) {
                // If profile is already complete, redirect to nextUrl
                const isComplete = profile.full_name && profile.phone && profile.age && profile.gender;
                if (isComplete) {
                    router.push(nextUrl);
                    return;
                }

                // Pre-fill existing data
                const names = profile.full_name?.split(' ') || ['', ''];
                setFormData({
                    first_name: names[0] || '',
                    last_name: names.slice(1).join(' ') || '',
                    phone: profile.phone || '',
                    age: profile.age?.toString() || '',
                    gender: profile.gender || '',
                });
            }

            setChecking(false);
        };

        checkUser();
    }, [supabase, router, nextUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.age || !formData.gender) {
            toast.error('Please fill in all required details');
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error('Phone number must be exactly 10 digits');
            return;
        }

        setLoading(true);

        try {
            const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${user.id}`;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    phone: formData.phone,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    user_type: 'Visitor', // Default to Visitor to satisfy constraint
                    qr_code_url: qrCodeUrl,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toast.success('Profile completed successfully!');
            router.push(nextUrl);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-primary-golden border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400 font-medium tracking-wide">Securing your session...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.3)]"
        >
            <div className="text-center mb-10">
                <h1 className="text-3xl font-heading text-primary-golden mb-3">Complete Your Profile</h1>
                <p className="text-gray-400">Just a few more details to get you started with E-Cell</p>
            </div>

            <div className="bg-primary-golden/10 border border-primary-golden/20 rounded-2xl p-4 mb-8 flex gap-4 items-start">
                <FiInfo className="text-primary-golden w-6 h-6 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300 leading-relaxed">
                    Personalizing your profile helps us provide a better experience and generates your exclusive E-Cell access pass.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">First Name</label>
                        <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primary-golden/50 transition-all placeholder:text-gray-600"
                                placeholder="Jane"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Last Name</label>
                        <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primary-golden/50 transition-all placeholder:text-gray-600"
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Phone Number</label>
                    <div className="relative">
                        <FiSmartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            required
                            pattern="\d{10}"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primary-golden/50 transition-all placeholder:text-gray-600"
                            placeholder="9876543210"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Age</label>
                        <div className="relative">
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                                min="10"
                                max="100"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primary-golden/50 transition-all placeholder:text-gray-600"
                                placeholder="20"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Gender</label>
                        <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primary-golden/50 transition-all appearance-none"
                            >
                                <option value="" disabled className="bg-gray-900">Select Gender</option>
                                <option value="Male" className="bg-gray-900">Male</option>
                                <option value="Female" className="bg-gray-900">Female</option>
                                <option value="Other" className="bg-gray-900">Other</option>
                                <option value="Prefer not to say" className="bg-gray-900">Prefer not to say</option>
                            </select>
                        </div>
                    </div>
                </div>



                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-golden to-yellow-600 text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            Save Profile <FiArrowRight />
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
}

export default function CompleteProfile() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 py-32 relative font-body selection:bg-primary-golden selection:text-black">
            {/* Background elements to match E-Cell aesthetic */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-golden/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-green/10 rounded-full blur-[120px]" />
            </div>

            <Toaster position="top-right"
                toastOptions={{
                    style: {
                        background: '#111',
                        color: '#fff',
                        border: '1px solid rgba(255,215,0,0.2)',
                    },
                }}
            />

            <Suspense fallback={<div className="text-primary-golden animate-pulse font-bold tracking-widest">LOADING...</div>}>
                <CompleteProfileForm />
            </Suspense>
        </div>
    );
}
