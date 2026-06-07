export default function EventLoading() {
  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="aspect-video animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="min-h-[520px] animate-pulse rounded-lg bg-white/[0.06]" />
      </div>
    </main>
  );
}
