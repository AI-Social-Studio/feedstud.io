import type { ReactNode } from "react";

type StepHeaderProps = {
  marker: ReactNode;
  markerVariant?: "default" | "brand";
  title: string;
  right?: ReactNode;
};

export function StepHeader({ marker, markerVariant = "default", title, right }: StepHeaderProps) {
  const markerClasses =
    markerVariant === "brand"
      ? "flex size-6 items-center justify-center rounded-md border border-blue-200 bg-blue-100 text-xs text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
      : "flex size-6 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";

  if (right) {
    return (
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
          <span className={markerClasses}>{marker}</span>
          {title}
        </h2>
        {right}
      </div>
    );
  }

  return (
    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
      <span className={markerClasses}>{marker}</span>
      {title}
    </h2>
  );
}
