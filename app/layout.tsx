import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    template: "%s | AI-UNIPOD BMS",
    default: "AI-UNIPOD UNILAG — Booking Management System",
  },
  description:
    "Book spaces and resources at the AI & Advanced Computing Pod, University of Lagos.",
  keywords: ["UNILAG", "AI-UNIPOD", "booking", "maker space", "innovation hub"],
  openGraph: {
    title: "AI-UNIPOD UNILAG BMS",
    description: "Book spaces and resources at the AI & Advanced Computing Pod, UNILAG.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "12px", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
