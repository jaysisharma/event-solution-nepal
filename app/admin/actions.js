'use server';

import { cookies, headers } from 'next/headers';
import { isRateLimited } from '@/lib/rateLimit';
import prisma from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginAction(prevState, formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    // Rate Limiting
    const ip = (await headers()).get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return { error: 'Too many attempts. Please try again in 1 minute.' };
    }

    const admin = await prisma.adminUser.findUnique({
        where: { username },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return { error: 'Invalid credentials' };
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { id: admin.id, username: admin.username }, expires });

    (await cookies()).set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expires,
        sameSite: 'strict',
        path: '/',
    });

    redirect('/admin');
}

export async function logoutAction() {
    (await cookies()).delete('session');
    redirect('/admin/login');
}
