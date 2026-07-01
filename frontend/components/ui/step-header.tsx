import type { ReactNode } from "react";

type StepHeaderProps = {
  marker: ReactNode;
  markerVariant?: "default" | "brand";
  title: string;
  right?: ReactNode;
};

export function StepHeader({
  marker,
  markerVariant = "default",
  title,
  right,
}: StepHeaderProps) {
  const markerClasses =
    markerVariant === "brand"
      ? "w-6 h-6 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center text-xs text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400"
      : "w-6 h-6 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400";

  if (right) {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 dark:text-gray-100">
          <span className={markerClasses}>{marker}</span>
          {title}
        </h2>
        {right}
      </div>
    );
  }

  return (
    <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-100">
      <span className={markerClasses}>{marker}</span>
      {title}
    </h2>
  );
}
