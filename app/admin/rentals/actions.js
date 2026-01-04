'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';

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

            if (file && file.size > 0) {
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
        return { success: false, message: "Failed to create rental item" };
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
        return { success: false, message: "Failed to update rental item" };
    }
}

export async function deleteRental(formData) {
    const id = formData.get('id');
    if (!id) return { success: false, message: "No ID provided" };

    try {
        await prisma.rentalItem.delete({
            where: { id: parseInt(id) },
        });

        revalidatePath('/admin/rentals');
        revalidatePath('/rentals');
        return { success: true, message: "Rental item deleted successfully" };
    } catch (error) {
        console.error("Error deleting rental:", error);
        return { success: false, message: "Failed to delete rental item" };
    }
}
