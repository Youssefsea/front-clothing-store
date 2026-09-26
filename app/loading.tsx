export default function Loading() {
  return (
    <main className="site-container py-10" aria-busy="true" aria-live="polite">
      <div className="h-10 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-[50vh] animate-pulse rounded-[28px] bg-muted" />
    </main>
  );
}
