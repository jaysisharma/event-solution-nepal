export const dynamic = "force-dynamic";

import ProjectsClient from "./ProjectsClient";

export const metadata = {
    title: "Projects | Event Solution Nepal",
    description: "Browse our projects of weddings, corporate events, parties, and concerts managed by Event Solution Nepal.",
};

import prisma from "@/lib/db";

export default async function ProjectsPage() {
    // Fetch projects from DB
    const projectsRaw = await prisma.workProject.findMany({
        orderBy: { order: 'asc' }
    });

    // Parse JSON images
    const projects = projectsRaw.map(p => ({
        ...p,
        images: JSON.parse(p.images)
    }));

    return <ProjectsClient initialProjects={projects} />;
}
