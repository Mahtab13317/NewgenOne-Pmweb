import axios from "axios";
import {
  ENDPOINT_AI_PROMPT_HISTORY,
  ENDPOINT_DATAOBJECTS,
  ENDPOINT_VARIABLE,
  SERVER_URL,
} from "../../../../Constants/appConstants";
export const deleteDataObject = async ({ previewId, dataObjectId }) => {
  try {
    const response = await axios.delete(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}/${previewId}${ENDPOINT_DATAOBJECTS}/${dataObjectId}`
    );
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
};

export const deleteDataObjectVariable = async ({
  previewId,
  dataObjectId,
  variableId,
}) => {
  try {
    const response = await axios.delete(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}/${previewId}${ENDPOINT_DATAOBJECTS}/${dataObjectId}${ENDPOINT_VARIABLE}/${variableId}`
    );
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
};
