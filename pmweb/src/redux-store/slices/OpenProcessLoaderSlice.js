import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: { loader: false },
};

export const OpenProcessLoaderSlice = createSlice({
  name: "openProcessLoader",
  initialState,
  reducers: {
    setOpenProcessLoader: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setOpenProcessLoader } = OpenProcessLoaderSlice.actions;
export const OpenProcessLoaderSliceValue = (state) =>
  state.openProcessLoader.value;

export default OpenProcessLoaderSlice.reducer;
