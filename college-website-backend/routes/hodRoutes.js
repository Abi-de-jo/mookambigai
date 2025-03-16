import express from 'express';
import { registerHOD, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerHOD);
router.post('/login', loginUser);

export default router;
