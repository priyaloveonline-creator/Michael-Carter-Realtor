"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import QuickReplies from "@/components/chat/QuickReplies";
import FeaturedProperties from "@/components/chat/FeaturedProperties";
import Composer, { type ComposerAttachment } from "@/components/chat/Composer";
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
  const [bookingOpen, setBookingOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-open the booking modal once per browser session when arriving via
  // ?intent=showing (e.g. the "Book a Showing" menu link) — but only the
  // very first time, not every time the visitor navigates back to /chat
  // while that query param still happens to be in the URL (browser back
  // button preserves it, which would otherwise pop the modal open again
  // unprompted).
  useEffect(() => {
    if (intent !== "showing") return;
    const key = "mc-chat-showing-auto-opened";
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setBookingOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, showPropertyTypes, showFeatured]);

  async function handleSend(text: string, attachment?: ComposerAttachment) {
    setShowPropertyTypes(false);

    if (attachment?.dataUrl) {
      // Real image: send it to the AI as actual image data, not just a filename.
      await sendMessage(text, attachment.dataUrl);
      return;
    }

    if (attachment) {
      // Non-image file (PDF, docx, etc.) — the model can't see its contents,
      // so be upfront about that instead of silently pretending to read it.
      const finalText = `${text ? text + "\n" : ""}📎 Attached: ${attachment.name} (I can't open non-image files yet — happy to answer questions about it if you describe what's in it, or I can connect you with Michael directly.)`;
      await sendMessage(finalText);
      return;
    }

    await sendMessage(text);
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
