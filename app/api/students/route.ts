import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';

// GET all students
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const students = await Student.find({}).sort({ createdAt: -1 });
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST create a new student
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    // Check if student with this email or rollNumber already exists
    const existingStudent = await Student.findOne({
      $or: [{ email: data.email }, { rollNumber: data.rollNumber }]
    });
    
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email or roll number already exists' },
        { status: 400 }
      );
    }
    
    const student = new Student(data);
    await student.save();
    
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
} 