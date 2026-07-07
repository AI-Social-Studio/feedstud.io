import type { UpsertMemoryRequest, UserMemory } from "@/types/memory";

export async function upsertUserMemory(data: UpsertMemoryRequest): Promise<void> {
  const response = await fetch("/api/memory/upsert", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      self_description: data.self_description ?? null,
      interests_tags: data.interests_tags ?? [],
      primary_platforms: data.primary_platforms ?? [],
      target_audience_intents: data.target_audience_intents ?? [],
      post_goals: data.post_goals ?? [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save memory profile: ${response.status}`);
  }
}

export async function getUserMemory(): Promise<UserMemory | null> {
  const response = await fetch("/api/memory/me", { method: "GET" });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch user memory: ${response.status}`);
  }

  return (await response.json()) as UserMemory | null;
}
