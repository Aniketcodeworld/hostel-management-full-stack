import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define allotee schema if not already defined in models
const alloteeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  roll: String,
  hostel: String,
  room: String,
  registeredBy: String,
  registeredAt: { type: Date, default: Date.now }
});

// Only create model if it doesn't exist
const Allotee = mongoose.models.Allotee || mongoose.model('Allotee', alloteeSchema);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid allotee ID' }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { hostel, room } = body;
    
    // Update allotee
    const updatedAllotee = await Allotee.findByIdAndUpdate(
      id, 
      { hostel, room },
      { new: true }
    );
    
    if (!updatedAllotee) {
      return NextResponse.json({ error: 'Allotee not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Allotee updated successfully',
      allotee: updatedAllotee
    });
  } catch (error: any) {
    console.error('Error updating allotee:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid allotee ID' }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get allotee by id
    const allotee = await Allotee.findById(id);
    
    if (!allotee) {
      return NextResponse.json({ error: 'Allotee not found' }, { status: 404 });
    }
    
    return NextResponse.json(allotee);
  } catch (error: any) {
    console.error('Error fetching allotee:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 