import Student from "../model/student.js";

export const addStudent = async (req, res) => {
    try {
        const {data} = req.body;

        if(!data || data.length === 0) {
            return res.status(404).json({message: "No data provided!"});
        }

        let students = await Student.insertMany(data);

        return res.status(200).json({message: "Students added successfully!"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const clearStudents = async (req, res) => {
    try {
        await Student.deleteMany({});
        return res.status(200).json({message: "All students deleted successfully!"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}