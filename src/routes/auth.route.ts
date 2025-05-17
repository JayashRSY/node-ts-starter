import express from 'express';
import { register, login, refresh, logout, gmailLogin } from '../controllers/auth.controller.ts';
import validate from '../middlewares/validate.middleware.ts';
import { loginValidation, registerValidation } from '../validations/auth.validation.ts';

const router = express.Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh-token', refresh);
router.post('/logout', logout);
router.post('/gmail-login', gmailLogin);

export default router;