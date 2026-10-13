import { categories } from "@/data/categories";
import type { CategoryId, Company, Listing, MoneyPlaceholder } from "@/data/types";

export type CompanyGlance = {
  count: number;
  byCategory: { id: CategoryId; label: string; count: number }[];
  reportedValuation: number;
  mockValuation: number;
  openValuation: number;
  publicCount: number;
  privateCount: number;
  subsidiaryCount: number;
};

/** Counts for the landscape strip. Derived from the loaded rows, not a source field. */
export function glanceAtCompanies(companies: readonly Company[]): CompanyGlance {
  const counts = new Map<CategoryId, number>(categories.map((category) => [category.id, 0]));
  let reportedValuation = 0;
  let mockValuation = 0;
  let openValuation = 0;
  let publicCount = 0;
  let privateCount = 0;
  let subsidiaryCount = 0;

  for (const company of companies) {
    counts.set(company.category, (counts.get(company.category) ?? 0) + 1);
    if (company.valuation.status === "reported") reportedValuation += 1;
    else if (company.valuation.status === "mock") mockValuation += 1;
    else openValuation += 1;
    if (company.listing === "public") publicCount += 1;
    else if (company.listing === "private") privateCount += 1;
    else subsidiaryCount += 1;
  }

  return {
    count: companies.length,
    byCategory: categories.map((category) => ({
      id: category.id,
      label: category.label,
      count: counts.get(category.id) ?? 0,
    })),
    reportedValuation,
    mockValuation,
    openValuation,
    publicCount,
    privateCount,
    subsidiaryCount,
  };
}

export type BoardCompany = {
  slug: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  blurb: string;
  tagline?: string;
  products?: string;
  founded: number | null;
  hq: string;
  listing: Listing;
  domain: string;
  website?: string;
  funding: MoneyPlaceholder;
  valuation: MoneyPlaceholder;
  ticker?: string;
};

/** Fields the landscape board renders. Long bios stay on the profile page. */
export function toBoardCompany(company: Company): BoardCompany {
  return {
    slug: company.slug,
    name: company.name,
    nameEn: company.nameEn,
    category: company.category,
    blurb: company.blurb,
    tagline: company.tagline,
    products: company.products,
    founded: company.founded,
    hq: company.hq,
    listing: company.listing,
    domain: company.domain,
    website: company.website,
    funding: company.funding,
    valuation: company.valuation,
    ticker: company.ticker,
  };
}
