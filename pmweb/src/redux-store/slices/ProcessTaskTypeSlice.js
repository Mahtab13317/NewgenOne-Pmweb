import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: "",
};

export const ProcessTaskTypeSlice = createSlice({
  name: "processTaskTypeSlice",
  initialState,
  reducers: {
    setProcessTaskType: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setProcessTaskType } = ProcessTaskTypeSlice.actions;
export const ProcessTaskTypeValue = (state) => state.processTaskTypeSlice.value;

export default ProcessTaskTypeSlice.reducer;
