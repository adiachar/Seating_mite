import {configureStore} from "@reduxjs/toolkit";
import seatingAppReducer from "../features/seatingSlice.js";

export const store = configureStore({
    reducer: seatingAppReducer
});