import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  studentId: Schema.Types.ObjectId; // Reference to Student model
  roomNumber: string;
  hostelBlock: string;
  createdBy: string; // Firebase Auth UID
  adminResponse?: string;
  resolvedAt?: Date;
}

const ComplaintSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  roomNumber: { type: String, required: true },
  hostelBlock: { type: String, required: true },
  createdBy: { type: String, required: true },
  adminResponse: { type: String },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema); 