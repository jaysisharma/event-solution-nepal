const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const event = await prisma.event.findUnique({
        where: { id: 7 },
    });
    console.log(JSON.stringify(event, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
