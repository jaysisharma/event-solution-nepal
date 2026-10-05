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

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
