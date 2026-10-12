import Link from "next/link";

export default function CompanyNotFound() {
  return (
    <div className="max-w-lg">
      <p className="font-mono text-[11px] tracking-[0.18em] text-cinnabar">404</p>
      <h1 className="mt-3 font-serif text-4xl">地图上没有这家机构</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        链接可能写错了，或者它还没放进占位样本。回到产业地图可以从分类里再找。
      </p>
      <Link
        href="/landscape"
        className="mt-6 inline-block bg-primary px-3 py-2 text-sm text-primary-foreground"
      >
        返回产业地图
      </Link>
    </div>
  );
}
