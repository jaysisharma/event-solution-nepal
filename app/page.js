import HomeClient from "./HomeClient";

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

export default function Home() {
  return <HomeClient />;
}
