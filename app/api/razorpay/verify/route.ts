import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET || '';

        // Generate signature hash to verify authenticity
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return NextResponse.json({ error: 'Transaction is not legit!' }, { status: 400 });
        }

        // Signature matches, update database
        const supabase = await createServerClient();

        const { error: updateError } = await supabase
            .from('user_passes')
            .update({
                payment_status: 'success',
                razorpay_payment_id: razorpay_payment_id
            })
            .eq('razorpay_order_id', razorpay_order_id);

        if (updateError) {
            console.error('Failure recording successful payment:', updateError);
            return NextResponse.json({ error: 'Payment received but failed to update record' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Payment verified successfully' });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: 'Internal server error while verifying payment' }, { status: 500 });
    }
}
