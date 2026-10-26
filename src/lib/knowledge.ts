import { categories, type CategoryId, type SubcategoryId, type TopicId, type ZoneId } from "./taxonomy.ts";

export interface KnowledgeCard {
  id: string;
  title: string;
  summary: string;
  takeaway: string;
  category: CategoryId;
  subcategory: SubcategoryId;
  zone?: ZoneId;
  archiveDate: string;
  tags: string[];
  sources: { name: string; url: string }[];
  contentKind: "seed";
}

export interface Filters {
  query: string;
  topic: TopicId;
  date: string;
  savedOnly: boolean;
  saved: string[];
  hidden: string[];
}

/** 所有条件取交集；全文查询匹配空格分隔的全部词。 */
export function filterKnowledge(cards: KnowledgeCard[], filters: Filters): KnowledgeCard[] {
  const tokens = filters.query.trim().toLocaleLowerCase("zh-CN").split(/\s+/u).filter(Boolean);
  return cards.filter((card) => {
    if (filters.hidden.includes(card.id)) return false;
    if (filters.savedOnly && !filters.saved.includes(card.id)) return false;
    if (filters.date !== "all" && card.archiveDate !== filters.date) return false;
    if (filters.topic !== "all" && ![card.category, card.subcategory, card.zone].includes(filters.topic)) return false;
    const text = [card.title, card.summary, card.takeaway, ...card.tags].join(" ").toLocaleLowerCase("zh-CN");
    return tokens.every((token) => text.includes(token));
  });
}

export function getArchiveDates(cards: KnowledgeCard[]): string[] {
  return [...new Set(cards.map((card) => card.archiveDate))].sort().reverse();
}

export function beijingDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function categoryLabel(card: KnowledgeCard): string {
  const category = categories.find((item) => item.id === card.category);
  return category?.children.find((item) => item.id === card.subcategory)?.label ?? category?.label ?? "见识";
}

export function shareUrl(origin: string, id: string): string {
  const url = new URL("/", origin);
  url.searchParams.set("card", id);
  return url.href;
}
