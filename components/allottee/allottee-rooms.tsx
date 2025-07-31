"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Home, Users } from "lucide-react"

export function AllotteeRooms() {
  // Mock data for room details
  const roomDetails = {
    number: "B-204",
    block: "B",
    floor: "2",
    capacity: 2,
    roommates: [
      { name: "John Doe (You)", email: "john.doe@example.com" },
      { name: "Michael Brown", email: "michael.brown@example.com" },
    ],
    amenities: ["Bed", "Study Table", "Chair", "Wardrobe", "Ceiling Fan", "Window"],
    lastCleaned: "2023-04-10",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Room Details</h2>
        <p className="text-muted-foreground">Information about your hostel room and roommates.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              <span>Room Information</span>
            </CardTitle>
            <CardDescription>Details about your current room assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Room Number</p>
                  <p className="text-lg font-semibold">{roomDetails.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Block</p>
                  <p className="text-lg font-semibold">Block {roomDetails.block}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Floor</p>
                  <p className="text-lg font-semibold">Floor {roomDetails.floor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                  <p className="text-lg font-semibold">{roomDetails.capacity} People</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Cleaned</p>
                <p className="text-lg font-semibold">
                  {new Date(roomDetails.lastCleaned).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              <span>Roommates</span>
            </CardTitle>
            <CardDescription>People sharing the room with you</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomDetails.roommates.map((roommate, index) => (
                  <TableRow key={index}>
                    <TableCell>{roommate.name}</TableCell>
                    <TableCell>{roommate.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Amenities</CardTitle>
          <CardDescription>Facilities provided in your room</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {roomDetails.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center p-3 border rounded-lg">
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

