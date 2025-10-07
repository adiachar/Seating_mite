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
    examTypes: [],
    buildings: []
}];


const deleteAllColleges = async () => {
    const response = await College.deleteMany({});
    return response;
}

const addColleges = async (colleges) => {
    try {
        await deleteAllColleges();
        const reponse = await College.insertMany(colleges);   
        console.log("Success!");
    } catch(err) {
        console.log(err);
    }
}

addColleges(colleges);