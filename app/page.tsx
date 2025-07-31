"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to dashboard if logged in, otherwise to login page
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [user, router])

  return null
}

