import mongoose from "mongoose";
import College from "../model/college.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "NoUrlHere";

mongoose.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => console.error("Error connecting to MongoDB:", err));





const colleges = [{
    name: "Mangalore Institute of Technology and Engineering",
    shortName: "MITE",
    departments: {ISE: "Information Science and Engineering", CSE: "Computer Science and Engineering",},
    examTypes: ['IA1', 'IA2', 'IA3', 'SE1', 'SE2'],
    buildings: []
}];


const deleteAllColleges = async () => {
    const response = await College.deleteMany({});
    return response;
}

const addCollege = async (college) => {
    try {
        const newCollege = new College(college);   
        await newCollege.save();
        console.log("Success!");
    } catch(err) {
        console.log(err);
    }
}


addCollege(colleges[0]);