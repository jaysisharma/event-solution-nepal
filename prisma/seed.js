const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = 'password123'; // Initial password

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
        where: { username },
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists.');
        console.log('✅ Admin user already exists.');
    } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        await prisma.adminUser.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        console.log(`✅ Admin user created.`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${password}`);
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

    // Seed Dashain Fest & Exhibitors from JSON if not exists
    const fs = require('fs');
    const path = require('path');
    const dataFilePath = path.join(__dirname, 'dashain_fest_data.json');

    if (fs.existsSync(dataFilePath)) {
        try {
            const dashainData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
            if (dashainData && dashainData.slug) {
                let event = await prisma.exhibitorEvent.findUnique({
                    where: { slug: dashainData.slug }
                });

                if (!event) {
                    event = await prisma.exhibitorEvent.create({
                        data: {
                            slug: dashainData.slug,
                            title: dashainData.title,
                            chronicleNumber: dashainData.chronicleNumber || '05',
                            description: dashainData.description || '',
                            previewImage: dashainData.previewImage || '',
                            order: dashainData.order ?? 5,
                        }
                    });
                    console.log(`✅ Seeded ExhibitorEvent: ${event.title}`);
                }

                for (const edData of (dashainData.editions || [])) {
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
                                title: edData.title,
                                dates: edData.dates,
                                venue: edData.venue,
                                attendees: edData.attendees || '100K+',
                                previewImage: edData.previewImage || '',
                                order: edData.order ?? 0,
                            }
                        });
                        console.log(`✅ Seeded ExhibitorEdition: Year ${edition.year}`);
                    }

                    const existingCount = await prisma.exhibitor.count({
                        where: { editionId: edition.id }
                    });

                    if (existingCount === 0 && Array.isArray(edData.exhibitors)) {
                        console.log(`⏳ Seeding ${edData.exhibitors.length} exhibitors for Year ${edition.year}...`);
                        for (let i = 0; i < edData.exhibitors.length; i++) {
                            const ex = edData.exhibitors[i];
                            await prisma.exhibitor.create({
                                data: {
                                    editionId: edition.id,
                                    slug: ex.slug || `exhibitor-${i + 1}`,
                                    name: ex.name,
                                    logo: ex.logo,
                                    contactPerson: ex.contactPerson || '',
                                    contact: ex.contact || '',
                                    email: ex.email || '',
                                    website: ex.website || '',
                                    booth: ex.booth || '',
                                    category: ex.category || 'Exhibition Showcase',
                                    tagline: ex.tagline || '',
                                    description: ex.description || '',
                                    photos: ex.photos || '[]',
                                    videoUrl: ex.videoUrl || '',
                                    videoPoster: ex.videoPoster || '',
                                    videoTitle: ex.videoTitle || '',
                                    order: ex.order ?? i,
                                    status: ex.status || 'APPROVED'
                                }
                            });
                        }
                        console.log(`✅ Seeded ${edData.exhibitors.length} exhibitors for Year ${edition.year}.`);
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
