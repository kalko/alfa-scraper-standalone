export const validateUrl = (req, res, next) => {
  const { targetUrl } = req.body

  if (!targetUrl) {
    return res.status(400).json({ error: "Please provide a URL to scrape." })
  }

  try {
    new URL(targetUrl)
    next() // Continue to next middleware/handler
  } catch (error) {
    res.status(400).json({ error: "Invalid or unsupported URL provided." })
  }
}
