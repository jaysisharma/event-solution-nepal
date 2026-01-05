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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
