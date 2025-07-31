import express, { Request, Response } from 'express';
import Student from '../models/Student';
import mongoose from 'mongoose';

const router = express.Router();

// GET all students
router.get('/', async (req: Request, res: Response) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET a specific student
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// POST create a new student
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Check if student with this email or rollNumber already exists
    const existingStudent = await Student.findOne({
      $or: [{ email: data.email }, { rollNumber: data.rollNumber }]
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        error: 'Student with this email or roll number already exists' 
      });
    }
    
    const student = new Student(data);
    await student.save();
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT update a student
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
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
        return res.status(400).json({
          error: 'Email or roll number already in use by another student'
        });
      }
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE a student
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router; 