import type { Metadata } from "next";
import { ContactContent } from "@/components/layout/contact-content";

export const metadata: Metadata = {
  title: "Contact — feedstud.io",
};

export default function ContactPage() {
  return <ContactContent />;
}
