"use client";

import { useMemo } from "react";
import type { AiExecutionListItem } from "@/lib/flowforge-api";
import { useLanguage } from "@/lib/i18n";

type DayBucket = {
  date: string;
  label: string;
  cost: number;
  requests: number;
};

export function AiCostChart({ executions }: { executions: AiExecutionListItem[] }) {
  const { locale, dict } = useLanguage();

  const buckets = useMemo(() => {
    const map = new Map<string, { cost: number; requests: number }>();

    for (const ex of executions) {
      const dayKey = ex.created_at.slice(0, 10);
      const entry = map.get(dayKey) ?? { cost: 0, requests: 0 };
      entry.cost += ex.cost ?? 0;
      entry.requests += 1;
      map.set(dayKey, entry);
    }

    const days: DayBucket[] = Array.from(map.entries())
      .map(([date, data]) => ({
        date,
        label: new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
          new Date(date + "T00:00:00"),
        ),
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return days;
  }, [executions, locale]);

  const maxCost = useMemo(() => Math.max(...buckets.map((b) => b.cost), 0.0001), [buckets]);

  return (
    <section className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800/60 dark:bg-gray-900/50">
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {dict.adminTelemetry.costChart.title}
        </h2>
      </div>
      {buckets.length === 0 ? (
        <div className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400">
          {dict.adminTelemetry.costChart.noData}
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-end px-6 pb-6">
          <div className="flex items-end gap-1" style={{ height: 160 }}>
            {buckets.map((bucket) => {
              const heightPercent = Math.max((bucket.cost / maxCost) * 100, 2);
              return (
                <div
                  key={bucket.date}
                  className="group relative flex flex-1 flex-col items-center"
                  style={{ height: "100%" }}
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-violet-400/80 transition-colors group-hover:bg-violet-500 dark:bg-violet-500/60 dark:group-hover:bg-violet-400/80"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-gray-900 px-2.5 py-1 text-[10px] font-medium whitespace-nowrap text-white shadow-lg group-hover:block dark:bg-gray-100 dark:text-gray-900">
                    {formatCurrency(bucket.cost, locale)}
                    <span className="mx-1 text-gray-400 dark:text-gray-500">·</span>
                    {bucket.requests} req
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1">
            {buckets.map((bucket, i) => (
              <div
                key={bucket.date}
                className="flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500"
              >
                {buckets.length <= 14 || i % Math.ceil(buckets.length / 10) === 0
                  ? bucket.label
                  : ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}
