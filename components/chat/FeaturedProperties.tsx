import Link from "next/link";
import Image from "next/image";
import { Home, ChevronRight, Heart } from "lucide-react";
import { type Listing, formatPrice } from "@/data/realtor";

export default function FeaturedProperties({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) return null;

  return (
    <div className="pl-9 pr-1 animate-msg-in">
      <div className="rounded-3xl border border-hairline bg-white shadow-card p-3.5">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5 font-bold text-navy text-sm">
            <Home size={15} className="text-brand-red" />
            Featured Properties
          </span>
          <Link
            href="/listings"
            className="flex items-center gap-0.5 text-brand-red text-xs font-semibold"
          >
            View All
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href="/listings"
              className="shrink-0 w-44 rounded-2xl border border-hairline overflow-hidden bg-white"
            >
              <div className="relative h-28 w-full">
                <Image
                  src={listing.image}
                  alt={listing.address}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {listing.status}
                </span>
                <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/95 flex items-center justify-center">
                  <Heart size={11} className="text-navy-soft" />
                </span>
              </div>
              <div className="px-2.5 py-2.5">
                <p className="font-bold text-navy text-sm">
                  {formatPrice(listing.price)}
                </p>
                <p className="text-navy-soft text-xs mt-0.5 truncate">
                  {listing.address}
                </p>
                <p className="text-navy-soft text-xs truncate">
                  {listing.city}, {listing.state} {listing.zip}
                </p>
                <p className="text-navy-soft text-[11px] mt-1">
                  {listing.beds} Beds · {listing.baths} Baths
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
