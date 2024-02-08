import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: { loadedData: {} },
};

export const OpenProcessSlice = createSlice({
  name: "openProcessSlice",
  initialState,
  reducers: {
    setOpenProcess: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setOpenProcess } = OpenProcessSlice.actions;
export const OpenProcessSliceValue = (state) => state.openProcessSlice.value;

export default OpenProcessSlice.reducer;
