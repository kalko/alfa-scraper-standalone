import express from "express"
import jwt from "jsonwebtoken"
import { evaluatePageWithAlfa } from "./alfa/alfa-audit.js"
import { validateUrl } from "./middleware.js"
import { scrapePage } from "./scraper.js"
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).send("Access Token Required")

  jwt.verify(
    token,
    process.env.JWT_SECRET_KEY,
    { algorithms: ["HS256"] },
    (err, user) => {
      if (err) return res.status(403).send("Invalid Access Token")
      req.user = user
      next()
    }
  )
}
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
router.post("/secured/scrape", authenticate, validateUrl, async (req, res) => {
  try {
    const { targetUrl } = req.body
    const scrapedData = await scrapePage(targetUrl)
    res.json(scrapedData)
  } catch (error) {
    console.error("Scraping failed:", error.message || error)
    res.status(500).json({ error: "Failed to process the scraping request." })
  }
})
router.post("/secured/audit", authenticate, validateUrl, async (req, res) => {
  try {
    const { targetUrl } = req.body
    const auditData = await evaluatePageWithAlfa(targetUrl)
    res.json(auditData)
  } catch (error) {
    console.error("Scraping failed:", error.message || error)
    res.status(500).json({ error: "Failed to process the scraping request." })
  }
})
export default router
