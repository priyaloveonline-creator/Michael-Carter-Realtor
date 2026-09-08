"use client";

import Link from "next/link";
import { X, User, Home, Sparkles, CalendarCheck, Phone } from "lucide-react";
import { useEffect } from "react";
import { realtor } from "@/data/realtor";

const links = [
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/listings", label: "My Listings", icon: Home },
  { href: "/services", label: "My Services", icon: Sparkles },
  { href: "/chat?intent=showing", label: "Book a Showing", icon: CalendarCheck },
];

export default function MenuSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-navy/40 backdrop-blur-[2px] animate-msg-in"
      />
      <div className="absolute right-0 top-0 h-full w-[78%] max-w-xs bg-white shadow-card-lg flex flex-col animate-msg-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <span className="text-lg font-semibold text-navy">Menu</span>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-pink-tint text-brand-red flex items-center justify-center active:scale-95 transition"
          >
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>
        <nav className="flex flex-col px-3 pt-2 gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl text-navy font-medium hover:bg-pink-tint active:scale-[0.98] transition"
            >
              <span className="h-9 w-9 rounded-full bg-pink-tint flex items-center justify-center text-brand-red shrink-0">
                <Icon size={18} strokeWidth={2.25} />
              </span>
              {label}
            </Link>
          ))}
          <a
            href={`tel:${realtor.phone.replace(/[^\d+]/g, "")}`}
            onClick={onClose}
            className="flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl text-navy font-medium hover:bg-pink-tint active:scale-[0.98] transition"
          >
            <span className="h-9 w-9 rounded-full bg-pink-tint flex items-center justify-center text-brand-red shrink-0">
              <Phone size={18} strokeWidth={2.25} />
            </span>
            Call Me
          </a>
        </nav>
      </div>
    </div>
  );
}
