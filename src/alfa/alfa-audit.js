import { Audit as AlfaAudit } from "@siteimprove/alfa-act"
import * as json from "@siteimprove/alfa-json"
import rules from "@siteimprove/alfa-rules"
import { Page } from "@siteimprove/alfa-web"
import { scrapePage } from "../scraper.js"

export const evaluatePageWithAlfa = async (targetUrl) => {
  try {
    // const response = await axios.post(scraperUrl, {
    //   targetUrl: targetUrl,
    // })

    // if (response.status === 200 && response.data) {
    //   const alfaPage = Page.from(response.data).getUnsafe(
    //     "Could not parse the page"
    //   )

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

// send the result of the audit to FE
export const runAlfaAudit = async (alfaPage, targetUrl) => {
  try {
    const outcomes = await AlfaAudit.of(alfaPage, rules).evaluate()
    const auditData = prepareAuditScan(targetUrl, outcomes)
    // const auditData = JSON.stringify(prepareAuditScan(targetUrl, outcomes))

    return auditData

    // const response = await axios.post(
    //   process.env.SCAN_RESULT_API_URL,
    //   {
    //     action: "save_scan_result",
    //     data: auditData,
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${process.env.SCAN_RESULT_API_TOKEN}`,
    //     },
    //   }
    // )

    // return response.data
  } catch (error) {
    console.error("Error during Alfa Audit evaluation:", error)
    throw error
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
          verbosity: json.Serializable.Verbosity.Low,
        })
      )
    }
  })

  return auditScan
}
