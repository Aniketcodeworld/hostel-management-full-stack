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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Plus, Search, UserPlus } from "lucide-react"

type Allotee = {
  _id: string
  name: string
  email: string
  roll: string
  hostel: string
  room: string
}

type Room = {
  _id: string
  number: string
  block: string
  floor: string
  capacity: number
  allotees: Allotee[]
}

export function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [unallocatedAllotees, setUnallocatedAllotees] = useState<Allotee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBlock, setSelectedBlock] = useState("all")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedAllotee, setSelectedAllotee] = useState<Allotee | null>(null)
  const [isAllotDialogOpen, setIsAllotDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingAllotees, setLoadingAllotees] = useState(true)
  const [formData, setFormData] = useState({
    number: "",
    block: "A",
    floor: "1",
    capacity: 2
  })
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false)

  useEffect(() => {
    fetchRooms()
    fetchUnallocatedAllotees()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rooms')
      
      if (!response.ok) {
        throw new Error('Failed to fetch rooms')
      }
      
      const data = await response.json()
      setRooms(data)
    } catch (error: any) {
      toast.error(error.message || 'Error fetching rooms')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnallocatedAllotees = async () => {
    try {
      setLoadingAllotees(true)
      const response = await fetch('/api/allotees/unallocated')
      
      if (!response.ok) {
        throw new Error('Failed to fetch unallocated allotees')
      }
      
      const data = await response.json()
      setUnallocatedAllotees(data)
    } catch (error: any) {
      toast.error(error.message || 'Error fetching unallocated allotees')
      console.error(error)
    } finally {
      setLoadingAllotees(false)
    }
  }

  const handleAddRoom = async () => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add room')
      }
      
      toast.success('Room added successfully')
      setIsAddRoomDialogOpen(false)
      setFormData({
        number: "",
        block: "A",
        floor: "1",
        capacity: 2
      })
      fetchRooms()
    } catch (error: any) {
      toast.error(error.message || 'Error adding room')
    }
  }

  const handleAllotRoom = async () => {
    if (!selectedRoom || !selectedAllotee) {
      toast.error("Please select both a room and an allotee")
      return
    }

    try {
      const response = await fetch(`/api/rooms/${selectedRoom._id}/allot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alloteeId: selectedAllotee._id
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to allot room')
      }
      
      toast.success(`${selectedAllotee.name || selectedAllotee.email} has been allotted to room ${selectedRoom.number}`)
      setIsAllotDialogOpen(false)
      setSelectedRoom(null)
      setSelectedAllotee(null)
      
      // Refresh data
      fetchRooms()
      fetchUnallocatedAllotees()
    } catch (error: any) {
      toast.error(error.message || 'Error allotting room')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) : value }))
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBlock = selectedBlock === "all" || room.block === selectedBlock
    return matchesSearch && matchesBlock
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Room Management</h2>
        <p className="text-muted-foreground">Manage hostel rooms and allot them to students.</p>
      </div>

      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="unallocated">Unallocated Allottees</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by room number..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="A">Block A</SelectItem>
                  <SelectItem value="B">Block B</SelectItem>
                  <SelectItem value="C">Block C</SelectItem>
                  <SelectItem value="D">Block D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Home className="mr-2 h-5 w-5" />
                  <span>Hostel Rooms</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setIsAddRoomDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Room
                </Button>
              </CardTitle>
              <CardDescription>
                {loading ? (
                  "Loading rooms..."
                ) : (
                  `Total ${rooms.length} rooms, ${rooms.reduce((acc, room) => acc + room.allotees.length, 0)} occupied`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center p-4">Loading rooms...</div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No rooms found. Add some rooms to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Allottees</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room._id}>
                        <TableCell>{room.number}</TableCell>
                        <TableCell>Block {room.block}</TableCell>
                        <TableCell>Floor {room.floor}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.allotees.length}</TableCell>
                        <TableCell>
                          {room.allotees.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {room.allotees.map((allotee) => (
                                <li key={allotee._id}>{allotee.name || allotee.email}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground">Unoccupied</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={room.allotees.length >= room.capacity}
                            onClick={() => {
                              setSelectedRoom(room)
                              setIsAllotDialogOpen(true)
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Allot
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="unallocated">
          <Card>
            <CardHeader>
              <CardTitle>Unallocated Allottees</CardTitle>
              <CardDescription>Students who have not been allotted a room yet.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAllotees ? (
                <div className="text-center p-4">Loading allottees...</div>
              ) : unallocatedAllotees.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">All allottees have been allocated rooms.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unallocatedAllotees.map((allotee) => (
                      <TableRow key={allotee._id}>
                        <TableCell>{allotee.name || "N/A"}</TableCell>
                        <TableCell>{allotee.email}</TableCell>
                        <TableCell>{allotee.roll || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAllotee(allotee)
                              setIsAllotDialogOpen(true)
                            }}
                          >
                            Allot Room
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>Enter the details for the new hostel room.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block">Block</Label>
                <Select 
                  value={formData.block} 
                  onValueChange={(value) => handleSelectChange('block', value)}
                >
                  <SelectTrigger id="block">
                    <SelectValue placeholder="Select Block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Block A</SelectItem>
                    <SelectItem value="B">Block B</SelectItem>
                    <SelectItem value="C">Block C</SelectItem>
                    <SelectItem value="D">Block D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Select 
                  value={formData.floor} 
                  onValueChange={(value) => handleSelectChange('floor', value)}
                >
                  <SelectTrigger id="floor">
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Floor 1</SelectItem>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Room Number</Label>
                <Input 
                  id="number"
                  name="number"
                  placeholder="e.g., A-101" 
                  value={formData.number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Select 
                  value={formData.capacity.toString()} 
                  onValueChange={(value) => handleSelectChange('capacity', value)}
                >
                  <SelectTrigger id="capacity">
                    <SelectValue placeholder="Select Capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Person</SelectItem>
                    <SelectItem value="2">2 People</SelectItem>
                    <SelectItem value="3">3 People</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddRoom}>
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allot Room Dialog */}
      <Dialog open={isAllotDialogOpen} onOpenChange={setIsAllotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allot Room</DialogTitle>
            <DialogDescription>
              {selectedAllotee
                ? `Allot a room to ${selectedAllotee.name || selectedAllotee.email}`
                : selectedRoom
                ? `Select an allottee for Room ${selectedRoom.number}`
                : "Select both a room and an allottee"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!selectedRoom && (
              <div className="space-y-2">
                <Label htmlFor="room">Select Room</Label>
                <Select onValueChange={(value) => setSelectedRoom(rooms.find(r => r._id === value) || null)}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Select Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms
                      .filter(room => room.allotees.length < room.capacity)
                      .map(room => (
                        <SelectItem key={room._id} value={room._id}>
                          {room.number} (Block {room.block}, Floor {room.floor})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!selectedAllotee && (
              <div className="space-y-2">
                <Label htmlFor="allotee">Select Allottee</Label>
                <Select onValueChange={(value) => setSelectedAllotee(unallocatedAllotees.find(a => a._id === value) || null)}>
                  <SelectTrigger id="allotee">
                    <SelectValue placeholder="Select Allottee" />
                  </SelectTrigger>
                  <SelectContent>
                    {unallocatedAllotees.map(allotee => (
                      <SelectItem key={allotee._id} value={allotee._id}>
                        {allotee.name || allotee.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedRoom && (
              <div className="p-2 bg-muted rounded-md">
                <p className="font-medium">Selected Room:</p>
                <p>{selectedRoom.number} (Block {selectedRoom.block}, Floor {selectedRoom.floor})</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRoom.allotees.length} of {selectedRoom.capacity} occupied
                </p>
              </div>
            )}
            {selectedAllotee && (
              <div className="p-2 bg-muted rounded-md">
                <p className="font-medium">Selected Allottee:</p>
                <p>{selectedAllotee.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{selectedAllotee.email}</p>
                {selectedAllotee.roll && (
                  <p className="text-sm text-muted-foreground">Roll: {selectedAllotee.roll}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAllotDialogOpen(false)
              setSelectedRoom(null)
              setSelectedAllotee(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleAllotRoom} disabled={!selectedRoom || !selectedAllotee}>
              Allot Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

