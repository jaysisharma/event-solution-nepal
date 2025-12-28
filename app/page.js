import HomeClient from "./HomeClient";
import prisma from "@/lib/db";
import { promises as fs } from 'fs';
import path from 'path';

export const metadata = {
  title: "Event Solution Nepal | Best Event Management Company in Nepal",
  description: "Event Solution Nepal offers premium event management, rentals, decoration, and corporate event services in Kathmandu, Nepal. Contact us for a quote.",
  openGraph: {
    title: "Event Solution Nepal | Create Memorable Events",
    description: "Your trusted partner for planning, executing, and managing events since 2014.",
    url: "https://eventsolutionnepal.com.np",
    siteName: "Event Solution Nepal",
    images: [
      {
        url: "https://placehold.co/1200x630/EB1F28/FFFFFF/png?text=Event+Solution+Nepal",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};



export const dynamic = 'force-dynamic';

export default async function Home() {
  const partners = await prisma.partner.findMany({
    orderBy: { order: 'asc' },
  });

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    take: 3, // Only show 3 on homepage
  });

  // Read partner logos from public/company
  const companyDir = path.join(process.cwd(), 'public/company');
  let partnerLogos = [];
  try {
    const files = await fs.readdir(companyDir);
    partnerLogos = files
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map(file => `/company/${encodeURIComponent(file)}`);
  } catch (error) {
    console.error("Error reading company logos:", error);
  }

  return (
    <HomeClient
      initialPartners={partners}
      initialEvents={events}
      partnerLogos={partnerLogos}
    />
  );
}
