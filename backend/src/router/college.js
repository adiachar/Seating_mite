import express from "express";
import { addBuilding, addCollege, updateBuildingData, updateDepartmentsData, getCollege, getAllColleges, deleteBuilding } from "../control/college.js";
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', (req, res) => getAllColleges(req, res));
router.post('/add-college', authMiddleware, (req, res) => addCollege(req, res));
router.post('/add-building', authMiddleware, (req, res) => addBuilding(req, res));
router.patch('/building', authMiddleware, (req, res) => updateBuildingData(req, res));
router.patch('/departments', authMiddleware, (req, res) => updateDepartmentsData(req, res));
router.delete('/building', authMiddleware, (req, res) => deleteBuilding(req, res));
router.get('/:collegeId',authMiddleware, (req, res) => getCollege(req, res));
export default router;