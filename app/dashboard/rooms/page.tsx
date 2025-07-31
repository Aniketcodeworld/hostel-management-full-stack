"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { AdminRooms } from "@/components/admin/admin-rooms"
import { AllotteeRooms } from "@/components/allottee/allottee-rooms"

export default function RoomsPage() {
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

  return <DashboardLayout>{user.role === "admin" ? <AdminRooms /> : <AllotteeRooms />}</DashboardLayout>
}

