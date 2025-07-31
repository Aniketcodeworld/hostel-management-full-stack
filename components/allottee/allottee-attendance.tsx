"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon } from "lucide-react"

export function AllotteeAttendance() {
  // Mock data for attendance history
  const attendanceHistory = [
    { date: "2023-04-01", day: "Monday", status: "Present" },
    { date: "2023-04-02", day: "Tuesday", status: "Present" },
    { date: "2023-04-03", day: "Wednesday", status: "Absent" },
    { date: "2023-04-04", day: "Thursday", status: "Present" },
    { date: "2023-04-05", day: "Friday", status: "Present" },
    { date: "2023-04-08", day: "Monday", status: "Present" },
    { date: "2023-04-09", day: "Tuesday", status: "Absent" },
    { date: "2023-04-10", day: "Wednesday", status: "Present" },
    { date: "2023-04-11", day: "Thursday", status: "Present" },
    { date: "2023-04-12", day: "Friday", status: "Present" },
  ]

  // Calculate attendance statistics
  const totalDays = attendanceHistory.length
  const presentDays = attendanceHistory.filter((day) => day.status === "Present").length
  const absentDays = totalDays - presentDays
  const attendanceRate = Math.round((presentDays / totalDays) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
        <p className="text-muted-foreground">View your attendance history and statistics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${attendanceRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentDays}</div>
            <p className="text-xs text-muted-foreground">Out of {totalDays} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentDays}</div>
            <p className="text-xs text-muted-foreground">Out of {totalDays} days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            <span>Attendance History</span>
          </CardTitle>
          <CardDescription>Your attendance record for the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{record.day}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        record.status === "Present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

