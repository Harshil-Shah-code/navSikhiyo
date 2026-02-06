import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin-dashboard and its sub-routes
    if (pathname.startsWith('/admin-dashboard')) {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/nav-portal-login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-PLEASE-CHANGE');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (error) {
            // Invalid token
            return NextResponse.redirect(new URL('/nav-portal-login', request.url));
        }
    }

    // Redirect /nav-portal-login to dashboard if already logged in
    if (pathname === '/nav-portal-login') {
        const token = request.cookies.get('admin_token')?.value;
        if (token) {
            try {
                const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-PLEASE-CHANGE');
                await jwtVerify(token, secret);
                return NextResponse.redirect(new URL('/admin-dashboard', request.url));
            } catch (e) {
                // Token invalid, allow access to login page
                return NextResponse.next();
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin-dashboard/:path*', '/nav-portal-login'],
};
