import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    commonLogo: null,
    isLoadingDetails: true,
    showPoweredByIcon: false,
    poweredByIcon: null,
    favIcon: null,
  },
};

export const brandDetailsSlice = createSlice({
  name: "brandDetails",
  initialState,
  reducers: {
    setBrandDetails: (state, action) => {
      // state.commonLogo = action.payload.commonLogo;
      //state.showPoweredByIcon = action.payload.showPoweredByIcon;
      //state.poweredByIcon = action.payload.poweredByIcon;
      // state.favIcon = action.payload.favIcon;
      state.value = { ...action.payload };
    },
    setBrandDetailsLoading: (state, action) => {
      state.value.isLoadingDetails = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setBrandDetails, setBrandDetailsLoading } =
  brandDetailsSlice.actions;
/*export const {
  commonLogo,
  isLoadingDetails,
  showPoweredByIcon,
  poweredByIcon,
  favIcon,
}*/
export const brandDetailsValue = (state) => state.brandDetails.value;

export default brandDetailsSlice.reducer;
