import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongodbUri = process.env.MONGODB_URI;
        if (!mongodbUri) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose.connect(mongodbUri);
        console.log('✅Connected to MongoDB');
    } catch (error: any) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;