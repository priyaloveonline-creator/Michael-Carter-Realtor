import Image from "next/image";
import { MapPin } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import { realtor } from "@/data/realtor";

export default function RealtorMiniHeader() {
  return (
    <div className="flex items-center gap-4 px-5 pt-4">
      <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden ring-4 ring-white shadow-card">
        <Image
          src={realtor.avatarImage}
          alt={realtor.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-bold text-navy leading-tight">
            {realtor.name}
          </h1>
          <VerifiedBadge size={17} />
        </div>
        <p className="text-navy-soft text-sm leading-tight mt-0.5">
          {realtor.title}
        </p>
        <p className="flex items-center gap-1 text-navy-soft text-sm mt-0.5">
          <MapPin size={13} className="text-brand-red shrink-0" />
          {realtor.location}
        </p>
      </div>
    </div>
  );
}
