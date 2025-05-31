import express from 'express'; 
import {
//   createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.ts';
import { authenticate } from '../middlewares/auth.middleware.ts'; 
import validate from '../middlewares/validate.middleware.ts';
import { createUserValidation, updateUserValidation, getUserValidation, deleteUserValidation } from '../validations/user.validation.ts';

const router = express.Router();

// router.post('/', validate(createUserValidation), createUser);
router.get('/', authenticate, getUsers);
router.get(
  '/:id',
  validate(getUserValidation),
  authenticate,
  getUser
);
router.put('/:id', validate(updateUserValidation), authenticate, updateUser);
router.delete('/:id', validate(deleteUserValidation), authenticate, deleteUser);

export default router;