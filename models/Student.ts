import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  course: string;
  year: number;
  rollNumber: string;
  hostelBlock: string;
  dateOfJoining: Date;
  userId: string; // Reference to Firebase Auth UID
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  roomNumber: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  rollNumber: { type: String, required: true, unique: true },
  hostelBlock: { type: String, required: true },
  dateOfJoining: { type: Date, default: Date.now },
  userId: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema); 