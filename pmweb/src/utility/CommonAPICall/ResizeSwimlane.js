import { SERVER_URL, ENDPOINT_RESIZELANE } from "../../Constants/appConstants";
import axios from "axios";

export const ResizeSwimlane = (
  processDefId,
  swimlaneArray,
  setProcessData,
  laneId,
  oldLaneHeight
) => {
  var obj = {
    processDefId: processDefId,
    swimlanes: swimlaneArray,
  };

  axios
    .post(SERVER_URL + ENDPOINT_RESIZELANE, obj)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      } else {
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          newProcessData.Lanes.forEach((lane) => {
            if (lane.LaneId === laneId) {
              lane.Height = oldLaneHeight + "";
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
