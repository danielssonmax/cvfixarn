import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== PDF Export API Called ===')
    const body = await request.json()
    console.log('Received body keys:', Object.keys(body))
    
    const { data, sectionOrder, sections, headerColor, selectedFont, fontSize, textColor, lineHeight, selectedTemplate } = body

    // Store data in a way the print page can access it
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

    // Encode data for URL
    const encodedData = encodeURIComponent(JSON.stringify(cvData))
    
    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const printUrl = `${baseUrl}/print?data=${encodedData}`

    console.log('Base URL:', baseUrl)
    console.log('Print URL length:', printUrl.length)
    console.log('Launching browser for PDF generation...')

    // Determine if we're in production (Vercel) or development
    const isProduction = process.env.NODE_ENV === 'production'
    
    console.log('Environment:', isProduction ? 'production' : 'development')
    
    let browser
    
    if (isProduction) {
      // Use puppeteer-core with Chromium for production (Vercel)
      console.log('Using puppeteer-core for production...')
      const puppeteerCore = await import('puppeteer-core')
      const chromium = await import('@sparticuz/chromium')
      
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath: await chromium.default.executablePath(),
        headless: chromium.default.headless,
      })
    } else {
      // Use regular puppeteer for local development
      console.log('Using puppeteer for development...')
      const puppeteer = await import('puppeteer')
      
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      console.log('Browser launched successfully')
    }

    const page = await browser.newPage()

    console.log('Navigating to print page:', printUrl)
    
    // Navigate to the print page
    await page.goto(printUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    console.log('Waiting for Paged.js to complete...')

    // Wait for Paged.js to complete rendering
    await page.waitForFunction(
      () => {
        return (window as any).Paged?.ready === true || (window as any).pagedReady === true
      },
      { timeout: 60000 }
    )

    console.log('Paged.js complete, generating PDF...')

    // Generate PDF
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      format: 'A4',
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    })

    await browser.close()

    console.log('PDF generated successfully')

    // Return PDF as response
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv.pdf"',
      },
    })
  } catch (error) {
    console.error('=== PDF Generation Error ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Environment:', process.env.NODE_ENV)
    console.error('Base URL:', process.env.NEXT_PUBLIC_BASE_URL)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name || 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        env: process.env.NODE_ENV,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      },
      { status: 500 }
    )
  }
}

