import "server-only";
import entries from "../../data/knowledge.json";
import specialEntries from "../../data/special-seeds.json";
import type { KnowledgeCard } from "@/lib/knowledge";

/** MVP 数据适配层。后续切换数据库时，页面继续使用相同的数据契约。 */
export function listKnowledge(): KnowledgeCard[] {
  return [entries[0], ...specialEntries, ...entries.slice(1)] as KnowledgeCard[];
}
