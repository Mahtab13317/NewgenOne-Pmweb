import { SERVER_URL, ENDPOINT_ADDMILE } from "../../Constants/appConstants";
import axios from "axios";
import {
  defaultWidthMilestone,
  milestoneName as milestoneNameConst,
} from "../../Constants/bpmnView";
import { checkDuplicateNameFunc } from "../CommonFunctionCall/CommonFunctionCall";

export const addMilestone = (
  translation,
  setNewId,
  processDefId,
  setProcessData
) => {
  let prefix = translation(milestoneNameConst);
  let milestoneId = 0;
  let milestoneName, mileArr;
  let sequenceId = 0;

  setProcessData((prevProcessData) => {
    mileArr = JSON.parse(JSON.stringify(prevProcessData?.MileStones));
    //get max milestoneId
    prevProcessData?.MileStones?.forEach((milestone) => {
      if (+milestoneId < +milestone.iMileStoneId) {
        milestoneId = +milestone.iMileStoneId;
      }
      //get max SequenceId
      if (+sequenceId < +milestone.SequenceId) {
        sequenceId = +milestone.SequenceId;
      }
    });
    return prevProcessData;
  });
  // code edited on 31 Jan 2023 for BugId 122662
  milestoneName = checkDuplicateNameFunc(
    mileArr,
    "MileStoneName",
    prefix,
    milestoneId + 1
  );
  var addMilestoneInput = {
    processDefId: processDefId,
    milestones: [
      {
        milestoneName: milestoneName,
        milestoneId: milestoneId + 1,
        seqId: sequenceId + 1,
        width: defaultWidthMilestone,
        action: "A",
        activities: [],
      },
    ],
  };

  axios
    .post(SERVER_URL + ENDPOINT_ADDMILE, addMilestoneInput)
    .then((response) => {
      if (response.data.Status == 0) {
        let newMilestone = {
          MileStoneName: milestoneName,
          iMileStoneId: milestoneId + 1,
          Activities: [],
          BackColor: "1234",
          FromRegistered: "N",
          Height: "",
          SequenceId: sequenceId + 1,
          Width: defaultWidthMilestone,
          id: "",
          isActive: "true",
          xLeftLoc: "",
          yTopLoc: "",
        };
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          newProcessData.MileStones = [
            ...newProcessData.MileStones,
            newMilestone,
          ];
          return newProcessData;
        });
      }
    })
    .catch(() => {
      setNewId((oldIds) => {
        let newIds = { ...oldIds };
        newIds.milestoneId = newIds.milestoneId - 1;
        return newIds;
      });
    });
};

export const addMilestoneInBetween = (
  setNewId,
  processDefId,
  setProcessData,
  newMile,
  milestonesArray
) => {
  var addMilestoneInput = {
    processDefId: processDefId,
    milestones: milestonesArray,
  };

  axios
    .post(SERVER_URL + ENDPOINT_ADDMILE, addMilestoneInput)
    .then((response) => {
      if (response.data.Status == 0) {
        let newMilestone = {
          MileStoneName: newMile.milestoneName,
          iMileStoneId: newMile.milestoneId,
          Activities: [],
          BackColor: "1234",
          FromRegistered: "N",
          Height: "",
          SequenceId: newMile.seqId,
          Width: newMile.width,
          id: "",
          isActive: "true",
          xLeftLoc: "",
          yTopLoc: "",
        };
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          let newArr = [...newProcessData.MileStones];
          newArr.splice(newMile.seqId - 1, 0, newMilestone);
          newProcessData.MileStones = [...newArr];
          return newProcessData;
        });
      }
    })
    .catch(() => {
      setNewId((oldId) => {
        let newIds = { ...oldId };
        newIds.milestoneId = newIds.milestoneId - 1;
        return newIds;
      });
    });
};
