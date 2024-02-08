import { SERVER_URL, ENDPOINT_RENAMETASK } from "../../Constants/appConstants";
import axios from "axios";

export const renameTask = (taskId, oldTaskName, newTaskName, processDefId) => {
  let obj = {
    processDefId: processDefId,
    taskId: taskId,
    taskName: newTaskName,
    oldTaskName: oldTaskName,
  };
  axios
    .post(SERVER_URL + ENDPOINT_RENAMETASK, obj)
    .then((response) => {
      if (response.data.Status == 0) {
        return 0;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
