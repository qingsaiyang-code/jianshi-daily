import type { KnowledgeCard } from "./knowledge";
import { categoryLabel } from "./knowledge";

function drawWrapped(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  let line = "";
  for (const character of text) {
    if (context.measureText(line + character).width > maxWidth && line) {
      context.fillText(line, x, y);
      line = character;
      y += lineHeight;
    } else line += character;
  }
  if (line) context.fillText(line, x, y);
  return y + lineHeight;
}

/** 纯浏览器生成，不上传用户数据；toBlob 避免庞大的 base64 URL。 */
export async function downloadPoster(card: KnowledgeCard, url: string): Promise<void> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法生成海报，请复制链接分享。");
  context.fillStyle = "#f1f5ff";
  context.fillRect(0, 0, 1080, 1440);
  context.fillStyle = "#3059d9";
  context.fillRect(0, 0, 1080, 16);
  context.font = 'bold 50px "Microsoft YaHei", sans-serif';
  context.fillText("见识", 80, 122);
  context.font = '25px "Microsoft YaHei", sans-serif';
  context.fillStyle = "#687892";
  context.fillText("每天多懂一点", 205, 118);
  context.fillText(`示例归档 ${card.archiveDate}  /  ${categoryLabel(card)}`, 80, 193);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.roundRect(54, 240, 972, 952, 24);
  context.fill();
  context.fillStyle = "#192944";
  context.font = 'bold 54px "Microsoft YaHei", sans-serif';
  let y = drawWrapped(context, card.title, 100, 335, 880, 80);
  y += 34;
  context.fillStyle = "#43526c";
  context.font = '32px "Microsoft YaHei", sans-serif';
  // 海报展示关键要点，完整内容通过链接阅读。
  y = drawWrapped(context, card.summary.slice(0, 260) + (card.summary.length > 260 ? "…" : ""), 100, y, 880, 54);
  context.fillStyle = "#3059d9";
  context.font = 'bold 31px "Microsoft YaHei", sans-serif';
  drawWrapped(context, `记住这一点：${card.takeaway.slice(0, 76)}`, 100, y + 32, 880, 48);
  context.font = '24px "Microsoft YaHei", sans-serif';
  context.fillStyle = "#687892";
  context.fillText(`来源：${card.sources[0]?.name ?? "见识知识库"}`, 80, 1254);
  context.fillText("打开链接，读完整见识", 80, 1312);
  context.font = "20px sans-serif";
  drawWrapped(context, url, 80, 1352, 920, 26);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("海报生成失败，请重试。")), "image/png"));
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = `jianshi-${card.id}.png`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
