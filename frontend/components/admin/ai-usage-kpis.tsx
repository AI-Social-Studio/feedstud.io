"use client";

import type { AiUsageSummary } from "@/lib/flowforge-api";
import { useLanguage } from "@/lib/i18n";

export function AiUsageKpis({ summary }: { summary: AiUsageSummary }) {
  const { locale, dict } = useLanguage();
  const cards = [
    {
      label: dict.adminTelemetry.kpis.totalCost,
      value: formatCurrency(summary.total_cost, locale),
      hint: dict.adminTelemetry.kpis.requests.replace("{count}", formatNumber(summary.total_requests, locale)),
    },
    {
      label: dict.adminTelemetry.kpis.totalTokens,
      value: formatNumber(summary.total_tokens, locale),
      hint: dict.adminTelemetry.kpis.tokenHint
        .replace("{prompt}", formatNumber(summary.total_prompt_tokens, locale))
        .replace("{completion}", formatNumber(summary.total_completion_tokens, locale)),
    },
    {
      label: dict.adminTelemetry.kpis.errorRate,
      value: formatPercent(summary.error_requests, summary.total_requests),
      hint: dict.adminTelemetry.kpis.errorHint
        .replace("{failed}", formatNumber(summary.error_requests, locale))
        .replace("{successful}", formatNumber(summary.success_requests, locale)),
    },
    {
      label: dict.adminTelemetry.kpis.averageCostPerRequest,
      value: formatCurrency(summary.average_cost_per_request, locale),
      hint: dict.adminTelemetry.kpis.reasoningTokens.replace(
        "{count}",
        formatNumber(summary.total_reasoning_tokens, locale),
      ),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <section key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {card.label}
          </div>
          <div className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-50">{card.value}</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{card.hint}</div>
        </section>
      ))}
    </div>
  );
}

function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

function formatPercent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}
