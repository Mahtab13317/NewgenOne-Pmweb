import { SERVER_URL, ENDPOINT_RESIZEMILE } from "../../Constants/appConstants";
import axios from "axios";

export const ResizeMilestone = (
  processDefId,
  milestonesArray,
  setProcessData,
  mileId,
  oldMileWidth
) => {
  var obj = {
    processDefId: processDefId,
    milestones: milestonesArray,
  };

  axios
    .post(SERVER_URL + ENDPOINT_RESIZEMILE, obj)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      } else {
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          newProcessData.MileStones.forEach((milestone) => {
            if (milestone.iMileStoneId === mileId) {
              milestone.Width = oldMileWidth + "";
            }
          });
          return newProcessData;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
