const { chromium } = require('playwright');

(async () => {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });

    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 900
      }
    });

    const page = await context.newPage();

    console.log("Opening Juice Shop...");

    await page.goto("https://demo.owasp-juice.shop", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    // Give Angular a few seconds to render
    await page.waitForTimeout(5000);

    console.log("Closing welcome banner...");

    try {
      await page.locator("button[aria-label='Close Welcome Banner']").click({
        timeout: 5000
      });
    } catch {}

    console.log("Closing cookie popup...");

    try {
      await page.locator("button[aria-label='dismiss cookie message']").click({
        timeout: 5000
      });
    } catch {}

    console.log("Opening Account menu...");

    await page.locator("#navbarAccount").click();

    console.log("Opening Login page...");

    await page.locator("#navbarLoginButton").click();

    console.log("Entering credentials...");

    await page.locator("#email").fill(process.env.APP_USERNAME);

    await page.locator("#password").fill(process.env.APP_PASSWORD);

    console.log("Clicking Login...");

    await page.locator("#loginButton").click();

    // Wait for login to complete
    await page.waitForTimeout(5000);

    console.log("Opening authenticated pages...");

    await page.goto("https://demo.owasp-juice.shop/#/profile");
    await page.waitForTimeout(3000);

    await page.goto("https://demo.owasp-juice.shop/#/wallet");
    await page.waitForTimeout(3000);

    await page.goto("https://demo.owasp-juice.shop/#/order-history");
    await page.waitForTimeout(3000);

    console.log("Taking screenshot...");

    await page.screenshot({
      path: "juice-shop-login.png",
      fullPage: true
    });

    console.log("SUCCESS - Login completed.");
  } catch (err) {
    console.error("ERROR:", err);

    if (browser) {
      const pages = browser.contexts().flatMap(c => c.pages());
      if (pages.length > 0) {
        try {
          await pages[0].screenshot({
            path: "error.png",
            fullPage: true
          });
        } catch {}
      }
    }

    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
