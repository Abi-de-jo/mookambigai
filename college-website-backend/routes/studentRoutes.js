import express from 'express';

import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { loginUser, registerStudent } from '../controllers/authController.js';
import {getStudentById,getAllStudents,deleteStudent,updateStudentDetails } from "../controllers/studentController.js"
const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginUser);

// Protected route (only logged-in users can access)
router.get('/profile', authenticateUser, (req, res) => {
  res.json({ message: `Welcome ${req.user.role}!`, user: req.user });
});

// Admin-only route
router.get('/admin-dashboard', authenticateUser, authorizeRoles('ADMIN'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

// Get all students (Admin/HOD only)
router.get('/getall', authenticateUser, authorizeRoles('ADMIN', 'HOD'), getAllStudents);
// Get a student by ID (For Admin, HOD, Teachers)
router.get('/:studentId', authenticateUser, authorizeRoles('ADMIN', 'HOD', 'TEACHER'), getStudentById);


// Update student details (Admin only)
router.put('/update/:studentId', authenticateUser, authorizeRoles('ADMIN'), updateStudentDetails);

// Delete a student (Admin only)
router.delete('/delete/:studentId', authenticateUser, authorizeRoles('ADMIN'), deleteStudent);

export default router;
