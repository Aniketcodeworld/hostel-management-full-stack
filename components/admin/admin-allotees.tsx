"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function AdminAllotees() {
  const [allotees, setAllotees] = useState<Allotee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAllotee, setSelectedAllotee] = useState<Allotee | null>(null)
  const [hostel, setHostel] = useState("")
  const [room, setRoom] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchAllotees()
  }, [])

  const fetchAllotees = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/allotees')
      
      if (!response.ok) {
        throw new Error('Failed to fetch allotees')
      }
      
      const data = await response.json()
      setAllotees(data)
    } catch (error: any) {
      toast.error(error.message || 'Error fetching allotees')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRoom = async () => {
    if (!selectedAllotee) return
    
    try {
      const response = await fetch(`/api/allotees/${selectedAllotee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostel,
          room
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update allotee')
      }
      
      // Update the allotee in the local state
      setAllotees(prev => 
        prev.map(a => 
          a._id === selectedAllotee._id 
            ? { ...a, hostel, room } 
            : a
        )
      )
      
      toast.success('Room assigned successfully')
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Error assigning room')
    }
  }

  const openDialog = (allotee: Allotee) => {
    setSelectedAllotee(allotee)
    setHostel(allotee.hostel || "")
    setRoom(allotee.room || "")
    setOpen(true)
  }

  // Sample hostel options
  const hostelOptions = [
    { id: "A", name: "A Block" },
    { id: "B", name: "B Block" },
    { id: "C", name: "C Block" },
    { id: "D", name: "D Block" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Allotees</CardTitle>
        <CardDescription>Manage hostel allocations for registered students</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading allotees...</div>
        ) : allotees.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No allotees registered yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allotees.map((allotee) => (
                <TableRow key={allotee._id}>
                  <TableCell className="font-medium">{allotee.name || "N/A"}</TableCell>
                  <TableCell>{allotee.email}</TableCell>
                  <TableCell>{allotee.roll || "N/A"}</TableCell>
                  <TableCell>{allotee.hostel || "Not assigned"}</TableCell>
                  <TableCell>{allotee.room || "Not assigned"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openDialog(allotee)}>
                      Assign Room
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Room</DialogTitle>
              <DialogDescription>
                Assign a hostel and room number to {selectedAllotee?.name || selectedAllotee?.email}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="hostel">Hostel Block</Label>
                <Select value={hostel} onValueChange={setHostel}>
                  <SelectTrigger id="hostel">
                    <SelectValue placeholder="Select hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostelOptions.map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input
                  id="room"
                  placeholder="e.g. A101"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAssignRoom}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 