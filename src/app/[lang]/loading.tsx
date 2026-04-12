export default function Loading() {
  return (
    <main className="min-h-screen bg-surface pt-36 pb-20 px-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        
        {/* Hero skeleton */}
        <div className="rounded-3xl bg-stone-200 h-[500px] mb-16" />

        {/* Section title */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="h-4 bg-stone-200 rounded-full w-32" />
          <div className="h-8 bg-stone-200 rounded-full w-64" />
          <div className="h-4 bg-stone-200 rounded-full w-80" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 space-y-4">
              <div className="aspect-[4/5] bg-stone-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-5 bg-stone-200 rounded-full w-3/4" />
                <div className="h-4 bg-stone-200 rounded-full w-full" />
                <div className="h-4 bg-stone-200 rounded-full w-5/6" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-7 bg-stone-200 rounded-full w-24" />
                <div className="h-10 bg-stone-200 rounded-full w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
