import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Where this deployment is reachable. Puppeteer has to fetch the print page over
 * HTTP, so getting this wrong means it silently navigates to localhost and the
 * export hangs until the function is killed.
 */
function getBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_URL
  if (configured) return configured.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  // Fall back to the host this request came in on rather than assuming localhost.
  const host = request.headers.get('host')
  if (host) {
    const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'
    return `${protocol}://${host}`
  }
  return 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  let browser: any = null

  try {
    const body = await request.json()
    const { data, sectionOrder, sections, headerColor, selectedFont, fontSize, textColor, lineHeight, selectedTemplate } = body

    const cvData = {
      data,
      sectionOrder,
      sections,
      headerColor,
      selectedFont,
      fontSize,
      textColor,
      lineHeight,
      selectedTemplate,
    }

    const baseUrl = getBaseUrl(request)
    const printUrl = `${baseUrl}/print`

    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction) {
      const puppeteerCore = await import('puppeteer-core')
      // Types differ between @sparticuz/chromium majors; the runtime shape is stable.
      const chromium: any = (await import('@sparticuz/chromium')).default

      browser = await puppeteerCore.default.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })
    } else {
      const puppeteer = await import('puppeteer')
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    const page = await browser.newPage()

    // Hand the CV to the print page through localStorage rather than the query
    // string. A CV with a profile photo is a few hundred KB of base64, which
    // makes the URL long enough that the navigation never completes - that was
    // the "download gets stuck" bug for saved CVs.
    const payload = JSON.stringify(cvData)
    await page.evaluateOnNewDocument((value: string) => {
      try {
        window.localStorage.setItem('cv-print-data', value)
      } catch {
        // Private mode or blocked storage - the print page shows its own error.
      }
    }, payload)

    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 25000 })

    // The print page sets this once Paged.js has laid the pages out, and has its
    // own 5s fallback. Keep the wait well inside the function budget so a failure
    // returns an error instead of the request being killed mid-flight.
    await page.waitForFunction(
      () => (window as any).Paged?.ready === true || (window as any).pagedReady === true,
      { timeout: 20000 },
    )

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      format: 'A4',
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    })

    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv.pdf"',
      },
    })
  } catch (error) {
    console.error('PDF generation failed:', error instanceof Error ? error.stack : String(error))

    return NextResponse.json(
      {
        error: 'Kunde inte skapa PDF:en. Försök igen om en stund.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    // Without this a failed run leaks a Chromium process, and the next request
    // on a warm instance runs out of memory.
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Failed to close browser:', closeError)
      }
    }
  }
}
