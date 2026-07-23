const { chromium } = require('playwright');

(async () => {

  let browser;

  try {

    console.log("Launching browser through ZAP Proxy...");

    browser = await chromium.launch({
      headless: true,
      proxy: {
        server: "http://127.0.0.1:8090"
      }
    });

    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 900
      },
      ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    console.log("Opening Juice Shop...");

    await page.goto("https://demo.owasp-juice.shop", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    // Close Welcome Banner
    try {
      await page.locator("button[aria-label='Close Welcome Banner']").click();
    } catch {}

    // Close Cookie Banner
    try {
      await page.locator("button[aria-label='dismiss cookie message']").click();
    } catch {}

    console.log("Opening Login Page...");

    await page.click("#navbarAccount");
    await page.click("#navbarLoginButton");

    console.log("Logging in...");

    await page.fill("#email", process.env.APP_USERNAME);
    await page.fill("#password", process.env.APP_PASSWORD);

    await page.click("#loginButton");

    await page.waitForTimeout(5000);

    console.log("Browsing authenticated pages...");

    const pages = [
      "https://demo.owasp-juice.shop/#/profile",
      "https://demo.owasp-juice.shop/#/wallet",
      "https://demo.owasp-juice.shop/#/order-history",
      "https://demo.owasp-juice.shop/#/basket",
      "https://demo.owasp-juice.shop/#/contact",
      "https://demo.owasp-juice.shop/#/photo-wall",
      "https://demo.owasp-juice.shop/#/search?q=apple",
      "https://demo.owasp-juice.shop/#/search?q=banana",
      "https://demo.owasp-juice.shop/#/search?q=juice"
    ];

    for (const url of pages) {

      console.log(`Opening ${url}`);

      try {

        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000
        });

        await page.waitForTimeout(2000);

      } catch {}

    }

    await page.screenshot({
      path: "juice-shop-login.png",
      fullPage: true
    });

    console.log("Waiting for ZAP to capture traffic...");

    await page.waitForTimeout(15000);

    console.log("Completed.");

  }

  catch (err) {

    console.error(err);

    try {

      const page = browser.contexts()[0].pages()[0];

      await page.screenshot({
        path: "error.png",
        fullPage: true
      });

    } catch {}

    process.exit(1);

  }

  finally {

    if (browser)
      await browser.close();

  }

})();
