import { SERVER_URL, ENDPOINT_MOVETASK } from "../../Constants/appConstants";
import axios from "axios";

export const MoveTask = (
  processDefId,
  taskId,
  taskName,
  xLeftLoc,
  yTopLoc,
  milestoneWidthIncreased
) => {
  let json = {
    taskId: taskId,
    taskName: taskName,
    xLeftLoc: xLeftLoc + "",
    yTopLoc: yTopLoc + "",
    processDefId: +processDefId,
  };
  if (milestoneWidthIncreased) {
    json = { ...json, ...milestoneWidthIncreased };
  }
  axios
    .post(SERVER_URL + ENDPOINT_MOVETASK, json)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
