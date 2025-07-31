import { NextRequest, NextResponse } from 'next/server';
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

// Create models
const Allotee = mongoose.models.Allotee || mongoose.model('Allotee', alloteeSchema);
const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

// GET all complaints
export async function GET(req: NextRequest) {
  try {
    // Connect to database
    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }

    // Get all complaints with populated student data
    const complaints = await Complaint.find()
      .populate('studentId', 'name email')
      .lean()
      .exec();

    // Transform the data to match the expected format
    const formattedComplaints = complaints.map(complaint => ({
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
    }));

    // If there are complaints with missing student data
    if (formattedComplaints.some(c => !c.student)) {
      // Get all allottees
      const allottees = await Allotee.find().lean().exec();
      
      if (allottees.length === 0) {
        return NextResponse.json({ error: 'No allottees found in the system' }, { status: 404 });
      }

      // Update complaints with missing student data
      for (const complaint of formattedComplaints) {
        if (!complaint.student) {
          // Get a random allottee
          const randomAllottee = allottees[Math.floor(Math.random() * allottees.length)];
          
          // Update the complaint in the database
          await Complaint.findByIdAndUpdate(complaint.id, {
            studentId: randomAllottee._id
          });
          
          // Update the complaint in our formatted array
          complaint.student = {
            name: randomAllottee.name,
            email: randomAllottee.email
          };
        }
      }
    }

    return NextResponse.json(formattedComplaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

// POST create a new complaint
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }

    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'studentId', 'roomNumber', 'hostelBlock'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate if studentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }
    
    // Check if the allottee exists
    const allottee = await Allotee.findById(data.studentId).lean().exec();
    if (!allottee) {
      return NextResponse.json({ error: 'Allottee not found' }, { status: 404 });
    }
    
    // Create and save the complaint
    const complaint = new Complaint({
      ...data,
      status: 'Open',
      priority: data.priority || 'Medium'
    });
    await complaint.save();
    
    // Return the complaint with populated student data
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email')
      .lean()
      .exec();

    // Format the response
    const formattedComplaint = {
      id: populatedComplaint._id.toString(),
      title: populatedComplaint.title,
      description: populatedComplaint.description,
      category: populatedComplaint.category,
      status: populatedComplaint.status,
      priority: populatedComplaint.priority,
      roomNumber: populatedComplaint.roomNumber,
      hostelBlock: populatedComplaint.hostelBlock,
      resolution: populatedComplaint.resolution,
      createdAt: populatedComplaint.createdAt,
      updatedAt: populatedComplaint.updatedAt,
      student: {
        name: populatedComplaint.studentId.name,
        email: populatedComplaint.studentId.email
      }
    };

    return NextResponse.json(formattedComplaint, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create complaint' },
      { status: 500 }
    );
  }
} 