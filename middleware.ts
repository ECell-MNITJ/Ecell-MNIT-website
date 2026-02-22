import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect /admin routes (except login and verify)
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const isAuthPage = request.nextUrl.pathname.startsWith('/admin/login') ||
            request.nextUrl.pathname.startsWith('/admin/verify');

        const isVerified = request.cookies.get('admin-verified')?.value === 'true';

        if (!user && !isAuthPage) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        if (user && request.nextUrl.pathname.startsWith('/admin/login')) {
            return NextResponse.redirect(new URL(isVerified ? '/admin/dashboard' : '/admin/verify', request.url));
        }

        if (user && !isVerified && !request.nextUrl.pathname.startsWith('/admin/verify')) {
            return NextResponse.redirect(new URL('/admin/verify', request.url));
        }

        if (user && isVerified && request.nextUrl.pathname.startsWith('/admin/verify')) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    // Protect /esummit/admin routes (except login and verify)
    if (request.nextUrl.pathname.startsWith('/esummit/admin')) {
        const isAuthPage = request.nextUrl.pathname.startsWith('/esummit/admin/login') ||
            request.nextUrl.pathname.startsWith('/esummit/admin/verify');

        const isVerified = request.cookies.get('esummit-admin-verified')?.value === 'true';

        if (!user && !isAuthPage) {
            return NextResponse.redirect(new URL('/esummit/admin/login', request.url));
        }

        if (user && request.nextUrl.pathname.startsWith('/esummit/admin/login')) {
            return NextResponse.redirect(new URL(isVerified ? '/esummit/admin/dashboard' : '/esummit/admin/verify', request.url));
        }

        if (user && !isVerified && !request.nextUrl.pathname.startsWith('/esummit/admin/verify')) {
            return NextResponse.redirect(new URL('/esummit/admin/verify', request.url));
        }

        if (user && isVerified && request.nextUrl.pathname.startsWith('/esummit/admin/verify')) {
            return NextResponse.redirect(new URL('/esummit/admin/dashboard', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
