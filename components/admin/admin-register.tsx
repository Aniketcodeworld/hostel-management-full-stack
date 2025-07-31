"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminRegister() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roll: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Validate name field to only accept characters
    if (name === 'name') {
      const nameRegex = /^[A-Za-z\s]*$/
      if (!nameRegex.test(value)) {
        toast.error("Name can only contain letters and spaces")
        return
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate name format before submission
    const nameRegex = /^[A-Za-z\s]+$/
    if (formData.name && !nameRegex.test(formData.name)) {
      toast.error("Name can only contain letters and spaces")
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      toast.error("Please enter an email address")
      setLoading(false)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      // Get admin email from environment variable or localStorage
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com'
      
      const response = await fetch('/api/allotees/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          adminEmail
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register allotee')
      }
      
      toast.success(`Allotee ${formData.name || formData.email} registered successfully!`)
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        roll: ""
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to register allotee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register New Allottee</CardTitle>
          <CardDescription>Create a new account for a hostel allottee.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roll">Roll Number</Label>
              <Input
                id="roll"
                name="roll"
                placeholder="CS123"
                value={formData.roll}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register Allottee"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


