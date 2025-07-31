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

export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get all allotees
    const allotees = await Allotee.find({}).sort({ registeredAt: -1 });
    
    return NextResponse.json(allotees);
  } catch (error: any) {
    console.error('Error fetching allotees:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 