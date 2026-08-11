"use client";

export function ShimmerLoader() {
  return (
    <div className="space-y-2">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-[#353535] dark:via-[#2a2a2a] dark:to-[#353535] rounded-full w-3/4 animate-shimmer" />
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-[#353535] dark:via-[#2a2a2a] dark:to-[#353535] rounded-full w-full animate-shimmer" style={{ animationDelay: '100ms' }} />
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-[#353535] dark:via-[#2a2a2a] dark:to-[#353535] rounded-full w-2/3 animate-shimmer" style={{ animationDelay: '200ms' }} />
    </div>
  );
}

export default ShimmerLoader;
