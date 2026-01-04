export const dynamic = "force-dynamic";

import ServicesClient from './ServicesClient';

export const metadata = {
    title: "Our Services | Event Solution Nepal",
    description: "Explore our wide range of event services including management, rentals, decoration, and more.",
};

import prisma from "@/lib/db";

export default async function Services() {
    const servicesRaw = await prisma.service.findMany({
        orderBy: { id: 'asc' }
    });

    const services = servicesRaw.map(s => ({
        ...s,
        tags: JSON.parse(s.tags)
    }));

    return <ServicesClient initialServices={services} />;
}
