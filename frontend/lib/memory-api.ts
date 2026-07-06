type UpsertMemoryPayload = {
  self_description?: string | null;
  interests_tags?: string[];
  primary_platforms?: string[];
  target_audience_intents?: string[];
  post_goals?: string[];
};

export async function upsertUserMemory(data: UpsertMemoryPayload): Promise<void> {
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
