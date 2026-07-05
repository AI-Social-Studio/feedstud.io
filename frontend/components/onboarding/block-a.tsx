import { useState, useMemo } from "react";
import { OptionCard } from "./option-card";
import {
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Storefront as StorefrontIcon,
  VideoCamera as VideoCameraIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
  Globe as GlobeIcon,
  Palette as PaletteIcon,
  Question as QuestionIcon,
  X as XIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { UserMemory } from "@/types/memory";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/i18n";

export function BlockA({
  data,
  onChange,
}: {
  data: Partial<UserMemory>;
  onChange: (updates: Partial<UserMemory>) => void;
}) {
  const dict = useDictionary().onboarding.blockA;
  const [tagInput, setTagInput] = useState("");
  const MAX_TAGS = 5;
  const MAX_TAG_LENGTH = 30;

  const currentTags = data.interests_tags || [];
  const isTagLimitReached = currentTags.length >= MAX_TAGS;

  const profiles = useMemo(() => [
    { id: "student", label: dict.profiles.student.label, description: dict.profiles.student.description, icon: GraduationCapIcon },
    { id: "employee", label: dict.profiles.employee.label, description: dict.profiles.employee.description, icon: BriefcaseIcon },
    { id: "business_owner", label: dict.profiles.business_owner.label, description: dict.profiles.business_owner.description, icon: StorefrontIcon },
    { id: "creator", label: dict.profiles.creator.label, description: dict.profiles.creator.description, icon: VideoCameraIcon },
    { id: "job_seeker", label: dict.profiles.job_seeker.label, description: dict.profiles.job_seeker.description, icon: MagnifyingGlassIcon },
    { id: "ngo", label: dict.profiles.ngo.label, description: dict.profiles.ngo.description, icon: GlobeIcon },
    { id: "hobbyist", label: dict.profiles.hobbyist.label, description: dict.profiles.hobbyist.description, icon: PaletteIcon },
    { id: "other", label: dict.profiles.other.label, description: dict.profiles.other.description, icon: QuestionIcon },
  ], [dict]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_TAG_LENGTH) return;
    if (isTagLimitReached) return;
    
    if (!currentTags.includes(trimmed)) {
      onChange({ interests_tags: [...currentTags, trimmed] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onChange({ interests_tags: currentTags.filter((t) => t !== tag) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dict.titleIdentity}</h2>
        <p className="mt-1.5 text-base text-gray-500 dark:text-gray-400">
          {dict.subtitleIdentity}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profiles.map((profile) => {
          const isKnownId = profiles.some((p) => p.id === data.self_description && p.id !== "other");
          const isSelected = profile.id === "other" 
            ? (!isKnownId && data.self_description !== undefined)
            : data.self_description === profile.id;

          return (
            <OptionCard
              key={profile.id}
              icon={profile.icon}
              title={profile.label}
              description={profile.description}
              selected={isSelected}
              onClick={() => {
                if (profile.id === "other") {
                  onChange({ self_description: "other" });
                } else {
                  onChange({ self_description: profile.id });
                }
              }}
            />
          );
        })}
      </div>

      {(!profiles.some((p) => p.id === data.self_description && p.id !== "other") && data.self_description !== undefined) && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {dict.otherIdentityLabel}
          </label>
          <input
            type="text"
            autoFocus
            maxLength={50}
            placeholder={dict.otherIdentityPlaceholder}
            value={data.self_description === "other" ? "" : data.self_description || ""}
            onChange={(e) => onChange({ self_description: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:bg-gray-900"
          />
          <div className="mt-1.5 text-right text-xs text-gray-400">
            {dict.charLimit(data.self_description === "other" ? 0 : (data.self_description?.length || 0), 50)}
          </div>
        </div>
      )}

      <div className="pt-2">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dict.titleTags}</h2>
            <p className="mt-1.5 text-base text-gray-500 dark:text-gray-400">
              {dict.subtitleTags}
            </p>
          </div>
          <span className="text-sm font-medium text-gray-400">
            {dict.tagLimit(currentTags.length, MAX_TAGS)}
          </span>
        </div>
        <div className={cn(
          "mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 transition-colors dark:border-gray-800 dark:bg-gray-950/50",
          !isTagLimitReached && "focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:border-blue-500 dark:focus-within:bg-gray-900"
        )}>
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm ring-1 ring-gray-200/50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-100"
                >
                  <XIcon size={14} weight="bold" />
                </button>
              </span>
            ))}
            {!isTagLimitReached && (
              <input
                type="text"
                maxLength={MAX_TAG_LENGTH}
                placeholder={currentTags.length ? dict.tagsPlaceholderMore : dict.tagsPlaceholderEmpty}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                className="min-w-[120px] flex-1 bg-transparent px-2 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
