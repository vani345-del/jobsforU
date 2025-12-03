import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true, 
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOtp: String,
    verificationOtpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    
    linkedInId: {
      type: String,
      unique: true,
      sparse: true, 
    },
  },
  { timestamps: true }
);



const User = mongoose.model('User', userSchema);
export default User;