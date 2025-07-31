import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { studyHabits, sleepSchedule, cleanliness, interests, languages } = await req.json()

    // Get all students looking for roommates
    const students = await prisma.student.findMany({
      where: {
        lookingForRoommate: true
      },
      include: {
        preferences: true
      }
    })

    // Calculate compatibility scores
    const matches = students.map(student => {
      let matchScore = 0
      const compatibility = {
        studyHabits: 0,
        sleepSchedule: 0,
        cleanliness: 0,
        interests: 0
      }

      // Study habits compatibility
      if (student.preferences?.studyHabits === studyHabits) {
        compatibility.studyHabits = 100
        matchScore += 25
      } else if (student.preferences?.studyHabits === 'flexible' || studyHabits === 'flexible') {
        compatibility.studyHabits = 75
        matchScore += 18.75
      } else {
        compatibility.studyHabits = 25
        matchScore += 6.25
      }

      // Sleep schedule compatibility
      if (student.preferences?.sleepSchedule === sleepSchedule) {
        compatibility.sleepSchedule = 100
        matchScore += 25
      } else if (student.preferences?.sleepSchedule === 'regular' || sleepSchedule === 'regular') {
        compatibility.sleepSchedule = 75
        matchScore += 18.75
      } else {
        compatibility.sleepSchedule = 25
        matchScore += 6.25
      }

      // Cleanliness compatibility
      if (student.preferences?.cleanliness === cleanliness) {
        compatibility.cleanliness = 100
        matchScore += 25
      } else if (
        (student.preferences?.cleanliness === 'moderate' && cleanliness !== 'very-clean') ||
        (cleanliness === 'moderate' && student.preferences?.cleanliness !== 'very-clean')
      ) {
        compatibility.cleanliness = 75
        matchScore += 18.75
      } else {
        compatibility.cleanliness = 25
        matchScore += 6.25
      }

      // Interests compatibility
      if (student.preferences?.interests && interests) {
        const studentInterests = student.preferences.interests.toLowerCase().split(',')
        const userInterests = interests.toLowerCase().split(',')
        const commonInterests = studentInterests.filter(interest => 
          userInterests.some(userInterest => userInterest.includes(interest.trim()))
        )
        const interestScore = (commonInterests.length / Math.max(studentInterests.length, userInterests.length)) * 100
        compatibility.interests = interestScore
        matchScore += interestScore * 0.25
      }

      // Language compatibility bonus
      if (student.preferences?.languages && languages) {
        const studentLanguages = student.preferences.languages.toLowerCase().split(',')
        const userLanguages = languages.toLowerCase().split(',')
        const commonLanguages = studentLanguages.filter(lang => 
          userLanguages.some(userLang => userLang.includes(lang.trim()))
        )
        if (commonLanguages.length > 0) {
          matchScore += 5 // Bonus for shared languages
        }
      }

      return {
        name: student.name,
        email: student.email,
        matchScore: Math.min(Math.round(matchScore), 100),
        compatibility,
        bio: student.bio || 'No bio available'
      }
    })

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Error in roommate matching:', error)
    return NextResponse.json(
      { error: 'Failed to find roommate matches' },
      { status: 500 }
    )
  }
} 