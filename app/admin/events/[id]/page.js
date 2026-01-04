export const dynamic = "force-dynamic";

import prisma from '@/lib/db';
import { updateEvent } from '../actions';
import EventForm from '../EventForm';
import { redirect } from 'next/navigation';

export default async function EditEventPage({ params }) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const event = await prisma.event.findUnique({
        where: { id }
    });

    if (!event) {
        redirect('/admin/events');
    }

    return (
        <EventForm
            initialData={event}
            action={updateEvent}
            mode="edit"
        />
    );
}
