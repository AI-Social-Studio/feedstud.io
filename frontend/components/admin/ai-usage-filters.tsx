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
    <form className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-6 dark:border-gray-800 dark:bg-gray-950">
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
      <div className="flex gap-3 md:col-span-3 xl:col-span-6">
        <button
          type="submit"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
        >
          {dict.adminTelemetry.filters.apply}
        </button>
        <a
          href="/dashboard/admin"
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
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
    <label className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
      <span className="block text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
        {label}
      </span>
      <input
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ring-0 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
    <label className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
      <span className="block text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ring-0 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
