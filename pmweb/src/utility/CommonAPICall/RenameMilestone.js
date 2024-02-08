import { SERVER_URL, ENDPOINT_RENAMEMILE } from "../../Constants/appConstants";
import axios from "axios";

export const renameMilestone = (
  milestoneId,
  oldMilestoneName,
  newMilestoneName,
  setProcessData,
  processDefId,
  isBpmn
) => {
  let obj = {
    milestoneName: newMilestoneName,
    milestoneId: milestoneId,
    oldName: oldMilestoneName,
    processDefId: processDefId,
  };
  axios
    .post(SERVER_URL + ENDPOINT_RENAMEMILE, obj)
    .then((response) => {
      if (response.data.Status == 0) {
        if (!isBpmn) {
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.MileStones.forEach((milestone) => {
              if (milestone.iMileStoneId === milestoneId) {
                //rename milestone name
                milestone.MileStoneName = newMilestoneName;
              }
            });
            return newProcessData;
          });
        }
      } else {
        if (isBpmn) {
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.MileStones.forEach((milestone) => {
              if (milestone.iMileStoneId === milestoneId) {
                //revert milestone name
                milestone.MileStoneName = oldMilestoneName;
              }
            });
            return newProcessData;
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
