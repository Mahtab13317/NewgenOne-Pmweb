import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  processes: [],
};

export const processListSlice = createSlice({
  name: "processList",
  initialState,
  reducers: {
    processAdded: (state, action) => {
      state.processes.push(action.payload);
    },
    processFetched: (state, action) => {
      state.processes = [...action.payload];
    },
  },
});

export const { processAdded, processFetched } = processListSlice.actions;
export const processListValue = (state) => state.processList.processes;

export default processListSlice.reducer;
