import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    projectId: null,
    projectCreated: false,
    projectName: null,
    projectDesc: null,
  },
};

export const projectCreationSlice = createSlice({
  name: "projectCreation",
  initialState,
  reducers: {
    setProjectCreation: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setProjectCreation } = projectCreationSlice.actions;
export const projectCreationVal = (state) => state.projectCreation.value;

export default projectCreationSlice.reducer;
