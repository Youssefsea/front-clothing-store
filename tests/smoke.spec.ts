import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/shop",
  "/product/1",
  "/login",
  "/signup",
  "/account",
  "/orders",
  "/cart",
  "/checkout",
  "/admin",
  "/admin/products",
  "/admin/orders",
  "/admin/users",
  "/admin/categories"
];

test("all primary routes survive browser hydration", async ({ page }) => {
  test.setTimeout(60000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "commit", timeout: 10000 });
    expect(response, `No response for ${route}`).not.toBeNull();
    expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(500);
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});

test("language ripple changes locale and direction after hydration", async ({ page }) => {
  test.setTimeout(15000);
  await page.goto("/", { waitUntil: "commit", timeout: 10000 });
  await page.waitForTimeout(500);

  const switcher = page.getByRole("button", { name: "Language" });
  await expect(switcher).toBeVisible();
  await switcher.click();
  await page.waitForTimeout(800);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  const arabicSwitcher = page.getByRole("button", { name: "اللغة" });
  await expect(arabicSwitcher).toBeVisible();
  await arabicSwitcher.click();
  await page.waitForTimeout(800);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("theme ripple changes theme after hydration", async ({ page }) => {
  test.setTimeout(15000);
  await page.goto("/", { waitUntil: "commit", timeout: 10000 });
  await page.waitForTimeout(500);

  const switcher = page.getByRole("button", { name: "Theme" });
  await expect(switcher).toBeVisible();
  await switcher.click();
  await page.waitForTimeout(800);
  await expect(page.locator("html")).toHaveClass(/dark/);

  await switcher.click();
  await page.waitForTimeout(800);
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("mobile navigation opens and closes cleanly", async ({ page }) => {
  test.setTimeout(15000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "commit", timeout: 10000 });
  await page.waitForTimeout(500);

  const openMenu = page.getByRole("button", { name: "Open menu" });
  await expect(openMenu).toBeVisible();
  await openMenu.click();
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeHidden();
});
