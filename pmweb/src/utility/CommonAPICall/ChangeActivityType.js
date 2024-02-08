import {
  SERVER_URL,
  ENDPOINT_CHANGEACTIVITY,
} from "../../Constants/appConstants";
import axios from "axios";
import { checkIfParentSwimlaneCheckedOut } from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";

export const ChangeActivityType = (
  processDefId,
  actName,
  actType,
  actSubType,
  setProcessData,
  mileIndex,
  activityIndex,
  actId,
  queueId
) => {
  let temp, laneId;
  setProcessData((prev) => {
    temp = prev;
    laneId = temp.MileStones[mileIndex].Activities[activityIndex].LaneId;
    return prev;
  });
  /* code added on 4 August 2023 for BugId 130480 - Jboss EAP+Oracle: If click on convert to Case 
  Workstep option for checked out process, getting error connect failed */
  if (checkIfParentSwimlaneCheckedOut(temp, laneId)?.length > 0) {
    setProcessData((prev) => {
      let newObj = JSON.parse(JSON.stringify(prev));
      newObj.SwimlaneCheckinChanges = true;
      newObj.MileStones[mileIndex].Activities[activityIndex].ActivityType =
        actType;
      newObj.MileStones[mileIndex].Activities[activityIndex].ActivitySubType =
        actSubType;
      newObj.MileStones[mileIndex].Activities[activityIndex].QueueId = queueId;
      return newObj;
    });
  } else {
    var changeActPostBody = {
      processDefId: +processDefId,
      actName: actName,
      actType: actType,
      actSubType: actSubType,
      actId: actId,
    };

    axios
      .post(SERVER_URL + ENDPOINT_CHANGEACTIVITY, changeActPostBody)
      .then((response) => {
        // code edited on 1 Feb 2023 for BugId 122462
        if (response.status === 200) {
          setProcessData((prev) => {
            let newObj = JSON.parse(JSON.stringify(prev));
            newObj.MileStones[mileIndex].Activities[
              activityIndex
            ].ActivityType = actType;
            newObj.MileStones[mileIndex].Activities[
              activityIndex
            ].ActivitySubType = actSubType;
            // added on 25/09/2023 for BugId 137236 - Convert to Case Workdesk>>screen is crashing
            // when added any task
            newObj.MileStones[mileIndex].Activities[
              activityIndex
            ].AssociatedTasks = [];
            // till here BugId 137236
            if (response.data?.queueId !== null) {
              newObj.MileStones[mileIndex].Activities[activityIndex].QueueId =
                response.data.queueId;
              newObj.Queue?.splice(0, 0, {
                QueueFilter: "",
                OrderBy: response.data?.orderBy,
                AllowReassignment: response.data?.allowReassignment,
                UG: [],
                FilterOption: "0",
                RefreshInterval: response.data?.refreshInterval,
                QueueId: response.data?.queueId,
                SortOrder: response.data?.sortOrder,
                QueueName: response.data?.queueName,
                QueueDescription: response.data?.queueDesc,
                QueueType: response.data?.queueType,
                FilterValue: "",
              });
            }
            return newObj;
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
