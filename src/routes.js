import express from "express"
import { validateUrl } from "./middleware.js"
import { scrapePage } from "./scraper.js"

const router = express.Router()

router.post("/", validateUrl, async (req, res) => {
  try {
    const { targetUrl } = req.body
    const scrapedData = await scrapePage(targetUrl)
    res.json(scrapedData)
  } catch (error) {
    console.error("Scraping failed:", error.message || error)
    res.status(500).json({ error: "Failed to process the scraping request." })
  }
})

export default router
