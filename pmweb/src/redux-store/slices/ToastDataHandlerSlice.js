import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: { message: "", severity: "error", open: false },
};

export const ToastDataHandlerSlice = createSlice({
  name: "toastDataHandlerSlice",
  initialState,
  reducers: {
    setToastDataFunc: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setToastDataFunc } = ToastDataHandlerSlice.actions;
export const ToastDataValue = (state) => state.toastDataHandlerSlice.value;

export default ToastDataHandlerSlice.reducer;
