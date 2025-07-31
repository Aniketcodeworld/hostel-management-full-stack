'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface RoommatePreference {
  studyHabits: string
  sleepSchedule: string
  cleanliness: string
  interests: string
  languages: string
}

interface RoommateMatch {
  name: string
  email: string
  matchScore: number
  compatibility: {
    studyHabits: number
    sleepSchedule: number
    cleanliness: number
    interests: number
  }
  bio: string
}

export function RoommateMatching() {
  const [preferences, setPreferences] = useState<RoommatePreference>({
    studyHabits: '',
    sleepSchedule: '',
    cleanliness: '',
    interests: '',
    languages: ''
  })
  const [matches, setMatches] = useState<RoommateMatch[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/roommate-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) throw new Error('Failed to find matches')
      
      const data = await response.json()
      setMatches(data.matches)
      toast.success('Found potential roommates!')
    } catch (error) {
      toast.error('Failed to find matches')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Your Perfect Roommate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studyHabits">Study Habits</Label>
              <Select
                value={preferences.studyHabits}
                onValueChange={(value) => setPreferences({ ...preferences, studyHabits: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your study habits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early-morning">Early Morning</SelectItem>
                  <SelectItem value="late-night">Late Night</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleepSchedule">Sleep Schedule</Label>
              <Select
                value={preferences.sleepSchedule}
                onValueChange={(value) => setPreferences({ ...preferences, sleepSchedule: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your sleep schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early-bird">Early Bird</SelectItem>
                  <SelectItem value="night-owl">Night Owl</SelectItem>
                  <SelectItem value="regular">Regular Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleanliness">Cleanliness Preference</Label>
              <Select
                value={preferences.cleanliness}
                onValueChange={(value) => setPreferences({ ...preferences, cleanliness: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your cleanliness preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-clean">Very Clean</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Textarea
                id="interests"
                value={preferences.interests}
                onChange={(e) => setPreferences({ ...preferences, interests: e.target.value })}
                placeholder="e.g., Sports, Music, Reading, Gaming"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={preferences.languages}
                onChange={(e) => setPreferences({ ...preferences, languages: e.target.value })}
                placeholder="e.g., English, Hindi, Spanish"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Finding Matches...' : 'Find Roommates'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Potential Roommates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((match, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{match.name}</h3>
                      <p className="text-sm text-muted-foreground">{match.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        Match Score: {match.matchScore}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Compatibility Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Study Habits:</span>
                        <span className="ml-2">{match.compatibility.studyHabits}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sleep Schedule:</span>
                        <span className="ml-2">{match.compatibility.sleepSchedule}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cleanliness:</span>
                        <span className="ml-2">{match.compatibility.cleanliness}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interests:</span>
                        <span className="ml-2">{match.compatibility.interests}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{match.bio}</p>
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