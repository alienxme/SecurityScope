"use client"

import { useState } from "react"
import { Shield, Search, Copy, CheckCircle, XCircle, AlertTriangle, Zap } from "lucide-react"

interface DomainResult {
  url: string
  lightspeed: {
    status: string
    category: string
  }
  fortiguard: {
    status: string
    category: string
  }
}

export default function SecurityScope() {
  const [inputText, setInputText] = useState("")
  const [results, setResults] = useState<DomainResult[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [filters, setFilters] = useState({
    lightspeed: true,
    fortiguard: true,
  })

  const checkLinks = async () => {
    const domainRegex = /([a-zA-Z0-9-]+(\.[a-zA-Z]{2,}){1,2})/g
    const extractedDomains = inputText.match(domainRegex)
    const filteredDomains = extractedDomains?.filter((domain) => domain !== "your.domain.com") || []
    const uniqueDomains = [...new Set(filteredDomains)]

    if (uniqueDomains.length === 0) {
      alert("Please enter domains or URLs to analyze.")
      return
    }

    if (!filters.lightspeed && !filters.fortiguard) {
      alert("Please select at least one filter to analyze domains.")
      return
    }

    setIsChecking(true)
    setProgress(0)
    setResults([])

    try {
      const batchSize = 5
      const allResults: DomainResult[] = []

      for (let i = 0; i < uniqueDomains.length; i += batchSize) {
        const batch = uniqueDomains.slice(i, i + batchSize)

        const response = await fetch("/api/check-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: batch,
            filters: {
              lightspeed: filters.lightspeed,
              fortiguard: filters.fortiguard,
            },
          }),
        })

        const data = await response.json()
        const batchResults = data.domains || []
        allResults.push(...batchResults)

        const progressPercent = Math.round(((i + batch.length) / uniqueDomains.length) * 100)
        setProgress(progressPercent)
        setResults([...allResults])

        if (i + batchSize < uniqueDomains.length) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }
    } catch (error) {
      console.error("Error checking domains:", error)
      alert("Error analyzing domains. Please try again.")
    } finally {
      setIsChecking(false)
      setProgress(100)
    }
  }

  const copyUnblockedDomains = () => {
    const unblockedDomains = results
      .filter((domain) => {
        const lightspeedSafe = !filters.lightspeed || domain.lightspeed.status === "Unblocked"
        const fortiguardSafe = !filters.fortiguard || domain.fortiguard.status === "Unblocked"
        return lightspeedSafe && fortiguardSafe
      })
      .map((domain) => domain.url)
      .join("\n")

    navigator.clipboard.writeText(unblockedDomains).then(
      () => {
        alert("Safe domains copied to clipboard!")
      },
      (err) => {
        console.error("Could not copy text: ", err)
      },
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Unblocked":
        return <CheckCircle className="w-4 h-4 text-primary" />
      case "Blocked":
        return <XCircle className="w-4 h-4 text-destructive" />
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getLightspeedSafeCount = () => {
    return results.filter((domain) => domain.lightspeed.status === "Unblocked").length
  }

  const getFortiguardSafeCount = () => {
    return results.filter((domain) => domain.fortiguard.status === "Unblocked").length
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">SecurityScope</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Advanced domain security analysis powered by Lightspeed and FortiGuard filtering systems. Instantly verify
              domain safety and categorization for enhanced cybersecurity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Bulk Analysis</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Dual Filtering</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                <Search className="w-5 h-5 text-chart-3" />
                <span className="text-sm font-medium">Real-time Results</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-accent" />
            Domain Input
          </h3>

          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Select Filters:</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.lightspeed}
                  onChange={(e) => setFilters((prev) => ({ ...prev, lightspeed: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm">Lightspeed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.fortiguard}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fortiguard: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm">FortiGuard</span>
              </label>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter domains, URLs, or paste any text containing domains here..."
            className="w-full h-32 p-4 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">Domains will be automatically extracted from your text</p>
            <button
              onClick={checkLinks}
              disabled={isChecking}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Analyze Domains
                </>
              )}
            </button>
          </div>
        </div>

        {isChecking && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium">Security analysis in progress...</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-display font-semibold">Total Domains</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{results.length}</p>
              </div>

              {filters.lightspeed && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-chart-1/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-chart-1" />
                    </div>
                    <span className="font-display font-semibold">Lightspeed Safe</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-1">{getLightspeedSafeCount()}</p>
                </div>
              )}

              {filters.fortiguard && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-chart-2/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-chart-2" />
                    </div>
                    <span className="font-display font-semibold">FortiGuard Safe</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-2">{getFortiguardSafeCount()}</p>
                </div>
              )}

              <div className="bg-card rounded-xl border border-border p-6">
                <button onClick={copyUnblockedDomains} className="w-full text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Copy className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-display font-semibold">Copy Safe Domains</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Click to copy all safe domains</p>
                </button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-display font-semibold">Analysis Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Domain</th>
                      {filters.lightspeed && (
                        <>
                          <th className="text-left p-4 font-medium">Lightspeed Status</th>
                          <th className="text-left p-4 font-medium">Lightspeed Category</th>
                        </>
                      )}
                      {filters.fortiguard && (
                        <>
                          <th className="text-left p-4 font-medium">FortiGuard Status</th>
                          <th className="text-left p-4 font-medium">FortiGuard Category</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((domain, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-sm">{domain.url}</td>
                        {filters.lightspeed && (
                          <>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(domain.lightspeed.status)}
                                <span
                                  className={`text-sm font-medium ${
                                    domain.lightspeed.status === "Unblocked" ? "text-primary" : "text-destructive"
                                  }`}
                                >
                                  {domain.lightspeed.status}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{domain.lightspeed.category || "N/A"}</td>
                          </>
                        )}
                        {filters.fortiguard && (
                          <>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(domain.fortiguard.status)}
                                <span
                                  className={`text-sm font-medium ${
                                    domain.fortiguard.status === "Unblocked" ? "text-primary" : "text-destructive"
                                  }`}
                                >
                                  {domain.fortiguard.status}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{domain.fortiguard.category || "N/A"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
