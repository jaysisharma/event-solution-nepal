'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';
import { seedDefaultExhibitorsIfEmpty } from '@/lib/exhibitorService';

/* =========================================================================
   EVENTS CRUD
   ========================================================================= */

export async function createEvent(formData) {
    try {
        const title = formData.get('title')?.trim();
        if (!title) {
            return { success: false, error: 'Event title is required' };
        }

        let slug = formData.get('slug')?.trim();
        if (!slug) {
            slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        // Check if slug exists
        const existing = await prisma.exhibitorEvent.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        let previewImage = formData.get('previewImage')?.trim() || '';
        const imageFile = formData.get('previewImageFile');
        if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
            const uploaded = await saveFile(imageFile, 'exhibitors/events');
            if (uploaded) previewImage = uploaded;
        }

        const chronicleNumber = formData.get('chronicleNumber')?.trim() || '01';
        const description = formData.get('description')?.trim() || '';

        const count = await prisma.exhibitorEvent.count();

        const created = await prisma.exhibitorEvent.create({
            data: {
                title,
                slug,
                chronicleNumber,
                description,
                previewImage,
                order: count,
            }
        });

        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');

        return { success: true, event: created };
    } catch (error) {
        console.error("Create Event Error:", error);
        return { success: false, error: error.message || 'Failed to create event' };
    }
}

export async function updateEvent(formData) {
    try {
        const id = parseInt(formData.get('id'));
        const title = formData.get('title')?.trim();

        if (!id || !title) {
            return { success: false, error: 'Event ID and title are required' };
        }

        let previewImage = formData.get('previewImage')?.trim();
        const imageFile = formData.get('previewImageFile');
        if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
            const uploaded = await saveFile(imageFile, 'exhibitors/events');
            if (uploaded) previewImage = uploaded;
        }

        const chronicleNumber = formData.get('chronicleNumber')?.trim() || '01';
        const description = formData.get('description')?.trim() || '';

        const updateData = {
            title,
            chronicleNumber,
            description,
        };
        if (previewImage) updateData.previewImage = previewImage;

        await prisma.exhibitorEvent.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Update Event Error:", error);
        return { success: false, error: error.message || 'Failed to update event' };
    }
}

export async function deleteEvent(id) {
    try {
        const eventId = parseInt(id);
        if (!eventId) return { success: false, error: 'Invalid event ID' };

        await prisma.exhibitorEvent.delete({
            where: { id: eventId }
        });

        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Delete Event Error:", error);
        return { success: false, error: error.message || 'Failed to delete event' };
    }
}

/* =========================================================================
   EDITIONS CRUD
   ========================================================================= */

export async function createEdition(formData) {
    try {
        const eventId = parseInt(formData.get('eventId'));
        const year = formData.get('year')?.trim();
        const dates = formData.get('dates')?.trim() || '';
        const venue = formData.get('venue')?.trim() || '';
        const attendees = formData.get('attendees')?.trim() || '100K+';
        const title = formData.get('title')?.trim() || `Edition ${year}`;

        if (!eventId || !year) {
            return { success: false, error: 'Event and Year are required' };
        }

        let previewImage = formData.get('previewImage')?.trim() || '';
        const imageFile = formData.get('previewImageFile');
        if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
            const uploaded = await saveFile(imageFile, 'exhibitors/editions');
            if (uploaded) previewImage = uploaded;
        }

        const count = await prisma.exhibitorEdition.count({ where: { eventId } });

        const created = await prisma.exhibitorEdition.create({
            data: {
                eventId,
                year,
                title,
                dates,
                venue,
                attendees,
                previewImage,
                order: count
            },
            include: { event: true }
        });

        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');
        if (created.event?.slug) {
            revalidatePath(`/exhibitors/${created.event.slug}/${year}`);
            revalidatePath(`/admin/exhibitors/${created.event.slug}/${year}`);
        }

        return { success: true, edition: created };
    } catch (error) {
        console.error("Create Edition Error:", error);
        return { success: false, error: error.message || "Failed to create edition" };
    }
}

export async function updateEdition(formData) {
    try {
        const id = parseInt(formData.get('id'));
        const year = formData.get('year')?.trim();
        const dates = formData.get('dates')?.trim() || '';
        const venue = formData.get('venue')?.trim() || '';
        const attendees = formData.get('attendees')?.trim() || '100K+';
        const title = formData.get('title')?.trim() || `Edition ${year}`;

        if (!id || !year) {
            return { success: false, error: 'Edition ID and Year are required' };
        }

        let previewImage = formData.get('previewImage')?.trim();
        const imageFile = formData.get('previewImageFile');
        if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
            const uploaded = await saveFile(imageFile, 'exhibitors/editions');
            if (uploaded) previewImage = uploaded;
        }

        const updateData = {
            year,
            title,
            dates,
            venue,
            attendees
        };
        if (previewImage) updateData.previewImage = previewImage;

        const updated = await prisma.exhibitorEdition.update({
            where: { id },
            data: updateData,
            include: { event: true }
        });

        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');
        if (updated.event?.slug) {
            revalidatePath(`/exhibitors/${updated.event.slug}/${year}`);
            revalidatePath(`/admin/exhibitors/${updated.event.slug}/${year}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Update Edition Error:", error);
        return { success: false, error: error.message || "Failed to update edition" };
    }
}

export async function deleteEdition(id) {
    try {
        const editionId = parseInt(id);
        if (!editionId) return { success: false, error: 'Invalid edition ID' };

        const edition = await prisma.exhibitorEdition.findUnique({
            where: { id: editionId },
            include: { event: true }
        });

        await prisma.exhibitorEdition.delete({
            where: { id: editionId }
        });

        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');
        if (edition?.event?.slug) {
            revalidatePath(`/exhibitors/${edition.event.slug}/${edition.year}`);
            revalidatePath(`/admin/exhibitors/${edition.event.slug}/${edition.year}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Delete Edition Error:", error);
        return { success: false, error: error.message || "Failed to delete edition" };
    }
}

/* =========================================================================
   EXHIBITORS CRUD
   ========================================================================= */

export async function createExhibitor(formData) {
    try {
        const editionId = parseInt(formData.get('editionId'));
        const eventSlug = formData.get('eventSlug');
        const year = formData.get('year');
        const name = formData.get('name')?.trim();

        if (!editionId || !name) {
            return { success: false, error: 'Name and Edition are required' };
        }

        // Generate slug from name
        let slug = formData.get('slug')?.trim();
        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        // Logo handling: either chosen public logo OR uploaded image file
        let logo = formData.get('logoSelected') || '';
        const logoFile = formData.get('logoFile');
        if (logoFile && typeof logoFile === 'object' && logoFile.size > 0) {
            const uploadedPath = await saveFile(logoFile, 'exhibitors/logos');
            if (uploadedPath) logo = uploadedPath;
        }

        const contactPerson = formData.get('contactPerson')?.trim() || '';
        const contact = formData.get('contact')?.trim() || '';
        const email = formData.get('email')?.trim() || '';
        const website = formData.get('website')?.trim() || '';
        const booth = formData.get('booth')?.trim() || '';
        const category = formData.get('category')?.trim() || 'Exhibition Showcase';
        const tagline = formData.get('tagline')?.trim() || '';
        const description = formData.get('description')?.trim() || '';

        // Photos handling (URLs or files)
        const photoUrls = [];
        const photo1 = formData.get('photo1')?.trim();
        const photo2 = formData.get('photo2')?.trim();
        const photo3 = formData.get('photo3')?.trim();
        if (photo1) photoUrls.push(photo1);
        if (photo2) photoUrls.push(photo2);
        if (photo3) photoUrls.push(photo3);

        for (let i = 1; i <= 3; i++) {
            const file = formData.get(`photoFile${i}`);
            if (file && typeof file === 'object' && file.size > 0) {
                const uploaded = await saveFile(file, 'exhibitors/photos');
                if (uploaded) photoUrls.push(uploaded);
            }
        }

        const videoUrl = formData.get('videoUrl')?.trim() || '';
        const videoPoster = formData.get('videoPoster')?.trim() || (photoUrls[0] || '');
        const videoTitle = formData.get('videoTitle')?.trim() || `${name} Showcase Video`;

        // Check if slug exists in this edition
        const existing = await prisma.exhibitor.findUnique({
            where: {
                editionId_slug: {
                    editionId,
                    slug
                }
            }
        });

        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const count = await prisma.exhibitor.count({ where: { editionId } });

        await prisma.exhibitor.create({
            data: {
                editionId,
                slug,
                name,
                logo,
                contactPerson,
                contact,
                email,
                website,
                booth,
                category,
                tagline,
                description,
                photos: JSON.stringify(photoUrls),
                videoUrl,
                videoPoster,
                videoTitle,
                order: count
            }
        });

        revalidatePath('/admin/exhibitors');
        if (eventSlug && year) {
            revalidatePath(`/admin/exhibitors/${eventSlug}/${year}`);
            revalidatePath(`/exhibitors/${eventSlug}/${year}`);
        }
        revalidatePath('/exhibitors');

        return { success: true, slug };
    } catch (error) {
        console.error("Create Exhibitor Error:", error);
        return { success: false, error: error.message || "Failed to create exhibitor" };
    }
}

export async function updateExhibitor(formData) {
    try {
        const id = parseInt(formData.get('id'));
        const eventSlug = formData.get('eventSlug');
        const year = formData.get('year');
        const name = formData.get('name')?.trim();

        if (!id || !name) {
            return { success: false, error: 'Exhibitor ID and Name are required' };
        }

        let logo = formData.get('logoSelected');
        const logoFile = formData.get('logoFile');
        if (logoFile && typeof logoFile === 'object' && logoFile.size > 0) {
            const uploadedPath = await saveFile(logoFile, 'exhibitors/logos');
            if (uploadedPath) logo = uploadedPath;
        }

        const contactPerson = formData.get('contactPerson')?.trim() || '';
        const contact = formData.get('contact')?.trim() || '';
        const email = formData.get('email')?.trim() || '';
        const website = formData.get('website')?.trim() || '';
        const booth = formData.get('booth')?.trim() || '';
        const category = formData.get('category')?.trim() || 'Exhibition Showcase';
        const tagline = formData.get('tagline')?.trim() || '';
        const description = formData.get('description')?.trim() || '';

        const photoUrls = [];
        const photo1 = formData.get('photo1')?.trim();
        const photo2 = formData.get('photo2')?.trim();
        const photo3 = formData.get('photo3')?.trim();
        if (photo1) photoUrls.push(photo1);
        if (photo2) photoUrls.push(photo2);
        if (photo3) photoUrls.push(photo3);

        for (let i = 1; i <= 3; i++) {
            const file = formData.get(`photoFile${i}`);
            if (file && typeof file === 'object' && file.size > 0) {
                const uploaded = await saveFile(file, 'exhibitors/photos');
                if (uploaded) photoUrls.push(uploaded);
            }
        }

        const videoUrl = formData.get('videoUrl')?.trim() || '';
        const videoPoster = formData.get('videoPoster')?.trim() || (photoUrls[0] || '');
        const videoTitle = formData.get('videoTitle')?.trim() || `${name} Showcase Video`;

        const updateData = {
            name,
            contactPerson,
            contact,
            email,
            website,
            booth,
            category,
            tagline,
            description,
            videoUrl,
            videoPoster,
            videoTitle
        };

        if (logo) updateData.logo = logo;
        if (photoUrls.length > 0) updateData.photos = JSON.stringify(photoUrls);

        const updated = await prisma.exhibitor.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/exhibitors');
        if (eventSlug && year) {
            revalidatePath(`/admin/exhibitors/${eventSlug}/${year}`);
            revalidatePath(`/exhibitors/${eventSlug}/${year}`);
            revalidatePath(`/exhibitors/${eventSlug}/${year}/${updated.slug}`);
        }
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Update Exhibitor Error:", error);
        return { success: false, error: error.message || "Failed to update exhibitor" };
    }
}

export async function deleteExhibitor(id, eventSlug, year) {
    try {
        const exhibitorId = parseInt(id);
        if (!exhibitorId) return { success: false, error: 'Invalid ID' };

        await prisma.exhibitor.delete({
            where: { id: exhibitorId }
        });

        revalidatePath('/admin/exhibitors');
        if (eventSlug && year) {
            revalidatePath(`/admin/exhibitors/${eventSlug}/${year}`);
            revalidatePath(`/exhibitors/${eventSlug}/${year}`);
        }
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Delete Exhibitor Error:", error);
        return { success: false, error: error.message || "Failed to delete exhibitor" };
    }
}

export async function approveExhibitor(id) {
    try {
        const exhibitorId = parseInt(id);
        if (!exhibitorId) return { success: false, error: 'Invalid ID' };

        const updated = await prisma.exhibitor.update({
            where: { id: exhibitorId },
            data: { status: 'APPROVED' },
            include: {
                edition: {
                    include: { event: true }
                }
            }
        });

        revalidatePath('/admin/exhibitors');
        if (updated.edition?.event?.slug && updated.edition?.year) {
            revalidatePath(`/admin/exhibitors/${updated.edition.event.slug}/${updated.edition.year}`);
            revalidatePath(`/exhibitors/${updated.edition.event.slug}/${updated.edition.year}`);
            revalidatePath(`/exhibitors/${updated.edition.event.slug}/${updated.edition.year}/${updated.slug}`);
        }
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Approve Exhibitor Error:", error);
        return { success: false, error: error.message || 'Failed to approve exhibitor' };
    }
}

export async function rejectExhibitor(id) {
    try {
        const exhibitorId = parseInt(id);
        if (!exhibitorId) return { success: false, error: 'Invalid ID' };

        const updated = await prisma.exhibitor.update({
            where: { id: exhibitorId },
            data: { status: 'REJECTED' },
            include: {
                edition: {
                    include: { event: true }
                }
            }
        });

        revalidatePath('/admin/exhibitors');
        if (updated.edition?.event?.slug && updated.edition?.year) {
            revalidatePath(`/admin/exhibitors/${updated.edition.event.slug}/${updated.edition.year}`);
            revalidatePath(`/exhibitors/${updated.edition.event.slug}/${updated.edition.year}`);
        }
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Reject Exhibitor Error:", error);
        return { success: false, error: error.message || 'Failed to reject exhibitor' };
    }
}

export async function submitPublicExhibitorApplication(formData) {
    try {
        let editionId = parseInt(formData.get('editionId'));
        const eventSlug = formData.get('eventSlug');
        const year = formData.get('year');
        const name = formData.get('name')?.trim();

        if (!editionId && eventSlug && year) {
            const ev = await prisma.exhibitorEvent.findUnique({
                where: { slug: eventSlug },
                include: { editions: true }
            });
            const ed = ev?.editions.find((e) => e.year === year);
            if (ed) editionId = ed.id;
        }

        if (!editionId || !name) {
            return { success: false, error: 'Company Name and target Exhibition Edition are required' };
        }

        let slug = formData.get('slug')?.trim();
        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        let logo = formData.get('logoSelected') || '';
        const logoFile = formData.get('logoFile');
        if (logoFile && typeof logoFile === 'object' && logoFile.size > 0) {
            const uploadedPath = await saveFile(logoFile, 'exhibitors/logos');
            if (uploadedPath) logo = uploadedPath;
        }

        const contactPerson = formData.get('contactPerson')?.trim() || '';
        const contact = formData.get('contact')?.trim() || '';
        const email = formData.get('email')?.trim() || '';
        const website = formData.get('website')?.trim() || '';
        const booth = formData.get('booth')?.trim() || '';
        const category = formData.get('category')?.trim() || 'Exhibition Showcase';
        const tagline = formData.get('tagline')?.trim() || '';
        const description = formData.get('description')?.trim() || '';

        const photoUrls = [];
        for (let i = 1; i <= 3; i++) {
            const photoUrl = formData.get(`photo${i}`)?.trim();
            if (photoUrl) photoUrls.push(photoUrl);

            const file = formData.get(`photoFile${i}`);
            if (file && typeof file === 'object' && file.size > 0) {
                const uploaded = await saveFile(file, 'exhibitors/photos');
                if (uploaded) photoUrls.push(uploaded);
            }
        }

        const videoUrl = formData.get('videoUrl')?.trim() || '';
        const videoPoster = formData.get('videoPoster')?.trim() || (photoUrls[0] || '');
        const videoTitle = formData.get('videoTitle')?.trim() || `${name} Showcase Video`;

        const existing = await prisma.exhibitor.findUnique({
            where: {
                editionId_slug: { editionId, slug }
            }
        });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const count = await prisma.exhibitor.count({ where: { editionId } });

        await prisma.exhibitor.create({
            data: {
                editionId,
                slug,
                name,
                logo,
                contactPerson,
                contact,
                email,
                website,
                booth,
                category,
                tagline,
                description,
                photos: JSON.stringify(photoUrls),
                videoUrl,
                videoPoster,
                videoTitle,
                order: count,
                status: 'PENDING'
            }
        });

        revalidatePath('/admin/exhibitors');
        return { success: true };
    } catch (error) {
        console.error("Public Exhibitor Application Error:", error);
        return { success: false, error: error.message || 'Failed to submit application' };
    }
}

export async function triggerSeedAction() {
    try {
        await seedDefaultExhibitorsIfEmpty();
        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
