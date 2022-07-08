const puppeteer = require("puppeteer");
const path = require("path");

const start = async () => {
  let data = []
  const paginas = 3;

  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage();

  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.resolve(__dirname, "temp")
  });

  await page.goto(
    "https://www.sat.gob.mx/consultas/operacion/49762/consulta-las-notificaciones-por-edictos"
  );
  await page.waitForTimeout(5000);

  const frameHandle = await page.$("iframe[id=iframetoload]");
  const frame = await frameHandle.contentFrame();

  for (let i=1; i <= paginas; i ++) {
    const table = await frame.$$eval("tbody a", (items) => {
      return items.map((item) => item.href);
    });

    data = [].concat(data, table);

    if (i < paginas-1) {
      await frame.click(`#example_paginate span a:nth-child(${i+1})`);
    }
    await page.waitForTimeout(3000);
  }

  console.log(data.length);

  for(const zip of data) {
    try {
      await page.goto(zip);
    } catch (error) {
      console.log("Descargando archivo...");
    }
  }
  await page.waitForTimeout(15000);

  await browser.close();
};

start();
