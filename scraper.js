require('dotenv').config();
const fs = require('fs').promises;
const {Builder, By, Key, until} = require('selenium-webdriver');

const validate = ({number, balance, due_date}) => {
  return new Promise(function(resolve, reject) {
    /^\w\d{9}/.exec(number) || reject('Invalid account number');
    /^\$.+\.\d\d$/.exec(balance) || reject('Invalid balance');
    /\d{2}\/\d{2}\/\d{4}/.exec(due_date) || reject('Invalid due date')
    resolve()
  });
};

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
    accInfo.obtained = new Date()
    await validate(accInfo)
    await fs.writeFile('accInfo.json', JSON.stringify(accInfo));
    await driver.findElement(By.css('#logoutForm > button')).click();
    await driver.wait(until.elementLocated(By.id('username')));
  } catch (err) {
    console.log(err);
  } finally {
    await driver.quit();
  }
})();
