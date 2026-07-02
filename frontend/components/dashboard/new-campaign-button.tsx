"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/lib/i18n";

export function NewCampaignButton({ label }: { label: string }) {
  const dict = useDictionary();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  function close() {
    setOpen(false);
    setTitle("");
  }

  function submit() {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    router.push(`/dashboard/new?title=${encodeURIComponent(nextTitle)}`);
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-gray-800 hover:-translate-y-px active:translate-y-0 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
      >
        <Plus size={16} weight="bold" />
        {label}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[999] bg-gray-950/60 backdrop-blur-md">
              <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-950">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {dict.common.campaignNamePromptTitle}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {dict.common.campaignNamePromptDescription}
                  </p>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="new-campaign-title">
                      {dict.common.campaignNameLabel}
                    </label>
                    <input
                      id="new-campaign-title"
                      autoFocus
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submit();
                        if (event.key === "Escape") close();
                      }}
                      placeholder={dict.common.campaignNamePlaceholder}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:bg-gray-900"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                    >
                      {dict.common.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={!title.trim()}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {dict.common.createCampaign}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
