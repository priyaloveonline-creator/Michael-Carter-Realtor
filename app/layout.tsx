import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Michael Carter — Real Estate Agent, New York, NY",
  description:
    "Your dream home is just a call away — let's make it happen together. Chat with Michael Carter's AI assistant to find your next home in New York.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f4f5f8]">
        <div className="mx-auto max-w-[480px] min-h-dvh bg-white shadow-card-lg relative">
          {children}
        </div>
      </body>
    </html>
  );
}
