export default function CompanyLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="motion-reduce:animate-none">
      <p className="font-mono text-xs text-muted-foreground">正在整理机构档案…</p>
      <div className="mt-4 h-10 w-48 animate-pulse bg-muted motion-reduce:animate-none" />
      <div className="mt-4 h-20 max-w-xl animate-pulse bg-muted motion-reduce:animate-none" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse bg-muted motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
