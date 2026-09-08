import Image from "next/image";
import { Check, CheckCheck } from "lucide-react";
import { realtor } from "@/data/realtor";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  status?: "sent" | "delivered";
}

export default function MessageBubble({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-msg-in">
        <div className="max-w-[78%]">
          <div className="bg-brand-red text-white rounded-3xl rounded-br-md px-4 py-3 text-[15px] leading-snug whitespace-pre-wrap">
            {message.content}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 pr-1">
            <span className="text-[11px] text-navy-soft">{message.time}</span>
            {message.status === "delivered" ? (
              <CheckCheck size={13} className="text-brand-red" />
            ) : (
              <Check size={13} className="text-navy-soft" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 animate-msg-in">
      <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0 mb-4">
        <Image
          src={realtor.avatarImage}
          alt={realtor.name}
          fill
          sizes="28px"
          className="object-cover"
        />
      </div>
      <div className="max-w-[78%]">
        <div className="bg-[#f1f2f6] text-navy rounded-3xl rounded-bl-md px-4 py-3 text-[15px] leading-snug whitespace-pre-wrap">
          {message.content}
        </div>
        <span className="block text-[11px] text-navy-soft mt-1 pl-1">
          {message.time}
        </span>
      </div>
    </div>
  );
}
