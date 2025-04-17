import express from 'express';
import {register, 
    login, 
    refresh, 
    logout, 
    gmailLogin
} from '../controllers/auth.controller.ts';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refresh);
router.post('/logout', logout);
router.post('/gmail-login', gmailLogin);

export default router;