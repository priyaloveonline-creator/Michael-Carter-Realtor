import Image from "next/image";
import TopNav from "@/components/TopNav";
import RealtorMiniHeader from "@/components/RealtorMiniHeader";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/data/realtor";

export const metadata = {
  title: "My Services — Michael Carter",
};

export default function ServicesPage() {
  return (
    <main className="min-h-dvh bg-white pb-16">
      <TopNav variant="plain" />
      <RealtorMiniHeader />

      <div className="px-5 mt-6 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-brand-red text-xs font-bold tracking-wide">
            My Services
          </p>
          <h1 className="text-[26px] leading-[1.15] font-bold text-navy mt-1">
            Let's Find What
            <br />
            Works for You
          </h1>
          <p className="text-navy-soft mt-2 text-[15px] leading-relaxed">
            Personalized real estate services to help you buy, sell, or
            invest with confidence.
          </p>
        </div>
        <div className="relative h-28 w-28 shrink-0 rounded-full overflow-hidden">
          <Image
            src="/images/services-hero.jpg"
            alt="Featured property"
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-3.5">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </main>
  );
}
