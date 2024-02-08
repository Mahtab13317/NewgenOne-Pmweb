import axios from "axios";
import {
  ENDPOINT_AI_PROMPT_HISTORY,
  ENDPOINT_ACTIVITY,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import {
  setIsLoadingPreviewProcessData,
  setIsPromptHistoryOpen,
  setPromptHistory,
  setSelectedGeneratedPreview,
  setSelectedGeneratedPreviewProcessData,
} from "../../../../redux-store/slices/MarvinPromtHistorySlice";
const CancelToken = axios.CancelToken;
let cancel;
export const getMarvinGeneratedProcesses = async ({ dispatch }) => {
  try {
    const response = await axios.get(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}`
    );
    if (response?.status === 200) {
      dispatch(setPromptHistory(response.data.templateGroups));
    }
  } catch (error) {
    console.log(error);
    //return false;
  }
  //return false;
};

export const getMarvinGeneratedPreviewProcessData = async ({
  dispatch,
  previewId,
}) => {
  dispatch(setIsLoadingPreviewProcessData(true));
  try {
    const response = await axios.get(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}/${previewId}`,
      {
        cancelToken: new CancelToken(function executor(c) {
          cancel = c;
        }),
      }
    );
    if (response?.status === 200) {
      //dispatch(setSelectedGeneratedPreview(response.data));
      dispatch(setSelectedGeneratedPreviewProcessData(response.data));
      dispatch(setIsLoadingPreviewProcessData(false));
    }
  } catch (error) {
    console.log(error);
    //dispatch(setIsLoadingPreviewProcessData(false));

    //return false;
  }
  //return false;
};

export const updateMarvinGeneratedProcessActivity = async ({
  dispatch,
  previewId,
  activityId,
  payload,
}) => {
  try {
    const response = await axios.put(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}/${previewId}${ENDPOINT_ACTIVITY}/${activityId}`,
      { ...payload }
    );
    if (response?.status === 200) {
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
};

export const deleteMarvinGeneratedProcesses = async ({ dispatch }) => {
  try {
    const response = await axios.delete(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}`
    );
    if (response?.status === 200) {
      dispatch(setPromptHistory([]));
      dispatch(setSelectedGeneratedPreview(null));
      dispatch(setIsPromptHistoryOpen(false));
      dispatch(setSelectedGeneratedPreviewProcessData(null));
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
};
