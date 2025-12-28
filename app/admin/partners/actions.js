'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addPartner(formData) {
    const name = formData.get('name');
    if (!name) return;

    await prisma.partner.create({
        data: { name },
    });

    revalidatePath('/admin/partners');
    revalidatePath('/'); // Update homepage
}

export async function deletePartner(formData) {
    const id = formData.get('id');
    if (!id) return;

    await prisma.partner.delete({
        where: { id: parseInt(id) },
    });

    revalidatePath('/admin/partners');
    revalidatePath('/');
}

export async function updatePartner(formData) {
    const id = formData.get('id');
    const name = formData.get('name');
    if (!id || !name) return;

    await prisma.partner.update({
        where: { id: parseInt(id) },
        data: { name },
    });

    revalidatePath('/admin/partners');
    revalidatePath('/');
}
