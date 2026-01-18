import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema(
  {
    users: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      }
    ],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true 
  }
);

// Validación: solo 2 usuarios por amistad y ordenamiento para consistencia
friendshipSchema.pre('save', function(next) {
  if (this.users.length !== 2) {
    return next(new Error('Una amistad debe tener exactamente 2 usuarios'));
  }
  // Ordenar los ObjectId para que siempre tengan el mismo orden
  this.users.sort();
  next();
});

// Índice simple para mejorar consultas
friendshipSchema.index({ users: 1 });

export default mongoose.model('Friendship', friendshipSchema);
