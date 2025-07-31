'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface MaintenancePrediction {
  roomNumber: string
  predictedIssues: {
    type: string
    probability: number
    estimatedDate: string
  }[]
  maintenanceHistory: {
    date: string
    type: string
    severity: string
  }[]
}

export function MaintenancePrediction() {
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/maintenance-prediction')
      if (!response.ok) throw new Error('Failed to fetch predictions')
      const data = await response.json()
      setPredictions(data.predictions)
    } catch (error) {
      toast.error('Failed to load maintenance predictions')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const selectedRoomData = predictions.find(p => p.roomNumber === selectedRoom)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Select Room</h3>
              <div className="grid grid-cols-2 gap-2">
                {predictions.map((prediction) => (
                  <Button
                    key={prediction.roomNumber}
                    variant={selectedRoom === prediction.roomNumber ? 'default' : 'outline'}
                    onClick={() => setSelectedRoom(prediction.roomNumber)}
                  >
                    Room {prediction.roomNumber}
                  </Button>
                ))}
              </div>
            </div>

            {selectedRoomData && (
              <div className="space-y-4">
                <h3 className="font-semibold">Predicted Issues</h3>
                <div className="space-y-2">
                  {selectedRoomData.predictedIssues.map((issue, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{issue.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Estimated: {new Date(issue.estimatedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {Math.round(issue.probability * 100)}% Probability
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedRoomData && (
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Maintenance History</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedRoomData.maintenanceHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="severity"
                      name="Severity"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 