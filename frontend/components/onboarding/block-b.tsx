"use client";

import { useMemo } from "react";
import { OptionCard } from "./option-card";
import {
  LinkedinLogo as LinkedinLogoIcon,
  InstagramLogo as InstagramLogoIcon,
  XLogo as XLogoIcon,
  Question as QuestionIcon,
  UsersThree as UsersThreeIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  ShoppingCart as ShoppingCartIcon,
  GlobeHemisphereWest as GlobeHemisphereWestIcon,
  Asterisk as AsteriskIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { UserMemory } from "@/types/memory";
import { useDictionary } from "@/lib/i18n";

export function BlockB({
  data,
  onChange,
}: {
  data: Partial<UserMemory>;
  onChange: (updates: Partial<UserMemory>) => void;
}) {
  const dict = useDictionary().onboarding.blockB;

  const platforms = useMemo(
    () => [
      { id: "linkedin", label: dict.platforms.linkedin, icon: LinkedinLogoIcon },
      { id: "instagram", label: dict.platforms.instagram, icon: InstagramLogoIcon },
      { id: "x", label: dict.platforms.x, icon: XLogoIcon },
      { id: "unknown", label: dict.platforms.unknown, icon: QuestionIcon },
    ],
    [dict],
  );

  const audiences = useMemo(
    () => [
      { id: "employers", label: dict.audiences.employers, icon: BriefcaseIcon },
      { id: "same_interests", label: dict.audiences.same_interests, icon: UsersThreeIcon },
      { id: "friends", label: dict.audiences.friends, icon: UsersIcon },
      { id: "customers", label: dict.audiences.customers, icon: ShoppingCartIcon },
      { id: "broad_reach", label: dict.audiences.broad_reach, icon: GlobeHemisphereWestIcon },
      { id: "other", label: dict.audiences.other, icon: AsteriskIcon },
    ],
    [dict],
  );

  const togglePlatform = (id: string) => {
    const current = data.primary_platforms || [];
    if (id === "unknown") {
      onChange({ primary_platforms: current.includes("unknown") ? [] : ["unknown"] });
      return;
    }
    const filtered = current.filter((p) => p !== "unknown");
    if (filtered.includes(id)) {
      onChange({ primary_platforms: filtered.filter((p) => p !== id) });
    } else {
      onChange({ primary_platforms: [...filtered, id] });
    }
  };

  const toggleAudience = (id: string) => {
    const current = data.target_audience_intents || [];
    const knownIds = audiences.map((a) => a.id).filter((a) => a !== "other");

    if (id === "other") {
      if (isAudienceSelected("other")) {
        onChange({ target_audience_intents: current.filter((item) => knownIds.includes(item)) });
      } else {
        onChange({ target_audience_intents: [...current, "other"] });
      }
      return;
    }

    if (current.includes(id)) {
      onChange({ target_audience_intents: current.filter((a) => a !== id) });
    } else {
      onChange({ target_audience_intents: [...current, id] });
    }
  };

  const isPlatformSelected = (id: string) => (data.primary_platforms || []).includes(id);

  const isAudienceSelected = (id: string) => {
    const current = data.target_audience_intents || [];
    if (id !== "other") return current.includes(id);

    const knownIds = audiences.map((a) => a.id).filter((a) => a !== "other");
    return current.includes("other") || current.some((item) => !knownIds.includes(item));
  };

  const updateCustomAudience = (value: string) => {
    const current = data.target_audience_intents || [];
    const knownIds = audiences.map((a) => a.id).filter((a) => a !== "other");
    const withoutCustom = current.filter((item) => knownIds.includes(item));

    if (value.trim() === "") {
      onChange({ target_audience_intents: [...withoutCustom, "other"] });
    } else {
      onChange({ target_audience_intents: [...withoutCustom, value] });
    }
  };

  const getCustomAudienceValue = () => {
    const current = data.target_audience_intents || [];
    const knownIds = audiences.map((a) => a.id).filter((a) => a !== "other");
    const customValue = current.find((item) => !knownIds.includes(item));
    return customValue === "other" ? "" : customValue || "";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both space-y-10 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dict.titlePlatforms}</h2>
        <p className="mt-1.5 text-base text-gray-500 dark:text-gray-400">
          {dict.subtitlePlatforms}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {platforms.map((platform) => (
            <OptionCard
              key={platform.id}
              icon={platform.icon}
              title={platform.label}
              selected={isPlatformSelected(platform.id)}
              onClick={() => togglePlatform(platform.id)}
            />
          ))}
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dict.titleAudience}</h2>
        <p className="mt-1.5 text-base text-gray-500 dark:text-gray-400">{dict.subtitleAudience}</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {audiences.map((audience) => (
            <OptionCard
              key={audience.id}
              icon={audience.icon}
              title={audience.label}
              selected={isAudienceSelected(audience.id)}
              onClick={() => toggleAudience(audience.id)}
            />
          ))}
        </div>
      </div>

      {isAudienceSelected("other") && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {dict.otherAudienceLabel}
          </label>
          <input
            type="text"
            autoFocus
            maxLength={60}
            placeholder={dict.otherAudiencePlaceholder}
            value={getCustomAudienceValue()}
            onChange={(e) => updateCustomAudience(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:bg-gray-900"
          />
        </div>
      )}
    </div>
  );
}
