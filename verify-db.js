const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prism Client...');
    try {
        const count = await prisma.workProject.count();
        console.log(`Successfully connected! Found ${count} projects.`);
    } catch (e) {
        console.error('Error connecting to WorkProject:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
