import express from 'express';
const router = express.Router();
import { addStudent, clearStudents } from '../control/student.js';

router.post('/add', (req, res) => {addStudent(req, res)});
router.post('/clear', (req, res) => {clearStudents(req, res)});

export default router;