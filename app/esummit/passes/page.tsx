'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/esummit/Navbar';
import Footer from '@/components/esummit/Footer';
import PassCard from '@/components/esummit/PassCard';
import toast from 'react-hot-toast';

export default function PassesPage() {
    return <PassesPageContent />;
}

const PassesPageContent = () => {
    const supabase = createClient();
    const [passes, setPasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFeatures, setGlobalFeatures] = useState<string[]>([]);

    // Referral Logic
    const [referralInput, setReferralInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, percentage: number } | null>(null);
    const [verifyingCode, setVerifyingCode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch passes
                const { data: passesData } = await supabase
                    .from('esummit_passes')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                // Fetch global features from settings
                const { data: settingsData } = await supabase
                    .from('esummit_settings')
                    .select('pass_features_list, ca_base_discount_percentage')
                    .single();

                if (passesData) {
                    // Enrich with simulation data for UI
                    const enriched = passesData.map(p => ({
                        ...p,
                        is_sold_out: false
                    }));
                    setPasses(enriched);
                }

                if (settingsData?.pass_features_list) {
                    setGlobalFeatures(settingsData.pass_features_list);
                }
            } catch (err) {
                console.error('Error fetching passes:', err);
                toast.error('Failed to load available passes.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleApplyReferral = async () => {
        if (!referralInput.trim()) return;
        setVerifyingCode(true);

        try {
            // Check for valid referral/promo code
            const { data: refData } = await supabase
                .from('campus_ambassadors')
                .select('referral_code, is_active, discount_override, status')
                .eq('referral_code', referralInput.trim().toUpperCase())
                .eq('is_active', true)
                .eq('status', 'approved')
                .single();

            if (refData) {
                // Determine discount: use override if set, else use global base discount
                let discount = refData.discount_override;

                if (!discount) {
                    const { data: settings } = await supabase
                        .from('esummit_settings')
                        .select('ca_base_discount_percentage')
                        .single();
                    discount = settings?.ca_base_discount_percentage || 10;
                }

                setAppliedDiscount({
                    code: referralInput.trim().toUpperCase(),
                    percentage: discount
                });
                toast.success(`Success! ${discount}% Discount Applied`);
            } else {
                toast.error('Invalid or inactive referral code');
                setAppliedDiscount(null);
            }
        } catch (err) {
            console.error('Referral verification error:', err);
            toast.error('Could not verify code');
        } finally {
            setVerifyingCode(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-esummit-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-esummit-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-esummit-bg text-white">
            <Navbar />

            <main className="relative pt-32 pb-24 px-4 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-esummit-primary/10 blur-[120px] rounded-full -z-10" />

                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-esummit-primary/10 border border-esummit-primary/20 rounded-full text-esummit-accent text-sm font-bold uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 bg-esummit-accent rounded-full animate-pulse" />
                            Events Passes Now Live
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase">
                            Grab Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-esummit-accent to-white">Passes</span> Now!
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Experience the biggest entrepreneurship summit of the year. Choose your pass and unlock exclusive opportunities.
                        </p>
                    </div>

                    {/* Referral Input Section */}
                    <div className="max-w-md mx-auto mb-16 relative">
                        <div className="bg-[#1a1a1a] p-1 rounded-2xl border border-white/5 shadow-2xl flex items-center">
                            <input
                                type="text"
                                value={referralInput}
                                onChange={(e) => setReferralInput(e.target.value)}
                                placeholder="ENTER REFERRAL CODE"
                                className="flex-grow bg-transparent px-6 py-4 outline-none uppercase font-bold tracking-widest text-sm text-esummit-accent placeholder:text-gray-600"
                            />
                            <button
                                onClick={handleApplyReferral}
                                disabled={verifyingCode}
                                className="px-8 py-4 bg-esummit-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-esummit-accent transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                            >
                                {verifyingCode ? '...' : (appliedDiscount ? 'Update' : 'Apply')}
                            </button>
                        </div>
                        {appliedDiscount && (
                            <div className="absolute top-full left-0 right-0 mt-3 text-center">
                                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 inline-flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                    {appliedDiscount.percentage}% Discount Activated with code {appliedDiscount.code}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {passes.map((pass) => (
                            <PassCard
                                key={pass.id}
                                pass={pass}
                                allPossibleFeatures={globalFeatures}
                                appliedDiscount={appliedDiscount || undefined}
                            />
                        ))}
                    </div>

                    {/* Footer Extra Note */}
                    <div className="mt-24 text-center">
                        <p className="text-gray-500 text-sm max-w-xl mx-auto">
                            * All passes include entry to the main venue and basic speaker sessions.
                            Exclusive workshops and networking dinners might require specific pass levels.
                        </p>
                    </div>
                </div>
            </main>

            <Footer user={null} />
        </div>
    );
};
