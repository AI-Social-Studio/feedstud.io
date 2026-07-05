import type { UserMemory } from "@/types/memory";

export async function upsertUserMemory(data: Partial<UserMemory>): Promise<void> {
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
