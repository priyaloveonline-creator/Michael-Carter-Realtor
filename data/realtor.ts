// ---------------------------------------------------------------------------
// Realtor knowledge base — single source of truth.
//
// Every page (profile, listings, services) AND the AI chat's system context
// read from this file. Update a listing's price/status here and the AI's
// answers change on the very next request — no retraining, no rebuild of
// any model, just a fresh read of this module at request time.
// ---------------------------------------------------------------------------

export type ListingStatus = "For Sale" | "Pending" | "Sold";

export interface Listing {
  id: string;
  status: ListingStatus;
  price: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: "buy" | "sell" | "relocate" | "invest";
}

export const realtor = {
  name: "Michael Carter",
  title: "Real Estate Agent",
  location: "New York, NY",
  verified: true,
  tagline: "Your dream home is just a call away — let's make it happen together.",
  avatarImage: "/images/michael-carter.jpg",
  heroImage: "/images/hero-home.jpg",
  phone: "310-508-4528",
  email: "michael.carter@compass.com",
  brokerage: "Compass",
  brokerageWebsite: "https://www.compass.com/",
  serviceAreas: "New York, NY & Surrounding Areas",
  about:
    "I'm Michael Carter, a licensed Real Estate Agent in New York, NY. I help buyers, sellers, and investors find the right opportunities with expert guidance, local market knowledge, and a commitment to your goals. Whether you're buying your first home, upgrading, or investing, I'm here to make the process simple and stress-free.",
  intents: ["Buy", "Sell", "Rent", "Invest"] as const,
  responseTime: "Avg. response < 1 min",
  online: true,
};

export const listings: Listing[] = [
  {
    id: "listing-1",
    status: "For Sale",
    price: 1250000,
    address: "2487 Oak Ridge Dr",
    city: "New York",
    state: "NY",
    zip: "10001",
    beds: 4,
    baths: 3,
    sqft: 2850,
    image: "/images/listing-1.jpg",
    description:
      "A striking glass-walled contemporary with a resort-style pool, covered lounge, and lush landscaped grounds — designed for indoor-outdoor living.",
  },
  {
    id: "listing-2",
    status: "For Sale",
    price: 980000,
    address: "765 Maple Ave",
    city: "New York",
    state: "NY",
    zip: "10016",
    beds: 4,
    baths: 3,
    sqft: 2420,
    image: "/images/listing-2.jpg",
    description:
      "A classic white farmhouse with black-trimmed windows, a covered entry, and beautifully landscaped curb appeal on a quiet street.",
  },
  {
    id: "listing-3",
    status: "For Sale",
    price: 649000,
    address: "1234 Pinecrest Ln",
    city: "New York",
    state: "NY",
    zip: "10028",
    beds: 3,
    baths: 2,
    sqft: 1620,
    image: "/images/listing-3.jpg",
    description:
      "A warm brick-and-stone craftsman with a two-car garage, mature landscaping, and a welcoming covered entry.",
  },
  {
    id: "listing-4",
    status: "For Sale",
    price: 899000,
    address: "569 Westlake Dr",
    city: "New York",
    state: "NY",
    zip: "10019",
    beds: 5,
    baths: 4,
    sqft: 3280,
    image: "/images/listing-4.jpg",
    description:
      "An architectural, light-filled estate with expansive glass walls, multiple terraces, and a sophisticated open floor plan.",
  },
];

export const services: Service[] = [
  {
    id: "buy",
    name: "Buy",
    description: "Find your dream home.",
    image: "/images/service-buy.jpg",
    icon: "buy",
  },
  {
    id: "sell",
    name: "Sell",
    description: "Get the best value for your home.",
    image: "/images/service-sell.jpg",
    icon: "sell",
  },
  {
    id: "relocate",
    name: "Relocate",
    description: "Make your next move with ease.",
    image: "/images/service-relocate.jpg",
    icon: "relocate",
  },
  {
    id: "invest",
    name: "Invest",
    description: "Build wealth through real estate.",
    image: "/images/service-invest.jpg",
    icon: "invest",
  },
];

/** Only ever show currently available properties to the AI or the visitor. */
export function getAvailableListings(): Listing[] {
  return listings.filter((l) => l.status !== "Sold");
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

/**
 * Builds a compact, structured text block of everything the AI is allowed to
 * know. This is regenerated on every chat request directly from the data
 * above, so changes to listings/profile/services are reflected immediately —
 * no caching, no stale AI knowledge, no separate "retrain" step.
 */
export function buildRealtorKnowledgeContext(): string {
  const listingsBlock = listings
    .map((l) => {
      return [
        `- ID: ${l.id}`,
        `  Status: ${l.status}`,
        `  Price: ${formatPrice(l.price)}`,
        `  Address: ${l.address}, ${l.city}, ${l.state} ${l.zip}`,
        `  Beds: ${l.beds} | Baths: ${l.baths} | Sqft: ${l.sqft}`,
        `  Description: ${l.description}`,
      ].join("\n");
    })
    .join("\n\n");

  const servicesBlock = services
    .map((s) => `- ${s.name}: ${s.description}`)
    .join("\n");

  return `
REALTOR PROFILE
Name: ${realtor.name}
Title: ${realtor.title}
Location: ${realtor.location}
Brokerage: ${realtor.brokerage}
Service Areas: ${realtor.serviceAreas}
Phone: ${realtor.phone}
Email: ${realtor.email}
Tagline: "${realtor.tagline}"
About: ${realtor.about}

SERVICES OFFERED
${servicesBlock}

CURRENT LISTINGS (this is the ONLY property data that exists — do not reference any property not listed here, and never mention a listing whose status is "Sold" as available)
${listingsBlock}
`.trim();
}
