import { SERVER_URL, ENDPOINT_MOVE_MSGAF } from "../../Constants/appConstants";
import axios from "axios";

export const MoveMsgAF = (
  processDefId,
  processState,
  msgAFName,
  msgAFId,
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
  let msgAF_Json = {
    processDefId: processDefId,
    processState: processState,
    msgAFName: msgAFName,
    msgAFId: msgAFId,
    xLeftLoc: xLeftLoc,
    yTopLoc: yTopLoc,
    laneId: laneId,
  };

  if (isEmbeddedArtifact !== null) {
    msgAF_Json = {
      ...msgAF_Json,
      parentActivityId: isEmbeddedArtifact,
    };
  }

  if (mileStoneWidthIncreased) {
    msgAF_Json = {
      ...msgAF_Json,
      ...mileStoneWidthIncreased,
    };
  }
  if (laneHeightIncreased) {
    msgAF_Json = { ...msgAF_Json, ...laneHeightIncreased };
  }

  axios
    .post(SERVER_URL + ENDPOINT_MOVE_MSGAF, msgAF_Json)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      }
    })
    .catch((err) => {
      console.log(err);
      setProcessData((prevData) => {
        let processObject = JSON.parse(JSON.stringify(prevData));
        processObject.MSGAFS = JSON.parse(JSON.stringify(prevData.MSGAFS));
        processObject.MSGAFS.forEach((dataObj, index) => {
          if (dataObj.MsgAFId === msgAFId) {
            processObject.MSGAFS[index].xLeftLoc = oldXLeftLoc;
            processObject.MSGAFS[index].yTopLoc = oldYTopLoc;
            processObject.MSGAFS[index].LaneId = oldLaneId;
          }
        });
        return processObject;
      });
    });
};
