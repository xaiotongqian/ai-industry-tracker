import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyDossier } from "@/components/company-dossier";
import { PageFrame } from "@/components/page-frame";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";
import { loadModels } from "@/lib/ingest/models";
import { loadNews } from "@/lib/ingest/news";

export async function generateStaticParams() {
  const { items } = await loadCompanies();
  return items.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { items } = await loadCompanies();
  const company = items.find((item) => item.slug === slug);
  if (!company) {
    return { title: "未找到机构" };
  }
  return {
    title: company.name,
    description: company.blurb,
  };
}

export default async function CompanyPage({
  params,
}: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const [companies, news, funding, models] = await Promise.all([
    loadCompanies(),
    loadNews(),
    loadFunding(),
    loadModels(),
  ]);
  const company = companies.items.find((item) => item.slug === slug);
  if (!company) notFound();

  const peers = companies.items
    .filter((item) => item.category === company.category && item.slug !== company.slug)
    .slice(0, 4);

  return (
    <PageFrame>
      <CompanyDossier
        company={company}
        peers={peers}
        news={news}
        funding={funding}
        models={models}
      />
    </PageFrame>
  );
}
