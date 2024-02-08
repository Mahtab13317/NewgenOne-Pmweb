import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    allAIGeneratedProcesses: [],
    selectedGeneratedPreview: null,
    selectedGeneratedPreviewProcessData: null,
    isPromptHistoryOpen: false,
    isLoadingPreviewProcessData: false,
    isMovedToPromptHistory: false,
  },
};

export const MarvinPromptHistorySlice = createSlice({
  name: "promptHistory",
  initialState,
  reducers: {
    setPromptHistory: (state, action) => {
      state.value = {
        ...state.value,
        allAIGeneratedProcesses: [...action.payload],
      };
    },
    setSelectedGeneratedPreview: (state, action) => {
      state.value = {
        ...state.value,
        selectedGeneratedPreview: action.payload,
      };
    },
    setSelectedGeneratedPreviewProcessData: (state, action) => {
      state.value = {
        ...state.value,
        selectedGeneratedPreviewProcessData: action.payload,
      };
    },
    setIsPromptHistoryOpen: (state, action) => {
      state.value = {
        ...state.value,
        isPromptHistoryOpen: action.payload,
      };
    },
    setIsLoadingPreviewProcessData: (state, action) => {
      state.value = {
        ...state.value,
        isLoadingPreviewProcessData: action.payload,
      };
    },
    setIsMovedToPromptHistory: (state, action) => {
      state.value = {
        ...state.value,
        isMovedToPromptHistory: action.payload,
      };
    },
  },
});

export const {
  setPromptHistory,
  setSelectedGeneratedPreview,
  setIsPromptHistoryOpen,
  setSelectedGeneratedPreviewProcessData,
  setIsLoadingPreviewProcessData,
  setIsMovedToPromptHistory,
} = MarvinPromptHistorySlice.actions;
export const promptHistoryValue = (state) => state.promptHistory.value;

export default MarvinPromptHistorySlice.reducer;
