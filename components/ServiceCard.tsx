import Image from "next/image";
import Link from "next/link";
import { Home, Tag, MapPinned, TrendingUp } from "lucide-react";
import type { Service } from "@/data/realtor";

const icons = {
  buy: Home,
  sell: Tag,
  relocate: MapPinned,
  invest: TrendingUp,
};

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = icons[service.icon];

  return (
    <Link
      href={`/chat?intent=${service.id}`}
      className="flex items-center gap-4 rounded-3xl border border-hairline bg-white shadow-card px-4 py-4 active:scale-[0.98] transition"
    >
      <span className="h-12 w-12 rounded-full bg-pink-tint flex items-center justify-center text-brand-red shrink-0">
        <Icon size={20} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-navy">{service.name}</p>
        <p className="text-navy-soft text-sm mt-0.5 leading-snug">
          {service.description}
        </p>
      </div>
      <div className="relative h-16 w-20 shrink-0 rounded-2xl overflow-hidden">
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
    </Link>
  );
}
