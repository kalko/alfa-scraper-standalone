import express from "express"
import jwt from "jsonwebtoken"
import { evaluatePageWithAlfa } from "./alfa/alfa-audit.js"
import { validateUrl } from "./middleware.js"
import { scrapePage } from "./scraper.js"
import https from 'https'
import url from 'url'

// TODO: clean up authentication

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

// TODO: add request data validation
router.post("/batch/audit", authenticate, async (req, res) => {
  res.status(202).send();

  console.log('Starting batch audit', req.body.targetUrls);

  for (const targetUrl of req.body.targetUrls) {
    try {
      const auditData = await evaluatePageWithAlfa(targetUrl)
      
      const postData = JSON.stringify({
        data: auditData,
      });
      const ingestUrl = new url.URL(req.body.ingestUrl)
    
      const token = jwt.sign({}, process.env.JWT_SECRET_KEY, {
        expiresIn: '1h' 
      });

      const options = {
        hostname: ingestUrl.hostname,
        port: ingestUrl.port,
        path: ingestUrl.pathname + ingestUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Bearer ' + token
        },
        rejectUnauthorized: false // TODO: use it only in local environment
      };

      // Create request to ingest API
      const httpsReq = https.request(options, (res) => {
        let responseData = '';
        const protocol = res.socket.encrypted ? 'https' : 'http';
        const host = res.socket.remoteAddress;
        const port = res.socket.remotePort;
        const path = res.req.path;

        res.on('data', (chunk) => {
          responseData += chunk;
        });
    
        res.on('end', () => {
            console.log(`POST ${protocol}://${host}:${port}${path} Response code: ${res.statusCode} ${res.statusMessage}`);
            //console.log('Response body:', responseData);
        });
      });

      httpsReq.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`, e);
      });

      httpsReq.write(postData);
      httpsReq.end();
    } catch (error) {
      console.error("Scraping failed:", error)
    }
  }
})

export default router
