'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { FiTag, FiCreditCard, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Navbar from '@/components/esummit/Navbar';
import Footer from '@/components/esummit/Footer';

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const passId = searchParams.get('passId');
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [pass, setPass] = useState<any | null>(null);
    const [referralCode, setReferralCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [isAutoApplied, setIsAutoApplied] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (!passId) {
            router.push('/esummit/passes');
            return;
        }
        fetchData();
        loadRazorpay();
    }, [passId]);

    const fetchData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                toast.error('Please log in to continue');
                router.push(`/login?next=/esummit/checkout?passId=${passId || ''}`);
                return;
            }
            setUser(authUser);

            // Fetch settings first to check if passes are enabled
            const { data: settings } = await supabase
                .from('esummit_settings')
                .select('*')
                .single();

            if (settings && settings.passes_enabled === false) {
                toast.error('Passes are currently unavailable');
                router.push('/esummit/passes');
                return;
            }

            const { data: passData, error } = await supabase
                .from('esummit_passes')
                .select('*')
                .eq('id', passId!)
                .single();

            if (error || !passData) throw new Error('Pass not found');
            setPass(passData);

            // Check if user is a CA and eligible for milestone discount
            const { data: caData } = await supabase
                .from('campus_ambassadors')
                .select('referral_code, is_active')
                .eq('profile_id', authUser.id)
                .single();

            if (caData && caData.is_active && caData.referral_code) {
                const { count } = await supabase
                    .from('user_passes')
                    .select('id', { count: 'exact', head: true })
                    .eq('applied_referral_code', caData.referral_code)
                    .eq('payment_status', 'success');

                if (settings) {
                    const refs = count || 0;
                    let calculatedDiscount = 0;

                    if (settings.ca_milestone_2_count && refs >= settings.ca_milestone_2_count) {
                        calculatedDiscount = passData.price * ((settings.ca_milestone_2_discount || 0) / 100);
                    } else if (settings.ca_milestone_1_count && refs >= settings.ca_milestone_1_count) {
                        calculatedDiscount = passData.price * ((settings.ca_milestone_1_discount || 0) / 100);
                    }

                    if (calculatedDiscount > 0) {
                        setReferralCode(caData.referral_code);
                        setDiscountAmount(calculatedDiscount);
                        setIsAutoApplied(true);
                        toast.success('Ambassador Milestone Discount automatically applied!', { icon: '🎉' });
                    }
                }
            }

        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to initialize checkout');
            router.push('/esummit/passes');
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    };

    const handleApplyCode = async () => {
        if (!pass) return;
        if (!referralCode.trim()) return toast.error('Please enter a referral code');

        setIsVerifyingCode(true);
        try {
            const { data: ca, error: caError } = await supabase
                .from('campus_ambassadors')
                .select('profile_id, is_active, discount_override')
                .eq('referral_code', referralCode.trim())
                .single();

            if (caError || !ca || !ca.is_active) {
                toast.error('Invalid or inactive referral code');
                setDiscountAmount(0);
                return;
            }

            let calculatedDiscount = 0;
            if (ca.profile_id === user.id) {
                // ... logic for CA milestone (existing)
                const { count } = await supabase
                    .from('user_passes')
                    .select('id', { count: 'exact', head: true })
                    .eq('applied_referral_code', referralCode.trim())
                    .eq('payment_status', 'success');

                const { data: settings } = await supabase
                    .from('esummit_settings')
                    .select('ca_milestone_1_count, ca_milestone_1_discount, ca_milestone_2_count, ca_milestone_2_discount, ca_base_discount_percentage')
                    .single();

                if (settings) {
                    const refs = count || 0;
                    if (settings.ca_milestone_2_count && refs >= settings.ca_milestone_2_count) {
                        calculatedDiscount = pass.price * ((settings.ca_milestone_2_discount || 0) / 100);
                    } else if (settings.ca_milestone_1_count && refs >= settings.ca_milestone_1_count) {
                        calculatedDiscount = pass.price * ((settings.ca_milestone_1_discount || 0) / 100);
                    } else {
                        // Use override if present, otherwise base
                        const discountPercent = ca.discount_override || settings.ca_base_discount_percentage || 0;
                        calculatedDiscount = pass.price * (discountPercent / 100);
                    }
                }
            } else {
                // Check for override on generic/other CA codes
                if (ca.discount_override) {
                    calculatedDiscount = pass.price * (ca.discount_override / 100);
                } else {
                    const { data: settings } = await supabase.from('esummit_settings').select('ca_base_discount_percentage').single();
                    if (settings && settings.ca_base_discount_percentage) {
                        calculatedDiscount = pass.price * (settings.ca_base_discount_percentage / 100);
                    }
                }
            }

            setDiscountAmount(calculatedDiscount);
            toast.success('Referral code applied!');
        } catch (error) {
            console.error('Error verifying code:', error);
            toast.error('Failed to verify referral code');
            setDiscountAmount(0);
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleCheckout = async () => {
        setProcessingPayment(true);
        try {
            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passId: pass.id,
                    referralCode: referralCode.trim() || null
                }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

            if (orderData.isFree) {
                toast.success('Pass acquired successfully!');
                router.push('/esummit');
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "E-Cell MNIT",
                description: `Purchase: ${orderData.passName}`,
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(response),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            toast.success('Payment successful!');
                            router.push('/esummit');
                        } else {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }
                    } catch (error: any) {
                        toast.error(error.message);
                    }
                },
                prefill: {
                    name: user.user_metadata?.full_name || "User",
                    email: user.email,
                },
                theme: { color: "#2563eb" } // esummit-primary
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Checkout failed');
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading || !pass) return (
        <div className="min-h-screen bg-esummit-bg flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esummit-primary"></div>
        </div>
    );

    const finalPrice = pass ? Math.max(0, pass.price - discountAmount) : 0;

    return (
        <div className="min-h-screen bg-esummit-bg text-white font-body selection:bg-esummit-primary/30">
            <Navbar />
            <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <FiArrowLeft /> Back to passes
                </button>

                <div className="mb-12">
                    <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-esummit-accent to-white">Checkout</h1>
                    <p className="text-esummit-secondary/60 text-sm">Review your pass details and complete the payment.</p>
                </div>

                <div className="grid md:grid-cols-5 gap-8 items-start">
                    <div className="md:col-span-3 space-y-6">

                        <div className="bg-esummit-card/50 backdrop-blur-md border border-esummit-primary/20 rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FiCheck className="text-esummit-accent" /> Pass Summary
                            </h2>
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                <div>
                                    <h3 className="font-bold text-white uppercase tracking-wider">{pass.name}</h3>
                                    <p className="text-xs text-esummit-secondary/40">Full Access Pass</p>
                                </div>
                                <span className="text-xl font-bold text-esummit-accent">₹{pass.price}</span>
                            </div>
                        </div>

                        <div className="bg-esummit-card/50 backdrop-blur-md border border-esummit-primary/20 rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-esummit-accent">
                                <FiTag /> Have a Referral Code?
                            </h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                    placeholder={isAutoApplied ? "Milestone Discount Active" : "e.g. CAABC1234"}
                                    disabled={isAutoApplied}
                                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-esummit-primary/50 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    onClick={handleApplyCode}
                                    disabled={isVerifyingCode || !referralCode.trim() || isAutoApplied}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${isAutoApplied
                                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                        : 'bg-esummit-primary/20 hover:bg-esummit-primary/40 border border-esummit-primary/30 disabled:opacity-50 text-esummit-accent'
                                        }`}
                                >
                                    {isVerifyingCode ? '...' : isAutoApplied ? 'Applied' : 'Apply'}
                                </button>
                            </div>
                            {isAutoApplied && (
                                <p className="text-xs text-green-400 mt-3 font-bold uppercase tracking-wide">
                                    ★ You have reached a Campus Ambassador milestone! This discount is locked in.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-esummit-primary rounded-2xl p-6 text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-esummit-primary via-esummit-accent to-esummit-primary opacity-50 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-10">
                                <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <FiCreditCard /> Order Total
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-white/70 text-sm">
                                        <span>Subtotal</span>
                                        <span>₹{pass.price}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-white font-bold text-sm">
                                            <span>Discount</span>
                                            <span>-₹{discountAmount}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 mt-1 border-t border-white/20">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold uppercase tracking-wider text-[10px]">Total Due</span>
                                            <span className="text-3xl font-black">₹{Math.round(finalPrice)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={processingPayment}
                                    className="w-full mt-8 bg-white text-esummit-primary font-black py-4 rounded-xl text-base hover:bg-esummit-bg hover:text-white transition-all duration-300 disabled:opacity-70 shadow-[0_15px_30px_rgba(0,0,0,0.2)] uppercase tracking-widest"
                                >
                                    {processingPayment ? 'Processing...' : (finalPrice <= 0 ? 'Get Pass Now' : `Pay Now`)}
                                </button>
                                {finalPrice > 0 && <p className="text-center text-[10px] uppercase tracking-[0.2em] font-bold mt-5 opacity-60">Secure payment via Razorpay</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer user={null} />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-esummit-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esummit-primary"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
