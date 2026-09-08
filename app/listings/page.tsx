import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import TopNav from "@/components/TopNav";
import RealtorMiniHeader from "@/components/RealtorMiniHeader";
import ListingCard from "@/components/ListingCard";
import { getAvailableListings } from "@/data/realtor";

export const metadata = {
  title: "My Listings — Michael Carter",
};

export default function ListingsPage() {
  const availableListings = getAvailableListings();

  return (
    <main className="min-h-dvh bg-white pb-16">
      <TopNav variant="plain" />
      <RealtorMiniHeader />

      <div className="px-5 mt-6">
        <h1 className="text-2xl font-bold text-navy">My Listings</h1>
        <p className="text-navy-soft mt-1">
          Explore available properties in the New York area.
        </p>
      </div>

      <div className="px-5 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <Link
        href="/chat?intent=buy"
        className="mx-5 mt-6 flex items-center justify-between gap-3 rounded-3xl bg-pink-tint px-5 py-4 active:scale-[0.98] transition"
      >
        <span className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-brand-red shrink-0">
            <Home size={18} strokeWidth={2.25} />
          </span>
          <span>
            <span className="block text-navy font-semibold text-sm">
              More Great Homes
            </span>
            <span className="block text-navy-soft text-sm">
              Let's find the perfect one for you.
            </span>
          </span>
        </span>
        <ArrowRight size={18} className="text-brand-red shrink-0" />
      </Link>
    </main>
  );
}
