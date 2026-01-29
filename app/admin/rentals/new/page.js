
import RentalForm from '../RentalForm';
import { addRental, getRentals } from '../actions';

export default async function NewRentalPage() {
    let existingCategories = [];
    try {
        const res = await getRentals();
        if (res.success && res.data) {
            existingCategories = Array.from(new Set(res.data.map(r => r.category)));
        }
    } catch (e) {
        console.error("Failed to fetch existing categories", e);
    }

    return (
        <RentalForm
            action={addRental}
            mode="create"
            existingCategories={existingCategories}
        />
    );
}
