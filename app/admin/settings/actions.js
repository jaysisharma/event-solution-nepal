'use server';

import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createAdminUser(formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    try {
        const existing = await prisma.adminUser.findUnique({
            where: { username }
        });

        if (existing) {
            return { error: 'Username already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.adminUser.create({
            data: {
                username,
                password: hashedPassword
            }
        });

        revalidatePath('/admin/settings');
        return { success: 'Admin user created successfully' };
    } catch (error) {
        console.error('Failed to create admin:', error);
        return { error: 'Failed to create admin user' };
    }
}

export async function getAdminUsers() {
    try {
        const users = await prisma.adminUser.findMany({
            select: { id: true, username: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: users };
    } catch (error) {
        return { success: false, error: 'Failed to fetch admins' };
    }
}

export async function deleteAdminUser(id) {
    try {
        // Prevent deleting the last admin or specific protection logic if needed
        const count = await prisma.adminUser.count();
        if (count <= 1) {
            return { error: 'Cannot delete the last admin user' };
        }

        await prisma.adminUser.delete({ where: { id } });
        revalidatePath('/admin/settings');
        return { success: 'Admin deleted successfully' };
    } catch (error) {
        return { error: 'Failed to delete admin' };
    }
}

export async function updateAdminPassword(id, newPassword) {
    if (!newPassword || newPassword.length < 4) {
        return { error: 'Password must be at least 4 characters' };
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.adminUser.update({
            where: { id },
            data: { password: hashedPassword }
        });
        return { success: 'Password updated successfully' };
    } catch (error) {
        console.error('Failed to update password:', error);
        return { error: 'Failed to update password' };
    }
}
