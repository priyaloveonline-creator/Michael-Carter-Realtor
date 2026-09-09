"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessageData } from "@/components/chat/MessageBubble";

const STORAGE_KEY = "mc-chat-state";
const CONVERSATION_ID_KEY = "mc-chat-conversation-id";

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
  let id = sessionStorage.getItem(CONVERSATION_ID_KEY);
  if (!id) {
    id = `${Date.now()}-${uid()}`;
    sessionStorage.setItem(CONVERSATION_ID_KEY, id);
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

interface StoredChatState {
  messages: ChatMessageData[];
  history: HistoryMessage[];
}

/**
 * Reads any saved conversation from sessionStorage. Returns null if there's
 * nothing saved yet (first visit) or the saved data is corrupt, so the
 * caller can fall back to a fresh greeting either way. sessionStorage — not
 * localStorage — is deliberate: it survives navigating between pages on the
 * site (Profile, Listings, Services, back to Chat) but clears when the tab
 * or app is closed, or when a new site/session begins, matching what was
 * asked for.
 */
function loadStoredState(): StoredChatState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.messages) || !Array.isArray(parsed?.history)) {
      return null;
    }
    return parsed as StoredChatState;
  } catch {
    return null;
  }
}

function saveState(messages: ChatMessageData[], history: HistoryMessage[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, history }));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — degrade
    // silently; the chat still works for the current page view, it just
    // won't survive navigating away and back.
  }
}

export function useChat(initialGreeting: string) {
  // Lazy-init from sessionStorage so a page remount (navigating back to
  // /chat) picks up right where the visitor left off, instead of always
  // restarting at the greeting.
  const [messages, setMessages] = useState<ChatMessageData[]>(() => {
    const stored = loadStoredState();
    if (stored && stored.messages.length > 0) return stored.messages;
    return [
      {
        id: uid(),
        role: "assistant",
        content: initialGreeting,
        time: timeNow(),
      },
    ];
  });
  const [isTyping, setIsTyping] = useState(false);

  const historyRef = useRef<HistoryMessage[]>(
    (() => {
      const stored = loadStoredState();
      if (stored && stored.history.length > 0) return stored.history;
      return [{ role: "assistant", content: initialGreeting }];
    })()
  );
  const conversationIdRef = useRef<string>(getOrCreateConversationId());

  // Keep sessionStorage in sync whenever the visible messages change.
  useEffect(() => {
    saveState(messages, historyRef.current);
  }, [messages]);

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

        historyRef.current.push({ role: "assistant", content: replyText });
        setMessages((prev) => [
          ...prev.map((m) =>
            m.id === userMsg.id ? { ...m, status: "delivered" as const } : m
          ),
          assistantMsg,
        ]);
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
    historyRef.current.push({ role: "assistant", content });
    setMessages((prev) => [...prev, msg]);
  }, []);

  return { messages, isTyping, sendMessage, addAssistantMessage };
}
