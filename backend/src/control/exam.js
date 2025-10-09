import Exams from "../model/exam.js";

export const getExams = async (req, res) => {
    try {
        const exams = await Exams.find().select('-eligibleStudents -allotment').lean();

        return res.status(200).json({exams: exams});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const getEligibleStudents = async (req, res) => {
    try {
        const {examId} = req.params;

        if(!examId) {
            return res.status(404).json({message: "No examId provided!"});
        }

        const exam = await Exams.findById(examId).select('eligibleStudents -_id').lean();

        if(!exam) {
            return res.status(404).json({message: "No exams found!"});
        }

        return res.status(200).json({eligibleStudents: exam.eligibleStudents});
        
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const addEligibleStudents = async (req, res) => {
    try {
        const {branch, semester, batch, data, examId} = req.body;

        if(!branch || !semester || !batch || !data || data.length === 0) {
            return res.status(400).json({message: "Please provide all the required fields!"});
        }

        const exam = await Exams.findById(examId);
        const eligibleStudents = data.map(student => student.USN);

        if(!exam) {
            return res.status(404).json({message: "Exam not found!"});
        }

        let existingEntryIndex = exam.eligibleStudents.findIndex(entry => entry.branch === branch && entry.semester === semester && entry.batch === batch);

        if(existingEntryIndex !== -1) {
            exam.eligibleStudents[existingEntryIndex].students = eligibleStudents;
        } else {
            exam.eligibleStudents.push({branch, semester, batch, students: eligibleStudents});
        }
        
        await exam.save();
        return res.status(200).json({message: "Eligible students added successfully!"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const addExams = async (req, res) => {
    try {
        const {year, examType} = req.body;

        if(!year || !examType) {
            return res.status(400).json({message: "Please provide all the required fields!"});
        }

        const exam = await Exams.findOne({year: year, examType: examType});

        if(exam) {
            return res.status(400).json({message: "Exam Request already exists!"});
        }

        const newExam = new Exams({year: year, examType: examType, eligibleStudents: []});
        await newExam.save();
        return res.status(200).json({message: "Exam added successfully!"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Interval Server Error!"});
    }
}

export const deleteExam = async (req, res) => {
    try {
        const {examId} = req.body;
        if(!examId) {
            return res.status(400).json({message: "Please provide examId!"});
        }
        const exam = await Exams.findByIdAndDelete(examId);
        return res.status(200).json({message: "Exam deleted successfully!"});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({message: "Interval Server Error!"});
    }
}

export const updateAllotment = async (req, res) => {
    try {   
        const {examId, allotment} = req.body;

        const response = await Exams.findByIdAndUpdate(examId, { $set: {isAllotted: true} ,$set: {allotment: allotment}});

        return res.status(200).json({message: "Allotment made Successfully!"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllotment = async (req, res) => {
    try {
        const {examId} = req.params;

        const exam = await Exams.findById(examId).select("allotment").lean();

        return res.status(200).json({allotment: exam.allotment});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}