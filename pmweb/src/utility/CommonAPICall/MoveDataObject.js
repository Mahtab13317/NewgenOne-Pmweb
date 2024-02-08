import {
  SERVER_URL,
  ENDPOINT_MOVE_DATAOBJECT,
} from "../../Constants/appConstants";
import axios from "axios";

export const MoveDataObject = (
  processDefId,
  processState,
  dataObjName,
  dataObjId,
  xLeftLoc,
  yTopLoc,
  laneId,
  setProcessData,
  oldXLeftLoc,
  oldYTopLoc,
  oldLaneId,
  mileStoneWidthIncreased,
  laneHeightIncreased,
  isEmbeddedArtifact = null
) => {
  let dataObjectJson = {
    processDefId: processDefId,
    processState: processState,
    dataObjName: dataObjName,
    dataObjId: dataObjId,
    xLeftLoc: xLeftLoc,
    yTopLoc: yTopLoc,
    laneId: laneId,
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
    .post(SERVER_URL + ENDPOINT_MOVE_DATAOBJECT, dataObjectJson)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      }
    })
    .catch((err) => {
      console.log(err);
      setProcessData((prevData) => {
        let processObject = JSON.parse(JSON.stringify(prevData));
        processObject.DataObjects = JSON.parse(
          JSON.stringify(prevData.DataObjects)
        );
        processObject.DataObjects.forEach((dataObj, index) => {
          if (dataObj.DataObjectId === dataObjId) {
            processObject.DataObjects[index].xLeftLoc = oldXLeftLoc;
            processObject.DataObjects[index].yTopLoc = oldYTopLoc;
            processObject.DataObjects[index].LaneId = oldLaneId;
          }
        });
        return processObject;
      });
    });
};
