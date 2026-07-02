import { AdminTelemetryView } from "@/components/admin/admin-telemetry-view";
import { requireAdminContext } from "@/lib/auth/get-auth-context";
import {
  fetchAiExecutionServer,
  fetchAiUsageSummaryServer,
  listAiExecutionsServer,
} from "@/lib/flowforge-api-server";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
const MAX_EXECUTIONS_LIMIT = 200;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const auth = await requireAdminContext();
  const params = await searchParams;
  const filters = parseFilters(params);
  const queryString = buildQueryString(filters);

  const [summary, executions, selectedExecution] = await Promise.all([
    fetchAiUsageSummaryServer(filters),
    listAiExecutionsServer(filters),
    filters.executionId
      ? fetchAiExecutionServer(filters.executionId).catch(() => null)
      : Promise.resolve(null),
  ]);

  return (
    <AdminTelemetryView
      summary={summary}
      executions={executions}
      selectedExecution={selectedExecution}
      selectedExecutionId={filters.executionId}
      queryString={queryString}
      viewer={auth.primaryEmailAddress ?? auth.userId}
      filters={{
        kind: filters.kind,
        status: filters.status,
        platform: filters.platform,
        model: filters.model,
        userId: filters.userId,
        limit: filters.limit,
      }}
    />
  );
}

type Filters = {
  limit: number;
  offset?: number;
  kind?: string;
  status?: string;
  platform?: string;
  action?: string;
  model?: string;
  userId?: string;
  from?: string;
  to?: string;
  executionId?: string;
};

function parseFilters(params: Awaited<SearchParams>): Filters {
  return {
    limit: parsePositiveInt(first(params.limit), 25),
    offset: parseNonNegativeInt(first(params.offset)),
    kind: first(params.kind),
    status: first(params.status),
    platform: first(params.platform),
    action: first(params.action),
    model: first(params.model),
    userId: first(params.userId),
    from: first(params.from),
    to: first(params.to),
    executionId: first(params.executionId),
  };
}

function buildQueryString(filters: Filters): string {
  const params = new URLSearchParams();
  params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.status) params.set("status", filters.status);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.action) params.set("action", filters.action);
  if (filters.model) params.set("model", filters.model);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return params.toString();
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_EXECUTIONS_LIMIT);
}

function parseNonNegativeInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}
