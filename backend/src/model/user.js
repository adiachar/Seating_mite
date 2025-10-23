import {Schema, model} from 'mongoose';

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    type: {type: String, enum: ['admin', 'student', 'coordinator'], required: true},
    college: {type: Schema.Types.ObjectId, ref: 'colleges', required: true},
    department: {short: {type: String, required: true}, long: {type: String, required: true}},
});

export default model('User', userSchema);