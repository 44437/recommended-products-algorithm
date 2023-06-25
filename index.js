const puppeteer = require('puppeteer');
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const baseURL = "https://www.trendyol.com";
let pagePath = "";

switch (process.argv[2]) {
  case "utu":
    pagePath = "utu-x-c1201";
    break;
  case "elbise":
    pagePath = "/elbise-x-c56";
    break;
  default:
    pagePath = "/cep-telefonu-x-c103498";
}

const pageBaseURL = baseURL + pagePath

async function GetImages() {
  const browser = await puppeteer.launch({headless: false, slowMo: 50});
  const page = await browser.newPage();
  await page.setViewport({width: 1080, height: 1024});

  await page.goto(`${pageBaseURL}?pi=0`, {waitUntil: 'load', timeout: 0});

  for (let i = 1; i < 5; i++) {
    await page.waitForSelector('div.p-card-wrppr[data-id]')

    const imageUrls = await page.$$eval('div.p-card-wrppr img.p-card-img', (images) =>
      images.map((image) => image.src)
    );

    for (const imageUrl of imageUrls) {
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
      });

      const imagePath = path.join("images", imageUrl.replace(/\//g, "%2F"));

      const writer = fs.createWriteStream(imagePath);

      response.data.pipe(writer);
    }

    await page.goto(`${pageBaseURL}?pi=${i}`, {waitUntil: 'load', timeout: 0});
  }

  await browser.close();
}

GetImages().then(_ => console.log("Done!")).catch(e => console.log(e));