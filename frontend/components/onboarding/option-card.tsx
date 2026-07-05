import { cn } from "@/lib/utils";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";

export function OptionCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex h-full w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ease-out",
        selected
          ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 shadow-blue-500/10 ring-blue-600 dark:border-blue-500 dark:bg-blue-500/10 dark:ring-blue-500"
          : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:bg-gray-900",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300",
          selected
            ? "border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400"
            : "border-gray-100 bg-gray-50 text-gray-500 group-hover:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:group-hover:bg-gray-800",
        )}
      >
        <Icon size={22} weight={selected ? "duotone" : "regular"} />
      </div>
      <div className="flex-1 pr-6">
        <h3
          className={cn(
            "font-semibold transition-colors duration-300",
            selected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100",
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div
        className={cn(
          "absolute top-4 right-4 transition-all duration-300",
          selected
            ? "scale-100 text-blue-600 opacity-100 dark:text-blue-500"
            : "scale-50 text-gray-300 opacity-0",
        )}
      >
        <CheckCircleIcon size={20} weight="fill" />
      </div>
    </button>
  );
}
