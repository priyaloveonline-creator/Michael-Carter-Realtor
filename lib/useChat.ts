"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessageData } from "@/components/chat/MessageBubble";

function timeNow() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getOrCreateConversationId(): string {
  if (typeof window === "undefined") return uid();
  const key = "mc-chat-conversation-id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${uid()}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface HistoryMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export function useChat(initialGreeting: string) {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: uid(),
      role: "assistant",
      content: initialGreeting,
      time: timeNow(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const historyRef = useRef<HistoryMessage[]>([
    { role: "assistant", content: initialGreeting },
  ]);
  const conversationIdRef = useRef<string>(getOrCreateConversationId());

  const sendMessage = useCallback(
    async (text: string, imageDataUrl?: string) => {
      if (!text.trim() && !imageDataUrl) return;

      const userMsg: ChatMessageData = {
        id: uid(),
        role: "user",
        content: text || "📷 Photo",
        time: timeNow(),
        status: "sent",
      };
      setMessages((prev) => [...prev, userMsg]);

      // Build the multimodal content block sent to the model. Only include
      // an image_url block when we actually have image bytes to send —
      // otherwise fall back to a plain string, which is cheaper and is what
      // every prior turn in the conversation already looks like.
      const historyEntry: HistoryMessage = imageDataUrl
        ? {
            role: "user",
            content: [
              { type: "text", text: text || "What do you see in this image?" },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          }
        : { role: "user", content: text };

      historyRef.current.push(historyEntry);
      setIsTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyRef.current,
            conversationId: conversationIdRef.current,
          }),
        });

        const data = await res.json();

        const replyText: string =
          data.reply ||
          data.error ||
          "Sorry, something went wrong on my end. Please try again, or reach Michael directly.";

        const assistantMsg: ChatMessageData = {
          id: uid(),
          role: "assistant",
          content: replyText,
          time: timeNow(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        historyRef.current.push({ role: "assistant", content: replyText });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, status: "delivered" } : m
          )
        );
      } catch (err) {
        const assistantMsg: ChatMessageData = {
          id: uid(),
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          time: timeNow(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    []
  );

  const addAssistantMessage = useCallback((content: string) => {
    const msg: ChatMessageData = {
      id: uid(),
      role: "assistant",
      content,
      time: timeNow(),
    };
    setMessages((prev) => [...prev, msg]);
    historyRef.current.push({ role: "assistant", content });
  }, []);

  return { messages, isTyping, sendMessage, addAssistantMessage };
}
