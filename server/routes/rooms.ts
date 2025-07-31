import express, { Request, Response } from 'express';
import Room from '../models/Room';
import mongoose from 'mongoose';

const router = express.Router();

// GET all rooms
router.get('/', async (req: Request, res: Response) => {
  try {
    const { block, floor } = req.query;
    const query: any = {};
    
    if (block) {
      query.block = block;
    }
    
    if (floor) {
      query.floor = floor;
    }
    
    const rooms = await Room.find(query).populate('allotees').sort({ block: 1, number: 1 });
    
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET a specific room
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST create a new room
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Map field names to match our schema
    const roomData = {
      number: data.number,
      block: data.block,
      floor: data.floor,
      capacity: data.capacity || 2,
      allotees: []
    };
    
    // Validate required fields
    const requiredFields = ['number', 'block', 'floor'];
    const missingFields = requiredFields.filter(field => !roomData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Check if the room already exists
    const existingRoom = await Room.findOne({
      number: roomData.number
    });
    
    if (existingRoom) {
      return res.status(400).json({
        error: 'Room with this number already exists'
      });
    }
    
    const room = new Room(roomData);
    await room.save();
    
    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// PUT update a room
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    
    // If number is being updated, check for duplicates
    if (data.number) {
      const room = await Room.findById(id);
      
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      const existingRoom = await Room.findOne({
        _id: { $ne: id },
        number: data.number
      });
      
      if (existingRoom) {
        return res.status(400).json({
          error: 'Room with this number already exists'
        });
      }
    }
    
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('allotees');
    
    if (!updatedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// DELETE a room
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    
    const deletedRoom = await Room.findByIdAndDelete(id);
    
    if (!deletedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router; 