import axios from "axios";
import { SERVER_URL, ENDPOINT_OPENPROCESS } from "../../Constants/appConstants";

// Function that makes the API call for open process based on parameters passed.
export const openProcessAPICall = async (
  openProcessID,
  openProcessName,
  processType
) => {
  return await axios.get(
    SERVER_URL +
      ENDPOINT_OPENPROCESS +
      openProcessID +
      "/" +
      openProcessName +
      "/" +
      processType
  );
};
