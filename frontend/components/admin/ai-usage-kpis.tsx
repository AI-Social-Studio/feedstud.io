"use client";

import type { AiUsageSummary } from "@/lib/flowforge-api";
import { useLanguage } from "@/lib/i18n";

import { WarningCircleIcon, CpuIcon, CurrencyDollarIcon, CoinsIcon } from "@phosphor-icons/react";

export function AiUsageKpis({ summary }: { summary: AiUsageSummary }) {
  const { locale, dict } = useLanguage();
  const cards = [
    {
      label: dict.adminTelemetry.kpis.totalCost,
      value: formatCurrency(summary.total_cost, locale),
      hint: dict.adminTelemetry.kpis.requests.replace(
        "{count}",
        formatNumber(summary.total_requests, locale),
      ),
      icon: CurrencyDollarIcon,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: dict.adminTelemetry.kpis.totalTokens,
      value: formatNumber(summary.total_tokens, locale),
      hint: dict.adminTelemetry.kpis.tokenHint
        .replace("{prompt}", formatNumber(summary.total_prompt_tokens, locale))
        .replace("{completion}", formatNumber(summary.total_completion_tokens, locale)),
      icon: CpuIcon,
      colorClass: "text-violet-600 dark:text-violet-400",
      bgClass: "bg-violet-50 dark:bg-violet-500/10",
    },
    {
      label: dict.adminTelemetry.kpis.errorRate,
      value: formatPercent(summary.error_requests, summary.total_requests),
      hint: dict.adminTelemetry.kpis.errorHint
        .replace("{failed}", formatNumber(summary.error_requests, locale))
        .replace("{successful}", formatNumber(summary.success_requests, locale)),
      icon: WarningCircleIcon,
      colorClass: "text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      label: dict.adminTelemetry.kpis.averageCostPerRequest,
      value: formatCurrency(summary.average_cost_per_request, locale),
      hint: dict.adminTelemetry.kpis.reasoningTokens.replace(
        "{count}",
        formatNumber(summary.total_reasoning_tokens, locale),
      ),
      icon: CoinsIcon,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <section
            key={card.label}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/50 dark:hover:bg-gray-900/80"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.label}
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.bgClass} ${card.colorClass}`}>
                <Icon className="h-5 w-5" weight="duotone" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <div className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                {card.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{card.hint}</div>
            </div>
          </section>
        );
      })}
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
