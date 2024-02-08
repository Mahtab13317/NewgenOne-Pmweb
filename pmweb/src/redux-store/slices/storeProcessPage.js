import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    projectId: null,
    previousProcessPage: null,
    tabType: null,
    clickedTile: null,
    clickedTileIndex: null,
    clickedTileCount: null,
  },
};

export const previousProcessPageSlice = createSlice({
  name: "storeProcessPage",
  initialState,
  reducers: {
    setPreviousProcessPage: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setPreviousProcessPage } = previousProcessPageSlice.actions;
export const previousProcessPageVal = (state) => state.storeProcessPage.value;

export default previousProcessPageSlice.reducer;
