const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGallery() {
    const items = await prisma.galleryItem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log('Recent Gallery Items:', JSON.stringify(items, null, 2));
}

checkGallery()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
