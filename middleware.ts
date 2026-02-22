import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Protect /admin routes (except login and verify)
    if (req.nextUrl.pathname.startsWith('/admin')) {
        const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login') ||
            req.nextUrl.pathname.startsWith('/admin/verify');

        // Check for admin verification cookie
        const isVerified = req.cookies.get('admin-verified')?.value === 'true';

        if (!session && !isAuthPage) {
            // Not logged in - redirect to login
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        if (session && req.nextUrl.pathname.startsWith('/admin/login')) {
            // Already logged in, redirect to verify or dashboard
            return NextResponse.redirect(new URL(isVerified ? '/admin/dashboard' : '/admin/verify', req.url));
        }

        if (session && !isVerified && !req.nextUrl.pathname.startsWith('/admin/verify')) {
            // Logged in but not verified - redirect to verify
            return NextResponse.redirect(new URL('/admin/verify', req.url));
        }

        if (session && isVerified && req.nextUrl.pathname.startsWith('/admin/verify')) {
            // Already verified - redirect to dashboard
            return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
    }

    // Protect /esummit/admin routes (except login and verify)
    if (req.nextUrl.pathname.startsWith('/esummit/admin')) {
        const isAuthPage = req.nextUrl.pathname.startsWith('/esummit/admin/login') ||
            req.nextUrl.pathname.startsWith('/esummit/admin/verify');

        // Check for admin verification cookie
        const isVerified = req.cookies.get('esummit-admin-verified')?.value === 'true';

        if (!session && !isAuthPage) {
            // Not logged in - redirect to login
            return NextResponse.redirect(new URL('/esummit/admin/login', req.url));
        }

        if (session && req.nextUrl.pathname.startsWith('/esummit/admin/login')) {
            // Already logged in, redirect to verify or dashboard
            return NextResponse.redirect(new URL(isVerified ? '/esummit/admin/dashboard' : '/esummit/admin/verify', req.url));
        }

        if (session && !isVerified && !req.nextUrl.pathname.startsWith('/esummit/admin/verify')) {
            // Logged in but not verified - redirect to verify
            return NextResponse.redirect(new URL('/esummit/admin/verify', req.url));
        }

        if (session && isVerified && req.nextUrl.pathname.startsWith('/esummit/admin/verify')) {
            // Already verified - redirect to dashboard
            return NextResponse.redirect(new URL('/esummit/admin/dashboard', req.url));
        }
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/esummit/admin/:path*'],
};
