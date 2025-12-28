'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTeamMember(prevState, formData) {
    const name = formData.get('name');
    const role = formData.get('role');
    const image = formData.get('image');

    try {
        await prisma.teamMember.create({
            data: {
                name,
                role,
                image
            }
        });
    } catch (e) {
        return { error: 'Failed to create team member.' };
    }

    revalidatePath('/about');
    revalidatePath('/admin/team');
    redirect('/admin/team');
}

export async function deleteTeamMember(id) {
    try {
        await prisma.teamMember.delete({
            where: { id: parseInt(id) }
        });
    } catch (e) {
        return { error: 'Failed to delete team member.' };
    }

    revalidatePath('/about');
    revalidatePath('/admin/team');
}
