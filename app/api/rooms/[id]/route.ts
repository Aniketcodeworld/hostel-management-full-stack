import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Room from '@/models/Room';
import mongoose from 'mongoose';

interface Params {
  params: {
    id: string;
  };
}

// GET a specific room
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }
    
    const room = await Room.findById(id);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

// PUT update a room
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const data = await req.json();
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }
    
    // If roomNumber or hostelBlock is being updated, check for duplicates
    if (data.roomNumber || data.hostelBlock) {
      const room = await Room.findById(id);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      const roomNumber = data.roomNumber || room.roomNumber;
      const hostelBlock = data.hostelBlock || room.hostelBlock;
      
      const existingRoom = await Room.findOne({
        _id: { $ne: id },
        roomNumber,
        hostelBlock
      });
      
      if (existingRoom) {
        return NextResponse.json(
          { error: 'Room with this number already exists in this hostel block' },
          { status: 400 }
        );
      }
    }
    
    // Auto-update status based on occupiedCount and capacity
    if (data.occupiedCount !== undefined || data.capacity !== undefined) {
      const room = await Room.findById(id);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      const occupiedCount = data.occupiedCount !== undefined ? data.occupiedCount : room.occupiedCount;
      const capacity = data.capacity !== undefined ? data.capacity : room.capacity;
      
      if (occupiedCount >= capacity) {
        data.status = 'full';
      } else if (data.status !== 'maintenance') {
        data.status = 'available';
      }
    }
    
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE a room
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }
    
    const deletedRoom = await Room.findByIdAndDelete(id);
    
    if (!deletedRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Room deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
} 