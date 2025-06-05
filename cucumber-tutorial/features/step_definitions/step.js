import { expect } from "chai";
import { Builder, By, until } from "selenium-webdriver";
import { When, Then, Given, setDefaultTimeout, Before, After } from "@cucumber/cucumber";

setDefaultTimeout(60 * 1000);

let driver;

Before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
});

After(async function () {
    if (driver) {
        try {
            await driver.getSession();
            await driver.quit();
        } catch (e) {
            if (e.name === 'NoSuchSessionError') {
                console.log("Session already closed or invalid.");
            } else {
                console.error("Error during WebDriver quit:", e);
            }
        }
    }
});

// Helper functions
const waitForElement = async (locator, timeout = 15000) => {
    return await driver.wait(until.elementLocated(locator), timeout);
};

const waitForElementVisibility = async (locator, timeout = 15000) => {
    const element = await waitForElement(locator, timeout);
    return await driver.wait(until.elementIsVisible(element), timeout);
};

const performLogin = async (username, password) => {
    const usernameField = await waitForElement(By.id('user-name'));
    await usernameField.clear();
    await usernameField.sendKeys(username);

    const passwordField = await waitForElement(By.id('password'));
    await passwordField.clear();
    await passwordField.sendKeys(password);

    const loginButton = await waitForElement(By.id('login-button'));
    await loginButton.click();
};

// Step Definitions
Given('the user is on the login page', async function () {
    await driver.get('https://www.saucedemo.com/');
    await waitForElementVisibility(By.id('user-name'));
});

When('the user attempts login with invalid credentials', async function () {
    await performLogin('invalid_user', 'wrong_password');
});

Then('the user should see a failed message', async function () {
    const errorElement = await waitForElementVisibility(By.css('[data-test="error"]'));
    expect(await errorElement.isDisplayed()).to.be.true;
});

Given('the user logs in successfully', async function () {
    await performLogin('standard_user', 'secret_sauce');
    await driver.wait(until.urlContains('inventory.html'), 10000);
    await waitForElementVisibility(By.id('inventory_container'));
});

When('the user adds the first item to cart', async function () {
    const addButton = await waitForElementVisibility(By.xpath('(//button[contains(text(),"Add to cart")])[1]'));
    await addButton.click();
});

Then('the item should appear in the cart', async function () {
    const removeButton = await waitForElementVisibility(By.xpath('//button[contains(text(),"Remove")]'), 15000);
    expect(await removeButton.isDisplayed()).to.be.true;
});

Given('the user has an item in the cart', async function () {
    const addButton = await waitForElementVisibility(By.xpath('(//button[contains(text(),"Add to cart")])[1]'));
    await addButton.click();
});

When('the user removes the item from cart', async function () {
    const removeButton = await waitForElementVisibility(By.xpath('//button[contains(text(),"Remove")]'), 15000);
    await removeButton.click();
});

Then('the item should no longer appear in the cart', async function () {
    const addButton = await waitForElementVisibility(By.xpath('(//button[contains(text(),"Add to cart")])[1]'), 15000);
    expect(await addButton.isDisplayed()).to.be.true;
});

When('the user sorts items by {string}', async function (option) {
    const dropdown = await waitForElementVisibility(By.className('product_sort_container'));
    await dropdown.click();
    const sortOption = await waitForElementVisibility(By.xpath(`//option[text()='${option}']`));
    await sortOption.click();
});

Then('the first item should be the cheapest one', async function () {
    const priceElements = await driver.findElements(By.className('inventory_item_price'));
    const prices = await Promise.all(priceElements.map(async (element) => {
        const text = await element.getText();
        return parseFloat(text.replace('$', ''));
    }));

    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices[0]).to.equal(sortedPrices[0]);
});

When('the user logs out', async function () {
    await waitForElementVisibility(By.id('shopping_cart_container'), 15000);
    const menuButton = await waitForElementVisibility(By.id('react-burger-menu-btn'), 15000);
    await menuButton.click();
    const logout = await waitForElementVisibility(By.id('logout_sidebar_link'), 15000);
    await logout.click();
});

Then('the user should be redirected to the login page', async function () {
    const loginButton = await driver.wait(
        until.elementLocated(By.id('login-button')),
        15000,
        'Login button did not appear after logout'
    );
    await driver.wait(until.elementIsVisible(loginButton), 5000);
});