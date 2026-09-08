"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, BedDouble, Bath, Ruler } from "lucide-react";
import { type Listing, formatPrice } from "@/data/realtor";

export default function ListingCard({
  listing,
  compact = false,
}: {
  listing: Listing;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-3xl bg-white border border-hairline shadow-card overflow-hidden">
      <div className={`relative w-full ${compact ? "h-36" : "h-44"}`}>
        <Image
          src={listing.image}
          alt={listing.address}
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 bg-brand-red text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {listing.status}
        </span>
        <button
          aria-label={saved ? "Remove from favorites" : "Save to favorites"}
          onClick={() => setSaved((s) => !s)}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 flex items-center justify-center shadow-card active:scale-90 transition"
        >
          <Heart
            size={15}
            strokeWidth={2.25}
            className={saved ? "fill-brand-red text-brand-red" : "text-navy-soft"}
          />
        </button>
      </div>

      <div className="px-4 py-3.5">
        <p className="text-lg font-bold text-navy leading-tight">
          {formatPrice(listing.price)}
        </p>
        <p className="text-sm text-navy font-medium mt-1 leading-snug">
          {listing.address}
        </p>
        <p className="text-sm text-navy-soft leading-snug">
          {listing.city}, {listing.state} {listing.zip}
        </p>
        <div className="flex items-center gap-3 mt-2.5 text-navy-soft text-xs">
          <span className="flex items-center gap-1">
            <BedDouble size={14} className="text-brand-red" />
            {listing.beds} Beds
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} className="text-brand-red" />
            {listing.baths} Baths
          </span>
          <span className="flex items-center gap-1">
            <Ruler size={14} className="text-brand-red" />
            {listing.sqft.toLocaleString()} sqft
          </span>
        </div>
      </div>
    </div>
  );
}
