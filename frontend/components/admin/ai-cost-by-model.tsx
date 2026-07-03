"use client";

import { useMemo } from "react";
import type { AiExecutionListItem } from "@/lib/flowforge-api";
import { useLanguage } from "@/lib/i18n";

type ModelRow = {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  share: number;
};

export function AiCostByModel({ executions }: { executions: AiExecutionListItem[] }) {
  const { locale, dict } = useLanguage();

  const models = useMemo(() => {
    const map = new Map<string, { requests: number; tokens: number; cost: number }>();

    for (const ex of executions) {
      const model = ex.resolved_model ?? ex.requested_model;
      const entry = map.get(model) ?? { requests: 0, tokens: 0, cost: 0 };
      entry.requests += 1;
      entry.tokens += ex.total_tokens ?? 0;
      entry.cost += ex.cost ?? 0;
      map.set(model, entry);
    }

    const totalCost = Array.from(map.values()).reduce((sum, e) => sum + e.cost, 0);

    const rows: ModelRow[] = Array.from(map.entries())
      .map(([model, data]) => ({
        model,
        ...data,
        share: totalCost > 0 ? (data.cost / totalCost) * 100 : 0,
      }))
      .sort((a, b) => b.cost - a.cost);

    return rows;
  }, [executions]);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800/60 dark:bg-gray-900/50">
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {dict.adminTelemetry.costByModel.title}
        </h2>
      </div>
      {models.length === 0 ? (
        <div className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400">
          {dict.adminTelemetry.costByModel.noData}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 text-left text-[11px] font-medium tracking-wider text-gray-400 uppercase dark:border-gray-800/60 dark:text-gray-500">
                <th className="px-6 py-3">{dict.adminTelemetry.costByModel.model}</th>
                <th className="px-6 py-3 text-right">{dict.adminTelemetry.costByModel.requests}</th>
                <th className="hidden px-6 py-3 text-right md:table-cell">
                  {dict.adminTelemetry.costByModel.tokens}
                </th>
                <th className="px-6 py-3 text-right">{dict.adminTelemetry.costByModel.cost}</th>
                <th className="px-6 py-3">{dict.adminTelemetry.costByModel.share}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
              {models.map((row) => (
                <tr
                  key={row.model}
                  className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/20"
                >
                  <td className="px-6 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {row.model}
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {formatNumber(row.requests, locale)}
                  </td>
                  <td className="hidden px-6 py-3 text-right whitespace-nowrap text-gray-500 md:table-cell dark:text-gray-400">
                    {formatNumber(row.tokens, locale)}
                  </td>
                  <td className="px-6 py-3 text-right font-medium whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {formatCurrency(row.cost, locale)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-all dark:bg-violet-400"
                          style={{ width: `${Math.max(row.share, 1)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {row.share.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
