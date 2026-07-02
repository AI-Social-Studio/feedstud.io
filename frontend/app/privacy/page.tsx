import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — feedstud.io",
};

export default function PrivacyPage() {
  return <LegalPage page="privacy" />;
}
