import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define models if not already defined
const alloteeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  roll: String,
  hostel: String,
  room: String,
  registeredBy: String,
  registeredAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  alloteeId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allotee',
    required: true
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  status: { 
    type: String, 
    enum: ['present', 'absent'], 
    required: true 
  },
  markedBy: String,
  remarks: String
});

// Only create models if they don't exist
const Allotee = mongoose.models.Allotee || mongoose.model('Allotee', alloteeSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all allotees
    const alloteesCount = await Allotee.countDocuments();
    
    // Get attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.find({
      date: {
        $gte: new Date(today),
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const presentCount = todayAttendance.filter(a => a.status === 'present').length;
    const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
    
    // Calculate attendance rate
    const attendanceRate = alloteesCount > 0 
      ? Math.round((presentCount / alloteesCount) * 100) 
      : 0;
    
    return NextResponse.json({
      total: alloteesCount,
      present: presentCount,
      absent: absentCount,
      notMarked: alloteesCount - (presentCount + absentCount),
      attendanceRate
    });
  } catch (error: any) {
    console.error('Error getting attendance stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get attendance statistics' },
      { status: 500 }
    );
  }
} 