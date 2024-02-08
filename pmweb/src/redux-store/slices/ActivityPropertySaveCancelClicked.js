import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    SaveClicked: false,
    CancelClicked: false,
    CloseClicked: false,
    SaveOnceClicked: false,
    SaveFormEnabled: false,
    saveFormCallBack: () => {},
  },
};

export const ActivityPropertySaveCancelSlice = createSlice({
  name: "activityPropertySaveCancel",
  initialState,
  reducers: {
    setSave: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
    setSaveCancelClickedToDefault: (state) => {
      let temp = { ...state.value };
      for (let key in temp) {
        temp[key] = false;
      }
      state.value = { ...temp };
    },
  },
});

export const { setSave, setSaveCancelClickedToDefault } =
  ActivityPropertySaveCancelSlice.actions;
export const ActivityPropertySaveCancelValue = (state) =>
  state.activityPropertySaveCancel.value;

export default ActivityPropertySaveCancelSlice.reducer;
