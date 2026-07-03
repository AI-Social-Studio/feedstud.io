import type { Dictionary } from "@/dictionaries";

export function formatTelemetryKind(kind: string, dict: Dictionary): string {
  if (kind === "generate") return dict.adminTelemetry.filters.options.kind.generate;
  if (kind === "refine") return dict.adminTelemetry.filters.options.kind.refine;
  return kind;
}

export function formatTelemetryStatus(status: string, dict: Dictionary): string {
  if (status === "success") return dict.adminTelemetry.filters.options.status.success;
  if (status === "error") return dict.adminTelemetry.filters.options.status.error;
  return status;
}

export function formatTelemetryAction(action: string, dict: Dictionary): string {
  const labels = dict.studio.refineActions;
  if (action === "hook") return labels.hook;
  if (action === "shorten") return labels.shorten;
  if (action === "formal") return labels.formal;
  if (action === "casual") return labels.casual;
  if (action === "cta") return labels.cta;
  if (action === "hashtags") return labels.hashtags;
  return action;
}

export function formatTelemetryPlatform(platform: string, dict: Dictionary): string {
  if (platform === "linkedin") return dict.adminTelemetry.filters.options.platform.linkedin;
  if (platform === "instagram") return dict.adminTelemetry.filters.options.platform.instagram;
  if (platform === "x") return dict.adminTelemetry.filters.options.platform.x;
  return platform;
}

export function formatTelemetryCurrency(value: number | null, locale: string): string {
  if (value === null) return "-";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}
