import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt'
// Define an interface representing a document in MongoDB.
interface IUser extends Document {
    name?: string;
    email: string;
    password: string;
    profilePicture?: string;
    role: 'user' | 'admin';
}

// Define the schema corresponding to the document interface.
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
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address'],
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
    }
}, { timestamps: true });

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
  };
  
  userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    next();
  });
  
  userSchema.method('isPasswordMatch', async function (password) {
    return bcrypt.compare(password, this.password);
  });
  
//   userSchema.plugin((schema) => {
//     schema.options.toJSON = {
//       transform: function (doc, ret, options) {
//         delete ret.password;
//         delete ret.__v;
//         return ret;
//       },
//     };
//   });

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password; // Exclude password
    delete user.__v; // remove version key

    return user;
};
// Create and export the model.
const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
