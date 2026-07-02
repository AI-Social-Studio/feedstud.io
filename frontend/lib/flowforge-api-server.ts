import type {
  AiExecutionDetail,
  AiExecutionListItem,
  AiUsageSummary,
  Draft,
  DraftSummary,
} from "@/lib/flowforge-api";
import { BackendRequestError, backendJson } from "@/lib/flowforge-backend";

export async function fetchDraftServer(draftId: string): Promise<Draft | null> {
  try {
    return await backendJson<Draft>(`/drafts/${encodeURIComponent(draftId)}`);
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchAiUsageSummaryServer(
  filters: AiUsageFilters = {},
): Promise<AiUsageSummary> {
  try {
    return await backendJson<AiUsageSummary>(`/admin/ai-usage/summary${toQueryString(filters)}`);
  } catch {
    return emptyAiUsageSummary();
  }
}

export async function listAiExecutionsServer(
  filters: AiUsageFilters = {},
): Promise<AiExecutionListItem[]> {
  try {
    return await backendJson<AiExecutionListItem[]>(
      `/admin/ai-usage/executions${toQueryString(filters)}`,
    );
  } catch {
    return [];
  }
}

export async function fetchAiExecutionServer(
  executionId: string,
): Promise<AiExecutionDetail | null> {
  try {
    return await backendJson<AiExecutionDetail>(
      `/admin/ai-usage/executions/${encodeURIComponent(executionId)}`,
    );
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) return null;
    throw error;
  }
}

export async function listDraftsServer(limit = 50): Promise<DraftSummary[]> {
  return backendJson<DraftSummary[]>(`/drafts?limit=${limit}`);
}

type AiUsageFilters = {
  limit?: number;
  offset?: number;
  kind?: string;
  status?: string;
  platform?: string;
  action?: string;
  model?: string;
  userId?: string;
  from?: string;
  to?: string;
};

function emptyAiUsageSummary(): AiUsageSummary {
  return {
    total_requests: 0,
    success_requests: 0,
    error_requests: 0,
    total_cost: 0,
    total_prompt_tokens: 0,
    total_completion_tokens: 0,
    total_tokens: 0,
    total_cached_tokens: 0,
    total_reasoning_tokens: 0,
    average_cost_per_request: 0,
  };
}

function toQueryString(filters: AiUsageFilters): string {
  const params = new URLSearchParams();
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.status) params.set("status", filters.status);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.action) params.set("action", filters.action);
  if (filters.model) params.set("model", filters.model);
  if (filters.userId) params.set("user_id", filters.userId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const query = params.toString();
  return query ? `?${query}` : "";
}
