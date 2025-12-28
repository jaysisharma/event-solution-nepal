import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request) {
    const path = request.nextUrl.pathname;

    if (path.startsWith('/admin')) {
        const session = request.cookies.get('session')?.value;
        const decrypted = await decrypt(session);

        if (path === '/admin/login') {
            if (decrypted) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            return NextResponse.next();
        }

        if (!decrypted) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
