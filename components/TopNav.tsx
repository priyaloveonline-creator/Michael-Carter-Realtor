"use client";

import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MenuSheet from "./MenuSheet";

export default function TopNav({
  variant = "light",
  showBack = true,
}: {
  /** "light" = icons on a photo/hero background (white circular buttons). "plain" = icons on a white page background. */
  variant?: "light" | "plain";
  showBack?: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const btnClass =
    variant === "light"
      ? "bg-white/95 shadow-card text-brand-red"
      : "bg-pink-tint text-brand-red";

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5">
        {showBack ? (
          <button
            aria-label="Go back"
            onClick={() => router.back()}
            className={`h-11 w-11 rounded-full flex items-center justify-center active:scale-95 transition ${btnClass}`}
          >
            <ArrowLeft size={20} strokeWidth={2.25} />
          </button>
        ) : (
          <span />
        )}
        <button
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className={`h-11 w-11 rounded-full flex items-center justify-center active:scale-95 transition ${btnClass}`}
        >
          <Menu size={20} strokeWidth={2.25} />
        </button>
      </div>
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
