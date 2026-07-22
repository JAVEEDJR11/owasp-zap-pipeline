const { chromium } = require('playwright');

(async () => {

    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage({

        proxy: {
            server: "http://127.0.0.1:8080"
        }

    });

    await page.goto("https://ess.changepond.com/#/");

    await page.getByRole('textbox', {
        name: 'Employee ID'
    }).fill(process.env.ESS_USERNAME);

    await page.locator('input[type="password"]').fill(process.env.ESS_PASSWORD);

    await page.getByRole('button', {
        name: 'Login'
    }).click();

    await page.waitForURL('**/dashboard');

    await page.screenshot({
        path: 'dashboard.png'
    });

    await browser.close();

})();
