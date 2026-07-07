export type UserMemory = {
  id?: string;
  app_user_id?: string;
  self_description?: string;
  interests_tags: string[];
  primary_platforms: string[];
  target_audience_intents: string[];
  post_goals: string[];
  tone_style?: string;
  avoid_patterns?: string[];
  one_liner?: string;
  content_topics?: string[];
  onboarding_completed?: boolean;
  onboarding_skipped?: boolean;
  onboarding_completed_at?: string;
};

export type UpsertMemoryRequest = Partial<
  Omit<UserMemory, "id" | "app_user_id" | "onboarding_completed_at">
>;
