import {
  SERVER_URL,
  ENDPOINT_ASSOCIATETASK,
} from "../../Constants/appConstants";
import axios from "axios";

export const associateTask = (
  taskId,
  taskName,
  setProcessData,
  processDefId,
  milestoneIndex,
  activityindex,
  activityName,
  activityId
) => {
  var obj = {
    taskId: taskId,
    taskName: taskName,
    associatedActivityName: activityName,
    associatedActivityId: activityId,
    processDefId: processDefId,
  };
  axios
    .post(SERVER_URL + ENDPOINT_ASSOCIATETASK, obj)
    .then((response) => {
      if (response.data.Status == 0) {
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          newProcessData.MileStones[milestoneIndex].Activities[
            activityindex
          ].AssociatedTasks.push(taskId);
          return newProcessData;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
