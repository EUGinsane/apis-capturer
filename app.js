const { chromium } = require("playwright");
const fs = require("fs");
const { Parser } = require("json2csv");
const fields = [
  { value: "path", label: "PATH" },
  { value: "method", label: "METHOD" },
  { value: "body", label: "BODY" },
  { value: "status", label: "STATUS" },
  { value: "response", label: "RESPONSE" }
];
const json2csvParser = new Parser({ fields });

(async () => {
  const apiArr = [];
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://app.flood.io/");

  page.on("request", async request => {
    const url = request.url();
    const urlPrefix = "https://api.flood.io";
    if (url.includes(urlPrefix)) {
      const response = await request.response();
      console.log(response.status)
      apiArr.push({
        path: url.replace(urlPrefix, ""),
        method: request.method(),
        body: request.postData(),
        status: response.status(),
        response: JSON.stringify(await response.json())
      });
      console.log(`captured: ${apiArr.length}`);
    }
  });

  page.on("close", async () => {
    fs.writeFileSync("./file.csv", json2csvParser.parse(apiArr));
  });
})();
