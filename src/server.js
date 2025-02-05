import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import routes from "./routes.js"
import { cleanupScraper } from "./scraper.js"

const app = express()
const PORT = process.env.PORT || 3111

dotenv.config()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/", routes)

// Error-handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await cleanupScraper()
    console.log("Shutting down gracefully.")
    process.exit(0)
  } catch (error) {
    console.error("Error during shutdown:", error)
    process.exit(1)
  }
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
