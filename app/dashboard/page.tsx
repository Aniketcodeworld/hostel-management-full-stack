"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AllotteeDashboard } from "@/components/allottee/allottee-dashboard"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return <DashboardLayout>{user.role === "admin" ? <AdminDashboard /> : <AllotteeDashboard />}</DashboardLayout>
}

