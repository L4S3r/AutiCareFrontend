import App from "@/components/App";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — AutiCare AI",
  description: "Learn about AutiCare AI's mission, vision, and research-backed approach to autism care.",
};

export default function AboutPage() {
  return <App initialTab="home" />;
}
