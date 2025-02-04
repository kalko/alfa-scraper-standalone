import { Audit as AlfaAudit } from "@siteimprove/alfa-act"
import * as json from "@siteimprove/alfa-json"
import rules from "@siteimprove/alfa-rules"
import { Page } from "@siteimprove/alfa-web"
import { scrapePage } from "../scraper.js"

export const evaluatePageWithAlfa = async (targetUrl) => {
  try {
    const scrapedData = await scrapePage(targetUrl)
    const alfaPage = Page.from(scrapedData).getUnsafe(
      "Could not parse the page"
    )

    return runAlfaAudit(alfaPage, targetUrl)
  } catch (error) {
    console.error("Error making POST request to scraper:", error)
    return error
  }
}

export const runAlfaAudit = async (alfaPage, targetUrl) => {
  try {
    console.log("Running Alfa Audit on page:", targetUrl)

    const outcomes = await AlfaAudit.of(alfaPage, rules).evaluate()
    return prepareAuditScan(targetUrl, outcomes)
  } catch (error) {
    console.error("Error during Alfa Audit evaluation:", error)
    throw new Error(
      `Failed to evaluate the page at ${targetUrl}: ${error.message}`
    )
  }
}

const prepareAuditScan = (url, outcomes) => {
  let failureCount = 0

  let auditScan = {
    failures: 0,
    failedItems: [],
    page: url,
  }

  outcomes.forEach((outcome) => {
    if (outcome._outcome === "failed") {
      failureCount++
      auditScan.failures = failureCount
      auditScan.failedItems.push(
        outcome.toJSON({
          verbosity: json.Serializable.Verbosity.High,
        })
      )
    }
  })

  return auditScan
}
