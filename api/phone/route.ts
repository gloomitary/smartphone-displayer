import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")

  if (!slug) {
    return NextResponse.json({ error: "No phone slug provided" }, { status: 400 })
  }

  try {
    // Fetch phone details from GSMArena
    const phoneUrl = `https://www.gsmarena.com/${slug}.php`

    const response = await fetch(phoneUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    })

    if (!response.ok) {
      throw new Error(`GSMArena returned ${response.status}`)
    }

    const html = await response.text()

    // Extract phone name
    const nameMatch = html.match(/<h1[^>]*class="specs-phone-name-title"[^>]*>([^<]+)<\/h1>/i)
    const name = nameMatch ? nameMatch[1].trim() : slug.replace(/-\d+$/, "").replace(/_/g, " ")

    // Extract brand
    const brand = name.split(" ")[0]

    // Extract display specs
    // Look for the Display section
    const displaySection = html.match(/Display[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i)

    let displaySize = "N/A"
    let screenToBody = "N/A"
    let resolution = "N/A"
    let displayType = "N/A"

    if (displaySection) {
      const displayHtml = displaySection[1]

      // Size - look for inches
      const sizeMatch = displayHtml.match(/(\d+\.?\d*)\s*inches/i)
      if (sizeMatch) {
        displaySize = `${sizeMatch[1]}"`
      }

      // Screen-to-body ratio
      const ratioMatch = displayHtml.match(/(\d+\.?\d*)\s*%\s*(?:screen-to-body|ratio)/i)
      if (ratioMatch) {
        screenToBody = `${ratioMatch[1]}%`
      }

      // Alternative ratio search
      if (screenToBody === "N/A") {
        const altRatioMatch = displayHtml.match(/~(\d+\.?\d*)\s*%/i)
        if (altRatioMatch) {
          screenToBody = `${altRatioMatch[1]}%`
        }
      }

      // Resolution
      const resMatch = displayHtml.match(/(\d{3,4})\s*x\s*(\d{3,4})/i)
      if (resMatch) {
        resolution = `${resMatch[1]} x ${resMatch[2]}`
      }

      // Display type (AMOLED, IPS LCD, etc.)
      const typeMatch = displayHtml.match(/(Super\s+)?([A-Z]+\s*)?(AMOLED|OLED|LCD|IPS|TFT|LTPO)/i)
      if (typeMatch) {
        displayType = typeMatch[0].trim().toUpperCase()
      }
    }

    // Broader search if display section didn't give us what we need
    if (displaySize === "N/A") {
      const globalSizeMatch = html.match(/(\d+\.?\d*)\s*inches/i)
      if (globalSizeMatch) displaySize = `${globalSizeMatch[1]}"`
    }

    if (screenToBody === "N/A") {
      const globalRatioMatch = html.match(/~?(\d{2,3}\.?\d*)\s*%\s*(?:screen|ratio|body)/i)
      if (globalRatioMatch) screenToBody = `${globalRatioMatch[1]}%`
    }

    if (resolution === "N/A") {
      const globalResMatch = html.match(/(\d{3,4})\s*x\s*(\d{3,4})\s*pixels/i)
      if (globalResMatch) resolution = `${globalResMatch[1]} x ${globalResMatch[2]}`
    }

    if (displayType === "N/A") {
      const globalTypeMatch = html.match(/(Dynamic\s+)?(Super\s+)?([A-Z]+\s*)?(AMOLED|OLED|LCD|IPS|TFT|LTPO)/i)
      if (globalTypeMatch) displayType = globalTypeMatch[0].trim().toUpperCase()
    }

    return NextResponse.json({
      name,
      brand,
      displaySize,
      screenToBody,
      resolution,
      displayType,
    })
  } catch (error) {
    console.error("Phone details error:", error)
    return NextResponse.json({ error: "Failed to get phone details. Please try again." }, { status: 500 })
  }
}
