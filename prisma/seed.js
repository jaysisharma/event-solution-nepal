const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Use absolute path to ensure we hit the same DB as migration (prisma/dev.db)
const prisma = new PrismaClient({
    datasourceUrl: 'file:' + path.join(__dirname, 'dev.db')
});

const PARTNERS = [
    "Lalitpur Metropolitan City",
    "Kathmandu Metropolitan City (SIP Mela)",
    "Nepal Tourism Board",
    "Confederation of Nepalese Industry (CNI)",
    "Independent Power Producers Association Nepal (IPPAN)",
    "Nepal Chamber of Commerce",
    "Nepal German Chamber of Commerce & Industries (NGCCI)",
    "Federation Of Nepal Cottage & Small Industries (FNCSI)",
    "Federation of Handicraft Associations of Nepal (FHAN)",
    "Federation of Women Entrepreneurs Association of Nepal (FWEAN)",
    "Nepal Furniture & Furnishing Association",
    "Footwear Manufacturers Association of Nepal (FMAN)",
    "Plast Nepal Foundation",
    "Australian Embassy Nepal",
    "British Embassy Kathmandu",
    "Swiss Embassy",
    "German Embassy",
    "Pakistan Embassy",
    "Embassy of India",
    "Hotel Association Nepal (HAN)",
    "Pacific Asia Travel Association (PATA)",
    "Trinity International SS & College",
    "Uniglobe College",
    "Southwestern State College",
    "Herald College",
    "Webtuned Studio",
    "Global Reach",
    "Hi-AIM Conference Pvt. Ltd. (India)",
    "Eleven Eleven",
    "AN Holding",
    "Autism Care Nepal Society",
    "Nepal Art Council",
    "Cricket Association of Nepal (CAN)",
    "NMB Bank",
    "Yamaha (MAW Enterprises)",
    "Bajaj",
    "Toyota",
    "Rotary Club",
    "Lions Club"
];

const EVENTS = [
    {
        date: "14",
        month: "APR",
        title: "Nepali New Year 2082 Celebration",
        location: "Hotel Yak & Yeti, Kathmandu",
        time: "06:00 PM - 12:00 AM",
        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop"
    },
    {
        date: "25",
        month: "MAY",
        title: "Kathmandu Music Festival",
        location: "Tudikhel Ground, Kathmandu",
        time: "02:00 PM - 10:00 PM",
        image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop"
    },
    {
        date: "10",
        month: "JUN",
        title: "Pokhara Corporate Retreat",
        location: "Lakeside, Pokhara",
        time: "09:00 AM - 05:00 PM",
        image: "https://images.unsplash.com/photo-1519671482502-9759101d4561?q=80&w=1000&auto=format&fit=crop"
    }
];

async function main() {
    console.log('Seeding database...');
    console.log('Database URL:', 'file:' + path.join(__dirname, 'dev.db'));

    try {
        // 1. Create default admin
        const passwordHash = await bcrypt.hash('admin123', 10);
        const admin = await prisma.adminUser.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: passwordHash,
            },
        });
        console.log('Created admin user:', admin.username);

        // 2. Clear & Seed Partners
        await prisma.partner.deleteMany({});
        await prisma.event.deleteMany({});
        console.log('Cleared existing data.');

        for (let i = 0; i < PARTNERS.length; i++) {
            await prisma.partner.create({
                data: {
                    name: PARTNERS[i],
                    order: i
                }
            });
        }
        console.log(`Seeded ${PARTNERS.length} partners.`);

        // 3. Seed Events
        for (const event of EVENTS) {
            await prisma.event.create({
                data: event
            });
        }
        console.log(`Seeded ${EVENTS.length} events.`);

        // 4. Seed Projects
        await prisma.workProject.deleteMany({});
        const projects = [
            { title: "Royal Palace Wedding", category: "Wedding", year: "2024", images: JSON.stringify(["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop", "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"]) },
            { title: "Tech Summit Nepal", category: "Corporate", year: "2023", images: JSON.stringify(["https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop"]) },
            { title: "Summer Music Festival", category: "Concert", year: "2024", images: JSON.stringify(["https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"]) },
            { title: "Neon Night Party", category: "Social", year: "2023", images: JSON.stringify(["https://images.unsplash.com/photo-1530103862676-de3c9a59af57?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=2070&auto=format&fit=crop"]) },
            { title: "Lakeside Nuptials", category: "Wedding", year: "2023", images: JSON.stringify(["https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=2070&auto=format&fit=crop"]) },
            { title: "Banking Awards Night", category: "Corporate", year: "2024", images: JSON.stringify(["https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop"]) },
            { title: "Birthday Bash", category: "Social", year: "2024", images: JSON.stringify(["https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=2070&auto=format&fit=crop"]) },
            { title: "Rock in Kathmandu", category: "Concert", year: "2023", images: JSON.stringify(["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"]) }
        ];
        for (const p of projects) await prisma.workProject.create({ data: p });
        console.log(`Seeded ${projects.length} projects.`);

        // 5. Seed Services
        await prisma.service.deleteMany({});
        const services = [
            { title: "Budget Creation & Management", description: "Budgets, tracking and reporting. Site inspection, pre-event, on-site event management and logistics.", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Financial Planning", "Logistics", "Reporting"]) },
            { title: "Customized Marketing Strategy", description: "We provide personalized marketing strategies based on the objectives and requirements of the client.", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop", tags: JSON.stringify(["Strategy", "Growth", "Engagement"]) },
            { title: "Photographs and Videographs", description: "We provide professional event photography and videography services.", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop", tags: JSON.stringify(["Capture", "Media", "Coverage"]) },
            { title: "Emcee", description: "We provide you with your favorite Emcee who is master of ceremonies.", image: "https://images.unsplash.com/photo-1719437364093-82c24d719303?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Hosting", "Entertainment", "Stage"]) },
            { title: "PA System", description: "All Public Address systems, including microphones, amplifiers, and loudspeakers.", image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Audio", "Sound", "Equipment"]) },
            { title: "Digital Marketing and Planning", description: "Promoting events through public relations and social marketing tactics.", image: "https://images.unsplash.com/photo-1585404930046-661b02d11ca9?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Social Media", "PR", "Promotion"]) },
            { title: "Branding", description: "Theme and identity, across all marketing communications.", image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Identity", "Design", "Visibility"]) },
            { title: "Zoom Conference", description: "Digital host services for online conferences and virtual events.", image: "https://images.unsplash.com/photo-1593463405365-c22accdbd09d?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Virtual", "Webinar", "Remote"]) },
            { title: "Online Registration & Management", description: "RSVPs, motivational teasers, delegate registration, expo online booking app.", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop", tags: JSON.stringify(["Registration", "Apps", "Data"]) },
            { title: "HR Management Service", description: "Invest in safety, adhere to proper HR practices, and technology for efficiency.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop", tags: JSON.stringify(["Staffing", "Safety", "Coordination"]) },
            { title: "Artist Management", description: "We contact your selected artist and book them for your event.", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Talent", "Booking", "Performance"]) },
            { title: "Graphic Design & Printing", description: "Create visually inspiring graphic design and printing.", image: "https://images.unsplash.com/photo-1619190324856-af3f6eb55601?q=80&w=2070&auto=format&fit=crop", tags: JSON.stringify(["Design", "Print", "Visuals"]) }
        ];
        for (const s of services) await prisma.service.create({ data: s });
        console.log(`Seeded ${services.length} services.`);

        // 6. Seed Team
        await prisma.teamMember.deleteMany({});
        const team = [
            { name: "Sunil Bhandari", role: "Chairman", image: "/meet_the_team/sunil.png" },
            { name: "Bijay Sagar Pradhan", role: "Managing Director", image: "/meet_the_team/bijay.jpg" },
            { name: "Nabin Bhatta", role: "Marketing Director", image: "/meet_the_team/nabin.png" },
            { name: "Vinesh Choradia", role: "Finance Director", image: "/meet_the_team/vinesh.png" },
            { name: "Bishal Parajapati", role: "Chief Event Officer", image: "/meet_the_team/bisal.png" },
            { name: "Mohan Shrestha", role: "Admin Head", image: "/meet_the_team/mohan.png" },
            { name: "Narendra Maharjan", role: "S.r Graphic Designer", image: "/meet_the_team/narendra.png" },
            { name: "Anup Shrestha", role: "S.r Marketing Officer", image: "/meet_the_team/anup.png" },
            { name: "Sajan Shrestha", role: "Digital Marketing", image: "/meet_the_team/sajan.png" },
            { name: "Srijana Gurung", role: "S.r Finance Officer", image: "/meet_the_team/srijina.png" },
            { name: "Manjesh Jyu Thakuri", role: "Logistic Supervisor", image: "/meet_the_team/manjesh.png" }
        ];
        for (const t of team) await prisma.teamMember.create({ data: t });
        console.log(`Seeded ${team.length} team members.`);

        // 7. Seed Gallery
        await prisma.galleryItem.deleteMany({});
        const gallery = [
            { category: 'Wedding', size: 'large', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop', title: 'Royal Ceremony' },
            { category: 'Corporate', size: 'tall', src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop', title: 'Tech Conference' },
            { category: 'Concert', size: 'wide', src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop', title: 'Star Light Fest' },
            { category: 'Wedding', size: 'normal', src: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=627&auto=format&fit=crop', title: 'Garden Vows' },
            { category: 'Party', size: 'tall', src: 'https://images.unsplash.com/photo-1514525253440-b393452e2729?q=80&w=2069&auto=format&fit=crop', title: 'Neon Nights' },
            { category: 'Corporate', size: 'normal', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', title: 'Annual Summit' },
            { category: 'Decoration', size: 'wide', src: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop', title: 'Floral Arrangement' },
            { category: 'Wedding', size: 'tall', src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop', title: 'Reception Hall' },
            { category: 'Concert', size: 'large', src: 'https://images.unsplash.com/photo-1459749411177-0473ef7161a8?q=80&w=2070&auto=format&fit=crop', title: 'Acoustic Session' },
            { category: 'Party', size: 'normal', src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop', title: 'Birthday Bash' }
        ];
        for (const g of gallery) await prisma.galleryItem.create({ data: g });
        console.log(`Seeded ${gallery.length} gallery items.`);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
