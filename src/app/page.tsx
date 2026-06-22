import App from "@/components/App";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AutiCare AI — AI-Powered Autism Support Platform",
  description: "AutiCare AI combines genetic nutrition intelligence with multi-provider care coordination.",
};

export default function Home() {
  return <App initialTab="home" />;
}
