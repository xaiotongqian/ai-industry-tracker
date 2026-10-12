import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { SectionIndex } from "@/components/section-index";
import { author } from "@/data/author";
import { focusRing, frameClass, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "关于",
  description:
    "站点作者刘永武（Will Liu）。香港理工大学与哈尔滨工业大学（深圳）双学位博士，研究强化学习、大语言模型与自动驾驶汽车调度。",
};

export default function AboutPage() {
  return (
    <>
      <section className="-mt-12 bg-black pt-28 pb-20 text-white sm:pt-36 sm:pb-28">
        <div className={frameClass}>
          <p className="text-[13px] tracking-[0.18em] text-white/60">06 · 关于</p>
          <h1 className="mt-5 text-6xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">
            {author.name}
          </h1>
          <p className="mt-4 text-2xl text-white/70 sm:text-3xl">{author.nameEn}</p>
          <p className="mt-6 max-w-xl text-xl leading-snug text-white/70 sm:text-2xl">
            {author.role}。强化学习、大语言模型，以及自动驾驶汽车调度。
          </p>
        </div>
      </section>
      <PageFrame>
        <SectionIndex current="about" />
        <p className="mt-14 max-w-2xl text-xl leading-relaxed sm:text-2xl sm:leading-snug">
          {author.bio}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          经历、论文与奖项据本人简历整理。影响因子为简历所列。
        </p>

        <section className="mt-20" aria-labelledby="focus">
          <h2 id="focus" className="text-sm text-muted-foreground">
            研究方向
          </h2>
          <ol className="mt-6 border-t border-border">
            {author.focus.map((item, index) => (
              <li key={item.title} className="border-b border-border py-8">
                <p className="text-sm text-muted-foreground">0{index + 1}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20" aria-labelledby="papers">
          <h2 id="papers" className="text-sm text-muted-foreground">
            论文
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed">{author.paperNote}</p>
          <ol className="mt-8 border-t border-border">
            {author.papers.map((paper) => (
              <li key={paper.title} className="border-b border-border py-7">
                <a
                  href={paper.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(
                    "inline text-xl font-medium tracking-tight text-link underline-offset-4 hover:underline sm:text-2xl",
                    focusRing,
                  )}
                >
                  {paper.title}
                </a>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {paper.venue}
                </p>
              </li>
            ))}
          </ol>
          <h3 className="mt-10 text-sm text-muted-foreground">外审中</h3>
          <ul className="mt-4 border-t border-border">
            {author.inReview.map((paper) => (
              <li key={paper.title} className="border-b border-border py-7">
                <p className="text-xl font-medium tracking-tight sm:text-2xl">{paper.title}</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {paper.venue}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
            {author.patentNote}
          </p>
        </section>

        <section className="mt-20" aria-labelledby="education">
          <h2 id="education" className="text-sm text-muted-foreground">
            教育
          </h2>
          <ol className="mt-6 border-t border-border">
            {author.education.map((item) => (
              <li key={`${item.school}-${item.dates}`} className="border-b border-border py-8">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h3 className="text-2xl font-semibold tracking-tight">{item.school}</h3>
                  <p className="text-sm text-muted-foreground">{item.dates}</p>
                </div>
                <p className="mt-2 text-lg">{item.program}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  学位论文：{item.thesis}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20" aria-labelledby="awards">
          <h2 id="awards" className="text-sm text-muted-foreground">
            荣誉
          </h2>
          <ul className="mt-6 border-t border-border">
            {author.awards.map((award) => (
              <li
                key={award}
                className="border-b border-border py-5 text-lg leading-relaxed"
              >
                {award}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="service">
          <h2 id="service" className="text-sm text-muted-foreground">
            学术服务
          </h2>
          <ul className="mt-6 border-t border-border">
            {author.service.map((item) => (
              <li key={item} className="border-b border-border py-5 text-lg leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="contact">
          <h2 id="contact" className="text-sm text-muted-foreground">
            联系
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">所在地 {author.location}</p>
          <a
            href={`mailto:${author.email}`}
            className={cn(
              "mt-4 inline-block text-2xl font-medium tracking-tight text-link underline-offset-4 hover:underline sm:text-3xl",
              focusRing,
            )}
          >
            {author.email}
          </a>
          <p className="mt-6">
            <a
              href={author.orcid}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(
                "text-lg text-link underline-offset-4 hover:underline",
                focusRing,
              )}
            >
              ORCID {author.orcidLabel}
            </a>
          </p>
          <p className="mt-8">
            <Link
              href="/insights"
              className={cn("text-lg tracking-tight", focusRing, hoverFade)}
            >
              阅读洞察
            </Link>
          </p>
        </section>
      </PageFrame>
    </>
  );
}
