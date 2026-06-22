import App from "@/components/App";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — AutiCare AI",
  description: "Explore all AutiCare AI features: genetic nutrition planning, behavioral analytics, care coordination, and more.",
};

export default function FeaturesPage() {
  return <App initialTab="features" />;
}
