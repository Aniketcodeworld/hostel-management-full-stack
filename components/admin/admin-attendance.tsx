"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "react-hot-toast"
import { CalendarIcon, CheckCircle2, CircleSlash, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type Allotee = {
  _id: string
  name: string
  email: string
  roll: string
  hostel: string
  room: string
}

type AttendanceRecord = {
  allotee: Allotee
  attendance: {
    status: 'present' | 'absent'
    date: string
    remarks: string
  } | null
}

export function AdminAttendance() {
  const [date, setDate] = useState<Date>(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    notMarked: 0,
    attendanceRate: 0
  })

  useEffect(() => {
    fetchAttendance()
    fetchStats()
  }, [date])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const formattedDate = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/attendance?date=${formattedDate}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records')
      }
      
      const data = await response.json()
      setAttendanceRecords(data.attendanceRecords)
    } catch (error: any) {
      toast.error(error.message || 'Error fetching attendance records')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/attendance/stats')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
    }
  }

  const markAttendance = (alloteeId: string, status: 'present' | 'absent') => {
    setAttendanceRecords(prev => 
      prev.map(record => {
        if (record.allotee._id === alloteeId) {
          return {
            ...record,
            attendance: {
              ...record.attendance,
              status,
              date: format(date, 'yyyy-MM-dd'),
              remarks: record.attendance?.remarks || ""
            }
          }
        }
        return record
      })
    )
  }

  const updateRemarks = (alloteeId: string, remarks: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => {
        if (record.allotee._id === alloteeId) {
          return {
            ...record,
            attendance: {
              ...(record.attendance || { status: 'absent', date: format(date, 'yyyy-MM-dd') }),
              remarks
            }
          }
        }
        return record
      })
    )
  }

  const saveAttendance = async () => {
    try {
      setSaving(true)
      
      // Get admin email from environment variable or localStorage
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com'
      
      // Prepare records to save
      const records = attendanceRecords
        .filter(record => record.attendance?.status) // Only send records with a status
        .map(record => ({
          alloteeId: record.allotee._id,
          status: record.attendance?.status,
          remarks: record.attendance?.remarks || ""
        }))
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records,
          adminEmail,
          date: format(date, 'yyyy-MM-dd')
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save attendance')
      }
      
      toast.success('Attendance saved successfully')
      
      // Refresh attendance data and stats
      fetchAttendance()
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || 'Error saving attendance')
    } finally {
      setSaving(false)
    }
  }

  const filteredRecords = searchQuery
    ? attendanceRecords.filter(record => 
        record.allotee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.allotee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.allotee.roll?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.allotee.hostel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.allotee.room?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : attendanceRecords

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Card className="w-full md:w-3/4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>Mark attendance for registered allotees</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={saveAttendance} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search allotees by name, email, roll number, hostel or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="rounded-md border">
              {loading ? (
                <div className="flex justify-center p-4">Loading attendance records...</div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No allotees found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll / Email</TableHead>
                      <TableHead>Hostel / Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.allotee._id}>
                        <TableCell className="font-medium">{record.allotee.name || "N/A"}</TableCell>
                        <TableCell>
                          <div>{record.allotee.roll || "No Roll Number"}</div>
                          <div className="text-muted-foreground text-xs">{record.allotee.email}</div>
                        </TableCell>
                        <TableCell>
                          {record.allotee.hostel && record.allotee.room ? (
                            <>
                              <div>{record.allotee.hostel}</div>
                              <div className="text-muted-foreground text-xs">Room: {record.allotee.room}</div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={record.attendance?.status === 'present' ? 'default' : 'outline'}
                              className={cn(
                                "rounded-full w-8 h-8 p-0",
                                record.attendance?.status === 'present' && "bg-green-500 hover:bg-green-600"
                              )}
                              onClick={() => markAttendance(record.allotee._id, 'present')}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="sr-only">Present</span>
                            </Button>
                            <Button
                              size="sm"
                              variant={record.attendance?.status === 'absent' ? 'default' : 'outline'}
                              className={cn(
                                "rounded-full w-8 h-8 p-0",
                                record.attendance?.status === 'absent' && "bg-red-500 hover:bg-red-600"
                              )}
                              onClick={() => markAttendance(record.allotee._id, 'absent')}
                            >
                              <CircleSlash className="h-4 w-4" />
                              <span className="sr-only">Absent</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Add remarks (optional)"
                            className="max-h-20 min-h-8"
                            value={record.attendance?.remarks || ""}
                            onChange={(e) => updateRemarks(record.allotee._id, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/4">
          <CardHeader>
            <CardTitle>Attendance Statistics</CardTitle>
            <CardDescription>Today's attendance summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Allotees</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Present</span>
                <span className="font-medium text-green-600">{stats.present}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Absent</span>
                <span className="font-medium text-red-600">{stats.absent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Not Marked</span>
                <span className="font-medium">{stats.notMarked}</span>
              </div>
            </div>
            
            <div>
              <div className="mb-2 text-muted-foreground text-sm">Attendance Rate</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${stats.attendanceRate}%` }}
                ></div>
              </div>
              <div className="text-right mt-1 text-sm font-medium">{stats.attendanceRate}%</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

