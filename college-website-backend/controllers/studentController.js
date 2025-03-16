  import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

 

// Get Student by ID
export const getStudentById = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Students
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({});
    console.log("ALl Studends",students)
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message:"No Students"});
  }
};

// Update Student Year and Semester (Admin Only)
export const updateStudentDetails = async (req, res) => {
  const { studentId } = req.params;
  const { year, semester  } = req.body;
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

// Delete Student (Admin Only)
export const deleteStudent = async (req, res) => {
  const { studentId } = req.params;
  try {
    await prisma.student.delete({ where: { id: studentId } });
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
