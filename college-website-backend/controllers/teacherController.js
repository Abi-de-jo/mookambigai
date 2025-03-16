import { PrismaClient } from '@prisma/client';
import { parse } from 'date-fns';
 import { sendEmail } from '../utils/emailService.js';
import { sendSMS } from '../utils/smsService.js';

const prisma = new PrismaClient();

// Add a Teacher (Admin Only)
export const addTeacher = async (req, res) => {
    const { name, email, subjects,password ,department ,year , semester } = req.body;
    try {
        const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
        if (existingTeacher) return res.status(400).json({ message: 'Teacher already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = await prisma.teacher.create({ data: { name, email, password: hashedPassword, year , semester, department,subjects: { set: subjects } } });
   

 
        res.status(201).json({ message: 'Teacher added successfully', teacher: newTeacher });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove a Teacher (Admin Only)
export const removeTeacher = async (req, res) => {
    const { teacherId } = req.params;
    try {
        const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        await prisma.teacher.delete({ where: { id: teacherId } });
        res.status(200).json({ message: 'Teacher removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Teachers
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await prisma.teacher.findMany({});
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Teacher by ID
export const getTeacherById = async (req, res) => {
    const { teacherId } = req.params;
    try {
        const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Teacher Details (Admin Only)
export const updateTeacher = async (req, res) => {
    const { teacherId } = req.params;
    const { name, email, subjects , semester ,year, department } = req.body;
    try {
        const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const updatedTeacher = await prisma.teacher.update({
            where: { id: teacherId },
            data: { name, email, subjects,semester , year,department },
        });
        res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const createAppointment = async (req, res) => {
  const { studentId, teacherId, date } = req.body;

  try {
    const parsedDate = parse(date, 'dd.MM.yyyy', new Date());
    if (isNaN(parsedDate)) {
        return res.status(400).json({ error: "Invalid date format. Use 'DD.MM.YYYY'." });
    }

    const appointment = await prisma.appointment.create({
        data: { studentId, teacherId, date: parsedDate, status: 'PENDING' },
        include: { student: {
select:{
  id:true,name:true,email:true,department:true,semester:true,year:true,phone:true
  
}
        }, teacher: {
          select:{
            id:true,name:true,email:true,department:true,semester:true,year:true,phone:true
            
          }
        } }
    }); 

      if (!appointment) {
          return res.status(404).json({ error: "Appointment creation failed" });
      }

      // Ensure student and teacher details exist before sending SMS
      if (!appointment.student || !appointment.teacher) {
          return res.status(400).json({ error: "Student or Teacher details missing" });
      }

      // Check if phone numbers exist
      if (!appointment.student.phone) {
          console.error('❌ Error: Student phone number is missing');
      } else {
          await sendSMS(
              appointment.student.phone, 
              `Your appointment with ${appointment.teacher.name} on ${date} is pending approval.`
          );
      }

      if (!appointment.teacher.phone) {
          console.error('❌ Error: Teacher phone number is missing');
      } else {
          await sendSMS(
              appointment.teacher.phone, 
              `New appointment request from ${appointment.student.name} on ${date}.`
          );
      }

      res.status(201).json({ message: 'Appointment booked successfully', appointment });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


 
  
  
  // Update Appointment Status (Teacher Only)
  export const updateAppointmentStatus = async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    try {
        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
            include: { student: true, teacher: true }
        });

        // Send email to student about approval/rejection
        await sendEmail(
            updatedAppointment.student.email,
            `Appointment ${status}`,
            `Hello ${updatedAppointment.student.name},\n\nYour appointment with ${updatedAppointment.teacher.name} on ${updatedAppointment.date} has been ${status.toLowerCase()}.`
        );

        res.status(200).json({ message: 'Appointment status updated', appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

  
  // Get Appointments by Teacher ID
  export const getAppointmentsByTeacher = async (req, res) => {
    const { teacherId } = req.params;
    try {
        const appointments = await prisma.appointment.findMany({
            where: { teacherId },
            include: {
                student: {
                  select:{
                    id:true,name:true,email:true,department:true,semester:true,year:true
                  }
                }
            }
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
  
  // Get Appointments by Student ID
  export const getAppointmentsByStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
        const appointments = await prisma.appointment.findMany({
            where: { studentId },
            include: {
                teacher: {
                  select:{
                    id:true,name:true,email:true,department:true,year:true,semester:true
                  }
                } // Include teacher details so student knows which teacher the appointment is with
            }
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

  export const updateStudentDetails = async (req, res) => {
    const { studentId } = req.params;
    const { year, semester } = req.body;
    try {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) return res.status(404).json({ message: 'Student not found' });
  
      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: { year, semester },
      });
      res.status(200).json({ message: 'Student details updated successfully', student: updatedStudent });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update Teacher Subjects (Admin Only)
  export const updateTeacherDetails = async (req, res) => {
    const { teacherId } = req.params;
    const { subjects } = req.body;
    try {
      const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  
      const updatedTeacher = await prisma.teacher.update({
        where: { id: teacherId },
        data: { subjects: { set: subjects } },
      });
      res.status(200).json({ message: 'Teacher details updated successfully', teacher: updatedTeacher });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };