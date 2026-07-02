"use client";

import type { AiExecutionDetail } from "@/lib/flowforge-api";
import { useLanguage } from "@/lib/i18n";
import { formatTelemetryKind, formatTelemetryStatus } from "@/lib/admin-telemetry";

export function AiExecutionDetailPanel({ execution }: { execution: AiExecutionDetail | null }) {
  const { locale, dict } = useLanguage();

  if (!execution) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
        {dict.adminTelemetry.detail.empty}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {dict.adminTelemetry.detail.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{execution.id}</p>
        </div>
        <div className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
          {formatTelemetryStatus(execution.status, dict)} /{" "}
          {formatTelemetryKind(execution.kind, dict)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={dict.adminTelemetry.detail.user}
          value={execution.user_id ?? dict.adminTelemetry.detail.anonymous}
        />
        <Metric
          label={dict.adminTelemetry.detail.model}
          value={execution.resolved_model ?? execution.requested_model}
        />
        <Metric
          label={dict.adminTelemetry.detail.cost}
          value={formatCurrency(execution.usage.cost, locale)}
        />
        <Metric
          label={dict.adminTelemetry.detail.tokens}
          value={new Intl.NumberFormat(locale).format(execution.usage.total_tokens ?? 0)}
        />
      </div>

      <JsonBlock title={dict.adminTelemetry.detail.systemPrompt} value={execution.system_prompt} />
      <JsonBlock title={dict.adminTelemetry.detail.userPrompt} value={execution.user_prompt} />
      <JsonBlock
        title={dict.adminTelemetry.detail.responseText}
        value={execution.response_text ?? execution.error_message ?? "-"}
      />
      <JsonBlock
        title={dict.adminTelemetry.detail.reasoning}
        value={execution.response_reasoning ?? "-"}
      />
      <JsonBlock title={dict.adminTelemetry.detail.messages} value={execution.messages} />
      <JsonBlock title={dict.adminTelemetry.detail.usage} value={execution.usage} />
      <JsonBlock
        title={dict.adminTelemetry.detail.providerResponses}
        value={execution.provider_responses}
      />
      <JsonBlock
        title={dict.adminTelemetry.detail.rawCompletionResponse}
        value={execution.raw_completion_response}
      />
      <JsonBlock
        title={dict.adminTelemetry.detail.rawGenerationResponse}
        value={execution.raw_generation_response}
      />
      <JsonBlock title={dict.adminTelemetry.detail.rawError} value={execution.error_json} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium break-all text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  const text = typeof value === "string" ? value : (JSON.stringify(value, null, 2) ?? "null");
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <pre className="overflow-x-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
        {text}
      </pre>
    </section>
  );
}

function formatCurrency(value: number | null, locale: string): string {
  if (value === null) return "-";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}
