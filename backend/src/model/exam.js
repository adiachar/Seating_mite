import {Schema, model} from "mongoose";

const examSchema = new Schema([
    {
        year: {type: Number, required: true},
        examType: {type: String, required: true, enum: ['IA1', 'IA2', 'IA3', 'SE1', 'SE2']},
        eligibleStudents: [
            {branch: String, semester: String, batch: String, students: [String]}
        ],
        isAllotted: {type: Boolean, default: false},
        allotment: [
            {
                building: {type: String, required: true},
                floor: {type: String, required: true},
                classRoom: {
                    name: {type: String, required: true},
                    rows: {type: Number, required: true},
                    columns: {type: Number, required: true},
                    seats: [[String]]

                }
            }
        ]
    }
]);

export default model('Exam', examSchema);