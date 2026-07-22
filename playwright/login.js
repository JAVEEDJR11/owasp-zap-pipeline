const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  // Open Juice Shop
  await page.goto('https://demo.owasp-juice.shop', {
    waitUntil: 'networkidle'
  });

  // Dismiss welcome dialog if it appears
  try {
    await page.getByRole('button', { name: /dismiss/i }).click({ timeout: 5000 });
  } catch (e) {
    console.log("No welcome dialog");
  }

  // Open Account menu
  await page.getByRole('button', { name: /account/i }).click();

  // Click Login
  await page.getByRole('menuitem', { name: /login/i }).click();

  // Enter Email
  await page.getByLabel(/email/i).fill(process.env.APP_USERNAME);

  // Enter Password
  await page.getByLabel(/password/i).fill(process.env.APP_PASSWORD);

  // Click Login
  await page.getByRole('button', { name: /^log in$/i }).click();

  // Wait for login
  await page.waitForLoadState('networkidle');

  // Verify login
  await page.screenshot({
    path: 'juice-shop-login.png',
    fullPage: true
  });

  console.log("Login Successful");

  await browser.close();
})();
