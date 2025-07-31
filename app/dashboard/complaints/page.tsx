"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { AdminComplaints } from "@/components/admin/admin-complaints"
import { AllotteeComplaints } from "@/components/allottee/allottee-complaints"

export default function ComplaintsPage() {
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

  return <DashboardLayout>{user.role === "admin" ? <AdminComplaints /> : <AllotteeComplaints />}</DashboardLayout>
}

