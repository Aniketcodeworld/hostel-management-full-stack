import mongoose from 'mongoose';
import Room from '../models/Room';
import Student from '../models/Student';
import Complaint from '../models/Complaint';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management';

// Sample data for rooms
const roomsData = [
  {
    roomNumber: '101',
    hostelBlock: 'A',
    capacity: 2,
    occupiedCount: 2,
    floorNumber: 1,
    type: 'double',
    status: 'full',
    amenities: ['Bed', 'Study Table', 'Chair', 'Cupboard', 'Fan']
  },
  {
    roomNumber: '102',
    hostelBlock: 'A',
    capacity: 2,
    occupiedCount: 1,
    floorNumber: 1,
    type: 'double',
    status: 'available',
    amenities: ['Bed', 'Study Table', 'Chair', 'Cupboard', 'Fan']
  },
  {
    roomNumber: '201',
    hostelBlock: 'A',
    capacity: 1,
    occupiedCount: 0,
    floorNumber: 2,
    type: 'single',
    status: 'available',
    amenities: ['Bed', 'Study Table', 'Chair', 'Cupboard', 'Fan', 'AC']
  },
  {
    roomNumber: '101',
    hostelBlock: 'B',
    capacity: 3,
    occupiedCount: 3,
    floorNumber: 1,
    type: 'triple',
    status: 'full',
    amenities: ['Bed', 'Study Table', 'Chair', 'Cupboard', 'Fan']
  },
  {
    roomNumber: '102',
    hostelBlock: 'B',
    capacity: 3,
    occupiedCount: 2,
    floorNumber: 1,
    type: 'triple',
    status: 'available',
    amenities: ['Bed', 'Study Table', 'Chair', 'Cupboard', 'Fan']
  },
];

// Sample data for students
const studentsData = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    roomNumber: '101',
    course: 'B.Tech Computer Science',
    year: 2,
    rollNumber: 'CSE2022001',
    hostelBlock: 'A',
    dateOfJoining: new Date('2022-08-01'),
    userId: 'firebase_user_id_1'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543211',
    roomNumber: '101',
    course: 'B.Tech Computer Science',
    year: 2,
    rollNumber: 'CSE2022002',
    hostelBlock: 'A',
    dateOfJoining: new Date('2022-08-01'),
    userId: 'firebase_user_id_2'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '9876543212',
    roomNumber: '102',
    course: 'B.Tech Electronics',
    year: 3,
    rollNumber: 'ECE2021001',
    hostelBlock: 'A',
    dateOfJoining: new Date('2021-08-01'),
    userId: 'firebase_user_id_3'
  },
  {
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    phone: '9876543213',
    roomNumber: '101',
    course: 'B.Tech Mechanical',
    year: 4,
    rollNumber: 'MECH2020001',
    hostelBlock: 'B',
    dateOfJoining: new Date('2020-08-01'),
    userId: 'firebase_user_id_4'
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    phone: '9876543214',
    roomNumber: '101',
    course: 'B.Tech Civil',
    year: 1,
    rollNumber: 'CIVIL2023001',
    hostelBlock: 'B',
    dateOfJoining: new Date('2023-08-01'),
    userId: 'firebase_user_id_5'
  }
];

// Sample complaint categories
const complaintCategories = [
  'Plumbing',
  'Electrical',
  'Furniture',
  'Cleaning',
  'Wi-Fi',
  'Room Maintenance',
  'Others'
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Room.deleteMany({});
    await Student.deleteMany({});
    await Complaint.deleteMany({});
    console.log('Cleared existing data');

    // Insert rooms
    const rooms = await Room.insertMany(roomsData);
    console.log(`Inserted ${rooms.length} rooms`);

    // Insert students
    const students = await Student.insertMany(studentsData);
    console.log(`Inserted ${students.length} students`);

    // Generate random complaints
    const complaintsData = [];
    
    for (let i = 0; i < 10; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const randomCategory = complaintCategories[Math.floor(Math.random() * complaintCategories.length)];
      const randomStatus = ['pending', 'in-progress', 'resolved', 'rejected'][Math.floor(Math.random() * 4)];
      
      const complaint = {
        title: `${randomCategory} Issue in Room ${randomStudent.roomNumber}`,
        description: `I am facing an issue with ${randomCategory.toLowerCase()} in my room. Please resolve it as soon as possible.`,
        category: randomCategory,
        status: randomStatus,
        studentId: randomStudent._id,
        roomNumber: randomStudent.roomNumber,
        hostelBlock: randomStudent.hostelBlock,
        createdBy: randomStudent.userId,
      };
      
      // Add admin response and resolvedAt for resolved or rejected complaints
      if (randomStatus === 'resolved' || randomStatus === 'rejected') {
        complaint.adminResponse = `Your complaint has been ${randomStatus}. ${
          randomStatus === 'resolved' 
            ? 'The issue has been fixed.' 
            : 'Please contact the hostel office for more details.'
        }`;
        complaint.resolvedAt = new Date();
      }
      
      complaintsData.push(complaint);
    }
    
    const complaints = await Complaint.insertMany(complaintsData);
    console.log(`Inserted ${complaints.length} complaints`);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 