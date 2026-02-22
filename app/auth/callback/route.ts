import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/auth/confirmed'

    console.log('Auth Callback initiated:', { token_hash: !!token_hash, type, code: !!code, next });

    if (token_hash && type) {
        const supabase = await createServerClient()
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url))
        }
        console.error('OTP Verification Error:', error);
        return NextResponse.redirect(new URL(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`, request.url))
    }

    if (code) {
        const supabase = await createServerClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url))
        }
        console.error('Code Exchange Error:', error);
        return NextResponse.redirect(new URL(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`, request.url))
    }

    console.warn('Auth Callback: No token_hash or code provided');
    // return the user to an error page with some instructions
    return NextResponse.redirect(new URL('/auth/auth-code-error?error=No+authentication+code+found', request.url))
}
