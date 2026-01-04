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
      {children}
    </section>
  );
}
