import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  hostelBlock: string;
  capacity: number;
  occupiedCount: number;
  floorNumber: number;
  type: 'single' | 'double' | 'triple';
  status: 'available' | 'maintenance' | 'full';
  amenities: string[];
}

const RoomSchema: Schema = new Schema({
  roomNumber: { type: String, required: true },
  hostelBlock: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupiedCount: { type: Number, default: 0 },
  floorNumber: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['single', 'double', 'triple'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['available', 'maintenance', 'full'],
    default: 'available'
  },
  amenities: [{ type: String }]
}, {
  timestamps: true
});

// Compound unique index for roomNumber and hostelBlock
RoomSchema.index({ roomNumber: 1, hostelBlock: 1 }, { unique: true });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema); 