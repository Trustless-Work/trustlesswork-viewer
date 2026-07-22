import { Skeleton } from "@/components/ui/skeleton";

/** Page shell while React Suspense resolves — mirrors navbar + main layout. */
export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-4 px-3 md:h-16 md:px-8">
          <Skeleton className="size-10 rounded-lg md:size-12" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28 rounded-4xl" />
            <Skeleton className="size-8 rounded-4xl" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-6 flex flex-col gap-2">
            <Skeleton className="h-8 w-48 md:h-9 md:w-56" />
            <Skeleton className="h-4 w-full max-w-xl md:h-5" />
          </div>

          <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-9 w-full flex-1 rounded-lg" />
              <Skeleton className="h-9 w-full rounded-4xl sm:w-28" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
