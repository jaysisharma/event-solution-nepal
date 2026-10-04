const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    // Precomputed bcrypt hash for 'password123' (10 salt rounds)
    const defaultHashedPassword = '$2b$10$LLSVk7zZJJazD835wSr8KuadYxOenIDObCa4t9fu9cbF8g1AIzs22';

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
        where: { username },
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists.');
    } else {
        // Create admin
        await prisma.adminUser.create({
            data: {
                username,
                password: defaultHashedPassword,
            },
        });

        console.log(`✅ Admin user created.`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: password123`);
    }

    // Seed Site Settings
    const existingSettings = await prisma.siteSettings.findFirst();
    if (!existingSettings) {
        await prisma.siteSettings.create({
            data: {
                whatsappNumber: '9779851336342',
                websiteUrl: 'http://x8408o8kkw8ococggsssg0o0.72.61.248.195.sslip.io/',
            }
        });
        console.log('✅ Site settings seeded.');
    } else {
        console.log('ℹ️ Site settings already exist.');
    }

    // Clean up earlier duplicate 'dashain-fest' event if present
    try {
        const duplicateDashain = await prisma.exhibitorEvent.findUnique({
            where: { slug: 'dashain-fest' }
        });
        if (duplicateDashain) {
            const editions = await prisma.exhibitorEdition.findMany({
                where: { eventId: duplicateDashain.id }
            });
            for (const ed of editions) {
                await prisma.exhibitor.deleteMany({
                    where: { editionId: ed.id }
                });
            }
            await prisma.exhibitorEdition.deleteMany({
                where: { eventId: duplicateDashain.id }
            });
            await prisma.exhibitorEvent.delete({
                where: { id: duplicateDashain.id }
            });
            console.log('🧹 Cleaned up earlier duplicate dashain-fest event from database.');
        }
    } catch (cleanErr) {
        console.warn('⚠️ Warning cleaning duplicate dashain-fest:', cleanErr.message);
    }

    // Seed Stock Clearance 2025 Exhibitors from JSON
    const fs = require('fs');
    const path = require('path');
    const stockDataFilePath = path.join(__dirname, 'stock_clearance_data.json');

    if (fs.existsSync(stockDataFilePath)) {
        try {
            const stockData = JSON.parse(fs.readFileSync(stockDataFilePath, 'utf8'));
            if (stockData && stockData.slug) {
                let event = await prisma.exhibitorEvent.findFirst({
                    where: {
                        OR: [
                            { slug: stockData.slug },
                            { slug: 'stock-clearance' },
                            { title: { contains: 'Stock Clearance', mode: 'insensitive' } }
                        ]
                    }
                });

                if (!event) {
                    event = await prisma.exhibitorEvent.create({
                        data: {
                            slug: stockData.slug || 'stock-clearance',
                            title: stockData.title || 'Stock Clearance',
                            chronicleNumber: stockData.chronicleNumber || '04',
                            description: stockData.description || '',
                            previewImage: stockData.previewImage || '',
                            order: stockData.order ?? 3,
                        }
                    });
                    console.log(`✅ Seeded ExhibitorEvent: ${event.title}`);
                }

                for (const edData of (stockData.editions || [])) {
                    let edition = await prisma.exhibitorEdition.findFirst({
                        where: {
                            eventId: event.id,
                            year: edData.year
                        }
                    });

                    if (!edition) {
                        edition = await prisma.exhibitorEdition.create({
                            data: {
                                eventId: event.id,
                                year: edData.year,
                                title: edData.title || `Edition ${edData.year}`,
                                dates: edData.dates || '',
                                venue: edData.venue || '',
                                attendees: edData.attendees || '120K+',
                                previewImage: edData.previewImage || '',
                                order: edData.order ?? 2,
                            }
                        });
                        console.log(`✅ Seeded ExhibitorEdition: Year ${edition.year}`);
                    }

                    if (edData.year === '2025' && Array.isArray(edData.exhibitors)) {
                        const deletedCount = await prisma.exhibitor.deleteMany({
                            where: { editionId: edition.id }
                        });
                        console.log(`🗑️ Removed ${deletedCount.count} earlier 2025 exhibitors from Stock Clearance.`);

                        console.log(`⏳ Seeding ${edData.exhibitors.length} fresh exhibitors for Stock Clearance Year ${edition.year}...`);
                        for (let i = 0; i < edData.exhibitors.length; i++) {
                            const ex = edData.exhibitors[i];
                            await prisma.exhibitor.create({
                                data: {
                                    editionId: edition.id,
                                    slug: ex.slug || `stock-exhibitor-2025-${i + 1}`,
                                    name: ex.name,
                                    logo: ex.logo || '',
                                    contactPerson: ex.contactPerson || '',
                                    contact: ex.contact || '',
                                    email: ex.email || '',
                                    website: ex.website || '',
                                    booth: ex.booth || '',
                                    category: ex.category || 'Festive & Consumer Trade',
                                    tagline: ex.tagline || `${ex.name} at Stock Clearance 2025`,
                                    description: ex.description || `Participating exhibitor at Stock Clearance 2025. ${ex.booth}.`,
                                    photos: typeof ex.photos === 'string' ? ex.photos : JSON.stringify(ex.photos || []),
                                    videoUrl: ex.videoUrl || '',
                                    videoPoster: ex.videoPoster || '',
                                    videoTitle: ex.videoTitle || '',
                                    order: ex.order ?? i,
                                    status: ex.status || 'APPROVED'
                                }
                            });
                        }
                        console.log(`✅ Seeded ${edData.exhibitors.length} exhibitors for Stock Clearance Year ${edition.year}.`);
                    } else if (edData.year === '2026' && Array.isArray(edData.exhibitors)) {
                        const deletedCount2026 = await prisma.exhibitor.deleteMany({
                            where: { editionId: edition.id }
                        });
                        console.log(`🗑️ Removed ${deletedCount2026.count} earlier 2026 exhibitors from Stock Clearance.`);

                        console.log(`⏳ Seeding ${edData.exhibitors.length} fresh exhibitors for Stock Clearance Year 2026...`);
                        for (let i = 0; i < edData.exhibitors.length; i++) {
                            const ex = edData.exhibitors[i];
                            await prisma.exhibitor.create({
                                data: {
                                    editionId: edition.id,
                                    slug: ex.slug || `stock-exhibitor-2026-${i + 1}`,
                                    name: ex.name,
                                    logo: ex.logo || '',
                                    contactPerson: ex.contactPerson || '',
                                    contact: ex.contact || '',
                                    email: ex.email || '',
                                    website: ex.website || '',
                                    booth: ex.booth || '',
                                    category: ex.category || 'Festive & Consumer Trade',
                                    tagline: ex.tagline || `${ex.name} at Stock Clearance 2026`,
                                    description: ex.description || `Participating exhibitor at Stock Clearance 2026. ${ex.booth}.`,
                                    photos: typeof ex.photos === 'string' ? ex.photos : JSON.stringify(ex.photos || []),
                                    videoUrl: ex.videoUrl || '',
                                    videoPoster: ex.videoPoster || '',
                                    videoTitle: ex.videoTitle || '',
                                    order: ex.order ?? i,
                                    status: ex.status || 'APPROVED'
                                }
                            });
                        }
                        console.log(`✅ Seeded ${edData.exhibitors.length} exhibitors for Stock Clearance Year 2026.`);
                    }
                }
            }
        } catch (seedErr) {
            console.error('⚠️ Exhibitors seed warning:', seedErr);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
