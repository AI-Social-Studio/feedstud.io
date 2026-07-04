"use client";

import type { AiUsageSummary } from "@/lib/admin-ai-telemetry";
import { formatTelemetryCurrency } from "@/lib/admin-telemetry";
import { useLanguage } from "@/lib/i18n";

import { WarningCircleIcon, CpuIcon, CurrencyDollarIcon, CoinsIcon } from "@phosphor-icons/react";

export function AiUsageKpis({
  summary,
  from,
  to,
}: {
  summary: AiUsageSummary;
  from?: string;
  to?: string;
}) {
  const { locale, dict } = useLanguage();

  const dateRangeLabel = buildDateRangeLabel(from, to, locale, dict);

  const cards = [
    {
      label: dict.adminTelemetry.kpis.totalCost,
      value: formatTelemetryCurrency(summary.total_cost, locale),
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
      colorClass: errorRateColor(summary.error_requests, summary.total_requests),
      bgClass: errorRateBg(summary.error_requests, summary.total_requests),
    },
    {
      label: dict.adminTelemetry.kpis.averageCostPerRequest,
      value: formatTelemetryCurrency(summary.average_cost_per_request, locale),
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
    <div className="space-y-2">
      {dateRangeLabel ? (
        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium tracking-wider text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-400">
            {dateRangeLabel}
          </span>
        </div>
      ) : null}
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
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.bgClass} ${card.colorClass}`}
                >
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
    </div>
  );
}

function buildDateRangeLabel(
  from: string | undefined,
  to: string | undefined,
  locale: string,
  dict: ReturnType<typeof useLanguage>["dict"],
): string | null {
  if (!from && !to) return null;

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));

  const fromLabel = from ? fmt(from) : "...";
  const toLabel = to ? fmt(to) : "...";

  return dict.adminTelemetry.kpis.dateRange.replace("{from}", fromLabel).replace("{to}", toLabel);
}

function errorRatePercent(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

function errorRateColor(part: number, total: number): string {
  const rate = errorRatePercent(part, total);
  if (rate <= 1) return "text-emerald-600 dark:text-emerald-400";
  if (rate <= 5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function errorRateBg(part: number, total: number): string {
  const rate = errorRatePercent(part, total);
  if (rate <= 1) return "bg-emerald-50 dark:bg-emerald-500/10";
  if (rate <= 5) return "bg-amber-50 dark:bg-amber-500/10";
  return "bg-rose-50 dark:bg-rose-500/10";
}

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

function formatPercent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}
