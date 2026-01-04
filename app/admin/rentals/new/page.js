
import RentalForm from '../RentalForm';
import { addRental } from '../actions';
import prisma from '@/lib/db';

export default async function NewRentalPage() {
    const categories = await prisma.rentalItem.findMany({
        distinct: ['category'],
        select: { category: true },
    });

    // Flatten to array of strings
    const categoryList = categories.map(c => c.category);

    return <RentalForm action={addRental} mode="create" existingCategories={categoryList} />;
}
