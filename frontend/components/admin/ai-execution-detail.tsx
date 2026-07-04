"use client";

import { CheckIcon, CopyIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { AiExecutionDetail } from "@/lib/feedstudio-api";
import { useLanguage } from "@/lib/i18n";
import { useMountEffect } from "@/lib/use-mount-effect";
import {
  formatTelemetryCurrency,
  formatTelemetryAction,
  formatTelemetryPlatform,
  formatTelemetryStatus,
} from "@/lib/admin-telemetry";

export function AiExecutionDetailPanel({
  execution,
  closeHref,
}: {
  execution: AiExecutionDetail | null;
  closeHref: string;
}) {
  const { locale, dict } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "prompts" | "payloads">("overview");
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useMountEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  });

  if (!execution) return null;

  const titleId = `ai-execution-detail-title-${execution.id}`;

  function close() {
    router.push(closeHref, { scroll: false });
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements(event.currentTarget);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      if (activeElement === firstElement || !event.currentTarget.contains(activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
      return;
    }

    if (activeElement === lastElement || !event.currentTarget.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  const responseText = execution.response_text ?? execution.error_message ?? "-";
  const overviewItems = [
    {
      label: dict.adminTelemetry.detail.provider,
      value: execution.resolved_provider ?? execution.provider,
    },
    {
      label: dict.adminTelemetry.detail.platform,
      value: execution.platform ? formatTelemetryPlatform(execution.platform, dict) : "-",
    },
    {
      label: dict.adminTelemetry.detail.action,
      value: execution.action ? formatTelemetryAction(execution.action, dict) : "-",
    },
    {
      label: dict.adminTelemetry.detail.createdAt,
      value: formatDateTime(execution.created_at, locale),
    },
    {
      label: dict.adminTelemetry.detail.latency,
      value: formatDuration(execution.latency_ms, locale),
    },
    {
      label: dict.adminTelemetry.detail.generationTime,
      value: formatDuration(execution.generation_time_ms, locale),
    },
    {
      label: dict.adminTelemetry.detail.finishReason,
      value: execution.native_finish_reason ?? execution.finish_reason ?? "-",
    },
    {
      label: dict.adminTelemetry.detail.promptTokens,
      value: formatNumber(execution.usage.prompt_tokens, locale),
    },
    {
      label: dict.adminTelemetry.detail.completionTokens,
      value: formatNumber(execution.usage.completion_tokens, locale),
    },
    {
      label: dict.adminTelemetry.detail.cachedTokens,
      value: formatNumber(execution.usage.cached_tokens, locale),
    },
    {
      label: dict.adminTelemetry.detail.reasoningTokens,
      value: formatNumber(execution.usage.reasoning_tokens, locale),
    },
    {
      label: dict.adminTelemetry.detail.totalUpstreamCost,
      value: formatTelemetryCurrency(execution.usage.total_upstream_cost, locale),
    },
  ];

  const content = (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-40 bg-gray-950/60 transition-opacity"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleDialogKeyDown}
          className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-[#0a0a0f] dark:ring-white/10"
        >
          <div className="flex-none border-b border-gray-100 bg-white px-6 py-5 dark:border-gray-800/60 dark:bg-[#0a0a0f]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={statusClassName(execution.status)}>
                    {formatTelemetryStatus(execution.status, dict)}
                  </span>
                  <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
                    {dict.adminTelemetry.detail.previewBadge}
                  </span>
                </div>
                <h2
                  id={titleId}
                  className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50"
                >
                  {dict.adminTelemetry.detail.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
                  {dict.adminTelemetry.detail.subtitle}
                </p>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={close}
                className="inline-flex rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label={dict.adminTelemetry.detail.close}
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="min-w-0">
                <div className="text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                  {dict.adminTelemetry.detail.traceLabel}
                </div>
                <div className="mt-1 text-sm break-all text-gray-700 dark:text-gray-200">
                  {execution.request_id ?? execution.generation_id ?? execution.id}
                </div>
              </div>
              <div className="min-w-0 md:text-right">
                <div className="text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                  {dict.adminTelemetry.detail.executionId}
                </div>
                <div className="mt-1 text-sm break-all text-gray-700 dark:text-gray-200">
                  {execution.id}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-none gap-6 border-b border-gray-100 px-6 pt-2 dark:border-gray-800/60">
            <TabButton
              active={activeTab === "overview"}
              label={dict.adminTelemetry.detail.tabs.overview}
              onClick={() => setActiveTab("overview")}
            />
            <TabButton
              active={activeTab === "prompts"}
              label={dict.adminTelemetry.detail.tabs.prompts}
              onClick={() => setActiveTab("prompts")}
            />
            <TabButton
              active={activeTab === "payloads"}
              label={dict.adminTelemetry.detail.tabs.payloads}
              onClick={() => setActiveTab("payloads")}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                <section className="grid gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {overviewItems.map((item) => (
                    <KeyValueCard key={item.label} label={item.label} value={item.value} />
                  ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                  <DetailBlock
                    title={dict.adminTelemetry.detail.inputPrompt}
                    description={dict.adminTelemetry.detail.inputPromptHint}
                    text={execution.user_prompt}
                    copyLabel={dict.adminTelemetry.detail.copy}
                    copiedLabel={dict.adminTelemetry.detail.copied}
                    copied={copiedBlock === "input"}
                    onCopy={() => copyToClipboard("input", execution.user_prompt, setCopiedBlock)}
                    preserveWhitespace
                    textClassName="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
                  />
                  <DetailBlock
                    title={dict.adminTelemetry.detail.modelOutput}
                    description={dict.adminTelemetry.detail.modelOutputHint}
                    text={responseText}
                    copyLabel={dict.adminTelemetry.detail.copy}
                    copiedLabel={dict.adminTelemetry.detail.copied}
                    copied={copiedBlock === "output"}
                    onCopy={() => copyToClipboard("output", responseText, setCopiedBlock)}
                    preserveWhitespace
                    textClassName="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
                  />
                </section>

                <section className="grid gap-3 md:grid-cols-2">
                  <KeyValueCard
                    label={dict.adminTelemetry.detail.requestId}
                    value={execution.request_id ?? "-"}
                  />
                  <KeyValueCard
                    label={dict.adminTelemetry.detail.generationId}
                    value={execution.generation_id ?? "-"}
                  />
                  <KeyValueCard
                    label={dict.adminTelemetry.detail.upstreamId}
                    value={execution.upstream_id ?? "-"}
                  />
                </section>
              </div>
            ) : null}

            {activeTab === "prompts" ? (
              <div className="space-y-4">
                <DetailBlock
                  title={dict.adminTelemetry.detail.systemPrompt}
                  text={execution.system_prompt}
                  copyLabel={dict.adminTelemetry.detail.copy}
                  copiedLabel={dict.adminTelemetry.detail.copied}
                  copied={copiedBlock === "system"}
                  onCopy={() => copyToClipboard("system", execution.system_prompt, setCopiedBlock)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
                <DetailBlock
                  title={dict.adminTelemetry.detail.userPrompt}
                  text={execution.user_prompt}
                  copyLabel={dict.adminTelemetry.detail.copy}
                  copiedLabel={dict.adminTelemetry.detail.copied}
                  copied={copiedBlock === "user"}
                  onCopy={() => copyToClipboard("user", execution.user_prompt, setCopiedBlock)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
                <DetailBlock
                  title={dict.adminTelemetry.detail.responseText}
                  text={responseText}
                  copyLabel={dict.adminTelemetry.detail.copy}
                  copiedLabel={dict.adminTelemetry.detail.copied}
                  copied={copiedBlock === "response"}
                  onCopy={() => copyToClipboard("response", responseText, setCopiedBlock)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
                <DetailBlock
                  title={dict.adminTelemetry.detail.reasoning}
                  text={execution.response_reasoning ?? "-"}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
                <DetailBlock
                  title={dict.adminTelemetry.detail.messages}
                  text={stringifyDetailValue(execution.messages)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
              </div>
            ) : null}

            {activeTab === "payloads" ? (
              <div className="space-y-4">
                <DetailBlock
                  title={dict.adminTelemetry.detail.providerResponses}
                  text={stringifyDetailValue(execution.provider_responses)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
                <DetailBlock
                  title={dict.adminTelemetry.detail.rawCompletionResponse}
                  text={stringifyDetailValue(execution.raw_completion_response)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
                <DetailBlock
                  title={dict.adminTelemetry.detail.rawGenerationResponse}
                  text={stringifyDetailValue(execution.raw_generation_response)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
                <DetailBlock
                  title={dict.adminTelemetry.detail.rawError}
                  text={stringifyDetailValue(execution.error_json)}
                  textClassName="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

function KeyValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </div>
      <div className="text-sm break-all text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}

function DetailBlock({
  title,
  description,
  text,
  copyLabel,
  copiedLabel,
  copied,
  onCopy,
  preserveWhitespace,
  textClassName,
}: {
  title: string;
  description?: string;
  text: string;
  copyLabel?: string;
  copiedLabel?: string;
  copied?: boolean;
  onCopy?: () => void;
  preserveWhitespace?: boolean;
  textClassName: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800/60">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          ) : null}
        </div>
        {copyLabel && copiedLabel && onCopy ? (
          <CopyButton
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
            copied={Boolean(copied)}
            onCopy={onCopy}
          />
        ) : null}
      </div>
      <div className="overflow-hidden rounded-md border border-gray-100 dark:border-gray-800/60">
        <pre
          className={`overflow-x-auto bg-gray-50/50 p-4 dark:bg-gray-900/40 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 ${preserveWhitespace ? "whitespace-pre-wrap" : ""} ${textClassName}`}
        >
          {text}
        </pre>
      </div>
    </section>
  );
}

function CopyButton({
  copyLabel,
  copiedLabel,
  copied,
  onCopy,
}: {
  copyLabel: string;
  copiedLabel: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "border-b-2 border-gray-900 py-3 text-sm font-medium text-gray-900 dark:border-white dark:text-white"
          : "border-b-2 border-transparent py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
      }
    >
      {label}
    </button>
  );
}

function statusClassName(status: string): string {
  return status === "success"
    ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
    : "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300";
}

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(value: number | null, locale: string): string {
  if (value === null) return "-";
  return `${new Intl.NumberFormat(locale).format(value)} ms`;
}

function formatNumber(value: number | null, locale: string): string {
  if (value === null) return "-";
  return new Intl.NumberFormat(locale).format(value);
}

function stringifyDetailValue(value: unknown): string {
  return typeof value === "string" ? value : (JSON.stringify(value, null, 2) ?? "null");
}

function copyToClipboard(
  key: string,
  value: string,
  setCopiedBlock: (value: string | null) => void,
): void {
  if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
    console.error("Clipboard API is unavailable in this context");
    return;
  }

  void navigator.clipboard
    .writeText(value)
    .then(() => {
      setCopiedBlock(key);
      setTimeout(() => setCopiedBlock(null), 1500);
    })
    .catch((error: unknown) => {
      console.error("Failed to copy execution details", error);
    });
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}
