import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.js"
import Student from "../model/student.js";
import dotenv from "dotenv";


dotenv.config();

export const signIn = async (req, res) => {
    const {email, password} = req.body;
    
    try{ 
        let user = await User.findOne({email: email}).lean();
        
        if(!user) {
            return res.status(404).json({message: "User not found!"});
        } 
        
        let isPassword = await bcrypt.compare(password, user.password);

        if(!isPassword) {
            return res.status(404).json({message: "Incorrect Password!"});
        }

        delete user.password;

        let token = jwt.sign(user, process.env.SECRET, {expiresIn: '1h'});

        return res.status(200).json({user: user, token: token});
        
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
    
}

export const signUp = async (req, res) => {
    if(!req.body) {
        return res.status(404).json({message: "No request object!"});
    }

    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        
        let newUser = new User(req.body);
        await newUser.save();
        let user = newUser.toObject();

        delete user.password;

        let token = jwt.sign(user, process.env.SECRET, {expiresIn: '1h'});
        return res.status(200).json({user: user, token: token});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const StudentSignIn = async (req, res) => {
    const {usn, password} = req.body;
    
    try{ 
        let user = await Student.findOne({usn: usn}).lean();
        
        if(!user) {
            return res.status(404).json({message: "Student not found!"});
        } 
        
        let isPassword = await bcrypt.compare(password, user.password);

        if(!isPassword) {
            return res.status(404).json({message: "Incorrect Password!"});
        }

        delete user.password;

        let token = jwt.sign(user, process.env.SECRET, {expiresIn: '1h'});

        return res.status(200).json({user: user, token: token});
        
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const StudentSignUp = async (req, res) => {
    if(!req.body) {
        return res.status(404).json({message: "No request object!"});
    }

    console.log(req.body);

    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        
        let newStudent = new Student(req.body);
        await newStudent.save();
        let user = newStudent.toObject();

        delete user.password;

        let token = jwt.sign(user, process.env.SECRET, {expiresIn: '1h'});
        return res.status(200).json({user: user, token: token});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}