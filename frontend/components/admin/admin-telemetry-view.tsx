"use client";

import { AiExecutionDetailPanel } from "@/components/admin/ai-execution-detail";
import { AiExecutionsTable } from "@/components/admin/ai-executions-table";
import { AiUsageFilters } from "@/components/admin/ai-usage-filters";
import { AiUsageKpis } from "@/components/admin/ai-usage-kpis";
import { useDictionary } from "@/lib/i18n";
import type { AiExecutionDetail, AiExecutionListItem, AiUsageSummary } from "@/lib/flowforge-api";

type FilterValues = {
  kind?: string;
  status?: string;
  platform?: string;
  model?: string;
  userId?: string;
  limit: number;
};

export function AdminTelemetryView({
  summary,
  executions,
  selectedExecution,
  selectedExecutionId,
  queryString,
  viewer,
  filters,
}: {
  summary: AiUsageSummary;
  executions: AiExecutionListItem[];
  selectedExecution: AiExecutionDetail | null;
  selectedExecutionId?: string;
  queryString: string;
  viewer: string;
  filters: FilterValues;
}) {
  const dict = useDictionary();
  const closeHref = queryString ? `/dashboard/admin?${queryString}` : "/dashboard/admin";

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-8 dark:border-violet-900/60 dark:bg-violet-950/20">
        <div className="mb-3 inline-flex rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-medium tracking-wider text-violet-700 uppercase dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
          {dict.adminTelemetry.badge}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {dict.adminTelemetry.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-600 dark:text-gray-300">
          {dict.adminTelemetry.subtitle}
        </p>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {dict.adminTelemetry.viewingAs.replace("{user}", viewer)}
        </p>
      </div>

      <AiUsageKpis summary={summary} />
      <AiUsageFilters values={filters} />
      <AiExecutionsTable
        rows={executions}
        selectedExecutionId={selectedExecutionId}
        queryString={queryString}
      />
      <AiExecutionDetailPanel
        key={selectedExecution?.id ?? "empty"}
        execution={selectedExecution}
        closeHref={closeHref}
      />
    </section>
  );
}
