import AboutClient from './AboutClient';

export const metadata = {
    title: "About Us | Event Solution Nepal",
    description: "Learn about Event Solution Nepal, our history, mission, and the team behind your memorable events.",
};

export const dynamic = "force-dynamic";

import React from 'react';
import prisma from "@/lib/db";

export default async function About() {
    const team = await prisma.teamMember.findMany({
        orderBy: { id: 'asc' }
    });

    return <AboutClient initialTeam={team} />;
}
