import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function CompanyNotFound() {
  return (
    <PageFrame>
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">地图上没有这家机构</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
        链接可能写错了，或者它还没放进占位样本。回到产业地图可以从分类里再找。
      </p>
      <Link
        href="/landscape"
        className={cn(
          "mt-8 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm text-background motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-80",
          focusRing,
        )}
      >
        返回产业地图
      </Link>
    </PageFrame>
  );
}
