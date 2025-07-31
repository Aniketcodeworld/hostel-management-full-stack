'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface RoomPreference {
  preferredFloor: string
  preferredRoomType: string
  specialNeeds: string
  budget: string
}

interface RoomSuggestion {
  roomNumber: string
  floor: string
  type: string
  matchScore: number
  reasons: string[]
}

export function SmartAllocation() {
  const [preferences, setPreferences] = useState<RoomPreference>({
    preferredFloor: '',
    preferredRoomType: '',
    specialNeeds: '',
    budget: ''
  })
  const [suggestions, setSuggestions] = useState<RoomSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate AI-based room allocation
      const response = await fetch('/api/smart-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) throw new Error('Failed to get suggestions')
      
      const data = await response.json()
      setSuggestions(data.suggestions)
      toast.success('Room suggestions generated successfully!')
    } catch (error) {
      toast.error('Failed to generate suggestions')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Room Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Preferred Floor</Label>
                <Input
                  id="floor"
                  value={preferences.preferredFloor}
                  onChange={(e) => setPreferences({ ...preferences, preferredFloor: e.target.value })}
                  placeholder="e.g., Ground, 1st, 2nd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Room Type</Label>
                <Input
                  id="type"
                  value={preferences.preferredRoomType}
                  onChange={(e) => setPreferences({ ...preferences, preferredRoomType: e.target.value })}
                  placeholder="e.g., Single, Double, AC"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="needs">Special Needs</Label>
              <Textarea
                id="needs"
                value={preferences.specialNeeds}
                onChange={(e) => setPreferences({ ...preferences, specialNeeds: e.target.value })}
                placeholder="Any special requirements or preferences"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <Input
                id="budget"
                value={preferences.budget}
                onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
                placeholder="e.g., 5000-10000"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Generating Suggestions...' : 'Get Room Suggestions'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Room {suggestion.roomNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        Floor: {suggestion.floor} | Type: {suggestion.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        Match Score: {suggestion.matchScore}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Why this room?</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {suggestion.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 