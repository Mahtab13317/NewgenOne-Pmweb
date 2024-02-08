import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: { localProjRightsList: [], menuRightsList: [], regProjRightsList: [] },
};

export const UserRightsDataHandlerSlice = createSlice({
  name: "userRightsDataHandlerSlice",
  initialState,
  reducers: {
    setUserRightsDataFunc: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setUserRightsDataFunc } = UserRightsDataHandlerSlice.actions;
export const UserRightsValue = (state) =>
  state.userRightsDataHandlerSlice.value;

export default UserRightsDataHandlerSlice.reducer;
