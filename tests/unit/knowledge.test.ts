import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { beijingDate, filterKnowledge, getArchiveDates, shareUrl, type Filters, type KnowledgeCard } from "../../src/lib/knowledge.ts";
import { categories, zones } from "../../src/lib/taxonomy.ts";
import { hideCard, parsePreferences, toggleSaved } from "../../src/lib/preferences.ts";

const entries: KnowledgeCard[] = [
  ...JSON.parse(readFileSync(new URL("../../data/knowledge.json", import.meta.url), "utf8")),
  ...JSON.parse(readFileSync(new URL("../../data/special-seeds.json", import.meta.url), "utf8")),
];
const base: Filters = { query: "", topic: "all", date: "all", savedOnly: false, saved: [], hidden: [] };

test("种子知识具有唯一 ID、有效层级、示例日期和可追溯 HTTPS 来源", () => {
  assert.ok(entries.length >= 30);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  for (const entry of entries) {
    assert.match(entry.id, /^[a-z0-9-]+$/u);
    const category = categories.find((item) => item.id === entry.category);
    assert.ok(category, entry.title);
    assert.ok(category.children.some((child) => child.id === entry.subcategory), entry.title);
    assert.ok(!entry.zone || zones.some((zone) => zone.id === entry.zone));
    assert.match(entry.archiveDate, /^\d{4}-\d{2}-\d{2}$/u);
    assert.equal(new Date(`${entry.archiveDate}T00:00:00Z`).toISOString().slice(0, 10), entry.archiveDate);
    assert.ok(entry.title.length > 0 && entry.summary.length > 0 && entry.takeaway.length > 0);
    assert.equal(entry.contentKind, "seed");
    assert.ok(entry.sources.length > 0 && entry.tags.length > 0);
    for (const source of entry.sources) {
      assert.equal(new URL(source.url).protocol, "https:");
      assert.ok(source.name.length > 0);
    }
  }
});

test("新增专区示例遵守 200 至 300 字符的摘要契约", () => {
  for (const entry of entries.filter((entry) => entry.zone)) {
    const length = [...entry.summary.replace(/\s/gu, "")].length;
    assert.ok(length >= 200 && length <= 300, `${entry.id}: ${length}`);
  }
});

test("全文检索覆盖正文；分词取交集，忽略大小写及首尾空白", () => {
  const matches = filterKnowledge(entries, { ...base, query: "  ai 引用  " });
  assert.ok(matches.some((entry) => entry.id === "seed-ai-reliability"));
  assert.equal(filterKnowledge(entries, { ...base, query: "不存在的独角兽测试词" }).length, 0);
});

test("一级、二级和专区筛选使用各自的分类字段", () => {
  for (const topic of ["life", "thinking", "ai"] as const) {
    const matches = filterKnowledge(entries, { ...base, topic });
    assert.ok(matches.length > 0);
    assert.ok(matches.every((entry) => [entry.category, entry.subcategory, entry.zone].includes(topic)));
  }
});

test("日期、收藏和隐藏条件共同生效，隐藏优先", () => {
  const target = entries[0];
  const filters = { ...base, date: target.archiveDate, savedOnly: true, saved: [target.id] };
  assert.deepEqual(filterKnowledge(entries, filters).map((entry) => entry.id), [target.id]);
  assert.equal(filterKnowledge(entries, { ...filters, hidden: [target.id] }).length, 0);
  assert.equal(filterKnowledge(entries, { ...filters, date: "2000-01-01" }).length, 0);
});

test("归档去重并按日期倒序；北京时间在 UTC 16 点跨日", () => {
  const dates = getArchiveDates(entries);
  assert.deepEqual(dates, [...new Set(dates)].sort().reverse());
  assert.equal(beijingDate(new Date("2026-10-25T15:59:59Z")), "2026-10-25");
  assert.equal(beijingDate(new Date("2026-10-25T16:00:00Z")), "2026-10-26");
});

test("损坏、未知版本和异常存储字段恢复为安全偏好", () => {
  assert.deepEqual(parsePreferences("{broken"), { version: 1, saved: [], hidden: [] });
  assert.deepEqual(parsePreferences('{"version":2,"saved":["x"]}'), { version: 1, saved: [], hidden: [] });
  assert.deepEqual(parsePreferences('{"version":1,"saved":["x","x",4,null],"hidden":false}'), { version: 1, saved: ["x"], hidden: [] });
});

test("收藏可逆；重复隐藏幂等，其他偏好保持", () => {
  const initial = parsePreferences(null);
  const saved = toggleSaved(initial, "seed-01");
  assert.deepEqual(saved.saved, ["seed-01"]);
  assert.deepEqual(toggleSaved(saved, "seed-01").saved, []);
  const hidden = hideCard(hideCard(saved, "seed-02"), "seed-02");
  assert.deepEqual(hidden.hidden, ["seed-02"]);
  assert.deepEqual(hidden.saved, ["seed-01"]);
  assert.deepEqual(initial.saved, []);
});

test("分享链接只包含稳定卡片 ID，不带本地筛选或偏好", () => {
  assert.equal(shareUrl("https://example.com/?private=1#test", "seed-01"), "https://example.com/?card=seed-01");
});
