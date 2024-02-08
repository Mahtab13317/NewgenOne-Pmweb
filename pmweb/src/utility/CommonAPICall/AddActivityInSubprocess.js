import { SERVER_URL, ENDPOINT_ADDACTIVITY } from "../../Constants/appConstants";
import axios from "axios";

export const AddActivityInSubprocess = (
  processDefId,
  processName,
  activity,
  milestone,
  parentActivityId
) => {
  const ActivityAddPostBody = {
    processDefId: processDefId,
    processName: processName,
    actName: activity.name,
    actId: activity.id,
    actType: activity.actType,
    actSubType: activity.actSubType,
    actAssocId: activity.actAssocId,
    seqId: activity.seqId,
    laneId: activity.laneId,
    blockId: activity.blockId,
    queueId: activity.queueInfo.queueId,
    queueInfo:
      !activity.queueInfo.queueId && activity.queueInfo.queueExist
        ? null
        : activity.queueInfo,
    queueExist: activity.queueInfo.queueExist,
    xLeftLoc: activity.xLeftLoc,
    yTopLoc: activity.yTopLoc,
    milestoneId: milestone.mileId,
    parentActivityId: parentActivityId,
    embeddedActivityType: "I", // code added on 1 March 2023 for BugId 124474
    height: activity.height,
    width: activity.width,
  };

  axios
    .post(SERVER_URL + ENDPOINT_ADDACTIVITY, ActivityAddPostBody)
    .then((response) => {
      if (response.data.Status === 0) {
        if (activity.view !== "BPMN") {
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
