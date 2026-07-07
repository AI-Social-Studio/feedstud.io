import { useMemo } from "react";
import {
  ChatsCircleIcon,
  CurrencyCircleDollarIcon,
  EnvelopeSimpleIcon,
  HandshakeIcon,
  MedalIcon,
  MegaphoneIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { UserMemory } from "@/types/memory";
import { OptionCard } from "./option-card";

export function BlockC({
  data,
  onChange,
}: {
  data: Partial<UserMemory>;
  onChange: (updates: Partial<UserMemory>) => void;
}) {
  const dict = useDictionary().onboarding.blockC;
  const goals = useMemo(
    () => [
      {
        id: "awareness",
        label: dict.goals.awareness.label,
        description: dict.goals.awareness.description,
        icon: MegaphoneIcon,
      },
      {
        id: "inbound_contact",
        label: dict.goals.inbound_contact.label,
        description: dict.goals.inbound_contact.description,
        icon: EnvelopeSimpleIcon,
      },
      {
        id: "engagement",
        label: dict.goals.engagement.label,
        description: dict.goals.engagement.description,
        icon: ChatsCircleIcon,
      },
      {
        id: "credibility",
        label: dict.goals.credibility.label,
        description: dict.goals.credibility.description,
        icon: MedalIcon,
      },
      {
        id: "networking",
        label: dict.goals.networking.label,
        description: dict.goals.networking.description,
        icon: HandshakeIcon,
      },
      {
        id: "sales",
        label: dict.goals.sales.label,
        description: dict.goals.sales.description,
        icon: CurrencyCircleDollarIcon,
      },
    ],
    [dict],
  );
  const currentGoals = data.post_goals || [];

  function toggleGoal(id: string) {
    if (currentGoals.includes(id)) {
      onChange({ post_goals: currentGoals.filter((goal) => goal !== id) });
      return;
    }
    if (currentGoals.length < 2) {
      onChange({ post_goals: [...currentGoals, id] });
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both space-y-10 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dict.titleGoals}</h2>
        <p className="mt-1.5 text-base text-gray-500 dark:text-gray-400">{dict.subtitleGoals}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {goals.map((goal) => {
          const isSelected = currentGoals.includes(goal.id);
          const isDisabled = currentGoals.length >= 2 && !isSelected;
          return (
            <div
              key={goal.id}
              className={cn(
                "h-full transition-opacity duration-300",
                isDisabled && "opacity-50 grayscale-[0.5]",
              )}
            >
              <OptionCard
                icon={goal.icon}
                title={goal.label}
                description={goal.description}
                selected={isSelected}
                onClick={() => toggleGoal(goal.id)}
              />
            </div>
          );
        })}
      </div>

      {currentGoals.length >= 2 ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl bg-blue-50/50 p-4 text-center text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          {dict.maxGoalsReached}
        </div>
      ) : null}
    </div>
  );
}
