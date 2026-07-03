"use client";

import { useDictionary } from "@/lib/i18n";

type FilterValues = {
  kind?: string;
  status?: string;
  platform?: string;
  model?: string;
  userId?: string;
  limit: number;
};

export function AiUsageFilters({ values }: { values: FilterValues }) {
  const dict = useDictionary();

  return (
    <form className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white/50 p-5 shadow-sm md:grid md:grid-cols-3 xl:grid-cols-6 dark:border-gray-800/60 dark:bg-gray-900/30">
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
      <FilterInput
        name="limit"
        label={dict.adminTelemetry.filters.limit}
        value={String(values.limit)}
        placeholder={dict.adminTelemetry.filters.placeholders.limit}
      />
      <div className="flex flex-wrap gap-3 md:col-span-3 xl:col-span-6">
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
        className="h-[42px] w-full rounded-2xl border-none bg-gray-100/80 px-4 text-sm text-gray-900 ring-0 outline-none transition-colors focus:bg-gray-200/80 placeholder:text-gray-400 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:bg-gray-800"
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
  allLabel: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-[42px] w-full rounded-2xl border-none bg-gray-100/80 px-4 text-sm text-gray-900 ring-0 outline-none transition-colors focus:bg-gray-200/80 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:bg-gray-800"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
