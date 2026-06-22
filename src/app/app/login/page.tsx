import App from "@/components/App";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Gateway — AutiCare AI",
  description: "Secure HIPAA compliance medical sign-in gateway.",
};

export default function LoginPage() {
  return <App initialTab="login" />;
}
