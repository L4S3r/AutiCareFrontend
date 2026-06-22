import App from "@/components/App";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — AutiCare AI",
  description: "Flexible pricing plans for clinics, hospitals, families, and enterprise healthcare networks.",
};

export default function PricingPage() {
  return <App initialTab="pricing" />;
}
