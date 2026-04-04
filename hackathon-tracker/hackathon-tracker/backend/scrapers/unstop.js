const puppeteer = require("puppeteer");

async function scrapeUnstop() {
  console.log("Scraping Unstop (network interception)...");

  // YAHAN CHANGE KIYA HAI: Local Chrome ka path de diya hai
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage();

  let hackathons = [];

  try {
    page.on("response", async (response) => {
      const url = response.url();

      if (url.includes("search-result")) {
        try {
          const data = await response.json();
          hackathons = data?.data?.data || [];
        } catch (e) {
          console.log("Parse error:", e.message);
        }
      }
    });

    await page.goto("https://unstop.com/hackathons", {
      waitUntil: "networkidle2",
    });

    await new Promise((r) => setTimeout(r, 3000));

    console.log(`Unstop: ${hackathons.length} hackathons found`);

    await browser.close();

    return hackathons.map((h) => ({
      title: h.title,
      url: h.public_url || `https://unstop.com/hackathons/${h.seo_url}`,
      deadline: h.end_date || "N/A",
      prize: h.prize_money ? `$${h.prize_money}` : "N/A",
      participants: h.registered_count || 0,
      thumbnail: h.cover_image || "",
      source: "Unstop",
      themes: h.themes || [],
    }));
  } catch (e) {
    await browser.close();
    console.log("Unstop error:", e.message);
    return [];
  }
}

module.exports = scrapeUnstop;