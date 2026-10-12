import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg">
      <p className="font-mono text-[11px] tracking-[0.18em] text-cinnabar">404</p>
      <h1 className="mt-3 font-serif text-4xl">这页不在地图上</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        地址可能写错了。四个栏目都从首页动态进去。
      </p>
      <Link
        href="/"
        className="mt-6 inline-block bg-primary px-3 py-2 text-sm text-primary-foreground"
      >
        回到首页动态
      </Link>
    </div>
  );
}
