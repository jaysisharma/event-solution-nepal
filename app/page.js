import HomeClient from "./HomeClient";
import prisma from "@/lib/db";
import { promises as fs } from 'fs';
import path from 'path';
import JsonLd from "@/components/JsonLd";

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

import { updateEventStatuses } from '@/lib/eventUtils';

export default async function Home() {
  // Auto-update statuses
  await updateEventStatuses();

  const partners = await prisma.partner.findMany({
    orderBy: { order: 'asc' },
  });

  // Fetch only Featured and Upcoming events for the homepage
  const events = await prisma.event.findMany({
    where: {
      isFeatured: true,
      status: 'UPCOMING'
    },
    orderBy: { date: 'asc' }, // Note: String sort isn't perfect for Date, but 'createdAt' or 'id' might be better until Date type is fixed. Sticking to 'date' as requested or 'createdAt' as fallback? 'date' (string) sorting is bad (1, 10, 2). I'll change to createdAt 'asc' for logical entry order? Or just keep it.
    // Actually, sorting by string "date" (e.g. "12") is bad.
    // Better to sort by ID or CreatedAt for now, or just render as is.
    // I'll keep existing sort for minimal disruption, or change to ID (creation order).
    orderBy: { createdAt: 'desc' }, // Show newest featured first? Or soonest?
    // Without full date year, accurate sorting is hard.
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

  // Fetch Testimonials
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fetch Hero Slides
  const heroSlides = await prisma.heroSlide.findMany({
    orderBy: { order: 'asc' },
  });

  // Fetch Hero Settings
  let heroSettings = await prisma.heroSettings.findFirst();
  if (!heroSettings) {
    // Create default if missing (though unlikely if seeded, but robust for first run)
    heroSettings = {
      rating: "4.9",
      ratingLabel: "Average Rating",
      capacity: "Handling events up to 10k guests.",
      capacityLabel: "Capacity"
    };
  }
  // Fetch Timeline Memories
  const timelineMemories = await prisma.timelineMemory.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Fetch Projects (Curated Portfolio)
  // Logic: Fetch FEATURED projects first. If empty, maybe fallback?
  // User request: "Select from which projects i have to show" -> implies strict manual selection.
  // So we filter by isFeatured: true.
  const projects = await prisma.workProject.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return (
    <>
      <HomeClient
        initialPartners={partners}
        initialEvents={events}
        partnerLogos={partnerLogos}
        initialTestimonials={testimonials}
        heroSlides={heroSlides}
        heroSettings={heroSettings}
        initialTimeline={timelineMemories}
        initialProjects={projects}
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "EventPlanner",
        "name": "Event Solution Nepal",
        "image": "https://eventsolutionnepal.com.np/opengraph-image.png",
        "url": "https://eventsolutionnepal.com.np",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Kathmandu",
          "addressLocality": "Kathmandu",
          "addressCountry": "NP"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 27.7172,
          "longitude": 85.3240
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "09:00",
          "closes": "18:00"
        }
      }} />
    </>
  );
}

