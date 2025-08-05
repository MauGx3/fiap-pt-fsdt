import mongoose, { model } from 'mongoose';
import { randomUUID } from 'crypto';
const { Schema } = mongoose;

const userSchema = new Schema({
  uuid: {
    type: String,
    default: () => randomUUID(),
    index: true,
    unique: true
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /.+@.+\..+/
  }
}, { timestamps: true });

// Index for better performance
userSchema.index({ email: 1 });

export default model('User', userSchema);
