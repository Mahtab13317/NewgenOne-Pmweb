import {
  SERVER_URL,
  ENDPOINT_DELETE_GROUPBOX,
} from "../../Constants/appConstants";
import axios from "axios";

export const DeleteGroupBox = (
  processDefId,
  processState,
  gbName,
  gbId,
  xLeftLoc,
  yTopLoc,
  laneId,
  setProcessData,
  width,
  height
) => {
  let gbJson = {
    processDefId: processDefId,
    processState: processState,
    gbName: gbName,
    gbId: gbId,
    xLeftLoc: xLeftLoc,
    yTopLoc: yTopLoc,
    laneId: laneId,
    height: height,
    width: width,
  };

  axios
    .post(SERVER_URL + ENDPOINT_DELETE_GROUPBOX, gbJson)
    .then((response) => {
      if (response.data.Status === 0) {
        setProcessData((prevData) => {
          let processObject = JSON.parse(JSON.stringify(prevData));
          processObject.GroupBoxes = JSON.parse(
            JSON.stringify(prevData.GroupBoxes)
          );
          processObject.GroupBoxes.forEach((gb, index) => {
            if (gb.GroupBoxId === gbId) {
              processObject.GroupBoxes.splice(index, 1);
            }
          });
          return processObject;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
