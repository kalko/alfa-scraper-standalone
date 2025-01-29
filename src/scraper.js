import { Scraper } from "@siteimprove/alfa-scraper";
import cors from "cors";
import express from "express";

const app = express();
const PORT = 3111;

app.use(cors());
app.use(express.json());

// Create a single Scraper instance and reuse it
let scraperInstance;

async function getScraper() {
  if (!scraperInstance) {
    scraperInstance = await Scraper.of();
  }
  return scraperInstance;
}

async function scrapePage(url) {
  try {
    const scraper = await getScraper();
    const pageResult = await scraper.scrape(url);
    const page = await pageResult.getUnsafe("Could not scrape page");
    return page.toJSON();
  } catch (error) {
    console.error("Scraping error:", error);
    return { error: "Failed to scrape the page." };
  }
}

app.post("/", async (req, res) => {
  const { targetUrl } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: "Please provide a URL to scrape." });
  }

  try {
    new URL(targetUrl);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Invalid or unsupported URL provided." });
  }

  console.log(`Scraping URL: ${targetUrl}`);
  const scrapedData = await scrapePage(targetUrl);

  res.json(scrapedData);
});

// Graceful shutdown: Close Scraper on process exit
process.on("SIGINT", async () => {
  if (scraperInstance) {
    await scraperInstance.dispose();
    console.log("Scraper instance closed.");
  }
  process.exit(0);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
