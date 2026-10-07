import prisma from '@/lib/db';
import { EXHIBITOR_EVENTS, COMPANY_LOGOS, getEventBySlug } from '@/data/exhibitorsData';

/**
 * Automatically populates PostgreSQL database from exhibitorsData.js if empty.
 */
export async function seedDefaultExhibitorsIfEmpty() {
    // Disabled: exhibitors are managed exclusively via admin dashboard and bulk upload
    return;
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
                    orderBy: [
                        { order: 'asc' },
                        { year: 'desc' }
                    ]
                }
            },
            orderBy: { order: 'asc' }
        });

        if (Array.isArray(events)) {
            return events.map((ev, eIdx) => ({
                id: ev.slug,
                slug: ev.slug,
                chronicleNumber: ev.chronicleNumber || String(eIdx + 1).padStart(2, '0'),
                title: ev.title,
                description: ev.description || '',
                previewImage: ev.previewImage || '',
                editions: (ev.editions || []).map((ed) => ({
                    id: ed.id,
                    year: ed.year,
                    title: ed.title || `Edition ${ed.year}`,
                    dates: ed.dates,
                    venue: ed.venue,
                    attendees: ed.attendees,
                    previewImage: ed.previewImage,
                    exhibitorCount: ed._count?.exhibitors || 0,
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
    const slugAliases = {
        'global-expo': 'global-consumer-expo',
        'global-consumer-expo': 'global-expo',
        'hotel-expo': 'the-hotel-expo',
        'the-hotel-expo': 'the-hotel-expo',
        'stock-clearance': 'stock-clearance',
        'family-baby-expo': 'family-baby-expo'
    };
    const targetSlug = slugAliases[eventSlug] || eventSlug;

    try {
        await seedDefaultExhibitorsIfEmpty();

        const exhibitorsFilter = includeAll ? {} : { status: 'APPROVED' };

        const dbEvent = await prisma.exhibitorEvent.findFirst({
            where: {
                OR: [
                    { slug: eventSlug },
                    { slug: targetSlug }
                ]
            },
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
                        logo: ex.logo || '/placeholder-logo.svg',
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
    const staticEvent = getEventBySlug(eventSlug);
    if (!staticEvent) return null;
    const staticEdition = staticEvent.editions.find((ed) => ed.year === year);
    if (!staticEdition) return null;

    const exhibitors = (staticEdition.exhibitors || []).map((ex) => ({
        ...ex,
        logo: ex.logo || '/placeholder-logo.svg'
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
