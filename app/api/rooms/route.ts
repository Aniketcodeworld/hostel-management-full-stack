import { NextRequest, NextResponse } from 'next/server';
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

// GET all rooms
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const url = new URL(req.url);
    const block = url.searchParams.get('block');
    const floor = url.searchParams.get('floor');
    
    const query: any = {};
    
    if (block) {
      query.block = block;
    }
    
    if (floor) {
      query.floor = floor;
    }
    
    const rooms = await Room.find(query).populate('allotees').sort({ block: 1, number: 1 });
    
    return NextResponse.json(rooms, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// POST create a new room
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    // Map field names to match our schema if needed
    const roomData = {
      number: data.number,
      block: data.block,
      floor: data.floor,
      capacity: data.capacity || 2
    };
    
    // Validate required fields
    const requiredFields = ['number', 'block', 'floor'];
    const missingFields = requiredFields.filter(field => !roomData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if the room already exists
    const existingRoom = await Room.findOne({
      number: roomData.number
    });
    
    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room with this number already exists' },
        { status: 400 }
      );
    }
    
    // Create the new room
    const room = new Room(roomData);
    await room.save();
    
    return NextResponse.json({
      message: 'Room created successfully',
      room
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create room' },
      { status: 500 }
    );
  }
} 