import {Schema, model} from "mongoose";

const studentsSchema = new Schema({
    usn: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    sem: {type: Number, required: true},
    branch: {type: String, required: true},
}, {_id: false});

export default model('Students', studentsSchema);