import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Common maintenance issues and their average frequency in days
const MAINTENANCE_ISSUES = {
  plumbing: 180,
  electrical: 365,
  painting: 730,
  furniture: 365,
  cleaning: 30,
  ac_maintenance: 90
}

export async function GET() {
  try {
    // Get all rooms with their maintenance history
    const rooms = await prisma.room.findMany({
      include: {
        maintenanceHistory: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    })

    const predictions = rooms.map(room => {
      // Group maintenance history by type
      const historyByType = room.maintenanceHistory.reduce((acc, record) => {
        if (!acc[record.type]) {
          acc[record.type] = []
        }
        acc[record.type].push(record)
        return acc
      }, {} as Record<string, typeof room.maintenanceHistory>)

      // Predict future issues based on historical data
      const predictedIssues = Object.entries(MAINTENANCE_ISSUES).map(([type, avgFrequency]) => {
        const history = historyByType[type] || []
        const lastMaintenance = history[0]?.date ? new Date(history[0].date) : null

        // Calculate probability based on time since last maintenance
        let probability = 0
        let estimatedDate = new Date()

        if (lastMaintenance) {
          const daysSinceLastMaintenance = Math.floor(
            (Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
          )
          
          // Higher probability if past average frequency
          probability = Math.min(0.95, daysSinceLastMaintenance / avgFrequency)
          
          // Estimate next maintenance date
          estimatedDate = new Date(
            lastMaintenance.getTime() + avgFrequency * 24 * 60 * 60 * 1000
          )
        } else {
          // If no history, use average frequency
          probability = 0.5
          estimatedDate = new Date(Date.now() + avgFrequency * 24 * 60 * 60 * 1000)
        }

        return {
          type,
          probability,
          estimatedDate: estimatedDate.toISOString()
        }
      })

      // Sort by probability
      predictedIssues.sort((a, b) => b.probability - a.probability)

      return {
        roomNumber: room.number,
        predictedIssues,
        maintenanceHistory: room.maintenanceHistory.map(record => ({
          date: record.date,
          type: record.type,
          severity: record.severity
        }))
      }
    })

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Error in maintenance prediction:', error)
    return NextResponse.json(
      { error: 'Failed to generate maintenance predictions' },
      { status: 500 }
    )
  }
} 