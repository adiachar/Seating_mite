import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./router/user.js";
import examRouter from "./router/exam.js";
import studentRouter from "./router/student.js";
import collegeRouter from "./router/college.js";
import { sendEmail } from "./utils/mail.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "NoUrlHere";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/user", userRouter);
app.use("/exam", examRouter);
app.use("/students", studentRouter);
app.use("/college", collegeRouter);


app.listen(PORT, () => {
    mongoose.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => console.error("Error connecting to MongoDB:", err));
    console.log(`Server is running on port ${PORT}`);
});