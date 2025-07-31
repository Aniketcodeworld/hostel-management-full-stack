import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  number: string;
  block: string;
  floor: string;
  capacity: number;
  allotees: mongoose.Types.ObjectId[];
}

const RoomSchema: Schema = new Schema({
  number: { type: String, required: true, unique: true },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  capacity: { type: Number, default: 2 },
  allotees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allotee'
  }]
}, {
  timestamps: true
});

export default mongoose.model<IRoom>('Room', RoomSchema); 