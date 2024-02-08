import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: true,
};

export const InitialRenderSlice = createSlice({
  name: "initialRenderSlice",
  initialState,
  reducers: {
    setValueInitialRender: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setValueInitialRender } = InitialRenderSlice.actions;
export const InitialRenderSliceValue = (state) =>
  state.initialRenderSlice.value;

export default InitialRenderSlice.reducer;
