import { type NextRequest, NextResponse } from "next/server"

const lightspeedCategoryNumbers = [
  6, 9, 10, 14, 15, 18, 20, 29, 30, 36, 37, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 57, 58, 59, 69, 73, 75, 76, 77,
  79, 83, 84, 85, 99, 129, 131, 132, 139, 140, 900,
]

const lightspeedCategories: { [key: string]: string } = {
  "-1": "Not Reviewed",
  "1": "Local-Allow",
  "2": "Local-Block",
  "3": "Ads",
  "4": "Adult",
  "5": "Audio-Video",
  "6": "Business",
  "7": "Errors",
  "8": "Drugs",
  "9": "Education",
  "10": "Business.Finance",
  "11": "Forums",
  "12": "Gambling",
  "13": "Games",
  "14": "General",
  "15": "Government",
  "16": "Security.Hacking",
  "17": "Violence.Hate",
  "18": "Business.Jobs",
  "19": "Forums.Mail",
  "20": "News",
  "21": "Porn",
  "22": "Porn.De",
  "23": "Porn.Es",
  "24": "Porn.Fr",
  "25": "Porn.It",
  "26": "Porn.Jp",
  "27": "Porn.Nl",
  "28": "Security.Proxy",
  "29": "Shopping",
  "30": "Sports",
  "31": "Suspicious",
  "32": "Violence",
  "33": "Security.Warez",
  "34": "Directory",
  "35": "Ads.Popup-Ads",
  "36": "Travel",
  "37": "Automobile",
  "38": "Forums.Newsgroups",
  "39": "Forums.Personals",
  "40": "Humor",
  "41": "Education.Lifestyles",
  "42": "Alcohol",
  "43": "Family.Health",
  "44": "Education.Science",
  "45": "Entertainment",
  "46": "Kids_And_Teens",
  "47": "Education.Arts",
  "48": "Education.Literature",
  "49": "Music",
  "50": "Education.Music",
  "51": "Microsoft",
  "52": "Ads.Banner-Ads",
  "53": "Ads.Html-Ads",
  "54": "Ads.Javascript-Ads",
  "55": "Spam",
  "56": "Ham",
  "57": "Computers",
  "58": "Family.Religion",
  "59": "World",
  "60": "Forums.P2p",
  "61": "Forums.Im",
  "62": "Security.Spyware",
  "63": "Security.Virus",
  "64": "Security.Test",
  "65": "Security.Phishing",
  "66": "Weapons",
  "67": "Access-Denied",
  "68": "Law",
  "69": "Kids_And_Teens.Chat",
  "70": "Adult.Language",
  "71": "Forums.Blogs",
  "72": "Security",
  "73": "Business.Real_Estate",
  "74": "Education.Games",
  "75": "Education.Social_Science",
  "76": "Family.Food",
  "77": "Kids_And_Teens.Animals",
  "78": "Shopping.Spam",
  "79": "Society",
  "80": "Education.Sex",
  "81": "Shopping.Auctions",
  "82": "Sports.Fantasy",
  "83": "Hobby",
  "84": "Sports.Youth",
  "85": "Search",
  "86": "World.De",
  "87": "World.Es",
  "88": "World.Fr",
  "89": "World.It",
  "90": "World.Jp",
  "91": "World.Nl",
  "92": "World.Pt",
  "93": "World.Ru",
  "94": "Porn.Illicit",
  "95": "Family",
  "96": "Society.Politics",
  "97": "Society.Crime",
  "98": "Sports.Martial_Arts",
  "99": "Education.History",
  "100": "Adult.Art",
  "101": "Adult.Bodyart",
  "102": "Adult.Games",
  "103": "Adult.Lifestyles",
  "104": "Shopping.Office_Supplies",
  "105": "Expired",
  "106": "World.Pl",
  "107": "World.Cn",
  "108": "World.Kr",
  "109": "Porn.Pl",
  "110": "Porn.Ru",
  "111": "Porn.Pt",
  "112": "Plagiarism",
  "113": "Parked",
  "114": "Suspicious.Script",
  "115": "Business.Construction",
  "116": "Security.Nettools",
  "117": "Forums.Social_Networking",
  "118": "Forums.Dating",
  "119": "Business.Manufacturing",
  "120": "G-Rated",
  "121": "PG-Rated",
  "122": "R-Rated",
  "123": "X-Rated",
  "124": "S-Rated",
  "125": "Security.Potentially_Unwanted_Applications",
  "126": "Offensive",
  "127": "Computers.Filehosting",
  "128": "Computers.Consumer_Electronics",
  "129": "Education.Media",
  "130": "Security.Virus_Ignore",
  "131": "Entertainment.Radio_And_Tv",
  "132": "Photography",
  "133": "Security.Shorteners",
  "134": "Security.Malware",
  "135": "Security.Translators",
  "136": "Computers.Storage",
  "137": "Violence.Extremism",
  "138": "Computers.Analytics",
  "139": "Esports",
  "140": "Artificial-Intelligence",
  "141": "Artificial-Intelligence.Generative",
  "142": "Artificial-Intelligence.Detective",
  "144": "Domain-Sharing",
  "200": "Facebook",
  "201": "Twitter",
  "202": "Instagram",
  "203": "Pinterest",
  "900": "Education.Videos",
}

async function fetchCategorization(url: string) {
  try {
    const response = await fetch("https://production-archive-proxy-api.lightspeedsystems.com/archiveproxy", {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        authority: "production-archive-proxy-api.lightspeedsystems.com",
        "content-type": "application/json",
        origin: "https://archive.lightspeedsystems.com",
        "user-agent": "Mozilla/5.0",
        "x-api-key": "onEkoztnFpTi3VG7XQEq6skQWN3aFm3h",
      },
      body: `{"query":"\\nquery getDeviceCategorization($itemA: CustomHostLookupInput!, $itemB: CustomHostLookupInput!){\\n a: custom_HostLookup(item: $itemA) { cat}\\n b: custom_HostLookup(item: $itemB) { cat \\n }\\n}","variables":{"itemA":{"hostname":"${url}"}, "itemB":{"hostname":"${url}"}}}`,
    })

    if (!response.ok) {
      console.error("Network response was not ok:", response.statusText)
      return { categories: [], status: "Unknown", categoryName: "Unknown" }
    }

    const body = await response.json()

    console.log(`[v0] API Response body for ${url}:`, JSON.stringify(body, null, 2))

    // Check if the response has the expected structure
    if (!body.data || !body.data.a || !body.data.b) {
      console.error(`[v0] Invalid API response structure for ${url}:`, body)
      return { categories: [], status: "Unknown", categoryName: "Unknown" }
    }

    // Check if the categorization data exists
    if (typeof body.data.a.cat === "undefined" || typeof body.data.b.cat === "undefined") {
      console.error(`[v0] Missing categorization data for ${url}:`, body.data)
      return { categories: [], status: "Unknown", categoryName: "Unknown" }
    }

    const categories = [body.data.a.cat, body.data.b.cat]

    console.log(`Lightspeed API Response for ${url}:`)
    console.log(`Category numbers: ${categories.join(", ")}`)

    const isUnblocked = categories.some((cat) => lightspeedCategoryNumbers.includes(cat))

    let categoryName = "Unknown"
    for (const cat of categories) {
      if (lightspeedCategories[cat.toString()]) {
        categoryName = lightspeedCategories[cat.toString()]
        break
      }
    }

    return {
      categories,
      status: isUnblocked ? "Unblocked" : "Blocked",
      categoryName,
    }
  } catch (error) {
    console.error("Fetch error:", error)
    return { categories: [], status: "Error", categoryName: "Error" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { urls, filters } = await request.json()

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Invalid input: 'urls' must be a non-empty array." }, { status: 400 })
    }

    const checkLightspeed = filters?.lightspeed !== false

    if (!checkLightspeed) {
      return NextResponse.json({ error: "Lightspeed filter must be enabled." }, { status: 400 })
    }

    const domainResults = []

    for (const url of urls) {
      const cleanUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "")
      console.log(`Processing URL: ${cleanUrl}`)

      try {
        const domainResult = {
          url: cleanUrl,
          lightspeed: {
            status: "Not Checked",
            category: "Not Checked",
          },
        }

        if (checkLightspeed) {
          console.log(`Checking Lightspeed for: ${cleanUrl}`)
          try {
            const lightspeedData = await fetchCategorization(cleanUrl)
            domainResult.lightspeed = {
              status: lightspeedData.status,
              category: lightspeedData.categoryName,
            }
          } catch (lightspeedError) {
            console.error(`Error checking Lightspeed for ${cleanUrl}:`, lightspeedError)
            domainResult.lightspeed = {
              status: "Error",
              category: "Error",
            }
          }
        }

        domainResults.push(domainResult)
      } catch (error) {
        console.error(`Error processing ${cleanUrl}:`, error)
        domainResults.push({
          url: cleanUrl,
          lightspeed: {
            status: checkLightspeed ? "Error" : "Not Checked",
            category: checkLightspeed ? "Error" : "Not Checked",
          },
        })
      }
    }

    console.log("Final Results:", domainResults)

    return NextResponse.json({
      domains: domainResults,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
