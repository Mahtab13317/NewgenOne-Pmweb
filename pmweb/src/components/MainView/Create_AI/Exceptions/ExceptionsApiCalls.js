import axios from "axios";
import {
  ENDPOINT_AI_PROMPT_HISTORY,
  ENDPOINT_EXCEPTIONS,
  SERVER_URL,
} from "../../../../Constants/appConstants";
export const deleteException = async ({ previewId, exceptionId }) => {
  try {
    const response = await axios.delete(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}/${previewId}${ENDPOINT_EXCEPTIONS}/${exceptionId}`
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
