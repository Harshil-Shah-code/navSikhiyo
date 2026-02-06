import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const authorizedUser = process.env.ADMIN_USERNAME;
        const authorizedPass = process.env.ADMIN_PASSWORD;

        if (!authorizedUser || !authorizedPass) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (username === authorizedUser && password === authorizedPass) {
            const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-PLEASE-CHANGE');

            const token = await new SignJWT({ role: 'admin' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('24h') // Session duration
                .sign(secret);

            const response = NextResponse.json({ success: true, redirectUrl: '/admin-dashboard' });

            response.cookies.set('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24, // 24 hours
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
