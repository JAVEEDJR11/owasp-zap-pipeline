const { chromium } = require('playwright');

(async () => {

    const browser = await chromium.launch({

        headless: true,

        proxy: {
            server: 'http://localhost:8080'
        }

    });

    const page = await browser.newPage();

    await page.goto("http://localhost:3000");

    await page.locator("#navbarAccount").click();

    await page.locator("#navbarLoginButton").click();

    await page.locator("#email").fill(process.env.APP_USERNAME);

    await page.locator("#password").fill(process.env.APP_PASSWORD);

    await page.locator("#loginButton").click();

    await page.waitForTimeout(5000);

    await browser.close();

})();
