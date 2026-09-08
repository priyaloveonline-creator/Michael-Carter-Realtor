"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import QuickReplies from "@/components/chat/QuickReplies";
import FeaturedProperties from "@/components/chat/FeaturedProperties";
import Composer from "@/components/chat/Composer";
import BookingModal from "@/components/BookingModal";
import { useChat } from "@/lib/useChat";
import { getAvailableListings } from "@/data/realtor";

const propertyTypes = ["Single Family Home", "Townhouse", "Condo", "Other"];

function ChatPageInner() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");

  const greeting =
    intent === "showing"
      ? "Hi there! 👋 I'd love to help you book a showing. Tap the button below, or tell me which property you're interested in."
      : intent
      ? `Hi there! 👋 It looks like you're interested in ${intent === "buy" ? "buying" : intent}ing a home in New York. What can I help you find?`
      : "Hi there! 👋\nAre you looking to buy, sell, rent, or invest in New York?";

  const { messages, isTyping, sendMessage, addAssistantMessage } =
    useChat(greeting);
  const [showPropertyTypes, setShowPropertyTypes] = useState(intent === "buy");
  const [showFeatured, setShowFeatured] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(intent === "showing");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, showPropertyTypes, showFeatured]);

  async function handleSend(text: string, attachment?: { name: string; type: string }) {
    const finalText = attachment
      ? `${text ? text + "\n" : ""}📎 Attached: ${attachment.name}`
      : text;
    setShowPropertyTypes(false);
    await sendMessage(finalText);
  }

  function handlePropertyType(type: string) {
    setShowPropertyTypes(false);
    sendMessage(type).then(() => {
      setShowFeatured(true);
    });
  }

  return (
    <main className="flex flex-col h-dvh bg-white">
      <ChatHeader />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {showPropertyTypes && !isTyping && (
          <QuickReplies options={propertyTypes} onSelect={handlePropertyType} />
        )}

        {showFeatured && (
          <FeaturedProperties listings={getAvailableListings().slice(0, 3)} />
        )}

        {isTyping && <TypingIndicator />}
      </div>

      <Composer onSend={handleSend} disabled={isTyping} />

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}
