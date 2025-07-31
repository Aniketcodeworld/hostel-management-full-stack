"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, Home, MessageSquare, UserPlus } from "lucide-react"
import Link from "next/link"

// Define types for database objects
type Allotee = {
  _id: string
  name: string
  email: string
  roll: string
  hostel: string
  room: string
  registeredBy: string
  registeredAt: string
}

type Activity = {
  action: string
  user: string
  time: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAllotees: 0,
    roomOccupancy: 0,
    attendanceRate: 0,
    openComplaints: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch allotees count
      const alloteesResponse = await fetch('/api/allotees')
      if (alloteesResponse.ok) {
        const allotees = await alloteesResponse.json() as Allotee[]
        const alloteesWithRooms = allotees.filter((a: Allotee) => a.room && a.hostel)
        
        // Get attendance stats
        const attendanceResponse = await fetch('/api/attendance/stats')
        let attendanceRate = 0
        
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          attendanceRate = attendanceData.attendanceRate || 0
        }
        
        setStats({
          totalAllotees: allotees.length,
          roomOccupancy: allotees.length > 0 
            ? Math.round((alloteesWithRooms.length / allotees.length) * 100) 
            : 0,
          attendanceRate: attendanceRate,
          openComplaints: 0  // Will be updated when we implement complaints
        })

        // Create recent activities from latest allotees
        if (allotees.length > 0) {
          const activities = allotees.slice(0, 4).map((allotee: Allotee) => ({
            action: allotee.room 
              ? `Room ${allotee.room} allocated in ${allotee.hostel}` 
              : "New allottee registered",
            user: allotee.name || allotee.email,
            time: new Date(allotee.registeredAt).toLocaleDateString()
          }))
          setRecentActivities(activities)
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Display for stats
  const statsDisplay = [
    {
      title: "Total Allottees",
      value: loading ? "Loading..." : stats.totalAllotees.toString(),
      description: "Registered students",
      icon: UserPlus
    },
    {
      title: "Room Occupancy",
      value: loading ? "Loading..." : `${stats.roomOccupancy}%`,
      description: "Rooms allocated",
      icon: Home
    },
    {
      title: "Attendance Rate",
      value: loading ? "Loading..." : `${stats.attendanceRate}%`,
      description: "Average daily attendance",
      icon: CalendarCheck
    },
    {
      title: "Open Complaints",
      value: loading ? "Loading..." : stats.openComplaints.toString(),
      description: "Pending resolution",
      icon: MessageSquare
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of hostel management statistics and activities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions in the hostel management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Loading activities...</p>
              ) : recentActivities.length === 0 ? (
                <p className="text-muted-foreground">No recent activities found</p>
              ) : (
                recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.user}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/attendance">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <CalendarCheck className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Mark Attendance</span>
                </div>
              </Link>
              <Link href="/dashboard/allotees">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Home className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Manage Allotees</span>
                </div>
              </Link>
              <Link href="/dashboard/register">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Register Allottee</span>
                </div>
              </Link>
              <Link href="/dashboard/complaints">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Review Complaints</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

