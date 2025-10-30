import express from 'express';
const router = express.Router();
import { getExams, getEligibleStudents, addEligibleStudents, addExam, deleteExam, updateAllotment, getAllotment, editExam } from '../control/exam.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

router.get('/all', authMiddleware, (req, res) => {getExams(req, res)});
router.post('/add', authMiddleware, (req, res) => {addExam(req, res)});
router.post('/delete', authMiddleware, (req, res) => {deleteExam(req, res)});
router.get('/eligible-students/:examId', authMiddleware, (req, res) => {getEligibleStudents(req, res)});
router.post('/add/eligible-students', authMiddleware, (req, res) => {addEligibleStudents(req, res)});
router.patch('/allotment', authMiddleware, (req, res) => {updateAllotment(req, res)});
router.get('/allotment/:examId', authMiddleware, (req, res) => {getAllotment(req, res)});
router.patch('/edit/:examId', authMiddleware, (req, res) => {editExam(req, res)});

export default router;