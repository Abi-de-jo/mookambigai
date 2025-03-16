import express from 'express';
import { 
  addTeacher, removeTeacher, getAllTeachers, getTeacherById, updateTeacher 
} from '../controllers/teacherController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { loginUser, registerTeacher } from '../controllers/authController.js';
 
const router = express.Router();

router.post('/register', registerTeacher);
router.post('/login', loginUser);

router.post('/add', authenticateUser, authorizeRoles('ADMIN'), addTeacher);
router.delete('/remove/:teacherId', authenticateUser, authorizeRoles('ADMIN'), removeTeacher);
router.get('/all', authenticateUser, getAllTeachers);
router.get('/:teacherId', authenticateUser, getTeacherById);
router.put('/update/:teacherId', authenticateUser, authorizeRoles('ADMIN'), updateTeacher);

export default router;
