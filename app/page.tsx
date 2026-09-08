import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import TopNav from "@/components/TopNav";
import VerifiedBadge from "@/components/VerifiedBadge";
import IntentChips from "@/components/IntentChips";
import ContactCard from "@/components/ContactCard";
import { realtor } from "@/data/realtor";

export default function ProfilePage() {
  return (
    <main className="min-h-dvh bg-white pb-28">
      {/* Hero */}
      <div className="relative h-72 w-full">
        <Image
          src={realtor.heroImage}
          alt="Featured property"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0">
          <TopNav variant="light" showBack={false} />
        </div>
      </div>

      {/* Overlapping avatar + identity */}
      <div className="px-5">
        <div className="-mt-14 flex items-end gap-4">
          <div className="relative h-28 w-28 shrink-0 rounded-full ring-4 ring-white shadow-card-lg overflow-hidden bg-white">
            <Image
              src={realtor.avatarImage}
              alt={realtor.name}
              fill
              sizes="112px"
              className="object-cover"
            />
            <span className="absolute bottom-1 right-1">
              <VerifiedBadge size={22} />
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold text-navy leading-tight">
              {realtor.name}
            </h1>
            <VerifiedBadge size={19} />
          </div>
          <p className="text-navy-soft mt-0.5">{realtor.title}</p>
          <p className="flex items-center gap-1.5 text-navy-soft mt-1">
            <MapPin size={15} className="text-brand-red shrink-0" />
            {realtor.location}
          </p>
          <p className="text-navy-soft mt-3 leading-relaxed max-w-md">
            {realtor.tagline}
          </p>
        </div>
      </div>

      <IntentChips />
      <ContactCard />

      {/* About */}
      <div className="px-5 mt-7">
        <h2 className="text-lg font-bold text-navy">About Me</h2>
        <p className="text-navy-soft leading-relaxed mt-2 text-[15px]">
          {realtor.about}
        </p>
      </div>

      {/* Skyline banner */}
      <div className="mx-5 mt-6 relative h-40 rounded-3xl overflow-hidden">
        <Image
          src="/images/nyc-skyline.svg"
          alt="New York City skyline"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-between p-4">
          <p className="font-script italic text-white text-2xl leading-tight drop-shadow">
            Your Next Chapter
            <br />
            Starts Here
          </p>
          <span className="flex items-center gap-1 bg-white/95 text-navy text-xs font-semibold px-3 py-1.5 rounded-full">
            <MapPin size={12} className="text-brand-red" />
            {realtor.location}
          </span>
        </div>
      </div>

      {/* Sticky chat CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-white via-white/95 to-transparent">
        <Link
          href="/chat"
          className="flex items-center justify-center gap-2 w-full bg-brand-red text-white font-semibold py-4 rounded-full shadow-card-lg active:scale-[0.98] transition"
        >
          <MessageCircle size={18} />
          Chat with Me
        </Link>
      </div>
    </main>
  );
}
