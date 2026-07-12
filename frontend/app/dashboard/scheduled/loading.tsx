export default function ScheduledPostsLoading() {
  return (
    <div className="space-y-4 p-6 sm:p-8">
      <div className="space-y-2">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
    </div>
  );
}
