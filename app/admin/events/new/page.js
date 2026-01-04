import { addEvent } from '../actions';
import EventForm from '../EventForm';

export default function NewEventPage() {
    return (
        <EventForm action={addEvent} mode="create" />
    );
}
