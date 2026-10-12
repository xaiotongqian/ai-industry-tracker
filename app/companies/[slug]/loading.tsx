import { PageFrame } from "@/components/page-frame";

export default function CompanyLoading() {
  return (
    <PageFrame>
      <div aria-busy="true" aria-live="polite">
        <p className="text-sm text-muted-foreground">正在整理机构档案…</p>
        <div className="mt-8 h-14 w-64 animate-pulse rounded-lg bg-black/5 motion-reduce:animate-none" />
        <div className="mt-6 h-20 max-w-xl animate-pulse rounded-lg bg-black/5 motion-reduce:animate-none" />
        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg bg-black/5 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </PageFrame>
  );
}
