import express from "express";
import { addBuilding, addCollege, updateBuildingData, getCollege, getAllColleges } from "../control/college.js";
const router = express.Router();

router.get('/:collegeId', (req, res) => getCollege(req, res));
router.get('/all', (req, res) => getAllColleges(req, res));
router.post('/add-college', (req, res) => addCollege(req, res));
router.post('/add-building', (req, res) => addBuilding(req, res));
router.patch('/update-building-data', (req, res) => updateBuildingData(req, res));

export default router;