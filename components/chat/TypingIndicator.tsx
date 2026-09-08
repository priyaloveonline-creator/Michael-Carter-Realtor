import Image from "next/image";
import { realtor } from "@/data/realtor";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-msg-in">
      <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
        <Image
          src={realtor.avatarImage}
          alt={realtor.name}
          fill
          sizes="28px"
          className="object-cover"
        />
      </div>
      <div className="bg-[#f1f2f6] rounded-3xl rounded-bl-md px-4 py-3.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-navy-soft animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}
