"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LandingPage } from "@/components/layout/landing-page"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)
  const [igError, setIgError] = useState<string | null>(null)

  useEffect(() => {
    const err = searchParams.get("ig_error")
    if (err) setIgError(err)

    // Check both auth methods in parallel
    Promise.all([
      fetch("/api/instagram/session"),
      fetch("/api/auth/session"),
    ]).then(([igRes, authRes]) => {
      if (igRes.ok || authRes.ok) router.replace("/dashboard")
      else setChecking(false)
    }).catch(() => setChecking(false))
  }, [router, searchParams])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <LandingPage error={igError} />
}
