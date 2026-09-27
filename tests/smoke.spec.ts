import {test,expect} from "@playwright/test";

const routes=["/","/shop","/login","/signup","/account","/orders","/cart","/checkout","/admin","/admin/products","/admin/orders","/admin/users","/admin/categories","/product/1"];

test.describe("VANTA hydrated route stability",()=>{
  for(const route of routes){
    test(`renders ${route} without a browser exception`,async({page})=>{
      const pageErrors:Error[]=[];
      page.on("pageerror",e=>pageErrors.push(e));
      await page.goto(route,{waitUntil:"domcontentloaded"});
      await expect(page.locator("body")).toBeVisible();
      await page.waitForTimeout(1200);
      expect(pageErrors,route+" produced page errors").toEqual([]);
    });
  }

  test("navigation survives client navigation, back, and forward",async({page})=>{
    const errors:Error[]=[]; page.on("pageerror",e=>errors.push(e));
    await page.goto("/",{waitUntil:"domcontentloaded"});
    await page.getByRole("link",{name:/Shop/i}).first().click();
    await expect(page).toHaveURL(/\/shop/);
    await page.goBack(); await expect(page).toHaveURL(/\/$/);
    await page.goForward(); await expect(page).toHaveURL(/\/shop/);
    await page.waitForTimeout(700);
    expect(errors).toEqual([]);
  });

  test("language and theme transitions update document state in one click",async({page})=>{
    await page.goto("/",{waitUntil:"domcontentloaded"});
    const language=page.getByTestId("language-switch");
    const theme=page.getByTestId("theme-switch");
    await language.click();
    await page.waitForFunction(()=>document.documentElement.lang==="ar"&&document.documentElement.dir==="rtl");
    await language.click();
    await page.waitForFunction(()=>document.documentElement.lang==="en"&&document.documentElement.dir==="ltr");
    const before=await page.locator("html").getAttribute("data-theme");
    await theme.click();
    await page.waitForFunction(prev=>document.documentElement.dataset.theme!==prev,before);
    await theme.click();
    await page.waitForTimeout(900);
    const after=await page.locator("html").getAttribute("data-theme");
    expect(after).toBe(before);
  });

  test("mobile menu opens and closes accessibly",async({browser})=>{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const page=await context.newPage();
    const errors:Error[]=[]; page.on("pageerror",e=>errors.push(e));
    await page.goto("/",{waitUntil:"domcontentloaded"});
    await page.getByTestId("mobile-menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(errors).toEqual([]);
    await context.close();
  });
});
