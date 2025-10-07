import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    user : null,
    headers: {},
    college: { 
        short: 'MITE',
        name: "Mangalore Institute Of Technology & Engineering",
        dtl: "(A Unit of Rajalaxmi Education Trust, Mangalore) Autonomous Institute Affialiated to VTU, Belagavi, Approved by AICTE, New Delhi Accredited by NAAC with A+ Grade & ISO 9001:2015 Certified Institution",
        departments: {
            AE: "Aeronautical Engineering",
            CSE: "Computer Science And Engineering",
            AIML: "Artificial Intelligence & Machine Learning",
            CSIOT: "Computer Science and Internet Of Things",
            CSAIML: "Computer Science and Artificial Intelligence & Machine Learning",
            ISE: "Information Science And Engineering",
            ECE: "Electronics And Communication Engineering",
            MEC: "Mechanical Engineering",
            ME: "Mechatronics Engineering",
            RAI: "Robotics and Artificial Intelligence",
            CVL: "Civil Engineering",
            PC: "Physics-cycle", 
            CC: "Chemistry-cycle"
        },
        examTypes: ['IA1', 'IA2', 'IA3', 'SE1', 'SE2'],
        branches: ['AE', 'CSE', 'AIML', 'CSIOT', 'CSAIML', 'ISE', 'ECE', 'MEC', 'ME', 'RAI', 'CVL', 'PC', 'CC'],
        rooms: [
            {name: 'L001', row: 7, col: 5},
            {name: 'L002', row: 7, col: 5},
            {name: 'L003', row: 7, col: 4},
            {name: 'L004', row: 7, col: 5},
            {name: 'L005', row: 7, col: 5},
            {name: 'L006', row: 7, col: 5},
            {name: 'L007', row: 7, col: 4},
            {name: 'L008', row: 7, col: 5}
        ],
    },
    userTypes: ['admin', 'student', 'coordinator'],
}

const guestifySlice = createSlice({
    name: "Guestify",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },

        setHeader: (state, action) => {
            state.headers = {
                authorization: `Bearer ${action.payload}`,
            }
        },
    }
});

export const {
    setUser,
    setHeader,
    setAllRequests
} = guestifySlice.actions;

export default guestifySlice.reducer;