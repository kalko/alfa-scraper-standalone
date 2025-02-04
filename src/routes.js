import express from "express"
import { evaluatePageWithAlfa } from "./alfa/alfa-audit.js"
import { validateUrl } from "./middleware.js"
import { scrapePage } from "./scraper.js"

const router = express.Router()

router.post("/", validateUrl, async (req, res, next) => {
  try {
    const { targetUrl } = req.body
    const scrapedData = await scrapePage(targetUrl)
    res.json(scrapedData)
  } catch (error) {
    next(error)
    // console.error("Scraping failed:", error.message || error)
    // res.status(500).json({ error: "Failed to process the scraping request." })
  }
})

router.post("/audit", validateUrl, async (req, res, next) => {
  try {
    const { targetUrl } = req.body
    const auditData = await evaluatePageWithAlfa(targetUrl)
    res.json(auditData)
  } catch (error) {
    next(error)
    // console.error("Scraping failed:", error.message || error)
    // res.status(500).json({ error: "Failed to process the scraping request." })
  }
})

export default router
