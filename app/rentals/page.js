
import RentalsClient from "./RentalsClient";

export const metadata = {
    title: "Event Rentals | Event Solution Nepal",
    description: "Rent premium furniture, tents, sound, and lighting equipment for your events in Nepal.",
};

import prisma from "@/lib/db";

export default async function RentalsPage() {
    const rawItems = await prisma.rentalItem.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const items = rawItems.map(item => ({
        ...item,
        images: JSON.parse(item.images),
        availableSizes: JSON.parse(item.availableSizes || '[]'),
    }));

    return <RentalsClient initialItems={items} />;
}
