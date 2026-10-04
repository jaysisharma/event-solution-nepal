'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SERVICES_LINKS, DEFAULT_QUICK_LINKS, DEFAULT_FOOTER_SETTINGS } from '@/lib/siteDefaults';

export async function getSiteSettings() {
    try {
        let settings = await prisma.siteSettings.findFirst();
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: DEFAULT_FOOTER_SETTINGS
            });
        }

        const merged = {
            ...DEFAULT_FOOTER_SETTINGS,
            ...settings,
            whatsappNumber: settings.whatsappNumber || DEFAULT_FOOTER_SETTINGS.whatsappNumber,
            contactEmail: settings.contactEmail || DEFAULT_FOOTER_SETTINGS.contactEmail,
            contactAddress: settings.contactAddress || DEFAULT_FOOTER_SETTINGS.contactAddress,
            phone1: settings.phone1 || DEFAULT_FOOTER_SETTINGS.phone1,
            phone2: settings.phone2 || DEFAULT_FOOTER_SETTINGS.phone2,
            footerAbout: settings.footerAbout || DEFAULT_FOOTER_SETTINGS.footerAbout,
            facebookUrl: settings.facebookUrl || DEFAULT_FOOTER_SETTINGS.facebookUrl,
            instagramUrl: settings.instagramUrl || DEFAULT_FOOTER_SETTINGS.instagramUrl,
            tiktokUrl: settings.tiktokUrl || DEFAULT_FOOTER_SETTINGS.tiktokUrl,
            linkedinUrl: settings.linkedinUrl || DEFAULT_FOOTER_SETTINGS.linkedinUrl,
            viberUrl: settings.viberUrl || DEFAULT_FOOTER_SETTINGS.viberUrl,
            servicesTitle: settings.servicesTitle || DEFAULT_FOOTER_SETTINGS.servicesTitle,
            servicesLinks: settings.servicesLinks || DEFAULT_FOOTER_SETTINGS.servicesLinks,
            quickLinksTitle: settings.quickLinksTitle || DEFAULT_FOOTER_SETTINGS.quickLinksTitle,
            quickLinks: settings.quickLinks || DEFAULT_FOOTER_SETTINGS.quickLinks,
            copyrightText: settings.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText,
            privacyPolicyUrl: settings.privacyPolicyUrl || DEFAULT_FOOTER_SETTINGS.privacyPolicyUrl,
            termsOfServiceUrl: settings.termsOfServiceUrl || DEFAULT_FOOTER_SETTINGS.termsOfServiceUrl,
        };

        return { success: true, data: merged };
    } catch (error) {
        console.error('Failed to fetch site settings:', error);
        return { error: 'Failed to fetch site settings', data: DEFAULT_FOOTER_SETTINGS };
    }
}

export async function updateSiteSettings(data) {
    try {
        const first = await prisma.siteSettings.findFirst();

        const updatePayload = {
            whatsappNumber: data.whatsappNumber ?? DEFAULT_FOOTER_SETTINGS.whatsappNumber,
            contactEmail: data.contactEmail ?? DEFAULT_FOOTER_SETTINGS.contactEmail,
            contactAddress: data.contactAddress ?? DEFAULT_FOOTER_SETTINGS.contactAddress,
            phone1: data.phone1 ?? DEFAULT_FOOTER_SETTINGS.phone1,
            phone2: data.phone2 ?? DEFAULT_FOOTER_SETTINGS.phone2,
            footerAbout: data.footerAbout ?? DEFAULT_FOOTER_SETTINGS.footerAbout,
            facebookUrl: data.facebookUrl ?? DEFAULT_FOOTER_SETTINGS.facebookUrl,
            instagramUrl: data.instagramUrl ?? DEFAULT_FOOTER_SETTINGS.instagramUrl,
            tiktokUrl: data.tiktokUrl ?? DEFAULT_FOOTER_SETTINGS.tiktokUrl,
            linkedinUrl: data.linkedinUrl ?? DEFAULT_FOOTER_SETTINGS.linkedinUrl,
            viberUrl: data.viberUrl ?? DEFAULT_FOOTER_SETTINGS.viberUrl,
            servicesTitle: data.servicesTitle ?? DEFAULT_FOOTER_SETTINGS.servicesTitle,
            servicesLinks: typeof data.servicesLinks === 'string' ? data.servicesLinks : JSON.stringify(data.servicesLinks || DEFAULT_SERVICES_LINKS),
            quickLinksTitle: data.quickLinksTitle ?? DEFAULT_FOOTER_SETTINGS.quickLinksTitle,
            quickLinks: typeof data.quickLinks === 'string' ? data.quickLinks : JSON.stringify(data.quickLinks || DEFAULT_QUICK_LINKS),
            copyrightText: data.copyrightText ?? DEFAULT_FOOTER_SETTINGS.copyrightText,
            privacyPolicyUrl: data.privacyPolicyUrl ?? DEFAULT_FOOTER_SETTINGS.privacyPolicyUrl,
            termsOfServiceUrl: data.termsOfServiceUrl ?? DEFAULT_FOOTER_SETTINGS.termsOfServiceUrl,
        };

        let settings;
        if (first) {
            settings = await prisma.siteSettings.update({
                where: { id: first.id },
                data: updatePayload
            });
        } else {
            settings = await prisma.siteSettings.create({
                data: updatePayload
            });
        }

        revalidatePath('/');
        return { success: 'Settings updated successfully', data: settings };
    } catch (error) {
        console.error('Failed to update site settings:', error);
        return { error: 'Failed to update site settings' };
    }
}
