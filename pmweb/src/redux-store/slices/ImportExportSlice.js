import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: { ProjectName: null, Type: null, ProjectList: [] },
};

export const ImportExportSlice = createSlice({
  name: "importExportSlice",
  initialState,
  reducers: {
    setImportExportVal: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
  },
});

export const { setImportExportVal } = ImportExportSlice.actions;
export const ImportExportSliceValue = (state) => state.importExportSlice.value;

export default ImportExportSlice.reducer;
