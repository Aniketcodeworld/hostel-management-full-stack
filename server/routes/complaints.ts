import express, { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import Student from '../models/Student';
import mongoose from 'mongoose';

const router = express.Router();

// GET all complaints
router.get('/', async (req: Request, res: Response) => {
  try {
    const { studentId, status } = req.query;
    
    const query: any = {};
    
    if (studentId) {
      // Validate if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(studentId as string)) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }
      query.studentId = studentId;
    }
    
    if (status) {
      query.status = status;
    }
    
    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email roomNumber')
      .sort({ createdAt: -1 });
      
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// GET a specific complaint
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' });
    }
    
    const complaint = await Complaint.findById(id).populate('studentId', 'name email roomNumber');
    
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// POST create a new complaint
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'studentId', 'roomNumber', 'hostelBlock', 'createdBy'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate if studentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    // Check if the student exists
    const student = await Student.findById(data.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const complaint = new Complaint(data);
    await complaint.save();
    
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// PUT update a complaint
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' });
    }
    
    // If status is being updated to 'resolved', set resolvedAt date
    if (data.status === 'resolved' && !data.resolvedAt) {
      data.resolvedAt = new Date();
    }
    
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email roomNumber');
    
    if (!updatedComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// DELETE a complaint
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' });
    }
    
    const deletedComplaint = await Complaint.findByIdAndDelete(id);
    
    if (!deletedComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

export default router; 