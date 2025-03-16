import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register Student
export const registerStudent = async (req, res) => {
  let { name, email, phone, password, year, semester, department } = req.body;
  try {
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    const existingUser = await prisma.student.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Student already exists' });

    // Convert year and semester to integers
    year = parseInt(year, 10);
    semester = parseInt(semester, 10);

    if (isNaN(year) || isNaN(semester)) {
      return res.status(400).json({ message: "Year and Semester must be valid numbers." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.student.create({ 
      data: { name, email, phone, department, password: hashedPassword, year, semester } 
    });
    
    res.status(201).json({ message: 'Student registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register Teacher
export const registerTeacher = async (req, res) => {
  let { name, email, phone, password, subjects, department, year, semester } = req.body;
  try {
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }
    
    const existingUser = await prisma.teacher.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Teacher already exists' });
    
    year = parseInt(year, 10);
    semester = parseInt(semester, 10);

    if (isNaN(year) || isNaN(semester)) {
      return res.status(400).json({ message: "Year and Semester must be valid numbers." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.teacher.create({ 
      data: { name, email, phone, password: hashedPassword, year, semester, department, subjects: { set: subjects } } 
    });
    
    res.status(201).json({ message: 'Teacher registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Register Admin
export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.admin.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Admin already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.admin.create({ data: { name, email, password: hashedPassword } });
    res.status(201).json({ message: 'Admin registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register HOD
export const registerHOD = async (req, res) => {
    const { name, email, password, department } = req.body;
    try {
      const existingUser = await prisma.hOD.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ message: 'HOD already exists' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.hOD.create({ data: { name, email, password: hashedPassword, department } });
      res.status(201).json({ message: 'HOD registered successfully', user: newUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Login User
  export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      let user, role;
      
      user = await prisma.student.findUnique({ where: { email } });
      if (user) role = 'STUDENT';
      
      if (!user) {
        user = await prisma.teacher.findUnique({ where: { email } });
        if (user) role = 'TEACHER';
      }
      
      if (!user) {
        user = await prisma.admin.findUnique({ where: { email } });
        if (user) role = 'ADMIN';
      }
      
      if (!user) {
        user = await prisma.hOD.findUnique({ where: { email } });
        if (user) role = 'HOD';
      }
      
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.status(200).json({ token, user: { id: user.id, name: user.name, role } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };