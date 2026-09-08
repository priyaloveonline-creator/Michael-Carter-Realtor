"use client";

import { useState } from "react";
import { X, MapPin, Video } from "lucide-react";

const PROVIDER = process.env.NEXT_PUBLIC_BOOKING_PROVIDER === "calcom" ? "calcom" : "calendly";
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/";
const CALCOM_URL = process.env.NEXT_PUBLIC_CALCOM_URL || "https://cal.com/";

type MeetingType = "in-person" | "video";

export default function BookingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [meetingType, setMeetingType] = useState<MeetingType>("in-person");

  if (!open) return null;

  const embedUrl = PROVIDER === "calcom" ? CALCOM_URL : CALENDLY_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        aria-label="Close booking"
        onClick={onClose}
        className="absolute inset-0 bg-navy/50 backdrop-blur-[2px]"
      />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-card-lg animate-msg-in max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline shrink-0">
          <div>
            <h2 className="font-bold text-navy text-lg">Book a Showing</h2>
            <p className="text-navy-soft text-xs mt-0.5">
              Pick a time that works for you.
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-pink-tint text-brand-red flex items-center justify-center active:scale-95 transition shrink-0"
          >
            <X size={16} strokeWidth={2.25} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 shrink-0">
          <p className="text-xs font-semibold text-navy-soft mb-2">
            Meeting type
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setMeetingType("in-person")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold border transition ${
                meetingType === "in-person"
                  ? "bg-brand-red text-white border-brand-red"
                  : "bg-white text-navy border-hairline"
              }`}
            >
              <MapPin size={14} />
              In-Person
            </button>
            <button
              onClick={() => setMeetingType("video")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold border transition ${
                meetingType === "video"
                  ? "bg-brand-red text-white border-brand-red"
                  : "bg-white text-navy border-hairline"
              }`}
            >
              <Video size={14} />
              Video Call
            </button>
          </div>
          <p className="text-navy-soft text-xs mt-2 leading-relaxed">
            {meetingType === "video"
              ? "A video call link will be shared automatically once your time is confirmed."
              : "Michael will meet you at the property at your confirmed time."}
          </p>
        </div>

        <div className="flex-1 min-h-[420px] px-2 pb-2">
          <iframe
            src={embedUrl}
            title="Schedule a showing"
            className="w-full h-full min-h-[420px] rounded-2xl border border-hairline"
          />
        </div>
      </div>
    </div>
  );
}
