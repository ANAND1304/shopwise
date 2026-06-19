export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-3 w-20" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-5 w-12" />
          <div className="skeleton h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="skeleton aspect-square rounded-xl w-full" />
      <div className="space-y-4">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-8 w-28" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
        <div className="skeleton h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
