import { Scraper } from "@siteimprove/alfa-scraper"

let scraperInstance = null

export const getScraper = async () => {
  if (!scraperInstance) {
    scraperInstance = await Scraper.of()
  }
  return scraperInstance
}

export const scrapePage = async (url) => {
  try {
    const scraper = await getScraper()
    const pageResult = await scraper.scrape(url)
    const page = await pageResult.getUnsafe("Could not scrape page")
    return page.toJSON()
  } catch (error) {
    console.error("Scraping error:", error)
    throw new Error("Failed to scrape the page.")
  }
}

// Cleanup on shutdown
export const cleanupScraper = async () => {
  if (scraperInstance) {
    await scraperInstance.dispose()
    console.log("Scraper instance closed.")
  }
}
