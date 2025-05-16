// test.spec.js
const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");

describe("Démo de test Selenium avec rapport", function () {
  let driver;

  // On augmente le timeout de Mocha (par défaut 2s),
  // car les interactions Selenium peuvent prendre plus de temps
  this.timeout(20000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });



  it("Devrait ouvrir la page et afficher un titre", async () => {
    // 1. Aller sur l’app Angular (ou autre) sur http://localhost:4200
    await driver.get("http://localhost:4200/list");
    const navForm = await driver.findElement(By.id("formNav"));

    await navForm.click();

    await driver.sleep(1000);

    const taskInput = await driver.findElement(By.id("task"));
    const taskSubmit = await driver.findElement(By.id("taskSubmit"));

    await taskInput.sendKeys("CAFE");
    await taskSubmit.click();

    await driver.sleep(1000);

    const listTask = await driver.findElements(By.id("listTask"));
    const firstLabel = await listTask[0].findElement(By.css("li"));
    const labelText = await firstLabel.getText();

    console.log("task attendu : CAFE. Task recu : ", labelText)
  });

  after(async () => {
    await driver.quit();
  });
});
