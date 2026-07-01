import type { ReactNode } from "react";
import { requireAdminContext } from "@/lib/auth/get-auth-context";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminContext();
  return children;
}
