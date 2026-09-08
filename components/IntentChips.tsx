import Link from "next/link";
import { realtor } from "@/data/realtor";

export default function IntentChips() {
  return (
    <div className="flex gap-2.5 px-5 mt-4 overflow-x-auto no-scrollbar">
      {realtor.intents.map((intent) => (
        <Link
          key={intent}
          href={`/chat?intent=${intent.toLowerCase()}`}
          className="shrink-0 px-5 py-2 rounded-full bg-pink-tint text-brand-red font-semibold text-sm active:scale-95 transition"
        >
          {intent}
        </Link>
      ))}
    </div>
  );
}
