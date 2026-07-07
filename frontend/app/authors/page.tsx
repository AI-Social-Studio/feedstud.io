import type { Metadata } from "next";
import { AuthorsPage } from "@/components/layout/authors-page";

export const metadata: Metadata = {
  title: "Authors — feedstud.io",
  description: "Meet the team behind feedstud.io.",
};

export default function Page() {
  return <AuthorsPage />;
}
