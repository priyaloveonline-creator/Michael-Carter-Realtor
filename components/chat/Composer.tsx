"use client";

import { useRef, useState } from "react";
import { Plus, Send, Mic, Square, Paperclip, X } from "lucide-react";

interface ComposerProps {
  onSend: (text: string, attachment?: { name: string; type: string }) => void;
  disabled?: boolean;
}

export default function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; type: string } | null>(
    null
  );
  const [recording, setRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  function handleSend() {
    if (!text.trim() && !attachment) return;
    onSend(text.trim(), attachment ?? undefined);
    setText("");
    setAttachment(null);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({ name: file.name, type: file.type });
    }
    setShowAttachMenu(false);
    e.target.value = "";
  }

  function toggleVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input isn't supported in this browser. Try Chrome on desktop or Android."
      );
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  return (
    <div className="sticky bottom-0 bg-white border-t border-hairline px-3 pt-2.5 pb-3">
      {attachment && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-2xl bg-pink-tint">
          <Paperclip size={14} className="text-brand-red shrink-0" />
          <span className="text-sm text-navy truncate flex-1">{attachment.name}</span>
          <button
            aria-label="Remove attachment"
            onClick={() => setAttachment(null)}
            className="shrink-0 text-navy-soft"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative shrink-0">
          <button
            aria-label="Attach file"
            onClick={() => setShowAttachMenu((v) => !v)}
            className="h-11 w-11 rounded-full bg-pink-tint text-brand-red flex items-center justify-center active:scale-95 transition"
          >
            <Plus size={20} strokeWidth={2.25} />
          </button>
          {showAttachMenu && (
            <div className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-card-lg border border-hairline p-1.5 flex flex-col w-44 animate-msg-in">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-pink-tint text-sm text-navy text-left"
              >
                <Paperclip size={15} className="text-brand-red" />
                Photo or File
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex-1 flex items-end bg-[#f4f5f8] rounded-3xl px-4 py-2.5 min-h-11">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[15px] text-navy placeholder:text-navy-soft max-h-24"
          />
        </div>

        {text.trim() || attachment ? (
          <button
            aria-label="Send message"
            onClick={handleSend}
            disabled={disabled}
            className="h-11 w-11 rounded-full bg-brand-red text-white flex items-center justify-center active:scale-95 transition shrink-0 disabled:opacity-50"
          >
            <Send size={17} />
          </button>
        ) : (
          <button
            aria-label={recording ? "Stop recording" : "Start voice input"}
            onClick={toggleVoice}
            className={`h-11 w-11 rounded-full flex items-center justify-center active:scale-95 transition shrink-0 ${
              recording ? "bg-brand-red text-white" : "bg-brand-red text-white"
            }`}
          >
            {recording ? <Square size={15} fill="white" /> : <Mic size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
