"use client";

import Link from "next/link";
import { Check, Copy, X } from "@phosphor-icons/react/dist/ssr";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { AiExecutionDetail } from "@/lib/flowforge-api";
import { useLanguage } from "@/lib/i18n";
import { formatTelemetryAction, formatTelemetryPlatform, formatTelemetryStatus } from "@/lib/admin-telemetry";

export function AiExecutionDetailPanel({
  execution,
  closeHref,
}: {
  execution: AiExecutionDetail | null;
  closeHref: string;
}) {
  const { locale, dict } = useLanguage();
  const [activeTab, setActiveTab] = useState<"overview" | "prompts" | "payloads">("overview");
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!execution) return null;

  const responseText = execution.response_text ?? execution.error_message ?? "-";
  const overviewItems = [
    { label: dict.adminTelemetry.detail.provider, value: execution.resolved_provider ?? execution.provider },
    {
      label: dict.adminTelemetry.detail.platform,
      value: execution.platform ? formatTelemetryPlatform(execution.platform, dict) : "-",
    },
    {
      label: dict.adminTelemetry.detail.action,
      value: execution.action ? formatTelemetryAction(execution.action, dict) : "-",
    },
    { label: dict.adminTelemetry.detail.createdAt, value: formatDateTime(execution.created_at, locale) },
    { label: dict.adminTelemetry.detail.latency, value: formatDuration(execution.latency_ms, locale) },
    {
      label: dict.adminTelemetry.detail.generationTime,
      value: formatDuration(execution.generation_time_ms, locale),
    },
    {
      label: dict.adminTelemetry.detail.finishReason,
      value: execution.native_finish_reason ?? execution.finish_reason ?? "-",
    },
    { label: dict.adminTelemetry.detail.promptTokens, value: formatNumber(execution.usage.prompt_tokens, locale) },
    {
      label: dict.adminTelemetry.detail.completionTokens,
      value: formatNumber(execution.usage.completion_tokens, locale),
    },
    { label: dict.adminTelemetry.detail.cachedTokens, value: formatNumber(execution.usage.cached_tokens, locale) },
    {
      label: dict.adminTelemetry.detail.reasoningTokens,
      value: formatNumber(execution.usage.reasoning_tokens, locale),
    },
    {
      label: dict.adminTelemetry.detail.totalUpstreamCost,
      value: formatCurrency(execution.usage.total_upstream_cost, locale),
    },
  ];

  const content = (
    <>
      <Link
        href={closeHref}
        scroll={false}
        aria-label={dict.adminTelemetry.detail.close}
        className="fixed inset-0 z-40 bg-gray-950/60 transition-opacity"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <section className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-[#0a0a0f] dark:ring-white/10">
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
                <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                  {dict.adminTelemetry.detail.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
                  {dict.adminTelemetry.detail.subtitle}
                </p>
              </div>
              <Link
                href={closeHref}
                scroll={false}
                className="inline-flex rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label={dict.adminTelemetry.detail.close}
              >
                <X className="size-5" />
              </Link>
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
                <div className="mt-1 text-sm break-all text-gray-700 dark:text-gray-200">{execution.id}</div>
              </div>
            </div>
          </div>

          <div className="flex-none flex gap-6 border-b border-gray-100 px-6 pt-2 dark:border-gray-800/60">
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
              <section className="grid gap-y-6 gap-x-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {overviewItems.map((item) => (
                  <KeyValueCard key={item.label} label={item.label} value={item.value} />
                ))}
              </section>

              <section className="grid gap-4 xl:grid-cols-2">
                <ContentBlock
                  title={dict.adminTelemetry.detail.inputPrompt}
                  description={dict.adminTelemetry.detail.inputPromptHint}
                  value={execution.user_prompt}
                  copyLabel={dict.adminTelemetry.detail.copy}
                  copiedLabel={dict.adminTelemetry.detail.copied}
                  copied={copiedBlock === "input"}
                  onCopy={() => copyToClipboard("input", execution.user_prompt, setCopiedBlock)}
                />
                <ContentBlock
                  title={dict.adminTelemetry.detail.modelOutput}
                  description={dict.adminTelemetry.detail.modelOutputHint}
                  value={responseText}
                  copyLabel={dict.adminTelemetry.detail.copy}
                  copiedLabel={dict.adminTelemetry.detail.copied}
                  copied={copiedBlock === "output"}
                  onCopy={() => copyToClipboard("output", responseText, setCopiedBlock)}
                />
              </section>

              <section className="grid gap-3 md:grid-cols-2">
                <KeyValueCard label={dict.adminTelemetry.detail.requestId} value={execution.request_id ?? "-"} />
                <KeyValueCard label={dict.adminTelemetry.detail.generationId} value={execution.generation_id ?? "-"} />
                <KeyValueCard label={dict.adminTelemetry.detail.upstreamId} value={execution.upstream_id ?? "-"} />
              </section>
            </div>
          ) : null}

          {activeTab === "prompts" ? (
            <div className="space-y-4">
              <JsonBlock
                title={dict.adminTelemetry.detail.systemPrompt}
                value={execution.system_prompt}
                copyLabel={dict.adminTelemetry.detail.copy}
                copiedLabel={dict.adminTelemetry.detail.copied}
                copied={copiedBlock === "system"}
                onCopy={() => copyToClipboard("system", execution.system_prompt, setCopiedBlock)}
              />
              <JsonBlock
                title={dict.adminTelemetry.detail.userPrompt}
                value={execution.user_prompt}
                copyLabel={dict.adminTelemetry.detail.copy}
                copiedLabel={dict.adminTelemetry.detail.copied}
                copied={copiedBlock === "user"}
                onCopy={() => copyToClipboard("user", execution.user_prompt, setCopiedBlock)}
              />
              <JsonBlock
                title={dict.adminTelemetry.detail.responseText}
                value={responseText}
                copyLabel={dict.adminTelemetry.detail.copy}
                copiedLabel={dict.adminTelemetry.detail.copied}
                copied={copiedBlock === "response"}
                onCopy={() => copyToClipboard("response", responseText, setCopiedBlock)}
              />
              <JsonBlock title={dict.adminTelemetry.detail.reasoning} value={execution.response_reasoning ?? "-"} />
              <JsonBlock title={dict.adminTelemetry.detail.messages} value={execution.messages} />
            </div>
          ) : null}

          {activeTab === "payloads" ? (
            <div className="space-y-4">
              <JsonBlock title={dict.adminTelemetry.detail.providerResponses} value={execution.provider_responses} />
              <JsonBlock title={dict.adminTelemetry.detail.rawCompletionResponse} value={execution.raw_completion_response} />
              <JsonBlock title={dict.adminTelemetry.detail.rawGenerationResponse} value={execution.raw_generation_response} />
              <JsonBlock title={dict.adminTelemetry.detail.rawError} value={execution.error_json} />
            </div>
          ) : null}
          </div>
        </section>
      </div>
    </>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}

function KeyValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </div>
      <div className="text-sm text-gray-900 break-all dark:text-gray-100">{value}</div>
    </div>
  );
}

function ContentBlock({
  title,
  description,
  value,
  copyLabel,
  copiedLabel,
  copied,
  onCopy,
}: {
  title: string;
  description: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800/60">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <CopyButton copyLabel={copyLabel} copiedLabel={copiedLabel} copied={copied} onCopy={onCopy} />
      </div>
      <div className="overflow-hidden rounded-md border border-gray-100 dark:border-gray-800/60">
        <pre className="overflow-x-auto whitespace-pre-wrap bg-gray-50/50 p-4 text-sm leading-relaxed text-gray-800 dark:bg-gray-900/40 dark:text-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2">
          {value}
        </pre>
      </div>
    </section>
  );
}

function JsonBlock({
  title,
  value,
  copyLabel,
  copiedLabel,
  copied,
  onCopy,
}: {
  title: string;
  value: unknown;
  copyLabel?: string;
  copiedLabel?: string;
  copied?: boolean;
  onCopy?: () => void;
}) {
  const text = typeof value === "string" ? value : (JSON.stringify(value, null, 2) ?? "null");
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800/60">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {copyLabel && copiedLabel && onCopy ? (
          <CopyButton copyLabel={copyLabel} copiedLabel={copiedLabel} copied={Boolean(copied)} onCopy={onCopy} />
        ) : null}
      </div>
      <div className="overflow-hidden rounded-md border border-gray-100 dark:border-gray-800/60">
        <pre className="overflow-x-auto bg-gray-50/50 p-4 text-xs leading-relaxed text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2">
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
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
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

function formatCurrency(value: number | null, locale: string): string {
  if (value === null) return "-";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

function copyToClipboard(
  key: string,
  value: string,
  setCopiedBlock: (value: string | null) => void,
): void {
  void navigator.clipboard.writeText(value).then(() => {
    setCopiedBlock(key);
    setTimeout(() => setCopiedBlock(null), 1500);
  });
}
