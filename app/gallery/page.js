export const dynamic = "force-dynamic";

import GalleryClient from './GalleryClient';
import prisma from "@/lib/db";

export default async function Gallery() {
    const galleryItems = await prisma.galleryItem.findMany({
        orderBy: { date: 'desc' }
    });

    return <GalleryClient galleryItems={galleryItems} />;
}
