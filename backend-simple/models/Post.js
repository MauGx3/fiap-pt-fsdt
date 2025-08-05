import mongoose, { model } from 'mongoose';
import crypto from 'crypto';
const { Schema } = mongoose;

const postSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  content: { 
    type: String, 
    required: true 
  },
  author: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Author must be a valid UUID'
    }
  },
  authorName: {
    type: String,
    default: 'Anonymous'
  },
  comments: [{
    id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    author: { 
      type: String, 
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Comment author must be a valid UUID'
      }
    },
    authorName: {
      type: String,
      default: 'Anonymous'
    },
    text: { 
      type: String, 
      required: true,
      trim: true
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
}, { timestamps: true });

// Index for better performance on common queries
postSchema.index({ createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

export default model('Post', postSchema);
