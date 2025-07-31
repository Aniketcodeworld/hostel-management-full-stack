import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define schema for rooms
const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  capacity: { type: Number, default: 2 },
  allotees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allotee'
  }]
});

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

// Create models only if they don't exist
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
const Allotee = mongoose.models.Allotee || mongoose.model('Allotee', alloteeSchema);

// Get all unallocated allotees
export async function GET() {
  try {
    await connectToDatabase();
    
    // Find all rooms with allotees
    const rooms = await Room.find();
    
    // Get all allotee IDs that are allocated to rooms
    const allocatedAlloteeIds = rooms.flatMap(room => room.allotees);
    
    // Find allotees that are not in any room
    let unallocatedAllotees;
    
    if (allocatedAlloteeIds.length === 0) {
      // If no allocations yet, get all allotees
      unallocatedAllotees = await Allotee.find();
    } else {
      unallocatedAllotees = await Allotee.find({ 
        _id: { $nin: allocatedAlloteeIds } 
      });
    }
    
    return NextResponse.json(unallocatedAllotees);
  } catch (error: any) {
    console.error('Error getting unallocated allotees:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get unallocated allotees' },
      { status: 500 }
    );
  }
} 