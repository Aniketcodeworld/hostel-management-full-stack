"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, Home, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function AllotteeDashboard() {
  const { user } = useAuth()

  // Mock data for statistics (to be replaced with real API data later)
  const dashboardData = {
    roomNumber: "B-204",
    attendanceRate: "92%",
    pendingComplaints: 1,
    recentAttendance: [
      { date: "2023-04-01", status: "Present" },
      { date: "2023-04-02", status: "Present" },
      { date: "2023-04-03", status: "Absent" },
      { date: "2023-04-04", status: "Present" },
      { date: "2023-04-05", status: "Present" },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.email}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Details</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.roomNumber}</div>
            <p className="text-xs text-muted-foreground">Block B, Second Floor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.attendanceRate}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingComplaints}</div>
            <p className="text-xs text-muted-foreground">Awaiting resolution</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your attendance for the last 5 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAttendance.map((day, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${day.status === "Present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {day.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for allottees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/attendance">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <CalendarCheck className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">View Attendance</span>
                </div>
              </Link>
              <Link href="/dashboard/rooms">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Home className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Room Details</span>
                </div>
              </Link>
              <Link href="/dashboard/complaints">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Raise Complaint</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

