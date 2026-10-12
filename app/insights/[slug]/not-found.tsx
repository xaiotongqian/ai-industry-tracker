import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function InsightNotFound() {
  return (
    <PageFrame>
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">没有这篇洞察</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
        地址可能写错了。洞察是编辑写定的文章，不从新闻源里临时生成。
      </p>
      <Link
        href="/insights"
        className={cn(
          "mt-8 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm text-background motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-80",
          focusRing,
        )}
      >
        返回洞察
      </Link>
    </PageFrame>
  );
}
