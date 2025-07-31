"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { AdminAttendance } from "@/components/admin/admin-attendance"
import { AllotteeAttendance } from "@/components/allottee/allottee-attendance"

export default function AttendancePage() {
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

  return <DashboardLayout>{user.role === "admin" ? <AdminAttendance /> : <AllotteeAttendance />}</DashboardLayout>
}

