"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import VerifiedBadge from "@/components/VerifiedBadge";
import { realtor } from "@/data/realtor";

export default function ChatHeader() {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-hairline">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          aria-label="Go back"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-pink-tint text-brand-red flex items-center justify-center active:scale-95 transition shrink-0"
        >
          <ArrowLeft size={18} strokeWidth={2.25} />
        </button>

        <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0">
          <Image
            src={realtor.avatarImage}
            alt={realtor.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="font-bold text-navy text-[15px] leading-tight truncate">
              {realtor.name}
            </p>
            <VerifiedBadge size={14} />
          </div>
          <p className="text-navy-soft text-xs leading-tight mt-0.5 truncate">
            {realtor.title}
          </p>
          <p className="flex items-center gap-1 text-xs text-navy-soft leading-tight mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Online · {realtor.responseTime}
          </p>
        </div>

        <Link
          href="/listings"
          className="hidden xs:flex shrink-0 items-center gap-1.5 border border-brand-red text-brand-red text-xs font-semibold px-3.5 py-2 rounded-full active:scale-95 transition whitespace-nowrap"
        >
          <Home size={13} />
          View Listings
        </Link>
      </div>
    </div>
  );
}
