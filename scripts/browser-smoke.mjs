import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const routes = [
  "/", "/shop", "/product/1", "/login", "/signup", "/account", "/orders",
  "/cart", "/checkout", "/admin", "/admin/products", "/admin/orders",
  "/admin/users", "/admin/categories"
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 }
];

const browser = await chromium.launch({ headless: true });
const failures = [];

for (const viewport of viewports) {
  for (const route of routes) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push("pageerror: " + error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push("console: " + message.text());
    });

    try {
      await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(1500);

      const snapshot = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        unexpectedError: document.body.innerText.includes("VANTA hit an unexpected UI error.")
      }));

      if (snapshot.unexpectedError) throw new Error("unexpected application error boundary rendered");
      if (snapshot.width > snapshot.viewport + 2) throw new Error(`horizontal overflow: ${snapshot.width}px > ${snapshot.viewport}px`);
      if ((await page.locator("header").count()) !== 1) throw new Error("site header missing");
      if ((await page.locator("footer").count()) !== 1) throw new Error("site footer missing");
      if (snapshot.lang !== "en" || snapshot.dir !== "ltr") throw new Error("initial EN/LTR state invalid");

      const languageButton = page.locator('button[aria-label="العربية"]');
      if (await languageButton.count()) {
        await languageButton.click();
        await page.waitForTimeout(900);
        const ar = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
        if (ar.lang !== "ar" || ar.dir !== "rtl") throw new Error("Arabic/RTL transition failed");

        const englishButton = page.locator('button[aria-label="English"]');
        if (!(await englishButton.count())) throw new Error("English switch control missing after RTL transition");
        await englishButton.click();
        await page.waitForTimeout(900);
        const en = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
        if (en.lang !== "en" || en.dir !== "ltr") throw new Error("English/LTR transition failed");
      }

      const themeButton = page.locator('button[aria-label="Theme"]');
      if (!(await themeButton.count())) throw new Error("theme control missing");
      await themeButton.click();
      await page.waitForTimeout(700);
      const dark = await page.evaluate(() => document.documentElement.dataset.theme);
      if (dark !== "dark") throw new Error("dark theme transition failed");
      await themeButton.click();
      await page.waitForTimeout(700);
      const light = await page.evaluate(() => document.documentElement.dataset.theme);
      if (light !== "light") throw new Error("light theme transition failed");

      if (route === "/") {
        const searchButton = page.locator('button[aria-label="Search"]');
        await searchButton.click();
        await page.waitForTimeout(250);
        if ((await page.locator(".search-panel").count()) !== 1) throw new Error("search overlay did not open");
        await page.keyboard.press("Escape");
        await page.waitForTimeout(250);
        if ((await page.locator(".search-panel").count()) !== 0) throw new Error("search overlay did not close");
      }

      if (viewport.name === "mobile" && route === "/") {
        await page.locator('button[aria-label="Menu"]').click();
        await page.waitForTimeout(250);
        if ((await page.locator(".mobile-drawer").count()) !== 1) throw new Error("mobile menu did not open");
        await page.keyboard.press("Escape");
        await page.waitForTimeout(250);
        if ((await page.locator(".mobile-drawer").count()) !== 0) throw new Error("mobile menu did not close with Escape");
      }

      if (errors.length) throw new Error(errors.join(" | "));
      console.log(`PASS ${viewport.name} ${route}`);
    } catch (error) {
      failures.push(`${viewport.name} ${route}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`FAIL ${viewport.name} ${route}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await page.close();
    }
  }
}

await browser.close();
if (failures.length) {
  console.error("\nBrowser smoke failures:");
  for (const failure of failures) console.error(" - " + failure);
  process.exit(1);
}
console.log(`\nBrowser smoke passed: ${routes.length * viewports.length} route/viewport combinations.`);
