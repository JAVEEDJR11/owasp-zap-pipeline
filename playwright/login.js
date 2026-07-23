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
      ignoreHTTPSErrors: true,
      viewport: {
        width: 1440,
        height: 900
      }
    });

    const page = await context.newPage();

    console.log("Opening Juice Shop...");

    await page.goto("https://demo.owasp-juice.shop", {
      waitUntil: "domcontentloaded",
      timeout: 120000
    });

    // Wait for Angular to finish rendering
    await page.waitForTimeout(8000);

    // Close welcome banner
    try {
      await page.locator("button[aria-label='Close Welcome Banner']").click({
        timeout: 5000
      });
    } catch {}

    // Close cookie banner
    try {
      await page.locator("button[aria-label='dismiss cookie message']").click({
        timeout: 5000
      });
    } catch {}

    console.log("Opening Login Page...");

    await page.waitForSelector("#navbarAccount", {
      timeout: 30000
    });

    await page.click("#navbarAccount");

    await page.waitForSelector("#navbarLoginButton");

    await page.click("#navbarLoginButton");

    console.log("Entering credentials...");

    await page.fill("#email", process.env.APP_USERNAME);

    await page.fill("#password", process.env.APP_PASSWORD);

    console.log("Logging in...");

    await page.click("#loginButton");

    await page.waitForTimeout(6000);

    console.log("Browsing authenticated pages...");

    const urls = [
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

    for (const url of urls) {
      console.log("Opening:", url);

      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 60000
        });

        await page.waitForTimeout(2500);

      } catch (e) {
        console.log("Skipped:", url);
      }
    }

    console.log("Scrolling page...");

    await page.evaluate(async () => {
      await new Promise(resolve => {
        let total = 0;
        const distance = 500;

        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          total += distance;

          if (total >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    console.log("Taking screenshot...");

    await page.screenshot({
      path: "juice-shop-login.png",
      fullPage: true
    });

    console.log("Waiting for ZAP to capture traffic...");

    await page.waitForTimeout(15000);

    console.log("Playwright completed successfully.");

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
