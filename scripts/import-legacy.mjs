import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// 显式一次性导入，不访问云端。默认输出独立文件，避免覆盖现有知识库。
const sourcePath = process.argv[2];
const outputPath = process.argv[3] ?? "data/imported-legacy.json";
if (!sourcePath) throw new Error("用法：node scripts/import-legacy.mjs <旧版初始知识 JSON> [输出 JSON]");
const oldEntries = JSON.parse(await readFile(sourcePath, "utf8"));
if (!Array.isArray(oldEntries)) throw new Error("源文件必须是知识数组");

const categoryMap = {
  life: ["life", "consumption"],
  science: ["professional", "science"],
  mind: ["professional", "thinking"],
  digital: ["life", "consumption"],
  world: ["professional", "science"],
  data: ["professional", "thinking"],
};

const entries = oldEntries.map((entry, index) => {
  const mapped = categoryMap[entry.category];
  if (!mapped || !entry.title || !Array.isArray(entry.body) || !entry.sources?.length) throw new Error(`第 ${index + 1} 条结构不完整`);
  const [category, defaultSubcategory] = mapped;
  const subcategory = index === 1 ? "travel" : index === 14 || index === 26 ? "economics" : defaultSubcategory;
  return {
    id: `seed-${String(index + 1).padStart(2, "0")}`,
    title: entry.title,
    summary: [entry.summary, ...entry.body, entry.application].join("\n\n"),
    takeaway: entry.takeaway,
    category,
    subcategory,
    archiveDate: ["2026-10-26", "2026-10-25", "2026-10-24"][index % 3],
    tags: [({ life: "日常原理", science: "自然科学", mind: "思考与学习", digital: "数字生活", world: "世界与文化", data: "看懂数据" })[entry.category], "实用通识"],
    sources: entry.sources,
    contentKind: "seed",
  };
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(entries, null, 2) + "\n", { encoding: "utf8", flag: "wx" });
console.log(`已导入 ${entries.length} 条种子知识：${outputPath}。日期为演示归档，不是新闻发布日期。`);
