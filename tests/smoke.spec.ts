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

test("all primary routes survive browser initialization", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `No response for ${route}`).not.toBeNull();
    expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(500);
    await page.waitForTimeout(700);
    await expect(page.locator("body")).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});

test("language transition changes locale and direction after hydration", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);

  await page.getByRole("button", { name: "Language" }).click();
  await page.waitForTimeout(900);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.getByRole("button", { name: "اللغة" }).click();
  await page.waitForTimeout(900);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("theme transition survives hydration", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);

  await page.getByRole("button", { name: "Theme" }).click();
  await page.waitForTimeout(900);
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Theme" }).click();
  await page.waitForTimeout(900);
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("mobile navigation opens, traps the visual flow, and closes cleanly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeHidden();
});
