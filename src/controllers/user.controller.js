import userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';
import { validationResult } from 'express-validator';
import pick from '../utils/pick.js';

export const createUser = catchAsync(async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      
    } 
  });
  
  export const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user)
  });
  
  export const getUsers = catchAsync(async (req, res) => {
      const filter = pick(req.query, ['name', 'role']);
      const options = pick(req.query, ['sortBy', 'limit', 'page']);
      
      const result = await userService.queryUsers(filter, options);
      res.send(result)
  });
  
  export const updateUser = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const user = await userService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    } 
  };
  
  export const deleteUser = catchAsync(async (req, res) => {
    try {
      const user = await userService.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted' });
    } catch (err) {
      next(err);
    } 
  });

