import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Simulate checking against Lightspeed archive
    // In a real implementation, you would make an API call to archive.lightspeedsystems.com
    // For now, we'll simulate some results based on common patterns

    const blockedDomains = ["facebook.com", "twitter.com", "instagram.com", "tiktok.com", "snapchat.com", "reddit.com"]

    const blockedCategories = ["Social Media", "Entertainment", "Gaming", "Adult Content", "Malware", "Phishing"]

    // Simple simulation logic
    const isBlocked = blockedDomains.some((blocked) => domain.includes(blocked) || blocked.includes(domain))

    const category = isBlocked ? blockedCategories[Math.floor(Math.random() * blockedCategories.length)] : "Safe"

    // Add some randomness to make it more realistic
    const randomBlock = Math.random() < 0.2 // 20% chance of random block

    return NextResponse.json({
      domain,
      blocked: isBlocked || randomBlock,
      category: isBlocked || randomBlock ? category : "Safe",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking domain:", error)
    return NextResponse.json({ error: "Failed to check domain" }, { status: 500 })
  }
}
