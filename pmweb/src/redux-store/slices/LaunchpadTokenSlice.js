import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: "",
};

export const LaunchpadTokenSlice = createSlice({
  name: "launchpadTokenSlice",
  initialState,
  reducers: {
    setLaunchpadToken: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setLaunchpadToken } = LaunchpadTokenSlice.actions;
export const LaunchpadTokenSliceValue = (state) =>
  state.launchpadTokenSlice.value;

export default LaunchpadTokenSlice.reducer;
