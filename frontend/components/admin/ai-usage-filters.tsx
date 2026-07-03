"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useDictionary, useLanguage } from "@/lib/i18n";

type FilterValues = {
  kind?: string;
  status?: string;
  platform?: string;
  model?: string;
  userId?: string;
  from?: string;
  to?: string;
  limit: number;
};

export function AiUsageFilters({ values }: { values: FilterValues }) {
  const dict = useDictionary();

  return (
    <form className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white/50 p-5 shadow-sm md:grid md:grid-cols-3 xl:grid-cols-4 dark:border-gray-800/60 dark:bg-gray-900/30">
      <FilterSelect
        name="kind"
        label={dict.adminTelemetry.filters.kind}
        value={values.kind}
        options={[
          { value: "generate", label: dict.adminTelemetry.filters.options.kind.generate },
          { value: "refine", label: dict.adminTelemetry.filters.options.kind.refine },
        ]}
        allLabel={dict.adminTelemetry.filters.all}
      />
      <FilterSelect
        name="status"
        label={dict.adminTelemetry.filters.status}
        value={values.status}
        options={[
          { value: "success", label: dict.adminTelemetry.filters.options.status.success },
          { value: "error", label: dict.adminTelemetry.filters.options.status.error },
        ]}
        allLabel={dict.adminTelemetry.filters.all}
      />
      <FilterSelect
        name="platform"
        label={dict.adminTelemetry.filters.platform}
        value={values.platform}
        options={[
          { value: "linkedin", label: dict.adminTelemetry.filters.options.platform.linkedin },
          { value: "instagram", label: dict.adminTelemetry.filters.options.platform.instagram },
          { value: "x", label: dict.adminTelemetry.filters.options.platform.x },
        ]}
        allLabel={dict.adminTelemetry.filters.all}
      />
      <FilterSelect
        name="limit"
        label={dict.adminTelemetry.filters.limit}
        value={String(values.limit)}
        options={[
          { value: "25", label: dict.adminTelemetry.filters.options.limit.show25 },
          { value: "50", label: dict.adminTelemetry.filters.options.limit.show50 },
          { value: "100", label: dict.adminTelemetry.filters.options.limit.show100 },
          { value: "200", label: dict.adminTelemetry.filters.options.limit.show200 },
        ]}
      />
      <FilterInput
        name="model"
        label={dict.adminTelemetry.filters.model}
        value={values.model}
        placeholder={dict.adminTelemetry.filters.placeholders.model}
      />
      <FilterInput
        name="userId"
        label={dict.adminTelemetry.filters.userId}
        value={values.userId}
        placeholder={dict.adminTelemetry.filters.placeholders.userId}
      />
      <FilterDatePicker
        name="from"
        label={dict.adminTelemetry.filters.from}
        value={values.from}
        placeholder={dict.adminTelemetry.filters.placeholders.from}
      />
      <FilterDatePicker
        name="to"
        label={dict.adminTelemetry.filters.to}
        value={values.to}
        placeholder={dict.adminTelemetry.filters.placeholders.to}
      />
      <div className="flex flex-wrap gap-3 md:col-span-3 xl:col-span-4">
        <button
          type="submit"
          className="flex h-[42px] min-w-[120px] items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
        >
          {dict.adminTelemetry.filters.apply}
        </button>
        <a
          href="/dashboard/admin"
          className="flex h-[42px] min-w-[120px] items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {dict.adminTelemetry.filters.reset}
        </a>
      </div>
    </form>
  );
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

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

function parseDate(value: string | undefined): {
  y: number | null;
  m: number | null;
  d: number | null;
} {
  if (!value) return { y: null, m: null, d: null };
  const parts = value.split("-").map(Number);
  return { y: parts[0] ?? null, m: parts[1] != null ? parts[1] - 1 : null, d: parts[2] ?? null };
}

function formatDateDisplay(value: string | undefined, locale: string): string | null {
  if (!value) return null;
  try {
    const [y, m, d] = value.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  } catch {
    return null;
  }
}

function FilterDatePicker({
  name,
  label,
  value,
  placeholder,
}: {
  name: string;
  label: string;
  value?: string;
  placeholder: string;
}) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? "");
  const ref = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  }, []);

  const parsed = useMemo(() => parseDate(selected), [selected]);
  const [viewY, setViewY] = useState(() => parsed.y ?? today.y);
  const [viewM, setViewM] = useState(() => parsed.m ?? today.m);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
        new Date(viewY, viewM, 1),
      ),
    [viewY, viewM, locale],
  );

  const cells = useMemo(() => buildCells(viewY, viewM), [viewY, viewM]);
  const displayLabel = useMemo(() => formatDateDisplay(selected, locale), [selected, locale]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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
    const dateStr = `${y}-${pad(m + 1)}-${pad(day)}`;
    setSelected(dateStr);
    setOpen(false);
    if (rel !== 0) {
      setViewY(y);
      setViewM(m);
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </span>
      {/* Hidden input carries the value into the form submission */}
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-[42px] w-full items-center gap-2 rounded-xl border px-3 text-sm transition-colors focus:outline-none ${
          open
            ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-500/10"
            : "border-gray-200 bg-white hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        }`}
      >
        <CalendarBlank
          className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
          weight="bold"
        />
        <span
          className={
            displayLabel ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"
          }
        >
          {displayLabel ?? placeholder}
        </span>
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setSelected("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                setSelected("");
              }
            }}
            className="ml-auto cursor-pointer text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
            aria-label="Clear date"
          >
            ×
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {/* Month nav */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="inline-flex size-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <CaretLeft className="h-3 w-3" weight="bold" />
            </button>
            <span className="text-sm font-semibold text-gray-900 capitalize dark:text-gray-100">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="inline-flex size-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <CaretRight className="h-3 w-3" weight="bold" />
            </button>
          </div>
          {/* Weekdays */}
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
                cell.rel === 0 && cell.day === today.d && viewY === today.y && viewM === today.m;
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
        </div>
      ) : null}
    </div>
  );
}

function FilterInput({
  name,
  label,
  value,
  placeholder,
}: {
  name: string;
  label: string;
  value?: string;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </span>
      <input
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-2xl border-none bg-gray-100/80 px-4 text-sm text-gray-900 ring-0 transition-colors outline-none placeholder:text-gray-400 focus:bg-gray-200/80 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:bg-gray-800"
      />
    </label>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
  allLabel,
}: {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-[42px] w-full rounded-2xl border-none bg-gray-100/80 px-4 text-sm text-gray-900 ring-0 transition-colors outline-none focus:bg-gray-200/80 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:bg-gray-800"
      >
        {allLabel ? <option value="">{allLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
