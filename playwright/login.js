const { chromium } = require('playwright');

(async () => {
    let browser;

    try {

        console.log("Launching Chromium through ZAP Proxy...");

        browser = await chromium.launch({
            headless: true,
            proxy: {
                server: "http://localhost:8080"
            }
        });

        const context = await browser.newContext({
            viewport: {
                width: 1440,
                height: 900
            }
        });

        const page = await context.newPage();

        console.log("Opening Juice Shop...");

        await page.goto("http://localhost:3000", {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        // Wait for page to settle
        await page.waitForTimeout(5000);

        // Close Welcome Banner
        try {
            await page.locator('button[aria-label="Close Welcome Banner"]').click({
                timeout: 5000
            });
            console.log("Welcome banner closed.");
        } catch {
            console.log("Welcome banner not found.");
        }

        // Close Cookie Banner
        try {
            await page.locator('a[aria-label="dismiss cookie message"]').click({
                timeout: 5000
            });
            console.log("Cookie banner dismissed.");
        } catch {
            console.log("Cookie banner not found.");
        }

        console.log("Opening Login Page...");

        await page.locator("#navbarAccount").click();
        await page.locator("#navbarLoginButton").click();

        console.log("Entering credentials...");

        await page.locator("#email").fill(process.env.APP_USERNAME);
        await page.locator("#password").fill(process.env.APP_PASSWORD);

        console.log("Logging in...");

        await page.locator("#loginButton").click();

        // Wait for login to complete
        await page.waitForTimeout(5000);

        // Verify login
        await page.waitForSelector("#navbarAccount", {
            timeout: 15000
        });

        console.log("======================================");
        console.log("Authentication Successful");
        console.log("Current URL:", page.url());
        console.log("======================================");

        // Save screenshot for GitHub Actions artifact
        await page.screenshot({
            path: "login-success.png",
            fullPage: true
        });

        console.log("Screenshot saved.");

        await browser.close();

    } catch (err) {

        console.error("======================================");
        console.error("Playwright Login Failed");
        console.error(err);
        console.error("======================================");

        if (browser) {
            await browser.close();
        }

        process.exit(1);
    }
})();
