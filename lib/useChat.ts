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
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: initialGreeting },
  ]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessageData = {
      id: uid(),
      role: "user",
      content: text,
      time: timeNow(),
      status: "sent",
    };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current.push({ role: "user", content: text });
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyRef.current }),
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
  }, []);

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
