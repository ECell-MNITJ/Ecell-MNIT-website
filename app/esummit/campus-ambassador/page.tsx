'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiGift, FiAward, FiShare2, FiCheck, FiZap, FiMessageCircle, FiVolume2, FiBarChart2 } from 'react-icons/fi';
import CANavbar from '@/components/esummit/CANavbar';
import Footer from '@/components/esummit/Footer';

export default function CampusAmbassadorPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [college, setCollege] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Must be logged in to be a CA
                toast.error('Please log in to register as a Campus Ambassador');
                router.push('/login?next=/esummit/campus-ambassador');
                return;
            }

            // Get profile details
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // Check if already a CA
            const { data: caData, error: caError } = await supabase
                .from('campus_ambassadors')
                .select('*')
                .eq('profile_id', user.id)
                .single();

            if (caData) {
                setIsRegistered(true);
                setReferralCode(caData.referral_code);
                setCollege(caData.college || '');
            }
        } catch (error) {
            console.error('Error checking CA status:', error);
        } finally {
            setLoading(false);
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
                // If not logged in, just stop loading and let the UI show the login prompt in the Apply section
                setLoading(false);
                return;
            }

            // Generate a unique referral code: 'CA' + First 3 letters of name + 4 random digits
            const namePrefix = profile?.full_name
                ? profile.full_name.substring(0, 3).toUpperCase()
                : user.id.substring(0, 3).toUpperCase();
            const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
            const newReferralCode = `CA${namePrefix}${randomDigits}`;

            const { error } = await supabase
                .from('campus_ambassadors')
                .insert({
                    profile_id: user.id,
                    referral_code: newReferralCode,
                    college: college,
                    phone_number: phoneNumber,
                    is_active: true,
                });

            if (error) {
                if (error.code === '23505') { // Unique violation, rare chance of duplicate code
                    toast.error('A collision occurred generating your code. Please try submitting again.');
                } else {
                    throw error;
                }
            } else {
                toast.success('Successfully registered as a Campus Ambassador!');
                setIsRegistered(true);
                setReferralCode(newReferralCode);
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success('Referral code copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-mono text-white selection:bg-purple-500/30">
            <CANavbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <section id="hero" className="relative pt-40 pb-20 px-6 sm:px-12 md:px-24 min-h-[90vh] flex flex-col justify-center items-center overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0a] to-[#0a0a0a] z-0 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 text-center space-y-8 max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-bold tracking-widest uppercase mb-4 backdrop-blur-sm shadow-xl">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Applications Open
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tighter">
                            BE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 animate-gradient-x">FACE</span> OF E-SUMMIT
                        </h1>
                        <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-sans">
                            Lead the entrepreneurial wave on your college campus. Earn exclusive rewards, free access passes, and build a network with top founders and investors.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                            {isRegistered ? (
                                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden max-w-md w-full animate-fade-in-up">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                    <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><FiCheck /></div>
                                        You are an Ambassador!
                                    </h3>
                                    <div className="bg-black/60 font-mono text-3xl font-bold py-4 px-6 rounded-xl text-white mb-4 tracking-widest border border-white/10">
                                        {referralCode}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center justify-center gap-2 w-full text-purple-300 hover:text-white transition-colors py-2"
                                    >
                                        <FiShare2 /> Copy Code to Share
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => router.push('/esummit/campus-ambassador/register')}
                                    className="relative group overflow-hidden bg-white text-black px-12 py-5 rounded-full font-black uppercase text-lg tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)]"
                                >
                                    <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Apply Now</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            )}

                            {!isRegistered && (
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('about-us');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="text-gray-400 hover:text-white font-bold uppercase tracking-widest text-sm underline underline-offset-8 transition-colors"
                                >
                                    Learn More
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <div className="space-y-32 py-20 px-6 sm:px-12 md:px-24">
                    {/* About Us Section */}
                    <section id="about-us" className="scroll-mt-32 max-w-4xl mx-auto text-center md:text-left">
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-3xl font-black mb-4 text-purple-400 uppercase tracking-widest">WHAT IS E-CELL ?</h3>
                                <p className="text-gray-400 text-lg leading-relaxed font-sans">
                                    The Entrepreneurship Cell of MNIT Jaipur is one of the largest student-run, non-profit organizations dedicated to fostering entrepreneurship. With a legacy spanning years of innovation, it has positively impacted thousands of students across India and beyond.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-4 text-pink-400 uppercase tracking-widest">OUR CAMPUS AMBASSADOR PROGRAM</h3>
                                <p className="text-gray-400 text-lg leading-relaxed font-sans">
                                    E-Cell MNIT Jaipur's Campus Ambassador Program is designed to spark the entrepreneurial spirit in students across India. This internship gives you hands-on experience in the startup world while helping you gain practical skills, grow your network and become a leader on your campus.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Why Us Section */}
                    <section id="why-us" className="scroll-mt-32 max-w-6xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-black mb-16 flex items-center justify-center gap-4">
                            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl"><FiGift className="w-8 h-8" /></div>
                            WHY JOIN US?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <div className="bg-gray-900/40 border border-gray-800 p-10 rounded-3xl hover:border-purple-500/50 hover:bg-purple-900/10 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiAward className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Exclusive Rewards</h3>
                                <p className="text-gray-400 font-sans leading-relaxed">Top performers receive exclusive E-Cell merchandise, premium courses, and massive discounts on E-Summit passes for themselves and their friends.</p>
                            </div>
                            <div className="bg-gray-900/40 border border-gray-800 p-10 rounded-3xl hover:border-pink-500/50 hover:bg-pink-900/10 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiUser className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Networking</h3>
                                <p className="text-gray-400 font-sans leading-relaxed">Gain direct access to interact with our esteemed guest speakers, startup founders, top-tier investors, and like-minded student leaders.</p>
                            </div>
                            <div className="bg-gray-900/40 border border-gray-800 p-10 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiCheck className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Certification</h3>
                                <p className="text-gray-400 font-sans leading-relaxed">Receive a verifiable certificate of appreciation from E-Cell MNIT Jaipur, significantly boosting your resume and LinkedIn profile value.</p>
                            </div>
                        </div>
                        <div className="mt-24">
                            <h2 className="text-3xl md:text-5xl font-black mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-600">
                                HOW DO AMBASSADORS ENGAGE?
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                                {/* Card 1: Ideate & Execute */}
                                <div className="bg-gradient-to-b from-[#0a192f]/50 to-transparent border border-blue-900/50 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-300">
                                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-blue-400 bg-blue-500/10 rounded-2xl">
                                        <FiZap className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-white">Ideate & Execute</h3>
                                    <p className="text-gray-400 font-sans text-sm leading-relaxed">
                                        Planning & organising entrepreneurship related events in your college with the support of the E-Cell, MNIT Jaipur.
                                    </p>
                                </div>

                                {/* Card 2: Communicate */}
                                <div className="bg-gradient-to-b from-[#3a2f00]/50 to-transparent border border-yellow-900/50 p-8 rounded-3xl hover:border-yellow-500/50 transition-all duration-300">
                                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-yellow-500 bg-yellow-500/10 rounded-2xl">
                                        <FiMessageCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-white">Communicate</h3>
                                    <p className="text-gray-400 font-sans text-sm leading-relaxed">
                                        Act as a bridge between E-Cell, MNIT Jaipur and your college by sharing information, updates, and opportunities through emails, notices, and social media platforms.
                                    </p>
                                </div>

                                {/* Card 3: Publicise */}
                                <div className="bg-gradient-to-b from-[#2e0000]/50 to-transparent border border-red-900/50 p-8 rounded-3xl hover:border-red-500/50 transition-all duration-300">
                                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-red-500 bg-red-500/10 rounded-2xl">
                                        <FiVolume2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-white">Publicise</h3>
                                    <p className="text-gray-400 font-sans text-sm leading-relaxed">
                                        Act as a channel to share E-Cell, MNIT Jaipur's initiatives that could impact students' careers and interests, helping the information reach those who can benefit from it.
                                    </p>
                                </div>

                                {/* Card 4: Lead */}
                                <div className="bg-gradient-to-b from-[#002e0b]/50 to-transparent border border-green-900/50 p-8 rounded-3xl hover:border-green-500/50 transition-all duration-300">
                                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-green-500 bg-green-500/10 rounded-2xl">
                                        <FiBarChart2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-white">Lead</h3>
                                    <p className="text-gray-400 font-sans text-sm leading-relaxed">
                                        Lead and coordinate with the startup ecosystem in and around your college.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* Terms & Conditions Section */}
                    <section id="terms" className="scroll-mt-32 max-w-4xl mx-auto bg-gray-900/30 border border-gray-800 rounded-3xl p-8 md:p-12">
                        <h2 className="text-2xl md:text-3xl font-black mb-8 text-white uppercase tracking-wider border-b border-gray-800 pb-4">Terms & Conditions</h2>
                        <ul className="space-y-4 text-gray-400 font-sans list-disc pl-6 leading-relaxed">
                            <li>The Campus Ambassador must be a currently enrolled student in a recognized college/university.</li>
                            <li>Referral codes are strictly for use by students of the Ambassador's college or direct network. Mass public distribution on coupon sites is prohibited.</li>
                            <li>Free passes earned through milestones are non-transferable and can only be used by the Ambassador.</li>
                            <li>E-Cell MNIT Jaipur reserves the right to terminate the ambassador status if any fraudulent activity or misrepresentation is detected.</li>
                            <li>The base discount for buyers and the milestone targets for Ambassadors are subject to change at the discretion of the organizing team.</li>
                        </ul>
                    </section>
                </div>
            </main>
            <div id="contact">
                <Footer user={profile} />
            </div>
        </div>
    );
}
