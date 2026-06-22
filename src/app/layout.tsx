import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutiCare AI — AI-Powered Autism Support Platform",
  description: "AutiCare AI combines AI-assisted genetic nutrition planning with multi-provider care coordination for children with Autism Spectrum Disorder.",
  keywords: ["autism", "ASD", "genetic nutrition", "care coordination", "AI healthcare"],
  authors: [{ name: "AutiCare AI" }],
  openGraph: {
    title: "AutiCare AI — AI-Powered Autism Support",
    description: "Personalized genetic nutrition and care coordination for children with ASD.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
