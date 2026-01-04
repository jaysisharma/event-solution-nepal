export const dynamic = "force-dynamic";

import prisma from "@/lib/db";

export default async function sitemap() {
    const baseUrl = 'https://eventsolutionnepal.com.np';

    // Static routes
    const routes = [
        '',
        '/about',
        '/services',
        '/projects',
        '/gallery',
        '/rentals',
        '/contact',
        '/events',
        '/quote',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Events
    const events = await prisma.event.findMany({
        select: { id: true, updatedAt: true }
    });
    const eventUrls = events.map((event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // Dynamic Projects
    const projects = await prisma.workProject.findMany({
        select: { id: true, updatedAt: true }
    });
    const projectUrls = projects.map((project) => ({
        url: `${baseUrl}/projects/${project.id}`,
        lastModified: project.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...routes, ...eventUrls, ...projectUrls];
}
