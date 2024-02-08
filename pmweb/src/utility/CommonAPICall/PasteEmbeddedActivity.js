import { SERVER_URL, ENDPOINT_ADDACTIVITY } from "../../Constants/appConstants";
import axios from "axios";
import { hideIcons } from "../bpmnView/cellOnMouseClick";
import { removeToolDivCell } from "../bpmnView/getToolDivCell";

export const PasteEmbeddedActivity = (
  processDefId,
  processName,
  activity,
  milestone,
  setProcessData,
  newXLeftLoc,
  embeddedActivitiesArr,
  oldActName,
  oldActId,
  mileStoneWidthIncreased,
  laneHeightIncreased
) => {
  let ActivityAddPostBody = {
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
    queueInfo: activity.queueInfo,
    queueExist: activity.queueInfo.queueExist,
    xLeftLoc: activity.xLeftLoc,
    yTopLoc: activity.yTopLoc,
    milestoneId: milestone.mileId,
    oldActName: oldActName,
    oldActId: oldActId,
    arrpMActType: embeddedActivitiesArr,
  };
  if (mileStoneWidthIncreased) {
    ActivityAddPostBody = {
      ...ActivityAddPostBody,
      ...mileStoneWidthIncreased,
    };
  }
  if (laneHeightIncreased) {
    ActivityAddPostBody = { ...ActivityAddPostBody, ...laneHeightIncreased };
  }
  axios
    .post(SERVER_URL + ENDPOINT_ADDACTIVITY, ActivityAddPostBody)
    .then((response) => {
      if (response.data.Status === 0) {
        if (activity.view !== "BPMN") {
          let embeddedObj = embeddedActivitiesArr?.map((embAct) => {
            return {
              ActivityId: embAct.actId,
              ActivityName: embAct.actName,
              ActivityType: embAct.actType,
              ActivitySubType: embAct.actSubType,
              LaneId: embAct.laneId,
              xLeftLoc: embAct.xLeftLoc,
              yTopLoc: embAct.yTopLoc,
              isActive: "true",
              BlockId: 0,
              CheckedOut: "",
              Color: "1234",
              FromRegistered: "N",
              QueueCategory: "",
              QueueId: embAct.queueId,
              SequenceId: embAct.seqId,
              id: "",
              AssociatedTasks: [],
            };
          });
          setProcessData((prevProcessData) => {
            let processObject = JSON.parse(JSON.stringify(prevProcessData));
            if (mileStoneWidthIncreased) {
              processObject.MileStones[milestone.mileIndex].Width =
                mileStoneWidthIncreased.arrMilestoneInfos[
                  milestone.mileIndex
                ].width;
            }
            processObject.MileStones[milestone.mileIndex].Activities.push({
              ActivityId: activity.id,
              ActivityName: activity.name,
              ActivityType: activity.actType,
              ActivitySubType: activity.actSubType,
              LaneId: activity.laneId,
              xLeftLoc: newXLeftLoc,
              yTopLoc: activity.yTopLoc,
              isActive: "true",
              BlockId: 0,
              CheckedOut: "",
              Color: "1234",
              FromRegistered: "N",
              EmbeddedActivity: [embeddedObj],
              QueueCategory: "",
              QueueId: activity.queueInfo.queueId,
              SequenceId: activity.seqId,
              id: "",
              AssociatedTasks: [],
            });
            return processObject;
          });
        }
      } else {
        if (activity.view === "BPMN") {
          setProcessData((prevData) => {
            let processObject = JSON.parse(JSON.stringify(prevData));
            let newArr = processObject.MileStones[
              milestone.mileIndex
            ].Activities?.map((act, index) => {
              if (
                index !==
                processObject.MileStones[milestone.mileIndex].Activities.length
              ) {
                return act;
              }
            });
            processObject.MileStones[milestone.mileIndex].Activities = [
              ...newArr,
            ];
            return processObject;
          });
          hideIcons();
          removeToolDivCell();
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
