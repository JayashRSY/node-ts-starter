import express from 'express'; 
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 
import validate from '../middlewares/validate.middleware.js';
import { createUserValidation, updateUserValidation, getUserValidation, deleteUserValidation } from '../validations/user.validation.js';

const router = express.Router(); 

router.post('/', validate(createUserValidation), createUser);
router.get('/', getUsers);
router.get(
  '/:id',
  validate(getUserValidation),
  authenticate,
  getUser
);
router.put('/:id', validate(updateUserValidation), authenticate, updateUser);
router.delete('/:id', validate(deleteUserValidation), authenticate, deleteUser);

export default router;