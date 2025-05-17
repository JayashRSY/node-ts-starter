import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt'
// Define an interface representing a document in MongoDB.
// Add to IUser interface
interface IUser extends Document {
    name?: string;
    email: string;
    password: string;
    profilePicture?: string;
    role: 'user' | 'admin';
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    passwordChangedAt?: Date;
    failedLoginAttempts?: number;
    lockUntil?: Date;
    isLocked(): boolean;
    isPasswordMatch(password: string): Promise<boolean>;
    incrementLoginAttempts(): Promise<void>;
    resetLoginAttempts(): Promise<void>;
}

// Add to schema
const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+(\.\w+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      private: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
    profilePicture: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    }
}, { timestamps: true });

// Update password match method to handle locked accounts
userSchema.method('isPasswordMatch', async function(password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
});

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
  };
  
  userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 12);
    }
    next();
  });
  
  userSchema.method('isPasswordMatch', async function (password) {
    return bcrypt.compare(password, this.password);
  });

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password; // Exclude password
    delete user.__v; // remove version key

    return user;
};
// Create and export the model.
const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
