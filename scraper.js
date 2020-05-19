require('dotenv').config();
const fs = require('fs').promises;
const {Builder, By, Key, until} = require('selenium-webdriver');

(async () => {
  let accInfo = {};
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://www.nelnet.com');
    const username = await driver.wait(until.elementLocated(By.id('username')));
    await driver.wait(until.elementIsEnabled(username), 30000, 'Timed out on username', 3000);
    await username.sendKeys(process.env.NELNET_USER, Key.RETURN);
    const password = await driver.wait(until.elementLocated(By.id('Password')), 30000, 'Timed out on password', 3000);
    await password.sendKeys(process.env.NELNET_PASS, Key.RETURN);
    await driver.wait(until.elementLocated(By.css('a[href="/Loan/Details"]')));
    await driver.get('https://www.nelnet.com/Loan/Details');
    await driver.wait(until.elementLocated(By.css('.feature.account-row')));
    const accDetails = await driver.findElement(By.css('.feature.account-row'));
    const detailList = await accDetails.findElements(By.css('.ng-binding.text-xs-right'));
    accInfo.number = await detailList[0].getText();
    accInfo.balance = await detailList[1].getText();
    accInfo.due_date = await detailList[5].getText();
    await fs.writeFile('accInfo.json', JSON.stringify(accInfo));
    await driver.findElement(By.css('#logoutForm > button')).click();
    await driver.wait(until.elementLocated(By.id('username')));
  } finally {
    await driver.quit();
  }
})();
