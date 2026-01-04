'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getSiteSettings() {
    try {
        let settings = await prisma.siteSettings.findFirst();
        if (!settings) {
            // Create default if not exists
            settings = await prisma.siteSettings.create({
                data: {
                    whatsappNumber: '9779851336342', // Default from requirements
                }
            });
        }
        return { success: true, data: settings };
    } catch (error) {
        console.error('Failed to fetch site settings:', error);
        return { error: 'Failed to fetch site settings' };
    }
}

export async function updateSiteSettings(data) {
    try {
        const first = await prisma.siteSettings.findFirst();

        let settings;
        if (first) {
            settings = await prisma.siteSettings.update({
                where: { id: first.id },
                data: {
                    whatsappNumber: data.whatsappNumber
                }
            });
        } else {
            settings = await prisma.siteSettings.create({
                data: {
                    whatsappNumber: data.whatsappNumber
                }
            });
        }

        revalidatePath('/');
        return { success: 'Settings updated successfully', data: settings };
    } catch (error) {
        console.error('Failed to update site settings:', error);
        return { error: 'Failed to update site settings' };
    }
}
