"use client";

import { useState, useRef, useMemo } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { PlatformIconBadge } from "@/components/ui/platform-icon-badge";
import { upsertUserMemory } from "@/lib/memory-api";
import { useDictionary } from "@/lib/i18n";
import type { UserMemory } from "@/types/memory";
import type { AppRole } from "@/lib/auth/roles";
import {
  Brain as BrainIcon,
  UserFocus as UserFocusIcon,
  Tag as TagIcon,
  ShareNetwork as ShareNetworkIcon,
  Users as UsersIcon,
  Target as TargetIcon,
  Check as CheckIcon,
  X as XIcon,
  ArrowCounterClockwise as ArrowCounterClockwiseIcon,
  FloppyDiskBack as FloppyDiskBackIcon,
  Plus as PlusIcon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Storefront as StorefrontIcon,
  VideoCamera as VideoCameraIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
  Globe as GlobeIcon,
  Palette as PaletteIcon,
  Question as QuestionIcon,
  UsersThree as UsersThreeIcon,
  ShoppingCart as ShoppingCartIcon,
  GlobeHemisphereWest as GlobeHemisphereWestIcon,
} from "@phosphor-icons/react/dist/ssr";

type Toast = {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
};

export function ProfileView({
  initialMemory,
  role,
  initialSidebarCollapsed,
}: {
  initialMemory: UserMemory | null;
  role: AppRole;
  initialSidebarCollapsed: boolean;
}) {
  const dict = useDictionary();
  const profileDict = dict.profile;
  const onboardingDict = dict.onboarding;

  const [memory, setMemory] = useState<UserMemory | null>(initialMemory);
  const [formData, setFormData] = useState<Partial<UserMemory>>(() => ({
    self_description: initialMemory?.self_description || "",
    interests_tags: initialMemory?.interests_tags || [],
    primary_platforms: initialMemory?.primary_platforms || [],
    target_audience_intents: initialMemory?.target_audience_intents || [],
    post_goals: initialMemory?.post_goals || [],
  }));

  const [showWizard, setShowWizard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  function pushToast(tone: Toast["tone"], message: string) {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  const hasChanges = useMemo(() => {
    const normCurrent = {
      self_description: (formData.self_description || "").trim(),
      interests_tags: [...(formData.interests_tags || [])].sort(),
      primary_platforms: [...(formData.primary_platforms || [])].sort(),
      target_audience_intents: [...(formData.target_audience_intents || [])].sort(),
      post_goals: [...(formData.post_goals || [])].sort(),
    };
    const normSaved = {
      self_description: (memory?.self_description || "").trim(),
      interests_tags: [...(memory?.interests_tags || [])].sort(),
      primary_platforms: [...(memory?.primary_platforms || [])].sort(),
      target_audience_intents: [...(memory?.target_audience_intents || [])].sort(),
      post_goals: [...(memory?.post_goals || [])].sort(),
    };
    return JSON.stringify(normCurrent) !== JSON.stringify(normSaved);
  }, [formData, memory]);

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    try {
      await upsertUserMemory({
        self_description: formData.self_description || null,
        interests_tags: formData.interests_tags || [],
        primary_platforms: formData.primary_platforms || [],
        target_audience_intents: formData.target_audience_intents || [],
        post_goals: formData.post_goals || [],
      });
      const updatedMemory: UserMemory = {
        ...(memory || {
          user_id: "me",
          avoid_patterns: [],
          content_topics: [],
          onboarding_completed: true,
          onboarding_skipped: false,
        }),
        self_description: formData.self_description || undefined,
        interests_tags: formData.interests_tags || [],
        primary_platforms: formData.primary_platforms || [],
        target_audience_intents: formData.target_audience_intents || [],
        post_goals: formData.post_goals || [],
      };
      setMemory(updatedMemory);
      pushToast("success", profileDict.savedToast);
    } catch (err) {
      console.error(err);
      pushToast("error", profileDict.errorToast);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWizardComplete = async (data: Partial<UserMemory>) => {
    try {
      await upsertUserMemory(data);
      const updatedMemory: UserMemory = {
        ...(memory || {
          user_id: "me",
          avoid_patterns: [],
          content_topics: [],
          onboarding_completed: true,
          onboarding_skipped: false,
        }),
        ...data,
      };
      setMemory(updatedMemory);
      setFormData({
        self_description: updatedMemory.self_description || "",
        interests_tags: updatedMemory.interests_tags || [],
        primary_platforms: updatedMemory.primary_platforms || [],
        target_audience_intents: updatedMemory.target_audience_intents || [],
        post_goals: updatedMemory.post_goals || [],
      });
      setShowWizard(false);
      pushToast("success", profileDict.savedToast);
    } catch (err) {
      console.error(err);
      pushToast("error", profileDict.errorToast);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || (formData.interests_tags || []).length >= 5) return;
    if (!formData.interests_tags?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        interests_tags: [...(prev.interests_tags || []), trimmed],
      }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      interests_tags: (prev.interests_tags || []).filter((t) => t !== tag),
    }));
  };

  const addAudience = () => {
    const trimmed = audienceInput.trim();
    if (!trimmed || (formData.target_audience_intents || []).length >= 5) return;
    if (!formData.target_audience_intents?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        target_audience_intents: [
          ...(prev.target_audience_intents || []).filter((t) => t !== "other"),
          trimmed,
        ],
      }));
    }
    setAudienceInput("");
  };

  const removeAudience = (aud: string) => {
    setFormData((prev) => ({
      ...prev,
      target_audience_intents: (prev.target_audience_intents || []).filter((t) => t !== aud),
    }));
  };

  const togglePlatform = (platform: string) => {
    const current = formData.primary_platforms || [];
    const next = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setFormData((prev) => ({ ...prev, primary_platforms: next }));
  };

  const toggleGoal = (goal: string) => {
    const current = formData.post_goals || [];
    if (current.includes(goal)) {
      setFormData((prev) => ({
        ...prev,
        post_goals: current.filter((g) => g !== goal),
      }));
    } else {
      if (current.length < 2) {
        setFormData((prev) => ({
          ...prev,
          post_goals: [...current, goal],
        }));
      }
    }
  };

  const identityProfiles = [
    {
      id: "student",
      label: onboardingDict.blockA.profiles.student.label,
      icon: GraduationCapIcon,
    },
    {
      id: "employee",
      label: onboardingDict.blockA.profiles.employee.label,
      icon: BriefcaseIcon,
    },
    {
      id: "business_owner",
      label: onboardingDict.blockA.profiles.business_owner.label,
      icon: StorefrontIcon,
    },
    {
      id: "creator",
      label: onboardingDict.blockA.profiles.creator.label,
      icon: VideoCameraIcon,
    },
    {
      id: "job_seeker",
      label: onboardingDict.blockA.profiles.job_seeker.label,
      icon: MagnifyingGlassIcon,
    },
    { id: "ngo", label: onboardingDict.blockA.profiles.ngo.label, icon: GlobeIcon },
    {
      id: "hobbyist",
      label: onboardingDict.blockA.profiles.hobbyist.label,
      icon: PaletteIcon,
    },
    { id: "other", label: onboardingDict.blockA.profiles.other.label, icon: QuestionIcon },
  ];

  const platformsList = [
    { id: "linkedin", label: onboardingDict.blockB.platforms.linkedin },
    { id: "instagram", label: onboardingDict.blockB.platforms.instagram },
    { id: "x", label: onboardingDict.blockB.platforms.x },
    { id: "unknown", label: onboardingDict.blockB.platforms.unknown },
  ];

  const goalsList = [
    { id: "awareness", ...onboardingDict.blockC.goals.awareness },
    { id: "inbound_contact", ...onboardingDict.blockC.goals.inbound_contact },
    { id: "engagement", ...onboardingDict.blockC.goals.engagement },
    { id: "credibility", ...onboardingDict.blockC.goals.credibility },
    { id: "networking", ...onboardingDict.blockC.goals.networking },
    { id: "sales", ...onboardingDict.blockC.goals.sales },
  ];

  const standardAudiences = [
    { id: "employers", label: onboardingDict.blockB.audiences.employers, icon: BriefcaseIcon },
    {
      id: "same_interests",
      label: onboardingDict.blockB.audiences.same_interests,
      icon: UsersThreeIcon,
    },
    { id: "friends", label: onboardingDict.blockB.audiences.friends, icon: UsersIcon },
    { id: "customers", label: onboardingDict.blockB.audiences.customers, icon: ShoppingCartIcon },
    {
      id: "broad_reach",
      label: onboardingDict.blockB.audiences.broad_reach,
      icon: GlobeHemisphereWestIcon,
    },
  ];

  return (
    <DashboardShell role={role} initialCollapsed={initialSidebarCollapsed}>
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-blue-50/50 p-8 dark:bg-blue-950/20">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold tracking-wider text-blue-800 uppercase dark:bg-blue-900/50 dark:text-blue-300">
            <BrainIcon size={14} weight="fill" />
            <span>AI Creator Memory</span>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                {profileDict.subtitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                {profileDict.reRunWizardDescription}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowWizard(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <ArrowCounterClockwiseIcon size={16} weight="bold" />
                <span>{profileDict.reRunWizard}</span>
              </button>
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  <FloppyDiskBackIcon size={16} weight="bold" />
                  <span>{isSaving ? profileDict.saving : profileDict.saveChanges}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition-all dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <UserFocusIcon size={20} weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {profileDict.identitySection.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profileDict.identitySection.subtitle}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  {profileDict.identitySection.label}
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {identityProfiles.map((profile) => {
                    const isKnownId = identityProfiles.some(
                      (p) => p.id === formData.self_description && p.id !== "other",
                    );
                    const isSelected =
                      profile.id === "other"
                        ? !isKnownId &&
                          formData.self_description !== undefined &&
                          formData.self_description !== ""
                        : formData.self_description === profile.id;

                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => {
                          if (profile.id === "other") {
                            if (!isSelected) {
                              const hasCustomText =
                                formData.self_description &&
                                !isKnownId &&
                                formData.self_description !== "other";
                              setFormData((prev) => ({
                                ...prev,
                                self_description: hasCustomText ? prev.self_description : "other",
                              }));
                            }
                          } else {
                            setFormData((prev) => ({ ...prev, self_description: profile.id }));
                          }
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-2xs dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300"
                            : "border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300 hover:bg-gray-100/50 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400 dark:hover:border-gray-700"
                        }`}
                      >
                        <profile.icon size={20} weight={isSelected ? "fill" : "regular"} />
                        <span className="text-xs font-semibold">{profile.label}</span>
                      </button>
                    );
                  })}
                </div>
                {(!identityProfiles.some(
                  (p) => p.id === formData.self_description && p.id !== "other",
                ) ||
                  formData.self_description === "other") && (
                  <div className="animate-in fade-in slide-in-from-top-1 mt-3">
                    <input
                      type="text"
                      maxLength={120}
                      placeholder={onboardingDict.blockA.otherIdentityPlaceholder}
                      value={
                        formData.self_description === "other" ? "" : formData.self_description || ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, self_description: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:bg-gray-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition-all dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <TagIcon size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {profileDict.topicsSection.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profileDict.topicsSection.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {(formData.interests_tags || []).length} / 5
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {(formData.interests_tags || []).length === 0 ? (
                  <p className="text-sm text-gray-400 italic dark:text-gray-500">
                    {profileDict.topicsSection.emptyState}
                  </p>
                ) : (
                  (formData.interests_tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                      >
                        <XIcon size={12} weight="bold" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              {(formData.interests_tags || []).length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={30}
                    placeholder={profileDict.topicsSection.inputPlaceholder}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:bg-gray-900"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <PlusIcon size={14} weight="bold" />
                    <span>{profileDict.topicsSection.addBtn}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition-all dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <ShareNetworkIcon size={20} weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {profileDict.platformsSection.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profileDict.platformsSection.subtitle}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {platformsList.map((platform) => {
                const isSelected = (formData.primary_platforms || []).includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/20"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {platform.id === "unknown" ? (
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gray-500 text-white">
                        <QuestionIcon size={20} weight="fill" />
                      </div>
                    ) : (
                      <PlatformIconBadge
                        platform={platform.id as "linkedin" | "instagram" | "x"}
                        size="md"
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {platform.label}
                    </span>
                    <div
                      className={`flex size-5 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
                      }`}
                    >
                      {isSelected && <CheckIcon size={12} weight="bold" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Target Audience */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition-all dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <UsersIcon size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {profileDict.audienceSection.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profileDict.audienceSection.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {(formData.target_audience_intents || []).length} / 5
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {standardAudiences.map((aud) => {
                  const isSelected = (formData.target_audience_intents || []).includes(aud.id);
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          removeAudience(aud.id);
                        } else if ((formData.target_audience_intents || []).length < 5) {
                          setFormData((prev) => ({
                            ...prev,
                            target_audience_intents: [
                              ...(prev.target_audience_intents || []).filter((t) => t !== "other"),
                              aud.id,
                            ],
                          }));
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <aud.icon size={16} weight={isSelected ? "fill" : "regular"} />
                      <span>{aud.label}</span>
                      {isSelected && <CheckIcon size={14} weight="bold" />}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                <div className="mb-3 flex flex-wrap gap-2">
                  {(formData.target_audience_intents || [])
                    .filter((t) => !standardAudiences.some((sa) => sa.id === t) && t !== "other")
                    .map((customAud) => (
                      <span
                        key={customAud}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >
                        <span>{customAud}</span>
                        <button
                          type="button"
                          onClick={() => removeAudience(customAud)}
                          className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                        >
                          <XIcon size={12} weight="bold" />
                        </button>
                      </span>
                    ))}
                </div>
                {(formData.target_audience_intents || []).length < 5 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={40}
                      placeholder={onboardingDict.blockB.otherAudiencePlaceholder}
                      value={audienceInput}
                      onChange={(e) => setAudienceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addAudience();
                        }
                      }}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:bg-gray-900"
                    />
                    <button
                      type="button"
                      onClick={addAudience}
                      disabled={!audienceInput.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      <PlusIcon size={14} weight="bold" />
                      <span>{profileDict.topicsSection.addBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition-all lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <TargetIcon size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {profileDict.goalsSection.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profileDict.goalsSection.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {(formData.post_goals || []).length} / 2
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {goalsList.map((goal) => {
                const isSelected = (formData.post_goals || []).includes(goal.id);
                const isDisabled = !isSelected && (formData.post_goals || []).length >= 2;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/20"
                        : isDisabled
                          ? "cursor-not-allowed border-gray-100 bg-gray-50/50 opacity-40 dark:border-gray-800/50 dark:bg-gray-950/30"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="mb-2 flex w-full items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {goal.label}
                      </span>
                      <div
                        className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
                        }`}
                      >
                        {isSelected && <CheckIcon size={12} weight="bold" />}
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {goal.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {showWizard && (
        <OnboardingModal
          initialData={memory || {}}
          onComplete={handleWizardComplete}
          onSkip={() => setShowWizard(false)}
        />
      )}

      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-in fade-in slide-in-from-bottom-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md transition-all ${
              toast.tone === "success"
                ? "border border-emerald-500/20 bg-emerald-500/90 text-white"
                : toast.tone === "error"
                  ? "border border-rose-500/20 bg-rose-500/90 text-white"
                  : "border border-blue-500/20 bg-blue-500/90 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
