import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

export const ActivityPropertyChangeSlice = createSlice({
  name: "activityPropertyChange",
  initialState,
  reducers: {
    setActivityPropertyValues: (state, action) => {
      state.value = { ...action.payload };
    },
    setActivityPropertyChange: (state, action) => {
      let temp = JSON.parse(
        JSON.stringify({ ...state.value, ...action.payload })
      );
      state.value = temp;
    },
    setActivityPropertyToDefault: (state) => {
      let temp = { ...state.value };
      for (var key in temp) {
        temp[key].isModified = false;
        temp[key].hasError = false;
      }
      state.value = { ...temp };
    },
  },
});

export const {
  setActivityPropertyChange,
  setActivityPropertyToDefault,
  setActivityPropertyValues,
} = ActivityPropertyChangeSlice.actions;

export const ActivityPropertyChangeValue = (state) =>
  state.activityPropertyChange.value;

export default ActivityPropertyChangeSlice.reducer;
