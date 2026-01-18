import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password:  { type: String, required: true, minlength: 6 },
  phone:     { 
    type: String, 
    sparse: true, 
    unique: true,
    trim: true
  },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
  profilePicture: { type: String, default: "" } // <--- NUEVO CAMPO
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual para nombre completo
userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

const User = mongoose.model('User', userSchema);

export default User;
