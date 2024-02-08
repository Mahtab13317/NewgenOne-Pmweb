import {
  SERVER_URL,
  ENDPOINT_PASTEACTIVITY,
} from "../../Constants/appConstants";
import axios from "axios";
import { hideIcons } from "../bpmnView/cellOnMouseClick";
import { removeToolDivCell } from "../bpmnView/getToolDivCell";

export const PasteActivity = (
  processDefId,
  processName,
  activity,
  milestone,
  setProcessData,
  newXLeftLoc,
  oldActName,
  oldActId,
  mileStoneWidthIncreased,
  laneHeightIncreased,
  isEmbedded = null,
  isEmbeddedWidth,
  isEmbeddedHeight
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
    queueInfo:
      !activity.queueInfo.queueId && activity.queueInfo.queueExist
        ? null
        : activity.queueInfo,
    queueExist: activity.queueInfo.queueExist,
    xLeftLoc: activity.xLeftLoc,
    yTopLoc: activity.yTopLoc,
    milestoneId: milestone.mileId,
    oldActName: oldActName,
    oldActId: oldActId,
  };

  if (isEmbedded !== null) {
    ActivityAddPostBody = {
      ...ActivityAddPostBody,
      parentActivityId: isEmbedded,
      height: isEmbeddedHeight,
      width: isEmbeddedWidth,
    };
  }
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
    .post(SERVER_URL + ENDPOINT_PASTEACTIVITY, ActivityAddPostBody)
    .then((response) => {
      if (response.data.Status === 0) {
        if (activity.view !== "BPMN") {
          setProcessData((prevData) => {
            let processObject = JSON.parse(JSON.stringify(prevData));
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
              QueueCategory: "",
              QueueId: activity.queueInfo.queueId,
              SequenceId: activity.seqId,
              id: "",
              AssociatedTasks: [],
              "Target WorkStep": [],
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
