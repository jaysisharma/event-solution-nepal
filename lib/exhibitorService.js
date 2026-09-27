import prisma from '@/lib/db';
import { EXHIBITOR_EVENTS, COMPANY_LOGOS } from '@/data/exhibitorsData';

/**
 * Automatically populates PostgreSQL database from exhibitorsData.js if empty.
 */
export async function seedDefaultExhibitorsIfEmpty() {
    try {
        const count = await prisma.exhibitorEvent.count();
        if (count > 0) return;

        console.log("Seeding default exhibitors into database...");

        for (let eIdx = 0; eIdx < EXHIBITOR_EVENTS.length; eIdx++) {
            const eventData = EXHIBITOR_EVENTS[eIdx];

            const createdEvent = await prisma.exhibitorEvent.create({
                data: {
                    slug: eventData.slug || eventData.id,
                    title: eventData.title,
                    chronicleNumber: eventData.chronicleNumber || `0${eIdx + 1}`,
                    description: eventData.description || '',
                    previewImage: eventData.previewImage || '',
                    order: eIdx,
                }
            });

            for (let edIdx = 0; edIdx < (eventData.editions || []).length; edIdx++) {
                const ed = eventData.editions[edIdx];

                const createdEdition = await prisma.exhibitorEdition.create({
                    data: {
                        eventId: createdEvent.id,
                        year: ed.year,
                        title: ed.title || `Edition ${ed.year}`,
                        dates: ed.dates || '',
                        venue: ed.venue || '',
                        attendees: '100K+',
                        previewImage: ed.previewImage || '',
                        order: edIdx,
                    }
                });

                for (let exIdx = 0; exIdx < (ed.exhibitors || []).length; exIdx++) {
                    const ex = ed.exhibitors[exIdx];
                    const assignedLogo = ex.logo || COMPANY_LOGOS[exIdx % COMPANY_LOGOS.length];

                    await prisma.exhibitor.create({
                        data: {
                            editionId: createdEdition.id,
                            slug: ex.id || `exhibitor-${exIdx + 1}`,
                            name: ex.name,
                            logo: assignedLogo,
                            contactPerson: ex.contactPerson || "Exhibition Manager",
                            contact: ex.contact || '',
                            email: ex.email || '',
                            website: ex.website || '',
                            booth: ex.booth || '',
                            category: ex.category || 'Exhibition Showcase',
                            tagline: ex.tagline || '',
                            description: ex.description || '',
                            photos: JSON.stringify(ex.photos || []),
                            videoUrl: ex.video?.url || '',
                            videoPoster: ex.video?.poster || '',
                            videoTitle: ex.video?.title || '',
                            order: exIdx,
                        }
                    });
                }
            }
        }
        console.log("Exhibitors seeding completed successfully.");
    } catch (error) {
        console.error("Error seeding exhibitors:", error);
    }
}

/**
 * Returns all exhibition events with their editions and exhibitor counts.
 */
export async function getAllExhibitorEvents() {
    try {
        await seedDefaultExhibitorsIfEmpty();

        const events = await prisma.exhibitorEvent.findMany({
            include: {
                editions: {
                    include: {
                        _count: { select: { exhibitors: { where: { status: 'APPROVED' } } } }
                    },
                    orderBy: { year: 'desc' }
                }
            },
            orderBy: { order: 'asc' }
        });

        if (events && events.length > 0) {
            return events.map((ev) => ({
                id: ev.slug,
                slug: ev.slug,
                chronicleNumber: ev.chronicleNumber,
                title: ev.title,
                description: ev.description,
                previewImage: ev.previewImage,
                editions: ev.editions.map((ed) => ({
                    id: ed.id,
                    year: ed.year,
                    title: ed.title,
                    dates: ed.dates,
                    venue: ed.venue,
                    attendees: ed.attendees,
                    previewImage: ed.previewImage,
                    exhibitorCount: ed._count.exhibitors,
                }))
            }));
        }
    } catch (err) {
        console.warn("Falling back to static exhibitors data for events:", err.message);
    }

    return EXHIBITOR_EVENTS;
}

/**
 * Returns specific edition data including all exhibitors.
 * By default filters for status = 'APPROVED', unless includeAll is true.
 */
export async function getEditionData(eventSlug, year, { includeAll = false } = {}) {
    try {
        await seedDefaultExhibitorsIfEmpty();

        const exhibitorsFilter = includeAll ? {} : { status: 'APPROVED' };

        const dbEvent = await prisma.exhibitorEvent.findUnique({
            where: { slug: eventSlug },
            include: {
                editions: {
                    include: {
                        exhibitors: {
                            where: exhibitorsFilter,
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        });

        if (dbEvent) {
            const dbEdition = dbEvent.editions.find((ed) => ed.year === year);
            if (dbEdition) {
                const exhibitors = dbEdition.exhibitors.map((ex, idx) => {
                    let parsedPhotos = [];
                    if (ex.photos) {
                        try {
                            parsedPhotos = typeof ex.photos === 'string' ? JSON.parse(ex.photos) : ex.photos;
                        } catch (e) {
                            parsedPhotos = [ex.photos];
                        }
                    }

                    return {
                        id: ex.slug,
                        dbId: ex.id,
                        name: ex.name,
                        logo: ex.logo || COMPANY_LOGOS[idx % COMPANY_LOGOS.length],
                        contactPerson: ex.contactPerson || "Exhibition Manager",
                        contact: ex.contact,
                        email: ex.email,
                        website: ex.website,
                        booth: ex.booth,
                        category: ex.category,
                        tagline: ex.tagline,
                        description: ex.description,
                        photos: parsedPhotos,
                        video: ex.videoUrl ? {
                            url: ex.videoUrl,
                            poster: ex.videoPoster || parsedPhotos[0] || '',
                            title: ex.videoTitle || `${ex.name} Showcase Reel`
                        } : null
                    };
                });

                return {
                    event: {
                        id: dbEvent.slug,
                        slug: dbEvent.slug,
                        title: dbEvent.title,
                        description: dbEvent.description,
                        previewImage: dbEvent.previewImage,
                        editions: dbEvent.editions.map((e) => ({
                            year: e.year,
                            title: e.title,
                            dates: e.dates,
                            venue: e.venue,
                        }))
                    },
                    edition: {
                        id: dbEdition.id,
                        year: dbEdition.year,
                        title: dbEdition.title,
                        dates: dbEdition.dates,
                        venue: dbEdition.venue,
                        attendees: dbEdition.attendees || '100K+',
                        previewImage: dbEdition.previewImage,
                        exhibitors
                    }
                };
            }
        }
    } catch (err) {
        console.warn("Falling back to static exhibitors data for edition:", err.message);
    }

    // Static Fallback
    const staticEvent = EXHIBITOR_EVENTS.find((e) => e.slug === eventSlug || e.id === eventSlug);
    if (!staticEvent) return null;
    const staticEdition = staticEvent.editions.find((ed) => ed.year === year);
    if (!staticEdition) return null;

    const exhibitors = (staticEdition.exhibitors || []).map((ex, idx) => ({
        ...ex,
        logo: ex.logo || COMPANY_LOGOS[idx % COMPANY_LOGOS.length]
    }));

    return {
        event: staticEvent,
        edition: {
            ...staticEdition,
            exhibitors
        }
    };
}

/**
 * Returns single exhibitor data for the dedicated showcase detail page.
 */
export async function getExhibitorData(eventSlug, year, exhibitorId, { includeAll = false } = {}) {
    const data = await getEditionData(eventSlug, year, { includeAll });
    if (!data) return null;
    const exhibitor = data.edition.exhibitors.find((ex) => ex.id === exhibitorId || String(ex.dbId) === String(exhibitorId));
    if (!exhibitor) return null;
    return { event: data.event, edition: data.edition, exhibitor };
}
