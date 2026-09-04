"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginPage } from "@/components/login-page"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => {
        if (r.ok) router.replace("/dashboard")
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [router])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <LoginPage />
}
