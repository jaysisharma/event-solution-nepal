'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';
import { seedDefaultExhibitorsIfEmpty } from '@/lib/exhibitorService';
import fs from 'fs/promises';
import path from 'path';

/* =========================================================================
   COMPANY LOGOS (Multi-upload & dynamic listing)
   ========================================================================= */

export async function getCompanyLogos() {
    try {
        const companyDir = path.join(process.cwd(), 'public', 'company');
        let files = [];
        try {
            files = await fs.readdir(companyDir);
        } catch (dirErr) {
            console.warn("Could not read companyDir, creating it:", dirErr.message);
            await fs.mkdir(companyDir, { recursive: true });
        }
        const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
        const logos = files
            .filter(file => validExtensions.includes(path.extname(file).toLowerCase()) && !file.startsWith('.') && !file.includes('placeholder'))
            .map(file => `/company/${encodeURIComponent(file)}`);

        // Also fetch any distinct non-placeholder logos assigned to exhibitors in database
        let dbLogos = [];
        try {
            const exhibitors = await prisma.exhibitor.findMany({
                where: { logo: { not: null } },
                select: { logo: true },
                distinct: ['logo']
            });
            dbLogos = exhibitors
                .map(e => e.logo)
                .filter(l => l && !l.includes('placeholder') && (l.startsWith('/company') || l.startsWith('/uploads') || l.startsWith('http')));
        } catch (dbErr) {
            // DB might be offline or empty
        }

        const resultLogos = Array.from(new Set([
            '/placeholder-logo.svg',
            ...logos,
            ...dbLogos
        ]));

        return { success: true, logos: resultLogos };
    } catch (error) {
        console.error("Error reading company logos:", error);
        return { success: false, logos: ['/placeholder-logo.svg'] };
    }
}

export async function uploadCompanyLogos(formData) {
    try {
        const files = formData.getAll('logoFiles');
        if (!files || files.length === 0) {
            return { success: false, error: 'No files selected for upload.' };
        }

        const companyDir = path.join(process.cwd(), 'public', 'company');
        await fs.mkdir(companyDir, { recursive: true });

        const uploadedUrls = [];
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

        for (const file of files) {
            if (!file || typeof file !== 'object' || file.size === 0) continue;
            
            const originalName = file.name || 'logo.png';
            const ext = path.extname(originalName).toLowerCase();
            if (!allowedExtensions.includes(ext)) continue;

            const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
            const uniqueFilename = `${baseName || 'logo'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;
            const targetPath = path.join(companyDir, uniqueFilename);

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await fs.writeFile(targetPath, buffer);

            uploadedUrls.push(`/company/${encodeURIComponent(uniqueFilename)}`);
        }

        if (uploadedUrls.length === 0) {
            return { success: false, error: 'No valid image files were processed.' };
        }

        // Return updated list of logos
        const { logos: allLogos } = await getCompanyLogos();

        revalidatePath('/admin/exhibitors');

        return {
            success: true,
            uploadedUrls,
            allLogos,
            count: uploadedUrls.length
        };
    } catch (error) {
        console.error("Upload company logos error:", error);
        return { success: false, error: error.message || 'Failed to upload logos' };
    }
}


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
            description,
        };
        if (previewImage) updateData.previewImage = previewImage;

        // If chronicleNumber is numeric (e.g. "01", "02", "1"), cleanly re-sequence events
        const parsedOrder = parseInt(chronicleNumber.replace(/[^0-9]/g, ''));
        if (!isNaN(parsedOrder)) {
            const allEvents = await prisma.exhibitorEvent.findMany({
                orderBy: [
                    { order: 'asc' },
                    { id: 'asc' }
                ]
            });
            const currentIndex = allEvents.findIndex(e => e.id === id);
            if (currentIndex !== -1) {
                const [targetEvent] = allEvents.splice(currentIndex, 1);
                const targetPos = Math.min(Math.max(0, parsedOrder - 1), allEvents.length);
                allEvents.splice(targetPos, 0, targetEvent);

                await prisma.$transaction([
                    prisma.exhibitorEvent.update({
                        where: { id },
                        data: updateData
                    }),
                    ...allEvents.map((ev, idx) => {
                        const formattedChronicle = String(idx + 1).padStart(2, '0');
                        return prisma.exhibitorEvent.update({
                            where: { id: ev.id },
                            data: {
                                order: idx,
                                chronicleNumber: formattedChronicle
                            }
                        });
                    })
                ]);

                revalidatePath('/admin/exhibitors');
                revalidatePath('/exhibitors');
                return { success: true };
            }
        }

        updateData.chronicleNumber = chronicleNumber;
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

export async function moveEventOrder(id, direction) {
    try {
        const eventId = parseInt(id);
        if (!eventId) return { success: false, error: 'Invalid event ID' };

        const allEvents = await prisma.exhibitorEvent.findMany({
            orderBy: [
                { order: 'asc' },
                { id: 'asc' }
            ]
        });

        const currentIndex = allEvents.findIndex((e) => e.id === eventId);
        if (currentIndex === -1) return { success: false, error: 'Event not found' };

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= allEvents.length) {
            return { success: false, error: 'Cannot move further' };
        }

        // Swap positions in array
        const temp = allEvents[currentIndex];
        allEvents[currentIndex] = allEvents[targetIndex];
        allEvents[targetIndex] = temp;

        // Persist new orders and sync chronicleNumbers ("01", "02", etc.)
        await prisma.$transaction(
            allEvents.map((ev, idx) => {
                const formattedChronicle = String(idx + 1).padStart(2, '0');
                return prisma.exhibitorEvent.update({
                    where: { id: ev.id },
                    data: {
                        order: idx,
                        chronicleNumber: formattedChronicle
                    }
                });
            })
        );

        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Move Event Order Error:", error);
        return { success: false, error: error.message || 'Failed to reorder event' };
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

        // Logo handling: either chosen public logo OR uploaded image file(s)
        let logo = formData.get('logoSelected') || '';
        const logoFiles = formData.getAll('logoFiles').filter(f => f && typeof f === 'object' && f.size > 0);
        const singleLogoFile = formData.get('logoFile');
        const fileToUpload = logoFiles.length > 0 ? logoFiles[0] : (singleLogoFile && typeof singleLogoFile === 'object' && singleLogoFile.size > 0 ? singleLogoFile : null);

        if (fileToUpload) {
            const uploadedPath = await saveFile(fileToUpload, 'exhibitors/logos');
            if (uploadedPath) logo = uploadedPath;
        }

        if (!logo) {
            logo = '/placeholder-logo.svg';
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
        const logoFiles = formData.getAll('logoFiles').filter(f => f && typeof f === 'object' && f.size > 0);
        const singleLogoFile = formData.get('logoFile');
        const fileToUpload = logoFiles.length > 0 ? logoFiles[0] : (singleLogoFile && typeof singleLogoFile === 'object' && singleLogoFile.size > 0 ? singleLogoFile : null);

        if (fileToUpload) {
            const uploadedPath = await saveFile(fileToUpload, 'exhibitors/logos');
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

export async function deleteMultipleExhibitors(ids, eventSlug, year) {
    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, error: 'No exhibitors selected' };
        }

        const intIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
        const stringSlugs = ids.map(id => String(id)).filter(id => isNaN(parseInt(id)));

        const conditions = [];
        if (intIds.length > 0) {
            conditions.push({ id: { in: intIds } });
        }
        if (stringSlugs.length > 0) {
            conditions.push({ slug: { in: stringSlugs } });
        }

        if (conditions.length === 0) {
            return { success: false, error: 'No valid IDs provided' };
        }

        const deleted = await prisma.exhibitor.deleteMany({
            where: {
                OR: conditions
            }
        });

        revalidatePath('/admin/exhibitors');
        if (eventSlug && year) {
            revalidatePath(`/admin/exhibitors/${eventSlug}/${year}`);
            revalidatePath(`/exhibitors/${eventSlug}/${year}`);
        }
        revalidatePath('/exhibitors');

        return { success: true, count: deleted.count };
    } catch (error) {
        console.error("Delete Multiple Exhibitors Error:", error);
        return { success: false, error: error.message || "Failed to delete selected exhibitors" };
    }
}

export async function bulkCreateExhibitors({ editionId, eventSlug, year, exhibitors = [], defaultCategory = 'Exhibition Showcase' }) {
    try {
        if (!Array.isArray(exhibitors) || exhibitors.length === 0) {
            return { success: false, error: 'No exhibitors provided to upload' };
        }

        let resolvedEditionId = parseInt(editionId);
        let resolvedEventSlug = eventSlug;
        let resolvedYear = year;

        // If editionId is missing, resolve from eventSlug and year
        if (!resolvedEditionId && eventSlug && year) {
            const ev = await prisma.exhibitorEvent.findFirst({
                where: {
                    OR: [
                        { slug: eventSlug },
                        { slug: eventSlug.toLowerCase() }
                    ]
                },
                include: { editions: true }
            });
            const ed = ev?.editions.find((e) => e.year === String(year));
            if (ed) {
                resolvedEditionId = ed.id;
                resolvedEventSlug = ev.slug;
                resolvedYear = ed.year;
            }
        }

        // If editionId is provided, get eventSlug and year if not provided
        if (resolvedEditionId && (!resolvedEventSlug || !resolvedYear)) {
            const ed = await prisma.exhibitorEdition.findUnique({
                where: { id: resolvedEditionId },
                include: { event: true }
            });
            if (ed) {
                resolvedEventSlug = ed.event?.slug || resolvedEventSlug;
                resolvedYear = ed.year || resolvedYear;
            }
        }

        if (!resolvedEditionId) {
            return { success: false, error: 'Target exhibition edition could not be identified' };
        }

        // Fetch existing slugs & max order in this edition
        const existingExhibitors = await prisma.exhibitor.findMany({
            where: { editionId: resolvedEditionId },
            select: { slug: true, order: true }
        });

        const existingSlugs = new Set(existingExhibitors.map(e => e.slug));
        const maxOrder = existingExhibitors.reduce((max, e) => (e.order > max ? e.order : max), -1);

        // Helper slugify
        const slugify = (text) => {
            if (!text) return 'exhibitor';
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'exhibitor';
        };

        const recordsToCreate = [];
        let orderTracker = maxOrder + 1;

        for (let i = 0; i < exhibitors.length; i++) {
            const raw = exhibitors[i];
            const name = (typeof raw === 'string' ? raw : raw?.name || '').trim();
            if (!name) continue;

            // Generate unique slug
            let baseSlug = slugify(name);
            let candidateSlug = baseSlug;
            let counter = 1;
            while (existingSlugs.has(candidateSlug)) {
                candidateSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            existingSlugs.add(candidateSlug);

            const booth = typeof raw === 'object' && raw.booth ? String(raw.booth).trim() : '';
            const contactPerson = typeof raw === 'object' && raw.contactPerson ? String(raw.contactPerson).trim() : '';
            const contact = typeof raw === 'object' && raw.contact ? String(raw.contact).trim() : '';
            const email = typeof raw === 'object' && raw.email ? String(raw.email).trim() : '';
            const website = typeof raw === 'object' && raw.website ? String(raw.website).trim() : '';
            const category = typeof raw === 'object' && raw.category ? String(raw.category).trim() : (defaultCategory || 'Exhibition Showcase');
            const tagline = typeof raw === 'object' && raw.tagline ? String(raw.tagline).trim() : `${name} at Exhibition ${resolvedYear || ''}`.trim();
            const description = typeof raw === 'object' && raw.description ? String(raw.description).trim() : (booth ? `Exhibiting at Stall ${booth}.` : `Participating exhibitor at ${resolvedYear || 'this edition'}.`);

            const assignedLogo = (typeof raw === 'object' && raw.logo) ? raw.logo : '/placeholder-logo.svg';

            recordsToCreate.push({
                editionId: resolvedEditionId,
                slug: candidateSlug,
                name,
                logo: assignedLogo,
                contactPerson: contactPerson || 'Exhibition Representative',
                contact: contact || '',
                email: email || '',
                website: website || '',
                booth: booth || '',
                category: category || defaultCategory,
                tagline: tagline || '',
                description: description || '',
                photos: JSON.stringify([]),
                videoUrl: '',
                videoPoster: '',
                videoTitle: '',
                order: orderTracker,
                status: 'APPROVED'
            });

            orderTracker++;
        }

        if (recordsToCreate.length === 0) {
            return { success: false, error: 'No valid exhibitor names were found' };
        }

        // Insert into database
        await prisma.exhibitor.createMany({
            data: recordsToCreate
        });

        // Revalidate cached paths
        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');
        if (resolvedEventSlug && resolvedYear) {
            revalidatePath(`/admin/exhibitors/${resolvedEventSlug}/${resolvedYear}`);
            revalidatePath(`/exhibitors/${resolvedEventSlug}/${resolvedYear}`);
        }

        return {
            success: true,
            count: recordsToCreate.length,
            eventSlug: resolvedEventSlug,
            year: resolvedYear
        };
    } catch (error) {
        console.error("Bulk Create Exhibitors Error:", error);
        return { success: false, error: error.message || 'Failed to bulk upload exhibitors' };
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

        if (!logo) {
            logo = '/placeholder-logo.svg';
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

/* =========================================================================
   PERSISTENT EXHIBITORS ORDERING (Save Sort Order in DB)
   ========================================================================= */

export async function reorderEditionExhibitors({ editionId, sortedIds, eventSlug, year }) {
    try {
        if (!editionId || !Array.isArray(sortedIds) || sortedIds.length === 0) {
            return { success: false, error: 'Invalid reorder parameters' };
        }

        // Update each exhibitor's order in PostgreSQL transaction
        await prisma.$transaction(
            sortedIds.map((item, index) => {
                const numericId = parseInt(item.dbId || item.id);
                if (numericId && !isNaN(numericId)) {
                    return prisma.exhibitor.update({
                        where: { id: numericId },
                        data: { order: index }
                    });
                } else if (item.slug) {
                    return prisma.exhibitor.updateMany({
                        where: {
                            editionId: parseInt(editionId),
                            slug: item.slug
                        },
                        data: { order: index }
                    });
                }
                return prisma.exhibitor.updateMany({
                    where: { editionId: parseInt(editionId) },
                    data: { order: index }
                });
            })
        );

        if (eventSlug && year) {
            revalidatePath(`/admin/exhibitors/${eventSlug}/${year}`);
            revalidatePath(`/exhibitors/${eventSlug}/${year}`);
        }
        revalidatePath('/admin/exhibitors');
        revalidatePath('/exhibitors');

        return { success: true };
    } catch (error) {
        console.error("Reorder Exhibitors Error:", error);
        return { success: false, error: error.message || 'Failed to persist order' };
    }
}

