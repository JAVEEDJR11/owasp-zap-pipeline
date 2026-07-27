const { chromium } = require('playwright');

(async () => {

    const browser = await chromium.launch({

        headless: true,

        proxy: {
            server: 'http://localhost:8080'
        }

    });

    const page = await browser.newPage();

    await page.goto('http://localhost:3000');

    await page.waitForTimeout(3000);

    // Close Welcome Banner

    try{
        await page.locator('button[aria-label="Close Welcome Banner"]').click();
    }catch{}

    // Close Cookie Dialog

    try{
        await page.locator('a[aria-label="dismiss cookie message"]').click();
    }catch{}

    // Login

    await page.locator('#navbarAccount').click();

    await page.locator('#navbarLoginButton').click();

    await page.locator('#email').fill(process.env.APP_USERNAME);

    await page.locator('#password').fill(process.env.APP_PASSWORD);

    await page.locator('#loginButton').click();

    await page.waitForTimeout(5000);

    console.log("Authenticated Successfully");

    await browser.close();

})();
