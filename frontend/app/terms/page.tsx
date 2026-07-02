import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions — feedstud.io",
};

export default function TermsPage() {
  return <LegalPage page="terms" />;
}
