import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Bare Studios | Barber, Hair, Lashes, Brows & Skin in Bel Air",
  description:
    "Book barbering, hair, lashes, brows, facials, Dermalogica Luminfusion, microneedling, chemical peels, waxing, and permanent makeup at Bare Studios in Downtown Bel Air.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="min-h-full bg-bg text-text-primary antialiased">{children}</body>
    </html>
  );
}
