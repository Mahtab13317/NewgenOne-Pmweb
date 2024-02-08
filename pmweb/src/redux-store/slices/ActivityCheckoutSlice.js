import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: { isCheckoutActEdited: false, checkedActProp: {}, actCheckedId: null, actCheckedName: null },
};

export const ActivityCheckoutSlice = createSlice({
  name: "activityCheckout",
  initialState,
  reducers: {
    setCheckoutActEdited: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setCheckoutActEdited } = ActivityCheckoutSlice.actions;
export const ActivityCheckoutValue = (state) => state.activityCheckout.value;

export default ActivityCheckoutSlice.reducer;
