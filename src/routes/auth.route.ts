import express from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  gmailLogin, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth.controller.ts';
import validate from '../middlewares/validate.middleware.ts';
import { 
  loginValidation, 
  registerValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation 
} from '../validations/auth.validation.ts';

const router = express.Router();

// router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refresh);
router.post('/logout', logout);
router.post('/gmail-login', gmailLogin);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

export default router;