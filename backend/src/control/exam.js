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
        const {branch, semester, subject, students, examId} = req.body;

        if(!branch || !semester || !subject || !students || students.length === 0) {
            return res.status(400).json({message: "Please provide all the required fields!"});
        }

        const exam = await Exams.findById(examId);
        const eligibleStudents = students.map(student => student.USN);

        if(!exam) {
            return res.status(404).json({message: "Exam not found!"});
        }

        let existingEntryIndex = exam.eligibleStudents.findIndex(entry => entry.branch === branch && entry.semester === semester && entry.subject === subject);

        if(existingEntryIndex !== -1) {
            exam.eligibleStudents[existingEntryIndex].students = eligibleStudents;
        } else {
            exam.eligibleStudents.push({branch, semester, subject, students: eligibleStudents});
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
        const {date, type} = req.body;

        if(!date || !type) {
            return res.status(400).json({message: "Please provide all the required fields!"});
        }

        const exam = await Exams.findOne({date: date, type: type});

        if(exam) {
            return res.status(400).json({message: "Exam Request already exists!"});
        }

        const newExam = new Exams({date: date, type: type});
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

        const response = await Exams.findByIdAndUpdate(examId, { $set: {isAllotted: true, allotment: allotment}}, {new: true});

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