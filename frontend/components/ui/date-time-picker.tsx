"use client";

import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function parseValue(value: string) {
  if (!value)
    return {
      y: null as number | null,
      m: null as number | null,
      d: null as number | null,
      t: "00:00",
    };
  const [date = "", t = "00:00"] = value.split("T");
  const [y, m, d] = date.split("-").map(Number);
  return { y, m: m - 1, d, t: t.slice(0, 5) };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildCells(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: { day: number; rel: -1 | 0 | 1 }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, rel: -1 });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, rel: 0 });
  while (cells.length < 42)
    cells.push({ day: cells.length - daysInMonth - startOffset + 1, rel: 1 });
  return cells;
}

export function formatDateValue(value: string, locale: string): string | null {
  if (!value) return null;
  const p = parseValue(value);
  if (p.y == null) return null;
  try {
    const date = new Date(p.y, p.m!, p.d!, ...(p.t.split(":").map(Number) as [number, number]));
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return value;
  }
}

export function CalendarPanel({
  value,
  onChange,
  timeLabel = "Time",
}: {
  value: string;
  onChange: (v: string) => void;
  timeLabel?: string;
}) {
  const { locale } = useLanguage();

  const todayDate = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  }, []);

  const parsed = useMemo(() => parseValue(value), [value]);
  const [viewY, setViewY] = useState(() => parsed.y ?? todayDate.y);
  const [viewM, setViewM] = useState(() => parsed.m ?? todayDate.m);

  useEffect(() => {
    if (parsed.y != null) {
      setViewY(parsed.y);
      setViewM(parsed.m!);
    }
  }, [parsed.y, parsed.m]);

  const cells = useMemo(() => buildCells(viewY, viewM), [viewY, viewM]);

  function prevMonth() {
    if (viewM === 0) {
      setViewY((y) => y - 1);
      setViewM(11);
    } else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (viewM === 11) {
      setViewY((y) => y + 1);
      setViewM(0);
    } else setViewM((m) => m + 1);
  }

  function selectDay({ day, rel }: { day: number; rel: -1 | 0 | 1 }) {
    let y = viewY,
      m = viewM;
    if (rel === -1) {
      m--;
      if (m < 0) {
        m = 11;
        y--;
      }
    }
    if (rel === 1) {
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    onChange(`${y}-${pad(m + 1)}-${pad(day)}T${parsed.t}`);
    if (rel !== 0) {
      setViewY(y);
      setViewM(m);
    }
  }

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
        new Date(viewY, viewM, 1),
      ),
    [viewY, viewM, locale],
  );

  const inputCls =
    "w-10 rounded-lg border border-gray-200 bg-white py-1.5 text-center text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="inline-flex size-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <CaretLeft size={13} weight="bold" />
        </button>
        <span className="text-sm font-semibold text-gray-900 capitalize dark:text-gray-100">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="inline-flex size-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <CaretRight size={13} weight="bold" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="flex h-7 items-center justify-center text-[11px] font-medium text-gray-400 dark:text-gray-500"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => {
          const isSel =
            cell.rel === 0 && cell.day === parsed.d && viewY === parsed.y && viewM === parsed.m;
          const isToday =
            cell.rel === 0 &&
            cell.day === todayDate.d &&
            viewY === todayDate.y &&
            viewM === todayDate.m;
          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDay(cell)}
              className={`flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                isSel
                  ? "bg-blue-600 text-white"
                  : isToday
                    ? "text-blue-600 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-700"
                    : cell.rel !== 0
                      ? "text-gray-300 dark:text-gray-700"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Time */}
      <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-600">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{timeLabel}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            max={23}
            value={Number(parsed.t.split(":")[0] ?? 0)}
            onChange={(e) => {
              const h = String(Math.min(23, Math.max(0, Number(e.target.value) || 0))).padStart(
                2,
                "0",
              );
              const m = parsed.t.split(":")[1] ?? "00";
              if (parsed.y != null)
                onChange(`${parsed.y}-${pad(parsed.m! + 1)}-${pad(parsed.d!)}T${h}:${m}`);
            }}
            className={inputCls}
          />
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500">:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={Number(parsed.t.split(":")[1] ?? 0)}
            onChange={(e) => {
              const h = parsed.t.split(":")[0] ?? "00";
              const m = String(Math.min(59, Math.max(0, Number(e.target.value) || 0))).padStart(
                2,
                "0",
              );
              if (parsed.y != null)
                onChange(`${parsed.y}-${pad(parsed.m! + 1)}-${pad(parsed.d!)}T${h}:${m}`);
            }}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  timeLabel = "Time",
  fullWidth = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  timeLabel?: string;
  fullWidth?: boolean;
}) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayLabel = useMemo(() => formatDateValue(value, locale), [value, locale]);

  return (
    <div className={`relative ${fullWidth ? "w-full" : "w-fit"}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none ${fullWidth ? "w-full justify-between" : "min-w-[210px]"} ${
          open
            ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-500/10"
            : "border-gray-200 bg-white hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        }`}
      >
        <CalendarBlank
          size={14}
          weight="bold"
          className="shrink-0 text-gray-400 dark:text-gray-500"
        />
        <span
          className={
            displayLabel ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"
          }
        >
          {displayLabel ?? placeholder}
        </span>
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <CalendarPanel value={value} onChange={onChange} timeLabel={timeLabel} />
        </div>
      ) : null}
    </div>
  );
}
