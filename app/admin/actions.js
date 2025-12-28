'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginAction(prevState, formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    const admin = await prisma.adminUser.findUnique({
        where: { username },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return { error: 'Invalid credentials' };
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { id: admin.id, username: admin.username }, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true });

    redirect('/admin');
}

export async function logoutAction() {
    (await cookies()).delete('session');
    redirect('/admin/login');
}
