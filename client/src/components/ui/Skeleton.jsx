import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div className={cn("rounded-lg shimmer", className)} {...props} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonReport() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      {/* Issue cards */}
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
