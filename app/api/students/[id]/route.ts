import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import mongoose from 'mongoose';

interface Params {
  params: {
    id: string;
  };
}

// GET a specific student
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }
    
    const student = await Student.findById(id);
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

// PUT update a student
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const data = await req.json();
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }
    
    // Check if email or rollNumber already exists for another student
    if (data.email || data.rollNumber) {
      const existingStudent = await Student.findOne({
        _id: { $ne: id },
        $or: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.rollNumber ? [{ rollNumber: data.rollNumber }] : [])
        ]
      });
      
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Email or roll number already in use by another student' },
          { status: 400 }
        );
      }
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE a student
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }
    
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
} 