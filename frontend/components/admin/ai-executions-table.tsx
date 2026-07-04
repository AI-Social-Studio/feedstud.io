"use client";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import {
  CaretRightIcon,
  CaretUpIcon,
  CaretDownIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import type { AiExecutionListItem } from "@/lib/admin-ai-telemetry";
import { useLanguage } from "@/lib/i18n";
import {
  formatTelemetryCurrency,
  formatTelemetryAction,
  formatTelemetryKind,
  formatTelemetryPlatform,
  formatTelemetryStatus,
} from "@/lib/admin-telemetry";

type SortKey = "time" | "cost" | "tokens" | "status" | "model";
type SortDirection = "asc" | "desc";

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
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        if (sortDir === "desc") setSortDir("asc");
        else {
          setSortKey(null);
          setSortDir("desc");
        }
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey, sortDir],
  );

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "time":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "cost":
          cmp = (a.cost ?? 0) - (b.cost ?? 0);
          break;
        case "tokens":
          cmp = (a.total_tokens ?? 0) - (b.total_tokens ?? 0);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "model":
          cmp = (a.resolved_model ?? a.requested_model).localeCompare(
            b.resolved_model ?? b.requested_model,
          );
          break;
      }
      return cmp;
    });
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [rows, sortKey, sortDir]);

  const exportCsv = useCallback(() => {
    const headers = [
      dict.adminTelemetry.table.time,
      dict.adminTelemetry.table.kind,
      dict.adminTelemetry.table.platform,
      dict.adminTelemetry.table.action,
      dict.adminTelemetry.table.user,
      dict.adminTelemetry.table.model,
      dict.adminTelemetry.table.tokens,
      dict.adminTelemetry.table.cost,
      dict.adminTelemetry.table.status,
    ];
    const csvRows = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) =>
        [
          escapeCsvCell(row.created_at),
          escapeCsvCell(row.kind),
          escapeCsvCell(row.platform ?? ""),
          escapeCsvCell(row.action ?? ""),
          escapeCsvCell(row.user_id ?? ""),
          escapeCsvCell(row.resolved_model ?? row.requested_model),
          row.total_tokens ?? 0,
          row.cost ?? 0,
          escapeCsvCell(row.status),
        ].join(","),
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-executions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dict, rows]);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800/60 dark:bg-gray-900/50">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {dict.adminTelemetry.table.title}
        </h2>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <DownloadSimpleIcon className="h-3.5 w-3.5" weight="bold" />
          {dict.adminTelemetry.exportCsv}
        </button>
      </div>
      <div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-100 text-left text-[11px] font-medium tracking-wider text-gray-400 uppercase dark:border-gray-800/60 dark:text-gray-500">
              <SortableHeader
                label={dict.adminTelemetry.table.time}
                sortKey="time"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                sortAscLabel={dict.adminTelemetry.table.sortAsc}
                sortDescLabel={dict.adminTelemetry.table.sortDesc}
                sortClearLabel={dict.adminTelemetry.table.sortClear}
              />
              <th className="px-6 py-3">{dict.adminTelemetry.table.kind}</th>
              <th className="px-6 py-3">{dict.adminTelemetry.table.user}</th>
              <SortableHeader
                label={dict.adminTelemetry.table.model}
                sortKey="model"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                sortAscLabel={dict.adminTelemetry.table.sortAsc}
                sortDescLabel={dict.adminTelemetry.table.sortDesc}
                sortClearLabel={dict.adminTelemetry.table.sortClear}
                className="hidden md:table-cell"
              />
              <SortableHeader
                label={dict.adminTelemetry.table.tokens}
                sortKey="tokens"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                sortAscLabel={dict.adminTelemetry.table.sortAsc}
                sortDescLabel={dict.adminTelemetry.table.sortDesc}
                sortClearLabel={dict.adminTelemetry.table.sortClear}
                className="hidden md:table-cell"
              />
              <SortableHeader
                label={dict.adminTelemetry.table.cost}
                sortKey="cost"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                sortAscLabel={dict.adminTelemetry.table.sortAsc}
                sortDescLabel={dict.adminTelemetry.table.sortDesc}
                sortClearLabel={dict.adminTelemetry.table.sortClear}
              />
              <SortableHeader
                label={dict.adminTelemetry.table.status}
                sortKey="status"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                sortAscLabel={dict.adminTelemetry.table.sortAsc}
                sortDescLabel={dict.adminTelemetry.table.sortDesc}
                sortClearLabel={dict.adminTelemetry.table.sortClear}
              />
              <th className="px-6 py-3 text-right">{dict.adminTelemetry.table.details}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
            {sortedRows.map((row) => {
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
                  <td className="px-6 py-3 whitespace-nowrap">
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
                  <td className="px-6 py-3 font-medium whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {formatTelemetryCurrency(row.cost, locale)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
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

function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onClick,
  sortAscLabel,
  sortDescLabel,
  sortClearLabel,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey | null;
  currentDir: SortDirection;
  onClick: (key: SortKey) => void;
  sortAscLabel: string;
  sortDescLabel: string;
  sortClearLabel: string;
  className?: string;
}) {
  const active = currentKey === sortKey;
  const ariaLabel = `${label}: ${
    !active ? sortDescLabel : currentDir === "desc" ? sortAscLabel : sortClearLabel
  }`;
  return (
    <th className={`px-6 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        aria-label={ariaLabel}
        className="group inline-flex items-center gap-1 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
      >
        {label}
        {active ? (
          currentDir === "asc" ? (
            <CaretUpIcon className="h-3 w-3 text-violet-500" weight="bold" />
          ) : (
            <CaretDownIcon className="h-3 w-3 text-violet-500" weight="bold" />
          )
        ) : (
          <CaretDownIcon
            className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-30"
            weight="bold"
          />
        )}
      </button>
    </th>
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

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

function escapeCsvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
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
