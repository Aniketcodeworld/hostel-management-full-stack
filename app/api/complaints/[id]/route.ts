import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define complaint schema
const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Allotee', 
    required: true 
  },
  roomNumber: { type: String, required: true },
  hostelBlock: { type: String, required: true },
  priority: { 
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  resolution: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create model
const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

interface Params {
  params: {
    id: string;
  };
}

// Helper function to format complaint response
function formatComplaint(complaint: any) {
  return {
    id: complaint._id.toString(),
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    status: complaint.status,
    priority: complaint.priority,
    roomNumber: complaint.roomNumber,
    hostelBlock: complaint.hostelBlock,
    resolution: complaint.resolution,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
    student: complaint.studentId ? {
      name: complaint.studentId.name,
      email: complaint.studentId.email
    } : null
  };
}

// GET a specific complaint
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Connect to database
    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    const { id } = params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid complaint ID' }, { status: 400 });
    }
    
    const complaint = await Complaint.findById(id)
      .populate('studentId', 'name email')
      .lean()
      .exec();
    
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }
    
    return NextResponse.json(formatComplaint(complaint));
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch complaint' },
      { status: 500 }
    );
  }
}

// PATCH update a complaint
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    // Connect to database
    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    const { id } = params;
    const data = await req.json();
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid complaint ID' }, { status: 400 });
    }
    
    // Update the complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        $set: {
          status: data.status,
          resolution: data.resolution,
          updatedAt: new Date()
        }
      },
      { new: true }
    )
    .populate('studentId', 'name email')
    .lean()
    .exec();
    
    if (!updatedComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }
    
    return NextResponse.json(formatComplaint(updatedComplaint));
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update complaint' },
      { status: 500 }
    );
  }
}

// DELETE a complaint
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Connect to database
    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    const { id } = params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid complaint ID' }, { status: 400 });
    }
    
    const deletedComplaint = await Complaint.findByIdAndDelete(id).lean().exec();
    
    if (!deletedComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete complaint' },
      { status: 500 }
    );
  }
} 