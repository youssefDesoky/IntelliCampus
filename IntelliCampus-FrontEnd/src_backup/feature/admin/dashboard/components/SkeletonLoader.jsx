function SkeletonBar({ className = "" }) {
 return (
 <div
 className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
 />
 );
}

export function KpiCardSkeleton() {
 return (
 <div className="flex items-center gap-4 p-5 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark">
 <SkeletonBar className="w-14 h-14 rounded-2xl shrink-0" />
 <div className="flex flex-col gap-2 grow">
 <SkeletonBar className="h-3 w-24" />
 <SkeletonBar className="h-8 w-20" />
 </div>
 </div>
 );
}

export function ChartSkeleton() {
 return (
 <div className="p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark">
 <SkeletonBar className="h-5 w-40 mb-4" />
 <SkeletonBar className="h-[220px] w-full rounded" />
 </div>
 );
}

export function AlertSkeleton() {
 return (
 <div className="flex items-start gap-4 p-4 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark">
 <SkeletonBar className="w-10 h-10 rounded-lg shrink-0" />
 <div className="flex-1 space-y-2">
 <SkeletonBar className="h-4 w-36" />
 <SkeletonBar className="h-3 w-56" />
 </div>
 </div>
 );
}

export function DashboardSkeleton() {
 return (
 <div className="space-y-6 animate-pulse">
 <div className="space-y-2">
 <SkeletonBar className="h-8 w-64" />
 <SkeletonBar className="h-4 w-48" />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <KpiCardSkeleton key={i} />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {Array.from({ length: 2 }).map((_, i) => (
 <ChartSkeleton key={i} />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {Array.from({ length: 2 }).map((_, i) => (
 <ChartSkeleton key={i} />
 ))}
 </div>
 <SkeletonBar className="h-6 w-32 mb-4" />
 <div className="space-y-3">
 {Array.from({ length: 3 }).map((_, i) => (
 <AlertSkeleton key={i} />
 ))}
 </div>
 </div>
 );
}
