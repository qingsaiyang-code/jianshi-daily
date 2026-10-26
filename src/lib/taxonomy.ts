export const categories = [
  { id: "life", label: "生活常识", description: "让日常，多一点从容", children: [
    { id: "relationships", label: "人际交往" },
    { id: "travel", label: "旅行避坑" },
    { id: "consumption", label: "生活消费" },
    { id: "health", label: "健康科普" },
  ] },
  { id: "professional", label: "专业通识", description: "看懂现象背后的原理", children: [
    { id: "science", label: "科学原理" },
    { id: "law", label: "法律常识" },
    { id: "economics", label: "经济通识" },
    { id: "thinking", label: "学术思维" },
  ] },
] as const;

export const zones = [
  { id: "ai", label: "AI 前沿", description: "理解智能，也理解它的边界" },
  { id: "defense", label: "军事防务", description: "从基本概念，理解防务议题" },
  { id: "context", label: "热点背景", description: "新闻之外，补一块背景知识" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type SubcategoryId = (typeof categories)[number]["children"][number]["id"];
export type ZoneId = (typeof zones)[number]["id"];
export type TopicId = "all" | CategoryId | SubcategoryId | ZoneId;

export function topicLabel(id: TopicId): string {
  if (id === "all") return "全部见识";
  return [...categories, ...categories.flatMap((c) => [...c.children]), ...zones]
    .find((item) => item.id === id)?.label ?? "全部见识";
}
