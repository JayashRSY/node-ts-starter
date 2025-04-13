import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import bcrypt from "bcrypt";

const createUser = async (userBody) => {
  try {
    if (await User.isEmailTaken(userBody.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }
    
    if (userBody.password) {
      const hashedPassword = await bcrypt.hash(userBody.password, 10);
      userBody.password = hashedPassword;
    }

    return await User.create(userBody);
    
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate Key Error');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not create user');
  }
};

const getUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not fetch user');
  }
};


const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not fetch user');
  }
};


const updateUserById = async (userId, updateBody) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    Object.assign(user, updateBody);
    await user.save();
    return user;
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate Key Error');
    }
    if (error.name === 'ValidationError') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Validation error');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not update user');
  }
};

const deleteUserById = async (userId) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await user.remove();
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not delete user');
  }
};

export default {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserById,
  deleteUserById,
};