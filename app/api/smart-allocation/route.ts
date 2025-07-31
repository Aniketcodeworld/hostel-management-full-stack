import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { preferredFloor, preferredRoomType, specialNeeds, budget } = await req.json()

    // Get all available rooms
    const rooms = await prisma.room.findMany({
      where: {
        status: 'AVAILABLE'
      },
      include: {
        amenities: true,
        maintenanceHistory: true
      }
    })

    // Calculate match scores for each room
    const suggestions = rooms.map(room => {
      let matchScore = 0
      const reasons: string[] = []

      // Floor preference
      if (preferredFloor && room.floor.toLowerCase() === preferredFloor.toLowerCase()) {
        matchScore += 25
        reasons.push('Matches your preferred floor')
      }

      // Room type preference
      if (preferredRoomType && room.type.toLowerCase() === preferredRoomType.toLowerCase()) {
        matchScore += 25
        reasons.push('Matches your preferred room type')
      }

      // Budget consideration
      if (budget) {
        const [minBudget, maxBudget] = budget.split('-').map(Number)
        if (room.price >= minBudget && room.price <= maxBudget) {
          matchScore += 25
          reasons.push('Fits within your budget range')
        }
      }

      // Special needs consideration
      if (specialNeeds) {
        const needs = specialNeeds.toLowerCase()
        const hasMatchingAmenity = room.amenities.some(amenity => 
          amenity.name.toLowerCase().includes(needs)
        )
        if (hasMatchingAmenity) {
          matchScore += 25
          reasons.push('Has amenities matching your special needs')
        }
      }

      // Maintenance history consideration
      const recentMaintenance = room.maintenanceHistory.some(
        record => new Date(record.date).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      )
      if (recentMaintenance) {
        reasons.push('Recently maintained')
      }

      return {
        roomNumber: room.number,
        floor: room.floor,
        type: room.type,
        matchScore,
        reasons
      }
    })

    // Sort by match score
    suggestions.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error in smart allocation:', error)
    return NextResponse.json(
      { error: 'Failed to generate room suggestions' },
      { status: 500 }
    )
  }
} 