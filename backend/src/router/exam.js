import express from 'express';
const router = express.Router();
import { getExams, getEligibleStudents, addEligibleStudents, addExams, deleteExam } from '../control/exam.js';

router.get('/all', (req, res) => {getExams(req, res)});
router.post('/add', (req, res) => {addExams(req, res)});
router.post('/delete', (req, res) => {deleteExam(req, res)});
router.get('/eligible-students/:examId', (req, res) => {getEligibleStudents(req, res)});
router.post('/add/eligible-students', (req, res) => {addEligibleStudents(req, res)});

export default router;