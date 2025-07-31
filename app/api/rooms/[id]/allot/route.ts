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

// Allocate a room to an allotee
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    const { alloteeId } = body;
    
    if (!alloteeId) {
      return NextResponse.json({ error: 'Allotee ID is required' }, { status: 400 });
    }
    
    // Find room
    const room = await Room.findById(id).populate('allotees');
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Check if room is already at full capacity
    if (room.allotees.length >= room.capacity) {
      return NextResponse.json({ error: 'Room is already at full capacity' }, { status: 400 });
    }
    
    // Find allotee
    const allotee = await Allotee.findById(alloteeId);
    if (!allotee) {
      return NextResponse.json({ error: 'Allotee not found' }, { status: 404 });
    }
    
    // Check if allotee is already allotted to a room
    const alloteeInRoom = await Room.findOne({ allotees: alloteeId });
    if (alloteeInRoom) {
      return NextResponse.json({ 
        error: `Allotee is already allotted to room ${alloteeInRoom.number}` 
      }, { status: 400 });
    }
    
    // Add allotee to room
    room.allotees.push(alloteeId);
    await room.save();
    
    // Update allotee with room details
    allotee.hostel = `Block ${room.block}`;
    allotee.room = room.number;
    await allotee.save();
    
    // Get updated room with populated allotees
    const updatedRoom = await Room.findById(id).populate('allotees');
    
    return NextResponse.json({ 
      message: 'Allotee allotted to room successfully',
      room: updatedRoom
    });
  } catch (error: any) {
    console.error('Error allocating room:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to allocate room' 
    }, { status: 500 });
  }
} 