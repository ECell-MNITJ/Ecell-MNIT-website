'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { FiUser, FiCheck, FiShare2 } from 'react-icons/fi';
import Footer from '@/components/esummit/Footer';
import Link from 'next/link';

export default function CampusAmbassadorRegistrationPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [college, setCollege] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [regsOpen, setRegsOpen] = useState(true);

    useEffect(() => {
        // Sanity check of the target project
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'UNDEFINED';
        console.log(`[DEBUG] Targeting Supabase Project: ${url.substring(0, 30)}...`);
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // Check if already registered
            const { data: caData } = await supabase
                .from('campus_ambassadors')
                .select('referral_code, college')
                .eq('profile_id', user.id)
                .single();

            if (caData) {
                setIsRegistered(true);
                setReferralCode(caData.referral_code);
                setCollege(caData.college || '');
            }

            // Check if registrations are open
            const { data: settings } = await supabase
                .from('esummit_settings')
                .select('ca_registrations_open')
                .single();

            if (settings) {
                setRegsOpen(settings.ca_registrations_open);
            }
        } else {
            // Even if not logged in, check if regs are open
            const { data: settings } = await supabase
                .from('esummit_settings')
                .select('ca_registrations_open')
                .single();

            if (settings) {
                setRegsOpen(settings.ca_registrations_open);
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!college.trim()) {
            toast.error('Please enter your college name');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                toast.error('You must be logged in to register.');
                router.push('/esummit/login?next=/esummit/campus-ambassador/register');
                return;
            }


            const { error } = await supabase
                .from('campus_ambassadors')
                .insert({
                    profile_id: user.id,
                    referral_code: null,
                    college: college,
                    year_of_study: yearOfStudy,
                    phone_number: phoneNumber,
                    status: 'pending',
                    is_active: false,
                });

            if (error) {
                if (error.code === '23505') {
                    // Check if the error is due to profile_id (already registered) or referral_code collision
                    if (error.message?.includes('profile_id')) {
                        toast.error('You are already registered as a Campus Ambassador!');
                    } else {
                        toast.error('A collision occurred generating your code. Please try again.');
                    }
                } else {
                    throw error;
                }
            } else {
                toast.success('Application submitted! You are now in the waiting list.');
                setIsRegistered(true);
            }
        } catch (error: any) {
            // Manual extraction because Error objects/Supabase errors don't always serialize properties in logs
            const errorReport = {
                code: error?.code || 'NO_CODE',
                message: error?.message || 'NO_MESSAGE',
                details: error?.details || 'NO_DETAILS',
                hint: error?.hint || 'NO_HINT',
                status: error?.status || 'NO_STATUS'
            };

            console.error('Registration error details (JSON):', JSON.stringify(errorReport, null, 2));
            console.dir(error); // Direct object inspection

            const errorMsg = error.message || error.details || 'Unknown registration failure';
            toast.error(`Error [${errorReport.code}]: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success('Referral code copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-mono text-white">
            <div className="p-6">
                <Link href="/esummit/campus-ambassador" className="text-purple-400 hover:text-purple-300 transition-colors uppercase font-bold tracking-widest text-sm flex items-center gap-2">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <main className="flex-grow flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl">
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

                        <h2 className="text-3xl md:text-4xl font-black mb-8 text-center text-white">CA REGISTRATION</h2>

                        {!profile ? (
                            <div className="text-center py-10 space-y-6">
                                <p className="text-gray-400 text-lg">You must be logged in to apply for the Campus Ambassador program.</p>
                                <button
                                    onClick={() => router.push('/esummit/login?next=/esummit/campus-ambassador/register')}
                                    className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <FiUser /> Login to Apply
                                </button>
                            </div>
                        ) : isRegistered ? (
                            <div className="text-center py-10 space-y-6">
                                <div className="mx-auto w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                                    <FiCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">You're an Ambassador!</h3>
                                <p className="text-gray-400">Your referral code is: <span className="text-white font-bold bg-white/10 px-2 py-1 rounded">{referralCode}</span></p>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center justify-center gap-2 mx-auto text-purple-300 hover:text-white transition-colors py-2"
                                >
                                    <FiShare2 /> Copy to share
                                </button>
                            </div>
                        ) : !regsOpen ? (
                            <div className="text-center py-10 space-y-6">
                                <div className="mx-auto w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Registrations Closed</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    Thank you for your interest! The Campus Ambassador registrations for E-Summit MNIT Jaipur are currently closed.
                                </p>
                                <Link
                                    href="/esummit/campus-ambassador"
                                    className="inline-block text-purple-400 hover:text-purple-300 transition-colors uppercase font-bold tracking-widest text-sm"
                                >
                                    Return to CA Page
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile?.full_name || ''}
                                            disabled
                                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-sans"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                        <input
                                            type="text"
                                            value={profile?.email || ''}
                                            disabled
                                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-sans"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                                            Year of Study *
                                        </label>
                                        <select
                                            id="year"
                                            required
                                            value={yearOfStudy}
                                            onChange={(e) => setYearOfStudy(e.target.value)}
                                            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 transition-all font-sans appearance-none"
                                        >
                                            <option value="" disabled>Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="Post-Grad">Post-Grad</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-1">
                                        <label htmlFor="college" className="block text-sm font-medium text-gray-300 mb-2">
                                            College Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="college"
                                            required
                                            value={college}
                                            onChange={(e) => setCollege(e.target.value)}
                                            placeholder="e.g. MNIT Jaipur"
                                            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 transition-all font-sans"
                                        />
                                    </div>

                                    <div className="md:col-span-1">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                            Phone / WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="XXXXX XXXXX"
                                            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 transition-all font-sans"
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mt-4 bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                                    By registering, you agree to act as an official representative and understand that your referral metrics will be tracked.
                                </p>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group overflow-hidden bg-white text-black font-bold text-lg py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-4 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-transparent hover:border-purple-300/50"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    <span className="relative z-10 transition-colors duration-300">
                                        {loading ? 'Processing...' : 'Submit Application'}
                                    </span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <Footer user={profile} />
        </div>
    );
}
