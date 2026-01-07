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



export const revalidate = 60;

import { updateEventStatuses } from '@/lib/eventUtils';

export default async function Home() {
  const companyDir = path.join(process.cwd(), 'public/company');

  // Fetch all data in parallel
  let partners = [], events = [], testimonials = [], heroSlides = [], heroSettingsRaw = null, timelineMemories = [], projects = [], partnerLogos = [];

  try {
    const [
      _updateStatus,
      fetchedPartners,
      fetchedEvents,
      fetchedTestimonials,
      fetchedHeroSlides,
      fetchedHeroSettings,
      fetchedTimeline,
      fetchedProjects,
      fetchedLogos
    ] = await Promise.all([
      updateEventStatuses().catch(e => console.error("Update statuses failed:", e)),
      prisma.partner.findMany({ orderBy: { order: 'asc' } }),
      prisma.event.findMany({
        where: { isFeatured: true, status: 'UPCOMING' },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.heroSlide.findMany({ orderBy: { order: 'asc' } }),
      prisma.heroSettings.findFirst(),
      prisma.timelineMemory.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.workProject.findMany({ where: { isFeatured: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
      (async () => {
        try {
          const files = await fs.readdir(companyDir);
          return files
            .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
            .map(file => `/company/${encodeURIComponent(file)}`);
        } catch (error) {
          console.error("Error reading company logos:", error);
          return [];
        }
      })()
    ]);

    partners = fetchedPartners;
    events = fetchedEvents;
    testimonials = fetchedTestimonials;
    heroSlides = fetchedHeroSlides;
    heroSettingsRaw = fetchedHeroSettings;
    timelineMemories = fetchedTimeline;
    projects = fetchedProjects;
    partnerLogos = fetchedLogos;

  } catch (error) {
    console.warn("Database unreachable during build (this is expected during Docker build):", error.message);
  }

  // Set defaults if heroSettings is missing
  const heroSettings = heroSettingsRaw || {
    rating: "4.9",
    ratingLabel: "Average Rating",
    capacity: "Handling events up to 10k guests.",
    capacityLabel: "Capacity"
  };

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

