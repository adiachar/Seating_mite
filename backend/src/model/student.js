import {Schema, model} from "mongoose";

const studentSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    usn: {type: String, required: true, unique: true},
    semester: {type: Number, required: true},
    department: {type: String, required: true},
    phoneNo: {type: Number, required: true},
    college: {type: Schema.Types.ObjectId, ref: 'College'},
    password: {type: String, required: true},
    type: {type: String, default: 'student'}
});

export default model('Student', studentSchema);