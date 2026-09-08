import { Phone, Mail, Building2, MapPin } from "lucide-react";
import { realtor } from "@/data/realtor";

const rows = [
  {
    icon: Phone,
    label: "Text",
    value: realtor.phone,
    cta: "Text",
    href: `tel:${realtor.phone.replace(/[^\d+]/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: realtor.email,
    cta: "Email",
    href: `mailto:${realtor.email}`,
  },
  {
    icon: Building2,
    label: "Brokerage",
    value: realtor.brokerage,
    cta: "Website",
    href: realtor.brokerageWebsite,
  },
  {
    icon: MapPin,
    label: "Service Areas",
    value: realtor.serviceAreas,
    cta: "View Map",
    href: `https://maps.google.com/?q=${encodeURIComponent(realtor.serviceAreas)}`,
  },
];

export default function ContactCard() {
  return (
    <div className="mx-5 mt-5 rounded-3xl border border-hairline bg-white shadow-card divide-y divide-hairline overflow-hidden">
      {rows.map(({ icon: Icon, label, value, cta, href }) => (
        <div key={label} className="flex items-center gap-3.5 px-4 py-4">
          <span className="h-10 w-10 rounded-full bg-pink-tint flex items-center justify-center text-brand-red shrink-0">
            <Icon size={17} strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-navy-soft leading-tight">{label}</p>
            <p className="text-sm font-semibold text-navy leading-tight mt-0.5 truncate">
              {value}
            </p>
          </div>
          <a
            href={href}
            target={cta === "Website" || cta === "View Map" ? "_blank" : undefined}
            rel="noreferrer"
            className="shrink-0 px-4 py-2 rounded-full bg-brand-red text-white text-xs font-semibold active:scale-95 transition whitespace-nowrap"
          >
            {cta}
          </a>
        </div>
      ))}
    </div>
  );
}
