"use client";

import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react";
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
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800/60 dark:bg-gray-900/50">
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {dict.adminTelemetry.table.title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-y border-gray-100 text-left text-[11px] font-medium tracking-wider text-gray-400 uppercase dark:border-gray-800/60 dark:text-gray-500">
              <th className="px-6 py-3">{dict.adminTelemetry.table.time}</th>
              <th className="px-6 py-3">{dict.adminTelemetry.table.kind}</th>
              <th className="px-6 py-3">{dict.adminTelemetry.table.user}</th>
              <th className="hidden px-6 py-3 md:table-cell">{dict.adminTelemetry.table.model}</th>
              <th className="hidden px-6 py-3 md:table-cell">{dict.adminTelemetry.table.tokens}</th>
              <th className="px-6 py-3">{dict.adminTelemetry.table.cost}</th>
              <th className="px-6 py-3">{dict.adminTelemetry.table.status}</th>
              <th className="px-6 py-3 text-right">{dict.adminTelemetry.table.details}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
            {rows.map((row) => {
              const href = `/dashboard/admin?${appendExecutionId(queryString, row.id)}`;
              const active = selectedExecutionId === row.id;
              return (
                <tr
                  key={row.id}
                  className={
                    active
                      ? "bg-violet-50/50 dark:bg-violet-950/20"
                      : "bg-transparent transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/20"
                  }
                >
                  <td className="whitespace-nowrap px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDatePart(row.created_at, locale)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimePart(row.created_at, locale)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100">
                    <Link
                      href={href}
                      scroll={false}
                      className="font-medium transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                    >
                      {formatTelemetryKind(row.kind, dict)}
                      {row.platform ? ` / ${formatTelemetryPlatform(row.platform, dict)}` : ""}
                      {row.action ? ` / ${formatTelemetryAction(row.action, dict)}` : ""}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {row.user_id ?? dict.adminTelemetry.table.anonymous}
                  </td>
                  <td className="hidden px-6 py-3 text-gray-500 md:table-cell dark:text-gray-400">
                    {row.resolved_model ?? row.requested_model}
                  </td>
                  <td className="hidden px-6 py-3 text-gray-500 md:table-cell dark:text-gray-400">
                    {formatNumber(row.total_tokens ?? 0, locale)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 font-medium text-gray-700 dark:text-gray-300">
                    {formatCost(row.cost, locale)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <span className={statusClassName(row.status)}>
                      {formatTelemetryStatus(row.status, dict)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={href}
                      scroll={false}
                      className={detailLinkClassName(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      {active
                        ? dict.adminTelemetry.table.openSelected
                        : dict.adminTelemetry.table.openDetails}
                      <CaretRightIcon className="h-3.5 w-3.5" weight="bold" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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

function formatDatePart(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatTimePart(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
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

function detailLinkClassName(active: boolean): string {
  return active
    ? "inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 py-1.5 pl-3 pr-2 text-xs font-semibold text-violet-700 dark:border-violet-800/60 dark:bg-violet-900/40 dark:text-violet-300"
    : "inline-flex items-center gap-1 rounded-full border border-transparent bg-gray-100 py-1.5 pl-3 pr-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";
}
