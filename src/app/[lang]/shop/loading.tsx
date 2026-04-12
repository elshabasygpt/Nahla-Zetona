export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-surface pt-36 pb-20 px-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 space-y-4">
              <div className="aspect-[4/5] bg-stone-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-5 bg-stone-200 rounded-full w-3/4" />
                <div className="h-4 bg-stone-100 rounded-full w-full" />
                <div className="h-4 bg-stone-100 rounded-full w-5/6" />
              </div>
              <div className="flex gap-2">
                {[1,2,3].map(j => <div key={j} className="flex-1 h-8 bg-stone-100 rounded-xl" />)}
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-7 bg-stone-200 rounded-full w-24" />
                <div className="h-10 bg-stone-200 rounded-full w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
