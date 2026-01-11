import { Suspense } from "react"
import PhoneDisplayLookup from "@/components/phone-display-lookup"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PhoneDisplayLookup />
    </Suspense>
  )
}
