import express from 'express';
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware.js"
import { updateStudentDetails, updateTeacherDetails } from '../controllers/teacherController.js';
import { loginUser, registerAdmin } from '../controllers/authController.js';

const router = express.Router();
router.post('/register', registerAdmin);
router.post('/login', loginUser);
// Admin updates student details
router.put('/update-student/:studentId', authenticateUser, authorizeRoles('ADMIN'), updateStudentDetails);

// Admin updates teacher details
router.put('/update-teacher/:teacherId', authenticateUser, authorizeRoles('ADMIN'), updateTeacherDetails);

export default router;
