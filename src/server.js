import cors from "cors"
import express from "express"
import routes from "./routes.js"
import { cleanupScraper } from "./scraper.js"

const app = express()
const PORT = process.env.PORT || 3111

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/", routes)

// Graceful shutdown
process.on("SIGINT", async () => {
  await cleanupScraper()
  console.log("Shutting down gracefully.")
  process.exit(0)
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
