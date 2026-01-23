
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvent() {
    const event = await prisma.event.findFirst({
        where: { title: 'sadfs' } // The event name seen in the logs
    });
    console.log("Event:", event);
    if (!event) console.log("Event not found");
    else if (!event.ticketTemplate) console.log("WARNING: Ticket Template is NULL. Email will NOT be sent.");
    else console.log("Ticket Template is present:", event.ticketTemplate);
}

checkEvent()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
