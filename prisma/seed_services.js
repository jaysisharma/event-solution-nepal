const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Services...');

    const services = [
        {
            title: "Event Organizing",
            description: "We plan and organize events from concept to execution, handling every detail.",
            image: "/services/event_organizing.png",
            tags: JSON.stringify(["Planning", "Execution", "Concept"]),
            order: 1
        },
        {
            title: "Event Management",
            description: "End-to-end event coordination including logistics, vendor management, and on-site supervision.",
            image: "/services/event_management.png",
            tags: JSON.stringify(["Coordination", "Logistics", "Management"]),
            order: 2
        },
        {
            title: "Rental Services",
            description: "High-quality event rentals including sound systems, lighting, furniture, and AV equipment.",
            image: "/services/rental_services.png",
            tags: JSON.stringify(["Sound", "Lighting", "Furniture"]),
            order: 3
        },
        {
            title: "Photography & Videography",
            description: "Professional photography and cinematic videography services to capture your event's best moments.",
            image: "/services/photography_videography.png",
            tags: JSON.stringify(["Photo", "Video", "Cinema"]),
            order: 4
        },
        {
            title: "HR Management",
            description: "Skilled manpower solutions including event staff, hosts, promoters, and security personnel.",
            image: "/services/hr_management.png",
            tags: JSON.stringify(["Staffing", "Security", "Hosts"]),
            order: 5
        },
        {
            title: "Digital Marketing",
            description: "Strategic online marketing services including social media promotion and digital campaigns.",
            image: "/services/digital_marketing.png",
            tags: JSON.stringify(["Social Media", "SEO", "Ads"]),
            order: 6
        },
        {
            title: "Printing Services",
            description: "Complete printing solutions such as banners, flex, standees, and promotional materials.",
            image: "/services/printing_services.png",
            tags: JSON.stringify(["Banners", "Flex", "Print"]),
            order: 7
        },
        {
            title: "Wedding",
            description: "Complete wedding planning and management services including decor, catering, and rituals.",
            image: "/services/wedding.png",
            tags: JSON.stringify(["Planning", "Decor", "Catering"]),
            order: 8
        },
        {
            title: "Marketing & Promotions",
            description: "Targeted on-ground and digital promotional campaigns to maximize brand visibility.",
            image: "/services/marketing_promotions.png",
            tags: JSON.stringify(["Campaigns", "Branding", "Events"]),
            order: 9
        }
    ];

    // Clear existing services to avoid duplicates/conflicts for this seed
    await prisma.service.deleteMany({});
    console.log('🗑️  Cleared existing services.');

    for (const service of services) {
        await prisma.service.create({
            data: service
        });
    }

    console.log(`✅ Seeded ${services.length} services.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
