import Exam from "../model/exam.js";
import User from "../model/user.js";
import {sendEmail} from "../utils/mail.js";

export const getExams = async (req, res) => {
    try {
        const exams = await Exam.find().lean();

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

        const exam = await Exam.findById(examId).select('eligibleStudents -_id').lean();

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

        const exam = await Exam.findById(examId);
        const eligibleStudents = students.map(student => student.USN);

        if(!exam) {
            
            return res.status(404).json({message: "Exam not found!"});
        }

        let existingEntryIndex = exam.eligibleStudents.findIndex(entry => entry.branch === branch && entry.semester === semester);

        if(existingEntryIndex !== -1) {
            exam.eligibleStudents[existingEntryIndex].students = eligibleStudents;
            await exam.save();

        } else {
            let response = await Exam.findByIdAndUpdate(examId, {$push: {eligibleStudents: {branch: branch, semester: semester, subject: subject, students: eligibleStudents}}}, {new: true});
        }
        
        return res.status(200).json({message: "Eligible students added successfully!"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

const getDate = (date) => {
    date = new Date(date);
    return date.toLocaleDateString('en-GB', {day: '2-digit', month: 'long', year: 'numeric'});
}

export const addExam = async (req, res) => {
    try {
        const {date, type} = req.body;

        if(!date || !type) {
            return res.status(400).json({message: "Please provide all the required fields!"});
        }

        const exam = await Exam.findOne({date: date, type: type});

        if(exam) {
            return res.status(400).json({message: "Exam Request already exists!"});
        }

        const newExam = new Exam({date: date, type: type});
        await newExam.save();

        const allUsers = User.find({type: 'coordinator'});
        
        if(allUsers?.length > 0) {
            for(let user of allUsers) {
                sendEmail(user.email, 
                    `Eligible Students Added for ${type}  Examination – ${getDate(date)}`,
                    `Hello ${user.name}, <br>
                    This is to inform you that the Examination Dean, ${req.user}, has successfully added the eligible students for the upcoming ${type} examination scheduled on ${getDate(date)}.<br>
                    You can now proceed with the necessary arrangements for the exam.<br>
                    For any queries, please contact the Examination Dean.<br><br>
                    `
                );
            }
        }

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
        const exam = await Exam.findByIdAndDelete(examId);
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

        const response = await Exam.findByIdAndUpdate(examId, { $set: {isAllotted: true, allotment: allotment}}, {new: true});

        return res.status(200).json({message: "Allotment made Successfully!"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllotment = async (req, res) => {
    try {
        const {examId} = req.params;
        
        const exam = await Exam.findById(examId).select("allotment").lean();
        
        return res.status(200).json({allotment: exam.allotment});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}