const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
console.log('Connecting to MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoCreate: true,
  autoIndex: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Create schema for allotees (students)
const alloteeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  roll: String,
  hostel: String,
  room: String,
  registeredBy: String, // Admin who registered this allotee
  registeredAt: { type: Date, default: Date.now }
});

// Create schema for attendance
const attendanceSchema = new mongoose.Schema({
  alloteeId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allotee',
    required: true
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  status: { 
    type: String, 
    enum: ['present', 'absent'], 
    required: true 
  },
  markedBy: String, // Admin who marked the attendance
  remarks: String
});

// Add compound index to prevent duplicate attendance records for same student on same day
attendanceSchema.index({ alloteeId: 1, date: 1 }, { unique: true });

// Create schema for hostels
const hostelSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  warden: String
});

// Create schema for admins
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'admin' }
});

// Create schema for rooms
const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  capacity: { type: Number, default: 2 },
  allotees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allotee'
  }]
});

// Create models
const Allotee = mongoose.model('Allotee', alloteeSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Hostel = mongoose.model('Hostel', hostelSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Room = mongoose.model('Room', roomSchema);

// Create default admin
async function createDefaultAdmin() {
  try {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
    const adminExists = await Admin.findOne({ email: adminEmail });
    
    if (!adminExists) {
      console.log('Creating default admin account...');
      await Admin.create({
        name: 'Admin',
        email: adminEmail,
        role: 'superadmin'
      });
      console.log('Default admin created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Simple route to test connection
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Route to register new allotee (only admins can do this)
app.post('/api/allotees/register', async (req, res) => {
  try {
    const { name, email, roll, adminEmail } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Verify admin exists
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      return res.status(403).json({ error: 'Unauthorized. Admin not found.' });
    }
    
    // Check if allotee already exists
    const existingAllotee = await Allotee.findOne({ email });
    if (existingAllotee) {
      return res.status(400).json({ error: 'Allotee with this email already exists' });
    }
    
    // Create new allotee
    const newAllotee = await Allotee.create({
      name: name || 'New Allotee',
      email,
      roll: roll || '',
      registeredBy: adminEmail
    });
    
    res.status(201).json({ 
      message: 'Allotee registered successfully', 
      allotee: newAllotee 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all registered allotees
app.get('/api/allotees', async (req, res) => {
  try {
    const allotees = await Allotee.find();
    res.json(allotees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update allotee details (assign hostel/room)
app.put('/api/allotees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hostel, room } = req.body;
    
    const updatedAllotee = await Allotee.findByIdAndUpdate(
      id, 
      { hostel, room },
      { new: true }
    );
    
    if (!updatedAllotee) {
      return res.status(404).json({ error: 'Allotee not found' });
    }
    
    res.json({ 
      message: 'Allotee updated successfully',
      allotee: updatedAllotee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to mark attendance for allotees
app.post('/api/attendance', async (req, res) => {
  try {
    const { records, adminEmail, date } = req.body;
    
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Records must be an array' });
    }
    
    // Verify admin exists
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      return res.status(403).json({ error: 'Unauthorized. Admin not found.' });
    }
    
    // Parse date or use current date
    const attendanceDate = date ? new Date(date) : new Date();
    // Set time to 00:00:00 for consistent date comparison
    attendanceDate.setHours(0, 0, 0, 0);
    
    // Process each attendance record
    const results = [];
    
    for (const record of records) {
      const { alloteeId, status, remarks } = record;
      
      // Check if allotee exists
      const allotee = await Allotee.findById(alloteeId);
      if (!allotee) {
        results.push({
          alloteeId,
          success: false,
          error: 'Allotee not found'
        });
        continue;
      }
      
      try {
        // Create or update attendance record for this date
        const attendance = await Attendance.findOneAndUpdate(
          { 
            alloteeId, 
            date: {
              $gte: new Date(attendanceDate),
              $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
            }
          },
          {
            alloteeId,
            date: attendanceDate,
            status,
            markedBy: adminEmail,
            remarks
          },
          { upsert: true, new: true }
        );
        
        results.push({
          alloteeId,
          success: true,
          attendance
        });
      } catch (error) {
        results.push({
          alloteeId,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Attendance processed',
      date: attendanceDate,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get attendance by date
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Use specified date or current date
    const queryDate = date ? new Date(date) : new Date();
    // Set time to 00:00:00 for consistent date comparison
    queryDate.setHours(0, 0, 0, 0);
    
    // Get attendance records for this date
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date(queryDate),
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('alloteeId');
    
    // Get all allotees for creating complete attendance records
    const allAllotees = await Allotee.find();
    
    // Map allotees to attendance records
    const alloteeAttendance = allAllotees.map(allotee => {
      // Find attendance record for this allotee if exists
      const record = attendanceRecords.find(a => 
        a.alloteeId && a.alloteeId._id.toString() === allotee._id.toString()
      );
      
      return {
        allotee: {
          _id: allotee._id,
          name: allotee.name,
          email: allotee.email,
          roll: allotee.roll,
          hostel: allotee.hostel,
          room: allotee.room
        },
        attendance: record ? {
          status: record.status,
          date: record.date,
          remarks: record.remarks
        } : null
      };
    });
    
    res.json({
      date: queryDate,
      attendanceRecords: alloteeAttendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get attendance stats
app.get('/api/attendance/stats', async (req, res) => {
  try {
    // Get all allotees
    const alloteesCount = await Allotee.countDocuments();
    
    // Get attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.find({
      date: {
        $gte: new Date(today),
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const presentCount = todayAttendance.filter(a => a.status === 'present').length;
    const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
    
    // Calculate percentage if there are allotees
    const attendanceRate = alloteesCount > 0 
      ? Math.round((presentCount / alloteesCount) * 100) 
      : 0;
    
    res.json({
      total: alloteesCount,
      present: presentCount,
      absent: absentCount,
      notMarked: alloteesCount - (presentCount + absentCount),
      attendanceRate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all hostels
app.get('/api/hostels', async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all rooms with allotees
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().populate('allotees');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a new room
app.post('/api/rooms', async (req, res) => {
  try {
    const { number, block, floor, capacity } = req.body;
    
    // Check if room already exists
    const existingRoom = await Room.findOne({ number });
    if (existingRoom) {
      return res.status(400).json({ error: 'Room with this number already exists' });
    }
    
    // Create new room
    const newRoom = await Room.create({
      number,
      block,
      floor,
      capacity: capacity || 2,
      allotees: []
    });
    
    res.status(201).json({ 
      message: 'Room created successfully', 
      room: newRoom 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to allot room to allotees
app.put('/api/rooms/:id/allot', async (req, res) => {
  try {
    const { id } = req.params;
    const { alloteeId } = req.body;
    
    // Find room
    const room = await Room.findById(id).populate('allotees');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Check if room is already at full capacity
    if (room.allotees.length >= room.capacity) {
      return res.status(400).json({ error: 'Room is already at full capacity' });
    }
    
    // Find allotee
    const allotee = await Allotee.findById(alloteeId);
    if (!allotee) {
      return res.status(404).json({ error: 'Allotee not found' });
    }
    
    // Check if allotee is already allotted to a room
    const alloteeInRoom = await Room.findOne({ allotees: alloteeId });
    if (alloteeInRoom) {
      return res.status(400).json({ error: 'Allotee is already allotted to room ' + alloteeInRoom.number });
    }
    
    // Add allotee to room
    room.allotees.push(alloteeId);
    await room.save();
    
    // Update allotee with room details
    allotee.hostel = `Block ${room.block}`;
    allotee.room = room.number;
    await allotee.save();
    
    res.json({ 
      message: 'Allotee allotted to room successfully',
      room: await Room.findById(id).populate('allotees')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to remove allotee from room
app.put('/api/rooms/:id/deallocate', async (req, res) => {
  try {
    const { id } = req.params;
    const { alloteeId } = req.body;
    
    // Find room
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Find allotee
    const allotee = await Allotee.findById(alloteeId);
    if (!allotee) {
      return res.status(404).json({ error: 'Allotee not found' });
    }
    
    // Check if allotee is in this room
    if (!room.allotees.includes(alloteeId)) {
      return res.status(400).json({ error: 'Allotee is not allocated to this room' });
    }
    
    // Remove allotee from room
    room.allotees = room.allotees.filter(a => a.toString() !== alloteeId);
    await room.save();
    
    // Update allotee to remove room details
    allotee.hostel = null;
    allotee.room = null;
    await allotee.save();
    
    res.json({ 
      message: 'Allotee removed from room successfully',
      room: await Room.findById(id).populate('allotees')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get unallocated allotees
app.get('/api/allotees/unallocated', async (req, res) => {
  try {
    // Find all rooms with allotees
    const rooms = await Room.find();
    
    // Get all allotee IDs that are allocated to rooms
    const allocatedAlloteeIds = rooms.flatMap(room => room.allotees);
    
    // Find allotees that are not in any room
    const unallocatedAllotees = await Allotee.find({ 
      _id: { $nin: allocatedAlloteeIds } 
    });
    
    res.json(unallocatedAllotees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createDefaultAdmin();
}); 