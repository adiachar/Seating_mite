import {Schema, model} from "mongoose";

const collegeSchema = new Schema({
    name: {type: String, required: true, unique: true},
    shortName: {type: String, required: true},
    departments: {type: Map, of: String},
    examTypes: [String],
    buildings: [
        {
            name: {type: String, required: true},
            noOfFloors: {type: Number, required: true, min: 0},
            floors: [
                {
                    name: {type: String, required: true},
                    classRooms: [
                        {
                            name: {type: String, required: true},
                            rows: {type: Number, required: true},
                            columns: {type: Number, required: true}
                        }
                    ]
                }
            ]
        }
    ]
});

export default model('College', collegeSchema);