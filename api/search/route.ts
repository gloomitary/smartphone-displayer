import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "No search query provided" }, { status: 400 })
  }

  try {
    // Fetch search results from GSMArena
    const searchUrl = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`

    const response = await fetch(searchUrl, {
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

    // Parse search results
    const results: { name: string; brand: string; slug: string }[] = []

    // Match phone entries: <a href="samsung_galaxy_s24_ultra-12771.php">
    const phoneRegex = /<a href="([^"]+\.php)"[^>]*>\s*<img[^>]*>\s*<span[^>]*>([^<]+)<\/span>\s*<\/a>/gi
    const altRegex = /<div class="makers"[^>]*>[\s\S]*?<ul>([\s\S]*?)<\/ul>/gi

    // Try to find the makers list
    const makersMatch = altRegex.exec(html)
    if (makersMatch) {
      const listHtml = makersMatch[1]
      const itemRegex =
        /<li[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<span[^>]*>[\s\S]*?<br\s*\/?>\s*([^<]+)<\/span>/gi

      let match
      while ((match = itemRegex.exec(listHtml)) !== null && results.length < 20) {
        const slug = match[1].replace(".php", "")
        const name = match[2].trim()
        const brand = name.split(" ")[0]

        results.push({ name, brand, slug })
      }
    }

    // Alternative parsing if the above didn't work
    if (results.length === 0) {
      const simpleRegex = /<a href="([a-z0-9_-]+\.php)"[^>]*>[\s\S]*?<strong>[\s\S]*?<span>([^<]+)<\/span>/gi
      let match
      while ((match = simpleRegex.exec(html)) !== null && results.length < 20) {
        const slug = match[1].replace(".php", "")
        const name = match[2].trim()
        const brand = name.split(" ")[0]
        results.push({ name, brand, slug })
      }
    }

    // Yet another fallback pattern
    if (results.length === 0) {
      const linkRegex = /href="([a-z][a-z0-9_]+-\d+\.php)"[^>]*>([^<]*(?:<[^a]*>[^<]*)*)<\/a>/gi
      let match
      while ((match = linkRegex.exec(html)) !== null && results.length < 20) {
        const slug = match[1].replace(".php", "")
        const name = match[2].replace(/<[^>]+>/g, "").trim()
        if (name && name.length > 2 && !name.includes("Compare") && !name.includes("Pictures")) {
          const brand = name.split(" ")[0]
          results.push({ name, brand, slug })
        }
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "No phones found. Try a different search term." })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search GSMArena. Please try again." }, { status: 500 })
  }
}
