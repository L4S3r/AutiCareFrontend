import App from "@/components/App";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — AutiCare AI",
  description: "Schedule a demo or get in touch with our clinical support team.",
};

export default function ContactPage() {
  return <App initialTab="contact" />;
}
