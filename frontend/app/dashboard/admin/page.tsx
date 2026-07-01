import { requireAdminContext } from "@/lib/auth/get-auth-context";

export default async function AdminPage() {
  const auth = await requireAdminContext();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-8 dark:border-violet-900/70 dark:bg-violet-950/30">
        <div className="mb-3 inline-flex rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wider text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
          Admin access
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Admin workspace</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
          This area is only available to users resolved as <code>admin</code> in Clerk metadata.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Resolved role</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{auth.role}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Detection source</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{auth.roleSource}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Account</div>
          <div className="mt-2 break-all text-sm font-medium text-gray-900 dark:text-gray-100">
            {auth.primaryEmailAddress ?? auth.userId}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        Add future admin-only screens under <code>/dashboard/admin</code> and gate them with
        <code>requireAdminContext()</code>.
      </div>
    </section>
  );
}
