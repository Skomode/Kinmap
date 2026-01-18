import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  message: { 
    type: String, 
    maxlength: 500,
    trim: true
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  respondedAt: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });
friendRequestSchema.index({ recipient: 1, status: 1 });
friendRequestSchema.index({ sender: 1, status: 1 });

export default mongoose.model('FriendRequest', friendRequestSchema);