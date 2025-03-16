import express from 'express';
import { 
  createAppointment, 
  updateAppointmentStatus, 
  getAppointmentsByTeacher, 
  getAppointmentsByStudent, 
  getAllTeachers
} from '../controllers/teacherController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', authenticateUser, getAllTeachers);

// Student books an appointment
router.post('/book', authenticateUser, authorizeRoles('STUDENT'), createAppointment);

// Teacher updates appointment status
router.put('/update/:appointmentId', authenticateUser, authorizeRoles('TEACHER'), updateAppointmentStatus);

// Get appointments by teacher
router.get('/teacher/:teacherId', authenticateUser, authorizeRoles('TEACHER', 'ADMIN'), getAppointmentsByTeacher);

// Get appointments by student
router.get('/student/:studentId', authenticateUser, authorizeRoles('STUDENT'), getAppointmentsByStudent);

export default router;
