import express from "express";
import { addBuilding, addCollege, updateBuildingData, getCollege, getAllColleges, deleteBuilding } from "../control/college.js";
const router = express.Router();

router.get('/all', (req, res) => getAllColleges(req, res));
router.post('/add-college', (req, res) => addCollege(req, res));
router.post('/add-building', (req, res) => addBuilding(req, res));
router.patch('/building', (req, res) => updateBuildingData(req, res));
router.delete('/building', (req, res) => deleteBuilding(req, res));
router.get('/:collegeId', (req, res) => getCollege(req, res));
export default router;