export function RoomSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px w-10 bg-white/30 rounded-full" />
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <div className="h-px flex-1 bg-white/10 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {children}
      </div>
    </section>
  );
}
