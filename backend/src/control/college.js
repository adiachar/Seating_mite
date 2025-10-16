import College from "../model/college.js";

export const getCollege = async (req, res) => {
    try {
        const {collegeId} = req.params;

        const college = await College.findById(collegeId).lean();

        if(!college) {
            return res.status(404).json({message: "College Not Found!"});
        }

        return res.status(200).json({college: college});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const getAllColleges = async (req, res) => {
    try {        
        const colleges = await College.find({}).lean();

        return res.status(200).json({colleges: colleges});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const addCollege = async (req, res) => {
    try {
        const {college} = req.body;
        
        let response = await College.find({name: college.name}).lean();

        if(response.length != 0) {
            return res.status(400).json({message: "College already exists in the Database!"});
        }

        const newCollege = new College({college});
        await newCollege.save();

        return res.status(200).json({message: "College added Successfully!"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}

export const addBuilding = async (req, res) => {
    try {
        const {collegeId, building} = req.body;
        
        const response = await College.findByIdAndUpdate(collegeId, {$push: {buildings: building}}, {new: true, lean: true}).lean();
        
        return res.status(200).json({message: "Building updated Successfully!"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
} 

export const updateBuildingData = async (req, res) => {
    try {
        const {collegeId, building} = req.body;
        
        const college = await College.findById(collegeId);

        if(!college) {
            return res.status(404).json({message: "College Not Found!"});
        }

        const buildingIdx = college.buildings.findIndex(oldBuilding => oldBuilding._id.toString() === building._id);

        if(buildingIdx == -1) {
            return res.status(404).json({message: "Building Not Found!"});
        }

        college.buildings[buildingIdx] = building;
        await college.save();

        return res.status(200).json({message: "Building Updated Successfully!"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    } 
} 

export const deleteBuilding = async (req, res) => {
    try {
        const {collegeId, buildingId} = req.body;
        const response = await College.updateOne({_id: collegeId}, {$pull : {buildings: {_id: buildingId}}});
        return res.status(200).json({message: "Building Deleted Successfully!"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error!"});
    }
}