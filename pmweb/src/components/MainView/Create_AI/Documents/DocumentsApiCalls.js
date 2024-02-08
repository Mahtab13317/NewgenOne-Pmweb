import axios from "axios";
import {
  ENDPOINT_AI_PROMPT_HISTORY,
  ENDPOINT_DOCUMENTS,
  SERVER_URL,
} from "../../../../Constants/appConstants";
export const deleteDocument = async ({ previewId, docId }) => {
  try {
    const response = await axios.delete(
      `${SERVER_URL}${ENDPOINT_AI_PROMPT_HISTORY}/${previewId}${ENDPOINT_DOCUMENTS}/${docId}`
    );
    console.log(response);
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
};
