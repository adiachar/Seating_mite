import {Schema, model} from "mongoose";

const examSchema = new Schema([
    {
        date: {type: Date, required: true},
        time: {type: String},
        type: {type: String, required: true, enum: ['IA1', 'IA2', 'IA3', 'SE1', 'SE2']},
        eligibleStudents: [
            {branch: {type: String, required: true}, semester: {type: Number, required: true}, subject: {type: String, required: true}, students: [String]}
        ],
        isAllotted: {type: Boolean, default: false},
        allotment: [{
            building: {
                _id: {type: String, required: true},
                name: {type: String, required: true}
            },
            floor: {
                _id: {type: String, required: true},
                name: {type: String, required: true}
            },
            classRoom: {
                _id: {type: String, required: true},
                name: {type: String, required: true},
                rows: {type: Number, required: true},
                columns: {type: Number, required: true},
                isFinalized: {type: Boolean, default: false},
                seats: [[{
                    usn: {type: String, required: true}, 
                    branch: {type: String, required: true},
                    subject: {type: String, required: true},
                    semester: {type: String, required: true},
                }]]
            }
        }],
        createdOn: {type: Date, default: Date.now}
    }
]);

export default model('Exam', examSchema);