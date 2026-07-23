const { chromium } = require('playwright');

(async () => {
  let browser;

  try {
    console.log("Launching browser through ZAP Proxy...");

    browser = await chromium.launch({
      headless: false, // Set true in GitHub Actions
      proxy: {
        server: "http://127.0.0.1:8090"
      }
    });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: {
        width: 1440,
        height: 900
      }
    });

    const page = await context.newPage();

    console.log("Opening Juice Shop...");

    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle",
      timeout: 60000
    });

    // Give Angular time to render
    await page.waitForTimeout(3000);

    // Close Welcome Banner
    try {
      await page.locator("button[aria-label='Close Welcome Banner']").click();
    } catch {}

    // Close Cookie Banner
    try {
      await page.locator("button[aria-label='dismiss cookie message']").click();
    } catch {}

    console.log("Opening Login page...");

    await page.click("#navbarAccount");
    await page.click("#navbarLoginButton");

    console.log("Entering credentials...");

    await page.fill("#email", process.env.APP_USERNAME);
    await page.fill("#password", process.env.APP_PASSWORD);

    console.log("Logging in...");

    await page.click("#loginButton");

    await page.waitForTimeout(5000);

    console.log("Login successful.");

    const urls = [
      "http://localhost:3000/#/profile",
      "http://localhost:3000/#/wallet",
      "http://localhost:3000/#/order-history",
      "http://localhost:3000/#/basket",
      "http://localhost:3000/#/contact",
      "http://localhost:3000/#/photo-wall",
      "http://localhost:3000/#/search?q=apple",
      "http://localhost:3000/#/search?q=banana",
      "http://localhost:3000/#/search?q=juice"
    ];

    for (const url of urls) {
      console.log(`Opening ${url}`);

      try {
        await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 30000
        });

        await page.waitForTimeout(2000);

      } catch (e) {
        console.log(`Could not open ${url}`);
      }
    }

    console.log("Taking Screenshot...");

    await page.screenshot({
      path: "juice-shop-login.png",
      fullPage: true
    });

    console.log("Waiting for ZAP to record traffic...");

    await page.waitForTimeout(10000);

    console.log("Completed Successfully.");

  } catch (err) {

    console.error(err);

    try {
      const page = browser.contexts()[0].pages()[0];

      await page.screenshot({
        path: "error.png",
        fullPage: true
      });

    } catch {}

    process.exit(1);

  } finally {

    if (browser)
      await browser.close();

  }

})();
