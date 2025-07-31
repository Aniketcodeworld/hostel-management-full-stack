"use client"

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Loader2, MessageSquare, Search } from "lucide-react"

interface Complaint {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  roomNumber: string
  hostelBlock: string
  createdAt: string
  updatedAt: string
  studentId: string
  student: {
    email: string
  }
}

export function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [resolution, setResolution] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/complaints")
      if (!response.ok) {
        throw new Error("Failed to fetch complaints")
      }
      const data = await response.json()
      setComplaints(data)
    } catch (error) {
      toast.error("Failed to load complaints")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveComplaint = async () => {
    if (!resolution.trim()) {
      toast.error("Please enter a resolution")
      return
    }

    if (!selectedComplaint) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Resolved",
          resolution: resolution,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update complaint")
      }

      await fetchComplaints() // Refresh the complaints list
      toast.success(`Complaint #${selectedComplaint.id} has been resolved`)
      setIsResolveDialogOpen(false)
      setResolution("")
    } catch (error) {
      toast.error("Failed to resolve complaint")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.student?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || complaint.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Complaint Management</h2>
        <p className="text-muted-foreground">Review and resolve complaints submitted by hostel allottees.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search complaints..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Complaints</TabsTrigger>
          <TabsTrigger value="Open">Open</TabsTrigger>
          <TabsTrigger value="In Progress">In Progress</TabsTrigger>
          <TabsTrigger value="Resolved">Resolved</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                <span>All Complaints</span>
              </CardTitle>
              <CardDescription>Total {filteredComplaints.length} complaints</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint, index) => (
                        <TableRow 
                          key={`${complaint.id}-${complaint.createdAt}-${index}`}
                        >
                          <TableCell>#{complaint.id}</TableCell>
                          <TableCell>{complaint.title}</TableCell>
                          <TableCell>{complaint.category}</TableCell>
                          <TableCell>{complaint.student?.email || "Unknown Student"}</TableCell>
                          <TableCell>{complaint.roomNumber}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                complaint.status === "Open"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : complaint.status === "In Progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {complaint.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                complaint.priority === "High"
                                  ? "bg-red-100 text-red-700"
                                  : complaint.priority === "Medium"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {complaint.priority}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => {
                                setSelectedComplaint(complaint)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              View
                            </Button>
                            {complaint.status !== "Resolved" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedComplaint(complaint)
                                  setIsResolveDialogOpen(true)
                                }}
                              >
                                Resolve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No complaints found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <p className="mt-1">{selectedComplaint.title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="mt-1">{selectedComplaint.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <p className="mt-1">{selectedComplaint.category}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <p className="mt-1">{selectedComplaint.priority}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Room Number</Label>
                  <p className="mt-1">{selectedComplaint.roomNumber}</p>
                </div>
                <div>
                  <Label>Hostel Block</Label>
                  <p className="mt-1">{selectedComplaint.hostelBlock}</p>
                </div>
              </div>
              <div>
                <Label>Submitted By</Label>
                <p className="mt-1">
                  {selectedComplaint.student ? 
                    `${selectedComplaint.student.email}` : 
                    "Unknown Student"}
                </p>
              </div>
              <div>
                <Label>Submitted On</Label>
                <p className="mt-1">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Enter the resolution details for this complaint. This will mark the complaint as resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter the resolution details..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveComplaint} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolve Complaint
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

