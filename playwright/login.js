const { chromium } = require("playwright");


(async()=>{


const browser = await chromium.launch({
    headless:true
});


const context = await browser.newContext();


const page = await context.newPage();



console.log("Opening Juice Shop");


await page.goto(
    "http://localhost:3000"
);


await page.waitForTimeout(3000);



console.log("Opening Login");


await page.goto(
    "http://localhost:3000/#/login"
);



await page.waitForTimeout(3000);



await page.fill(
    "#email",
    process.env.APP_USERNAME
);



await page.fill(
    "#password",
    process.env.APP_PASSWORD
);



await page.click(
    "#loginButton"
);



await page.waitForTimeout(5000);



console.log("Login Completed");



// Save authentication session

await context.storageState({

    path:"auth.json"

});


console.log("Auth state saved");


await browser.close();


})();
