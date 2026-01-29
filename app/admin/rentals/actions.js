'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile, deleteFile } from '@/lib/upload';

// Standalone actions for Auto-Upload
export async function uploadRentalImage(formData) {
    const image = formData.get("image");
    const folder = formData.get("folder") || "rentals";

    if (!image) return { success: false, error: "No image provided" };

    try {
        const imagePath = await saveFile(image, folder);
        if (!imagePath) throw new Error("Upload failed");
        return { success: true, url: imagePath };
    } catch (error) {
        console.error("Auto-upload failed:", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function deleteRentalImageAction(url) {
    if (!url) return { success: false };
    try {
        await deleteFile(url);
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}

export async function addRental(formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const price = formData.get('price') || "Custom Quote";
    const variantsMetaStr = formData.get('variants_meta');

    if (!title || !category) {
        return { success: false, message: "Missing required fields (Title, Category)" };
    }

    try {
        let variantsMeta = [];
        try {
            variantsMeta = variantsMetaStr ? JSON.parse(variantsMetaStr) : [];
        } catch (e) {
            console.error("Error parsing variants meta", e);
        }

        const finalVariants = [];

        for (const meta of variantsMeta) {
            const index = meta.index;
            const file = formData.get(`variant_file_${index}`);
            let imagePath = meta.existingImage || '';

            // Check if file is actually a URL string (from background upload)
            if (file && typeof file === 'string' && file.includes('/uploads/')) {
                imagePath = file;
            } else if (file && typeof file === 'object' && file.size > 0) {
                imagePath = await saveFile(file, 'rentals');
            }

            if (meta.size && imagePath) { // Only save valid variants
                finalVariants.push({
                    size: meta.size,
                    image: imagePath
                });
            }
        }

        // Derive legacy fields for frontend compatibility
        const images = finalVariants.map(v => v.image);
        const availableSizes = finalVariants.map(v => v.size);

        await prisma.rentalItem.create({
            data: {
                title,
                category,
                price,
                images: JSON.stringify(images),
                availableSizes: JSON.stringify(availableSizes),
                variants: JSON.stringify(finalVariants),
            },
        });

        revalidatePath('/admin/rentals');
        revalidatePath('/rentals');
        return { success: true, message: "Rental item created successfully" };
    } catch (error) {
        console.error("Error creating rental:", error);
        return { success: false, message: error.message || "Failed to create rental item" };
    }
}

export async function updateRental(formData) {
    const id = formData.get('id');
    const title = formData.get('title');
    const category = formData.get('category');
    const price = formData.get('price') || "Custom Quote";
    const variantsMetaStr = formData.get('variants_meta');

    if (!id || !title) return { success: false, message: "Missing required fields" };

    try {
        let variantsMeta = [];
        try {
            variantsMeta = variantsMetaStr ? JSON.parse(variantsMetaStr) : [];
        } catch (e) {
            console.error("Error parsing variants meta", e);
        }

        const finalVariants = [];

        for (const meta of variantsMeta) {
            const index = meta.index;
            const file = formData.get(`variant_file_${index}`);
            let imagePath = meta.existingImage || '';

            if (file && file.size > 0) {
                imagePath = await saveFile(file, 'rentals');
            }

            if (meta.size && imagePath) {
                finalVariants.push({
                    size: meta.size,
                    image: imagePath
                });
            }
        }

        const images = finalVariants.map(v => v.image);
        const availableSizes = finalVariants.map(v => v.size);

        await prisma.rentalItem.update({
            where: { id: parseInt(id) },
            data: {
                title,
                category,
                price,
                images: JSON.stringify(images),
                availableSizes: JSON.stringify(availableSizes),
                variants: JSON.stringify(finalVariants),
            },
        });

        revalidatePath('/admin/rentals');
        revalidatePath('/rentals');
        return { success: true, message: "Rental item updated successfully" };

    } catch (error) {
        console.error("Error updating rental:", error);
        return { success: false, message: error.message || "Failed to update rental item" };
    }
}

export async function deleteRental(formData) {
    const id = formData.get('id');
    if (!id) return { success: false, message: "No ID provided" };

    try {
        const rentalId = parseInt(id);

        // Fetch the item first to get images
        const item = await prisma.rentalItem.findUnique({
            where: { id: rentalId },
        });

        if (!item) {
            return { success: false, message: "Item not found" };
        }

        // Collect all image URLs
        const imagesToDelete = new Set();

        // 1. From 'images' legacy array
        if (item.images) {
            try {
                const imgArray = JSON.parse(item.images);
                if (Array.isArray(imgArray)) {
                    imgArray.forEach(img => {
                        if (img) imagesToDelete.add(img);
                    });
                }
            } catch (e) { console.error("Error parsing images for deletion", e); }
        }

        // 2. From 'variants' array
        if (item.variants) {
            try {
                const variantsArray = JSON.parse(item.variants);
                if (Array.isArray(variantsArray)) {
                    variantsArray.forEach(v => {
                        if (v.image) imagesToDelete.add(v.image);
                    });
                }
            } catch (e) { console.error("Error parsing variants for deletion", e); }
        }

        // Delete files
        for (const imageUrl of imagesToDelete) {
            await deleteFile(imageUrl);
        }

        // Delete from DB
        await prisma.rentalItem.delete({
            where: { id: rentalId },
        });

        revalidatePath('/admin/rentals');
        revalidatePath('/rentals');
        return { success: true, message: "Rental item deleted successfully" };
    } catch (error) {
        console.error("Error deleting rental:", error);
        return { success: false, message: error.message || "Failed to delete rental item" };
    }
}

export async function getRentals() {
    try {
        const rentals = await prisma.rentalItem.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: rentals };
    } catch (error) {
        console.error("Error fetching rentals:", error);
        return { success: false, error: "Failed to fetch rentals" };
    }
}
