import AboutClient from './AboutClient';

export const metadata = {
    title: "About Us | Event Solution Nepal",
    description: "Learn about Event Solution Nepal, our history, mission, and the team behind your memorable events.",
};

export const dynamic = "force-dynamic";

import React from 'react';
import prisma from "@/lib/prisma";

export default async function About() {
    const team = await prisma.teamMember.findMany({
        orderBy: { id: 'asc' }
    });

    const aboutData = await prisma.aboutPage.findFirst();

    return <AboutClient initialTeam={team} initialAbout={aboutData} />;
}

