import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    user : null,
    headers: {},
    college: {},
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

        setCollege: (state, action) => {
            state.college = action.payload;
        },
    }
});

export const {
    setUser,
    setHeader,
    setCollege
} = guestifySlice.actions;

export default guestifySlice.reducer;