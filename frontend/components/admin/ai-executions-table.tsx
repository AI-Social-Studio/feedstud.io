"use client";

import Link from "next/link";
import type { AiExecutionListItem } from "@/lib/flowforge-api";
import { useLanguage } from "@/lib/i18n";
import {
  formatTelemetryAction,
  formatTelemetryKind,
  formatTelemetryPlatform,
  formatTelemetryStatus,
} from "@/lib/admin-telemetry";

export function AiExecutionsTable({
  rows,
  selectedExecutionId,
  queryString,
}: {
  rows: AiExecutionListItem[];
  selectedExecutionId?: string;
  queryString: string;
}) {
  const { locale, dict } = useLanguage();

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {dict.adminTelemetry.table.title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/60">
            <tr className="text-left text-xs tracking-wider text-gray-400 uppercase dark:text-gray-500">
              <th className="px-4 py-3">{dict.adminTelemetry.table.time}</th>
              <th className="px-4 py-3">{dict.adminTelemetry.table.kind}</th>
              <th className="px-4 py-3">{dict.adminTelemetry.table.user}</th>
              <th className="px-4 py-3">{dict.adminTelemetry.table.model}</th>
              <th className="px-4 py-3">{dict.adminTelemetry.table.tokens}</th>
              <th className="px-4 py-3">{dict.adminTelemetry.table.cost}</th>
              <th className="px-4 py-3">{dict.adminTelemetry.table.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row) => {
              const href = `/dashboard/admin?${appendExecutionId(queryString, row.id)}`;
              const active = selectedExecutionId === row.id;
              return (
                <tr
                  key={row.id}
                  className={
                    active ? "bg-violet-50/60 dark:bg-violet-950/20" : "bg-white dark:bg-gray-950"
                  }
                >
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {formatTime(row.created_at, locale)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                    <Link
                      href={href}
                      className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                    >
                      {formatTelemetryKind(row.kind, dict)}
                      {row.platform ? ` / ${formatTelemetryPlatform(row.platform, dict)}` : ""}
                      {row.action ? ` / ${formatTelemetryAction(row.action, dict)}` : ""}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.user_id ?? dict.adminTelemetry.table.anonymous}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.resolved_model ?? row.requested_model}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {formatNumber(row.total_tokens ?? 0, locale)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {formatCost(row.cost, locale)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusClassName(row.status)}>
                      {formatTelemetryStatus(row.status, dict)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                  {dict.adminTelemetry.table.noResults}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function appendExecutionId(queryString: string, executionId: string): string {
  const params = new URLSearchParams(queryString);
  params.set("executionId", executionId);
  return params.toString();
}

function formatTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCost(value: number | null, locale: string): string {
  if (value === null) return "-";
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

function statusClassName(status: string): string {
  return status === "success"
    ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
    : "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300";
}
