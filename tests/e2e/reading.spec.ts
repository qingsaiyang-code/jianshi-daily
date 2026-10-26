import { test, expect } from "@playwright/test";

test("收藏刷新保留，收藏列表支持取消", async ({ page }) => {
  await page.goto("/");
  const saveButton = page.getByRole("button", { name: "收藏：冰饮杯外的水珠，从哪里来？", exact: true });
  await saveButton.click();
  await expect(saveButton).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(saveButton).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /我的收藏/ }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await saveButton.click();
  await expect(page.getByRole("heading", { name: "口袋里，还没有见识" })).toBeVisible();
});

test("不感兴趣刷新保留，能够显式恢复", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "不感兴趣：冰饮杯外的水珠，从哪里来？", exact: true }).click();
  await expect(page.locator('[data-card-id="seed-01"]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-card-id="seed-01"]')).toHaveCount(0);
  await page.getByRole("button", { name: "恢复已隐藏的 1 条" }).click();
  await expect(page.locator('[data-card-id="seed-01"]')).toBeVisible();
});

test("搜索覆盖历史归档；二级分类、日期与空态可用", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "搜索知识" }).fill("光年");
  await expect(page.getByLabel("归档日期")).toHaveValue("all");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByLabel("归档日期").selectOption("2026-10-25");
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByRole("button", { name: "浏览全部见识" }).click();
  await expect(page.locator("article")).toHaveCount(33);
  await page.getByRole("button", { name: "学术思维", exact: true }).click();
  await expect(page.locator("article").first()).toBeVisible();
  await page.getByRole("button", { name: "人际交往", exact: true }).click();
  await expect(page.getByRole("heading", { name: "换个方向，也许就有答案" })).toBeVisible();
});

test("分享深链接可独立打开，Escape 可关闭", async ({ page }) => {
  await page.goto("/?card=seed-ai-reliability");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "AI 说得很像真的，就一定对吗？" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link", { name: /NIST/ })).toHaveAttribute("href", /nist\.gov/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL("/");
});

test("分享复制的是真实深链接，海报下载为 PNG", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "分享：冰饮杯外的水珠，从哪里来？", exact: true }).click();
  await page.getByRole("button", { name: "复制链接", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("http://127.0.0.1:3000/?card=seed-01");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载海报" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("jianshi-seed-01.png");
  expect(await download.failure()).toBeNull();
  await download.saveAs(test.info().outputPath("poster.png"));
});

test("不把未配置的联网问答伪装成成功", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "联网问答", exact: true }).click();
  await expect(page.getByRole("region", { name: "联网问答状态" })).toBeVisible();
  const response = await request.post("/api/search", { data: { query: "测试" } });
  expect(response.status()).toBe(503);
  expect((await response.json()).code).toBe("SEARCH_NOT_CONFIGURED");
});

test("损坏的本地偏好不会让页面崩溃", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jianshi-daily:preferences:v1", "invalid-json"));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把世界看明白一点。" })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(13);
});

test("存储被禁用时不误报收藏成功", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); }; });
  await page.goto("/");
  const saveButton = page.getByRole("button", { name: "收藏：冰饮杯外的水珠，从哪里来？", exact: true });
  await saveButton.click();
  await expect(page.getByRole("status")).toContainText("浏览器无法保存收藏");
  await expect(saveButton).toHaveAttribute("aria-pressed", "false");
});

for (const width of [360, 390, 768, 1440]) {
  test(`${width}px 屏幕无水平溢出，导航与知识卡片可用`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator("article").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width <= 760) {
      await page.getByRole("button", { name: "打开导航" }).click();
      await page.getByRole("button", { name: "人际交往", exact: true }).click();
      await expect(page.getByRole("heading", { name: "换个方向，也许就有答案" })).toBeVisible();
      await page.getByRole("button", { name: "全部见识", exact: true }).click();
    }
    await page.screenshot({ path: test.info().outputPath(`homepage-${width}.png`), fullPage: true });
    await page.screenshot({ path: test.info().outputPath(`viewport-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
