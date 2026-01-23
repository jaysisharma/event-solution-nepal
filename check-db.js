const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log("--- Latest 5 Events ---");
    events.forEach(e => {
        console.log(`ID: ${e.id} | Title: ${e.title} | Price: ${e.ticketPrice} (Type: ${typeof e.ticketPrice})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
