import {
  SERVER_URL,
  ENDPOINT_ADD_GROUPBOX,
} from "../../Constants/appConstants";
import axios from "axios";

export const AddGroupBox = (
  processDefId,
  processState,
  gbName,
  gbId,
  xLeftLoc,
  yTopLoc,
  laneId,
  setProcessData,
  width,
  height,
  mileStoneWidthIncreased,
  laneHeightIncreased,
  actArr,
  isEmbeddedArtifact = null
) => {
  let dataObjectJson = {
    processDefId: processDefId,
    processState: processState,
    gbName: gbName,
    gbId: gbId,
    xLeftLoc: xLeftLoc,
    yTopLoc: yTopLoc,
    laneId: laneId,
    height: height,
    width: width,
    pMActInfo: actArr,
  };

  if (isEmbeddedArtifact !== null) {
    dataObjectJson = {
      ...dataObjectJson,
      parentActivityId: isEmbeddedArtifact,
    };
  }

  if (mileStoneWidthIncreased) {
    dataObjectJson = {
      ...dataObjectJson,
      ...mileStoneWidthIncreased,
    };
  }
  if (laneHeightIncreased) {
    dataObjectJson = { ...dataObjectJson, ...laneHeightIncreased };
  }

  axios
    .post(SERVER_URL + ENDPOINT_ADD_GROUPBOX, dataObjectJson)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      }
    })
    .catch((err) => {
      console.log(err);
      setProcessData((prevData) => {
        let processObject = JSON.parse(JSON.stringify(prevData));
        processObject.GroupBoxes = JSON.parse(
          JSON.stringify(prevData.GroupBoxes)
        );
        processObject.GroupBoxes.pop();
        return processObject;
      });
    });
};
