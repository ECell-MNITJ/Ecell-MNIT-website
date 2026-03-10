import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const supabase = await createServerClient();

        // Check if passes are enabled
        const { data: settings } = await supabase
            .from('esummit_settings')
            .select('passes_enabled')
            .single();

        if (settings?.passes_enabled === false) {
            return NextResponse.json({ error: 'Passes are currently disabled' }, { status: 403 });
        }

        // Ensure user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { passId, referralCode } = body;

        if (!passId) {
            return NextResponse.json({ error: 'Pass ID is required' }, { status: 400 });
        }

        // Fetch Pass Details
        const { data: pass, error: passError } = await supabase
            .from('esummit_passes')
            .select('*')
            .eq('id', passId)
            .single();

        if (passError || !pass) {
            return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
        }

        if (!pass.is_active) {
            return NextResponse.json({ error: 'This pass is not currently active' }, { status: 400 });
        }

        let finalPrice = pass.price;
        let appliedReferralCode = null;

        // Apply Referral Code Logic if provided
        if (referralCode) {
            // First check if the referral code is valid and active
            const { data: ca, error: caError } = await supabase
                .from('campus_ambassadors')
                .select('profile_id, is_active, discount_override')
                .eq('referral_code', referralCode)
                .single();

            if (!caError && ca && ca.is_active) {
                appliedReferralCode = referralCode;
                // Determine the correct discount
                if (ca.profile_id === user.id) {
                    // It's the CA themselves buying the pass
                    // Check their milestones
                    const { count: referralCount } = await supabase
                        .from('user_passes')
                        .select('id', { count: 'exact', head: true })
                        .eq('applied_referral_code', referralCode)
                        .eq('payment_status', 'success');

                    const { data: settings } = await supabase
                        .from('esummit_settings')
                        .select('ca_milestone_1_count, ca_milestone_1_discount, ca_milestone_2_count, ca_milestone_2_discount, ca_base_discount_percentage')
                        .single();

                    if (settings) {
                        const count = referralCount || 0;
                        if (settings.ca_milestone_2_count && count >= settings.ca_milestone_2_count) {
                            finalPrice = pass.price * (1 - (settings.ca_milestone_2_discount || 0) / 100);
                        } else if (settings.ca_milestone_1_count && count >= settings.ca_milestone_1_count) {
                            finalPrice = pass.price * (1 - (settings.ca_milestone_1_discount || 0) / 100);
                        } else {
                            // Use override if present, otherwise base
                            const discountPercent = ca.discount_override || settings.ca_base_discount_percentage || 0;
                            finalPrice = pass.price * (1 - discountPercent / 100);
                        }
                    }

                } else {
                    // Regular buyer using a CA/Promo code
                    if (ca.discount_override) {
                        finalPrice = pass.price * (1 - ca.discount_override / 100);
                    } else {
                        const { data: settings } = await supabase
                            .from('esummit_settings')
                            .select('ca_base_discount_percentage')
                            .single();
                        if (settings && settings.ca_base_discount_percentage) {
                            finalPrice = pass.price * (1 - settings.ca_base_discount_percentage / 100);
                        }
                    }
                }
            } else {
                return NextResponse.json({ error: 'Invalid or inactive referral code' }, { status: 400 });
            }
        }

        // Razorpay expects amount in smallest currency unit (paise for INR)
        if (finalPrice <= 0) {
            // Free pass via 100% discount
            // Use upsert to handle cases where a pending/failed record might already exist
            const { error: insertError } = await supabase
                .from('user_passes')
                .upsert({
                    user_id: user.id,
                    pass_id: pass.id,
                    payment_status: 'success',
                    amount_paid: 0,
                    applied_referral_code: appliedReferralCode
                }, { onConflict: 'user_id,pass_id' });

            if (insertError) {
                console.error('Error recording free pass:', insertError);
                return NextResponse.json({ error: `Database error: ${insertError.message}` }, { status: 500 });
            }

            return NextResponse.json({ success: true, isFree: true });
        }

        const amountInPaise = Math.round(finalPrice * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Store pending record in user_passes using upsert
        const { error: insertError } = await supabase
            .from('user_passes')
            .upsert({
                user_id: user.id,
                pass_id: pass.id,
                razorpay_order_id: order.id,
                payment_status: 'pending',
                amount_paid: finalPrice,
                applied_referral_code: appliedReferralCode
            }, { onConflict: 'user_id,pass_id' });

        if (insertError) {
            console.error('Error recording pending pass:', insertError);
            return NextResponse.json({ error: `Database error: ${insertError.message}` }, { status: 500 });
        }

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            passName: pass.name
        });
    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        return NextResponse.json({
            error: error?.message || 'Internal server error while creating order'
        }, { status: 500 });
    }
}
