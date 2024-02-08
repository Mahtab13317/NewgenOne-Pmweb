import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    initialWebservice: null,
    webserviceChanged: false,
    initialConn: 0,
    connChanged: false,
  },
};

export const webserviceChangeSlice = createSlice({
  name: "webserviceChange",
  initialState,
  reducers: {
    setWebservice: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setWebservice } = webserviceChangeSlice.actions;
export const webserviceChangeVal = (state) => state.webserviceChange.value;

export default webserviceChangeSlice.reducer;
