const { chromium } = require('playwright');

(async () => {
  let browser;

  try {
    console.log("Starting browser through OWASP ZAP proxy...");

    browser = await chromium.launch({
      headless: false, // Change to true in GitHub Actions
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

    await page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    // Close Welcome Banner
    try {
      console.log("Closing Welcome Banner...");
      await page.locator("button[aria-label='Close Welcome Banner']").click({
        timeout: 5000
      });
    } catch {
      console.log("Welcome banner not displayed.");
    }

    // Close Cookie Popup
    try {
      console.log("Closing Cookie Popup...");
      await page.locator("button[aria-label='dismiss cookie message']").click({
        timeout: 5000
      });
    } catch {
      console.log("Cookie popup not displayed.");
    }

    console.log("Opening Login page...");

    await page.locator("#navbarAccount").click();
    await page.locator("#navbarLoginButton").click();

    console.log("Entering credentials...");

    await page.fill("#email", process.env.APP_USERNAME);
    await page.fill("#password", process.env.APP_PASSWORD);

    console.log("Logging in...");

    await page.click("#loginButton");

    await page.waitForTimeout(5000);

    console.log("Login successful.");

    // Visit authenticated pages so ZAP can discover them
    const pages = [
      "http://localhost:3000/#/profile",
      "http://localhost:3000/#/wallet",
      "http://localhost:3000/#/order-history",
      "http://localhost:3000/#/basket",
      "http://localhost:3000/#/contact",
      "http://localhost:3000/#/photo-wall",
      "http://localhost:3000/#/search?q=apple",
      "http://localhost:3000/#/search?q=juice",
      "http://localhost:3000/#/search?q=banana"
    ];

    for (const url of pages) {
      console.log(`Visiting ${url}`);

      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000
        });

        await page.waitForTimeout(2500);
      } catch (e) {
        console.log(`Could not load ${url}`);
      }
    }

    console.log("Scrolling pages...");

    await page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        const distance = 500;

        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    await page.waitForTimeout(3000);

    console.log("Taking screenshot...");

    await page.screenshot({
      path: "juice-shop-login.png",
      fullPage: true
    });

    console.log("Authenticated browsing completed.");

    console.log("Waiting 20 seconds for ZAP to finish recording requests...");

    await page.waitForTimeout(20000);

    console.log("Finished.");

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

    if (browser) {
      await browser.close();
    }

  }

})();
