import { Scraper } from "@siteimprove/alfa-scraper";
import cors from "cors";
import express from "express";

async function scrapePage(url) {
  try {
    const scraper = await Scraper.of(); // Await the scraper instantiation
    const pageResult = await scraper.scrape(url);
    const page = await pageResult.getUnsafe("Could not scrape page");
    return page.toJSON(); // Assuming that page has a toJSON method
  } catch (error) {
    console.error("Scraping error:", error);
    return { error: "Failed to scrape the page." };
  }
}

const app = express();
const PORT = 3111;

app.use(cors()); // // Enable all CORS requests, or use specific domain (here we may restrict to only a certain list of domains to call the service)

// Middleware to parse JSON bodies
app.use(express.json());

// Handle POST requests
app.post("/", async (req, res) => {
  // Retrieve the URL from the request body
  const { targetUrl } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: "Please provide a URL to scrape." });
  }

  // Validate the URL
  try {
    new URL(targetUrl); // This will throw if the URL is invalid
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Invalid or unsupported URL provided." });
  }

  console.log(`Scraping URL: ${targetUrl}`);
  const scrapedData = await scrapePage(targetUrl);

  res.json(scrapedData);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
