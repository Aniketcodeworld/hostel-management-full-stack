"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { AdminRegister } from "@/components/admin/admin-register"

export default function RegisterPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login")
    }
    // Redirect to dashboard if user is not admin
    else if (user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Register New Allotee</h1>
      <p className="text-muted-foreground">Add a new student to the hostel system.</p>
      <AdminRegister />
    </div>
  )
}

