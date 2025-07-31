import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define allotee schema
const alloteeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  roll: String,
  hostel: String,
  room: String,
  registeredBy: String,
  registeredAt: { type: Date, default: Date.now }
});

// Define attendance schema
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

// Add compound index to prevent duplicate attendance records
attendanceSchema.index({ alloteeId: 1, date: 1 }, { unique: true });

// Define admin schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'admin' }
});

// Create models only if they don't exist
const Allotee = mongoose.models.Allotee || mongoose.model('Allotee', alloteeSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

// Get attendance records
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Parse URL for query params
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Use specified date or current date
    const queryDate = dateParam ? new Date(dateParam) : new Date();
    // Set time to 00:00:00 for consistent date comparison
    queryDate.setHours(0, 0, 0, 0);
    
    // Get attendance records for this date
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date(queryDate),
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('alloteeId');
    
    // Get all allotees for creating complete attendance records
    const allAllotees = await Allotee.find();
    
    // Map allotees to attendance records
    const alloteeAttendance = allAllotees.map(allotee => {
      // Find attendance record for this allotee if exists
      const record = attendanceRecords.find(a => 
        a.alloteeId && a.alloteeId._id.toString() === allotee._id.toString()
      );
      
      return {
        allotee: {
          _id: allotee._id,
          name: allotee.name,
          email: allotee.email,
          roll: allotee.roll,
          hostel: allotee.hostel,
          room: allotee.room
        },
        attendance: record ? {
          status: record.status,
          date: record.date,
          remarks: record.remarks
        } : null
      };
    });
    
    return NextResponse.json({
      date: queryDate,
      attendanceRecords: alloteeAttendance
    });
  } catch (error: any) {
    console.error('Error getting attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get attendance' },
      { status: 500 }
    );
  }
}

// Record attendance
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    const { records, adminEmail, date } = body;
    
    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Records must be an array' },
        { status: 400 }
      );
    }
    
    // Verify admin exists
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin not found.' },
        { status: 403 }
      );
    }
    
    // Parse date or use current date
    const attendanceDate = date ? new Date(date) : new Date();
    // Set time to 00:00:00 for consistent date comparison
    attendanceDate.setHours(0, 0, 0, 0);
    
    // Process each attendance record
    const results = [];
    
    for (const record of records) {
      const { alloteeId, status, remarks } = record;
      
      // Check if allotee exists
      const allotee = await Allotee.findById(alloteeId);
      if (!allotee) {
        results.push({
          alloteeId,
          success: false,
          error: 'Allotee not found'
        });
        continue;
      }
      
      try {
        // Create or update attendance record for this date
        const attendance = await Attendance.findOneAndUpdate(
          { 
            alloteeId, 
            date: {
              $gte: new Date(attendanceDate),
              $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
            }
          },
          {
            alloteeId,
            date: attendanceDate,
            status,
            markedBy: adminEmail,
            remarks
          },
          { upsert: true, new: true }
        );
        
        results.push({
          alloteeId,
          success: true,
          attendance
        });
      } catch (error: any) {
        results.push({
          alloteeId,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      message: 'Attendance processed',
      date: attendanceDate,
      results
    });
  } catch (error: any) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record attendance' },
      { status: 500 }
    );
  }
} 