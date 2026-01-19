"use client"

import type React from "react"

import { useState } from "react"
import { Search, Smartphone, Maximize } from "lucide-react"

type NotchType = "dynamic-island" | "wide" | "teardrop" | "punch-hole" | "pill" | "none"

interface PhoneResult {
  name: string
  brand: string
  slug: string
}

interface PhoneSpecs {
  name: string
  brand: string
  displaySize: string
  screenToBody: string
  resolution: string
  displayType: string
}

const notchDescriptions: Record<NotchType, string> = {
  "dynamic-island": "Pill-shaped cutout with interactive features (iPhone 14 Pro+)",
  wide: "Wide notch housing Face ID sensors (iPhone X-13)",
  teardrop: "Small centered teardrop cutout for front camera",
  "punch-hole": "Small circular hole-punch cutout for camera",
  pill: "Elongated pill-shaped cutout for camera and sensors",
  none: "Full screen display with no visible cutout",
}

const notchLabels: Record<NotchType, string> = {
  "dynamic-island": "Dynamic Island",
  wide: "Wide Notch",
  teardrop: "Teardrop",
  "punch-hole": "Punch Hole",
  pill: "Pill Cutout",
  none: "Full Screen",
}

const detectNotchType = (phoneName: string): NotchType => {
  const name = phoneName.toLowerCase()

  // ===== APPLE =====
  if (name.includes("iphone")) {
    // Dynamic Island: iPhone 14 Pro/Pro Max and all iPhone 15/16/17+ models
    if (
      name.includes("iphone 14 pro") ||
      name.includes("iphone 15") ||
      name.includes("iphone 16") ||
      name.includes("iphone 17")
    ) {
      return "dynamic-island"
    }
    // Wide notch: iPhone X through iPhone 14 (non-Pro)
    if (
      name.includes("iphone x") ||
      name.includes("iphone 11") ||
      name.includes("iphone 12") ||
      name.includes("iphone 13") ||
      name.includes("iphone 14")
    ) {
      return "wide"
    }
    // Older iPhones (8 and below) - no notch
    return "none"
  }

  // ===== SAMSUNG =====
  if (name.includes("samsung") || name.includes("galaxy")) {
    // Galaxy Z Flip series - punch hole
    if (name.includes("flip")) return "punch-hole"
    // Galaxy Z Fold series - punch hole
    if (name.includes("fold")) return "punch-hole"

    // Galaxy S series
    if (name.includes("galaxy s")) {
      // S10 and newer use punch-hole
      const sMatch = name.match(/galaxy s(\d+)/i)
      if (sMatch) {
        const sNum = Number.parseInt(sMatch[1])
        if (sNum >= 10) return "punch-hole"
      }
      // S24, S23, S22, S21, S20, S10 - punch hole
      if (/s2[0-4]|s10/.test(name)) return "punch-hole"
      // Older S series - no notch (S9 and below)
      return "none"
    }

    // Galaxy A series - varies by model and year
    if (name.includes("galaxy a")) {
      const aMatch = name.match(/galaxy a(\d+)/i)
      if (aMatch) {
        const aNum = Number.parseInt(aMatch[1])
        // A50 and above from 2020+ mostly use punch-hole
        // A30, A20, A10 series often use teardrop
        // A5x (A50, A51, A52, A53, A54, A55) - newer ones punch hole
        if (aNum >= 51) return "punch-hole"
        // A30s, A50s, A70 era - teardrop was common
        if (aNum >= 30 && aNum <= 50) return "teardrop"
        // A70, A80 - punch hole
        if (aNum >= 70) return "punch-hole"
        // A10, A20 series - teardrop
        if (aNum >= 10 && aNum < 30) return "teardrop"
      }
      // Check year in name for A series
      if (/a[0-9]+s/.test(name)) return "teardrop" // A30s, A50s etc
      if (/a5[1-5]|a7[1-5]|a3[3-5]/.test(name)) return "punch-hole"
      return "teardrop" // Default older A series
    }

    // Galaxy M series - mostly teardrop/punch-hole
    if (name.includes("galaxy m")) {
      const mMatch = name.match(/galaxy m(\d+)/i)
      if (mMatch) {
        const mNum = Number.parseInt(mMatch[1])
        if (mNum >= 51) return "punch-hole"
        if (mNum >= 30) return "teardrop"
      }
      return "teardrop"
    }

    // Galaxy F series - teardrop
    if (name.includes("galaxy f")) return "teardrop"

    // Default Samsung
    return "punch-hole"
  }

  // ===== GOOGLE PIXEL =====
  if (name.includes("pixel")) {
    // Pixel 3 XL had the wide notch
    if (name.includes("pixel 3") && name.includes("xl")) return "wide"
    // Pixel 3 (non-XL) - no notch
    if (name.includes("pixel 3") && !name.includes("xl") && !name.includes("3a")) return "none"
    // Pixel 3a, 4a - punch hole
    if (name.includes("3a") || name.includes("4a")) return "punch-hole"
    // Pixel 4/4XL - no notch (radar sensor in bezel)
    if (name.includes("pixel 4") && !name.includes("4a")) return "none"
    // Pixel 5, 6, 7, 8, 9 - punch hole
    if (/pixel [5-9]/.test(name)) return "punch-hole"
    return "punch-hole"
  }

  // ===== ONEPLUS =====
  if (name.includes("oneplus")) {
    // OnePlus 6T, 7 - teardrop
    if (name.includes("6t") || (name.includes("oneplus 7") && !name.includes("7t") && !name.includes("pro"))) {
      return "teardrop"
    }
    // OnePlus 7 Pro, 7T Pro - pop-up camera, no notch
    if ((name.includes("7") || name.includes("7t")) && name.includes("pro")) return "none"
    // OnePlus 8, 9, 10, 11, 12, Nord - punch hole
    if (/oneplus [8-9]|oneplus 1[0-2]|nord/.test(name)) return "punch-hole"
    return "punch-hole"
  }

  // ===== XIAOMI =====
  if (name.includes("xiaomi") || name.includes("redmi") || name.includes("poco")) {
    // Mi Mix series - some have no notch
    if (name.includes("mi mix")) return "none"
    // Mi 9, Mi 10, Mi 11, Mi 12 - teardrop or punch-hole
    if (name.includes("mi 9")) return "teardrop"
    if (/mi 1[0-3]/.test(name)) return "punch-hole"

    // Redmi Note series
    if (name.includes("redmi note")) {
      const noteMatch = name.match(/note (\d+)/i)
      if (noteMatch) {
        const noteNum = Number.parseInt(noteMatch[1])
        // Note 10+ and newer - punch hole
        if (noteNum >= 10) return "punch-hole"
        // Note 7, 8, 9 - teardrop
        if (noteNum >= 7) return "teardrop"
      }
      return "teardrop"
    }

    // Redmi (non-Note)
    if (name.includes("redmi")) {
      // Redmi 9, 10, 11, 12 series - teardrop mostly
      if (/redmi [9]|redmi 1[0-4]/.test(name) && !name.includes("note")) {
        return "teardrop"
      }
      return "teardrop"
    }

    // Poco
    if (name.includes("poco")) {
      if (name.includes("f1")) return "wide"
      return "punch-hole"
    }

    // Xiaomi numbered series (11, 12, 13, 14)
    if (/xiaomi 1[1-4]/.test(name)) return "punch-hole"

    return "teardrop"
  }

  // ===== OPPO =====
  if (name.includes("oppo")) {
    // Find X series - various
    if (name.includes("find x")) {
      if (
        name.includes("find x3") ||
        name.includes("find x5") ||
        name.includes("find x6") ||
        name.includes("find x7")
      ) {
        return "punch-hole"
      }
      return "punch-hole"
    }
    // Reno series
    if (name.includes("reno")) {
      // Reno 10x zoom had pop-up
      if (name.includes("10x")) return "none"
      // Most Reno - punch hole
      return "punch-hole"
    }
    // A series - teardrop
    if (name.includes("oppo a")) return "teardrop"
    // F series - teardrop
    if (name.includes("oppo f")) return "teardrop"
    return "teardrop"
  }

  // ===== VIVO =====
  if (name.includes("vivo")) {
    // V series - teardrop
    if (name.includes("vivo v")) return "teardrop"
    // Y series - teardrop
    if (name.includes("vivo y")) return "teardrop"
    // X series - punch-hole
    if (name.includes("vivo x")) return "punch-hole"
    // NEX - pop-up, no notch
    if (name.includes("nex")) return "none"
    // iQOO - punch-hole
    if (name.includes("iqoo")) return "punch-hole"
    return "teardrop"
  }

  // ===== REALME =====
  if (name.includes("realme")) {
    // GT series - punch hole
    if (name.includes("gt")) return "punch-hole"
    // Numbered series (8, 9, 10, 11, 12)
    const realmeMatch = name.match(/realme (\d+)/i)
    if (realmeMatch) {
      const num = Number.parseInt(realmeMatch[1])
      if (num >= 8) return "punch-hole"
      return "teardrop"
    }
    // C series - teardrop
    if (name.includes("realme c")) return "teardrop"
    // Narzo - punch hole
    if (name.includes("narzo")) return "punch-hole"
    return "teardrop"
  }

  // ===== HUAWEI =====
  if (name.includes("huawei") || name.includes("honor")) {
    // P series
    if (name.includes("p30")) return "teardrop"
    if (name.includes("p40") || name.includes("p50") || name.includes("p60")) return "pill"
    // Mate series
    if (name.includes("mate 20")) return "wide"
    if (name.includes("mate 30") || name.includes("mate 40") || name.includes("mate 50")) return "wide"
    // Nova - teardrop/punch-hole
    if (name.includes("nova")) return "teardrop"
    // Honor
    if (name.includes("honor")) {
      if (name.includes("magic")) return "punch-hole"
      return "teardrop"
    }
    return "teardrop"
  }

  // ===== MOTOROLA =====
  if (name.includes("motorola") || name.includes("moto")) {
    // Edge series - punch hole
    if (name.includes("edge")) return "punch-hole"
    // G series - teardrop mostly
    if (name.includes("moto g")) {
      // Newer G series (G 5G, G Power 2021+) - punch hole
      if (name.includes("5g") || /g[0-9]{2}/.test(name)) return "punch-hole"
      return "teardrop"
    }
    // Razr - punch hole / fold
    if (name.includes("razr")) return "punch-hole"
    return "teardrop"
  }

  // ===== NOTHING =====
  if (name.includes("nothing")) {
    return "punch-hole"
  }

  // ===== SONY =====
  if (name.includes("sony") || name.includes("xperia")) {
    // Xperia - no notch, they use bezels
    return "none"
  }

  // ===== ASUS =====
  if (name.includes("asus") || name.includes("rog") || name.includes("zenfone")) {
    // ROG Phone - no notch
    if (name.includes("rog")) return "none"
    // Zenfone 6, 7 - flip camera, no notch
    if (name.includes("zenfone 6") || name.includes("zenfone 7")) return "none"
    // Zenfone 8, 9, 10 - punch hole
    if (/zenfone [8-9]|zenfone 10/.test(name)) return "punch-hole"
    return "punch-hole"
  }

  // ===== NOKIA =====
  if (name.includes("nokia")) {
    // Most Nokia phones use teardrop
    return "teardrop"
  }

  // ===== TECNO / INFINIX / ITEL =====
  if (name.includes("tecno") || name.includes("infinix") || name.includes("itel")) {
    return "teardrop"
  }

  // ===== LG =====
  if (name.includes("lg ")) {
    // LG V60 and newer - teardrop
    if (name.includes("v60") || name.includes("velvet")) return "teardrop"
    // Older LG - no notch
    return "none"
  }

  // Default fallback - punch hole is most common now
  return "punch-hole"
}

export default function PhoneDisplayLookup() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<PhoneResult[]>([])
  const [selectedPhone, setSelectedPhone] = useState<PhoneSpecs | null>(null)
  const [notchType, setNotchType] = useState<NotchType>("punch-hole")
  const [error, setError] = useState("")

  const searchPhone = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError("")
    setSearchResults([])
    setSelectedPhone(null)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else if (data.results && data.results.length > 0) {
        setSearchResults(data.results)
      } else {
        setError("No phones found. Try a different search term.")
      }
    } catch {
      setError("Failed to search. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const selectPhone = async (phone: PhoneResult) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/phone?slug=${encodeURIComponent(phone.slug)}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSelectedPhone(data)
        setSearchResults([])
        setNotchType(detectNotchType(data.name))
      }
    } catch {
      setError("Failed to get phone details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") searchPhone()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-5">
        {/* Header */}
        <header className="py-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2.5 text-xl font-semibold">
            <Smartphone className="w-8 h-8 text-blue-500" />
            <span>DisplaySpec</span>
          </div>
        </header>

        {/* Main */}
        <main className="py-16">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Phone Display Lookup</h1>
          <p className="text-lg text-gray-400 mb-10 max-w-lg">
            Search any smartphone to get display size, screen-to-body ratio, and notch type
          </p>

          {/* Search Box */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter phone name (e.g., iPhone 15 Pro, Samsung S24 Ultra)"
              className="flex-1 px-5 py-4 text-base bg-[#141414] border border-[#2a2a2a] rounded-xl text-white outline-none focus:border-blue-500 placeholder:text-gray-500 transition-colors"
            />
            <button
              onClick={searchPhone}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-4 text-base font-medium bg-blue-500 text-white border-none rounded-xl cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-3 border-[#2a2a2a] border-t-blue-500 rounded-full mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Fetching display specs from GSMArena...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 text-red-400 text-center text-sm bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              {error}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
              <h3 className="text-base text-gray-400 mb-4">Select a phone:</h3>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {searchResults.map((phone, i) => (
                  <button
                    key={i}
                    onClick={() => selectPhone(phone)}
                    className="flex items-center gap-4 p-3 px-4 bg-[#141414] border border-[#2a2a2a] rounded-xl cursor-pointer transition-all hover:border-blue-500 hover:bg-[#1a1a1a] text-left"
                  >
                    <div className="w-10 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-0.5">{phone.name}</div>
                      <div className="text-sm text-gray-400">{phone.brand}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Card */}
          {selectedPhone && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 mb-10">
              <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[#2a2a2a]">
                {/* Phone Visual */}
                <div className="w-24 h-48 bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] rounded-[20px] p-1.5 flex-shrink-0 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-b from-[#1e3a5f] via-[#0f1f35] to-[#0a1525] rounded-2xl relative overflow-hidden">
                    <NotchVisual type={notchType} size="large" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-1">{selectedPhone.name}</h2>
                  <p className="text-gray-400 text-sm">{selectedPhone.brand}</p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-5 mb-8">
                <SpecItem
                  icon={<Maximize className="w-6 h-6" />}
                  label="Display Size"
                  value={selectedPhone.displaySize}
                />
                <SpecItem
                  icon={
                    <div className="w-6 h-6 border-2 border-current rounded p-0.5">
                      <div className="w-full h-full border border-current rounded-sm" />
                    </div>
                  }
                  label="Screen-to-Body"
                  value={selectedPhone.screenToBody}
                />
              </div>

              {/* Notch Section */}
              <div className="pt-6 border-t border-[#2a2a2a]">
                <h3 className="text-base font-semibold mb-4 text-gray-400">Select Notch / Cutout Type</h3>
                <div className="mb-6">
                  <span className="text-2xl font-semibold text-green-500 block mb-1">{notchLabels[notchType]}</span>
                  <p className="text-gray-400 text-sm">{notchDescriptions[notchType]}</p>
                </div>

                {/* Notch Options */}
                <div className="bg-[#141414] rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-3">Change notch type:</p>
                  <div className="grid grid-cols-6 gap-2">
                    {(Object.keys(notchLabels) as NotchType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNotchType(type)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                          notchType === type
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-blue-500"
                        }`}
                      >
                        <div className="w-8 h-16 bg-[#2a2a2a] rounded-md p-0.5">
                          <div className="w-full h-full bg-gradient-to-b from-[#1a3050] to-[#0f1f35] rounded relative overflow-hidden">
                            <NotchVisual type={type} size="small" />
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 text-center">{notchLabels[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-[#2a2a2a] text-center">
          <p className="text-sm text-gray-400">Data sourced from GSMArena</p>
        </footer>
      </div>
    </div>
  )
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-5 bg-[#141414] rounded-xl">
      <div className="w-12 h-12 flex items-center justify-center bg-[#1a1a1a] rounded-lg text-blue-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-xl font-semibold">{value}</span>
      </div>
    </div>
  )
}

function NotchVisual({ type, size }: { type: NotchType; size: "large" | "small" }) {
  const isLarge = size === "large"

  const styles: Record<NotchType, string> = {
    "dynamic-island": isLarge
      ? "absolute top-2 left-1/2 -translate-x-1/2 w-[40%] h-[8%] bg-black rounded-full"
      : "absolute top-1 left-1/2 -translate-x-1/2 w-3.5 h-1.5 bg-black rounded-full",
    wide: isLarge
      ? "absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[12%] bg-black rounded-b-xl"
      : "absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-black rounded-b",
    teardrop: isLarge
      ? "absolute top-0 left-1/2 -translate-x-1/2 w-[16%] h-[10%] bg-black rounded-b-full"
      : "absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-b-full",
    "punch-hole": isLarge
      ? "absolute top-[5%] left-1/2 -translate-x-1/2 w-[8%] h-[5%] bg-black rounded-full"
      : "absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full",
    pill: isLarge
      ? "absolute top-[5%] left-1/2 -translate-x-1/2 w-[25%] h-[6%] bg-black rounded-lg"
      : "absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-1 bg-black rounded",
    none: "hidden",
  }

  return <div className={styles[type]} />
}
