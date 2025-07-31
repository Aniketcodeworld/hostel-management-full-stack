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

// Define admin schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'admin' }
});

// Only create model if it doesn't exist
const Allotee = mongoose.models.Allotee || mongoose.model('Allotee', alloteeSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { name, email, roll, adminEmail } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Verify admin exists
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin not found.' }, { status: 403 });
    }
    
    // Check if allotee already exists
    const existingAllotee = await Allotee.findOne({ email });
    if (existingAllotee) {
      return NextResponse.json({ error: 'Allotee with this email already exists' }, { status: 400 });
    }
    
    // Create new allotee
    const newAllotee = await Allotee.create({
      name: name || 'New Allotee',
      email,
      roll: roll || '',
      registeredBy: adminEmail
    });
    
    return NextResponse.json({ 
      message: 'Allotee registered successfully', 
      allotee: newAllotee 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering allotee:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 