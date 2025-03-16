import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import teacherRoutes from './routes/teacherRoute.js';
import appointmentRoutes from './routes/appointmentRoute.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import hodRoutes from './routes/hodRoutes.js';

const app = express();
 
app.use(express.json());
app.use(cors());
 

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


export default app;