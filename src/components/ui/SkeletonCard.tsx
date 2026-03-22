import { cn } from '@/lib/utils';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      <div className="aspect-[2/3] bg-white/5 animate-pulse" />
      <div className="p-2.5 space-y-2">
        <div className="h-3.5 bg-white/5 rounded animate-pulse w-4/5" />
        <div className="h-3 bg-white/5 rounded animate-pulse w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative h-[70vh] bg-card animate-pulse">
      <div className="absolute bottom-16 left-8 space-y-4">
        <div className="h-8 bg-white/5 rounded w-96" />
        <div className="h-4 bg-white/5 rounded w-80" />
        <div className="h-4 bg-white/5 rounded w-64" />
        <div className="flex gap-3">
          <div className="h-10 bg-white/5 rounded-lg w-32" />
          <div className="h-10 bg-white/5 rounded-lg w-28" />
        </div>
      </div>
    </div>
  );
}
