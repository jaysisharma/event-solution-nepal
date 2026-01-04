export const dynamic = "force-dynamic";

import prisma from '@/lib/db';
import RentalForm from '../RentalForm';
import { updateRental } from '../actions';
import { notFound } from 'next/navigation';

export default async function EditRentalPage({ params }) {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const rental = await prisma.rentalItem.findUnique({
        where: { id },
    });

    if (!rental) {
        notFound();
    }

    const categories = await prisma.rentalItem.findMany({
        distinct: ['category'],
        select: { category: true },
    });
    const categoryList = categories.map(c => c.category);

    return <RentalForm initialData={rental} action={updateRental} mode="edit" existingCategories={categoryList} />;
}
