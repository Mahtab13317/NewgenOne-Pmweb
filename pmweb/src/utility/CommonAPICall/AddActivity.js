import { SERVER_URL, ENDPOINT_ADDACTIVITY } from "../../Constants/appConstants";
import axios from "axios";
import { hideIcons } from "../bpmnView/cellOnMouseClick";
import { removeToolDivCell } from "../bpmnView/getToolDivCell";

export const AddActivity = (
  processDefId,
  processName,
  activity,
  milestone,
  setProcessData,
  newXLeftLoc,
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
    queueInfo:
      !activity.queueInfo.queueId && activity.queueInfo.queueExist
        ? null
        : activity.queueInfo,
    queueExist: activity.queueInfo.queueExist,
    xLeftLoc: activity.xLeftLoc,
    yTopLoc: activity.yTopLoc,
    milestoneId: milestone.mileId,
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

  const addActivityHandler = () => {
    setProcessData((prevData) => {
      let processObject = JSON.parse(JSON.stringify(prevData));
      if (mileStoneWidthIncreased) {
        processObject.MileStones[milestone.mileIndex].Width =
          mileStoneWidthIncreased.arrMilestoneInfos[milestone.mileIndex].width;
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
        QueueId: checkIfActivityWiseQueue(
          activity.laneId,
          processObject,
          activity.actType,
          activity.actSubType
        )
          ? Math.min(...processObject.Queue.map((el) => +el.QueueId)) - 1
          : activity.queueInfo.queueId,
        SequenceId: activity.seqId,
        id: "",
        AssociatedTasks: [],
        "Target WorkStep": [],
      });

      if (
        checkIfActivityWiseQueue(
          activity.laneId,
          processObject,
          activity.actType,
          activity.actSubType
        )
      ) {
        processObject.Queue.splice(0, 0, {
          QueueFilter: "",
          OrderBy: "2",
          AllowReassignment: "N",
          UG: [],
          FilterOption: "0",
          RefreshInterval: "0",
          QueueId:
            Math.min(...processObject.Queue.map((el) => +el.QueueId)) - 1 + "",
          SortOrder: "",
          QueueName: `${processObject.ProcessName}_${activity.name}`,
          QueueDescription: "Process Modeler generated Default Queue",
          QueueType: "F",
          FilterValue: "",
        });
      }
      // code added on 22 July 2022 for BugId 113305
      else if (!activity.queueInfo.queueExist) {
        processObject.Queue?.splice(0, 0, {
          QueueFilter: "",
          OrderBy: activity.queueInfo?.orderBy,
          AllowReassignment: activity.queueInfo?.allowReassignment,
          UG: [],
          FilterOption: "0",
          RefreshInterval: activity.queueInfo?.refreshInterval,
          QueueId: activity.queueInfo?.queueId,
          SortOrder: activity.queueInfo?.sortOrder,
          QueueName: activity.queueInfo?.queueName,
          QueueDescription: activity.queueInfo?.queueDesc,
          QueueType: activity.queueInfo?.queueType,
          FilterValue: "",
        });
      }
      return processObject;
    });
  };

  const checkIfActCanHaveOwnQueue = (actType, actSubType) => {
    return (
      (+actType === 26 && +actSubType === 1) ||
      (+actType === 10 && +actSubType === 7) ||
      (+actType === 10 && +actSubType === 3)
    );
  };

  const checkIfActivityWiseQueue = (laneid, processObject, type, subType) => {
    let temp = global.structuredClone(processObject);
    let flag = false;
    temp.Lanes?.forEach((el) => {
      if (
        el.LaneId == laneid &&
        el.DefaultQueue === "Y" &&
        checkIfActCanHaveOwnQueue(type, subType)
      ) {
        flag = true;
      }
    });
    return flag;
  };

  axios
    .post(SERVER_URL + ENDPOINT_ADDACTIVITY, ActivityAddPostBody)
    .then((response) => {
      if (response.data.Status === 0) {
        if (activity.view !== "BPMN") {
          addActivityHandler();
        }
      }
    })
    .catch((err) => {
      console.log(err);
      if (activity.view === "BPMN") {
        setProcessData((prevData) => {
          let processObject = JSON.parse(JSON.stringify(prevData));
          let newArr = processObject.MileStones[
            milestone.mileIndex
          ].Activities?.filter((act) => {
            if (+act.ActivityId !== +activity.id) {
              return act;
            }
          });
          processObject.MileStones[milestone.mileIndex].Activities = [
            ...newArr,
          ];
          // code added on 22 July 2022 for BugId 113305
          if (!activity.queueInfo.queueExist) {
            processObject.Queue?.splice(0, 1);
          }
          if (+activity.actType === 35 && +activity.actSubType === 1) {
            processObject.Queue?.splice(0, 1);
          }
          return processObject;
        });
        hideIcons();
        removeToolDivCell();
      }
    });
};
