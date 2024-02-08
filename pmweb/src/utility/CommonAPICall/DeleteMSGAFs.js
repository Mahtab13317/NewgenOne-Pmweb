import {
  SERVER_URL,
  ENDPOINT_DELETE_MSGAF,
} from "../../Constants/appConstants";
import axios from "axios";

export const DeleteMsgAF = (
  processDefId,
  processState,
  msgAFName,
  msgAFId,
  xLeftLoc,
  yTopLoc,
  laneId,
  setProcessData
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

  axios
    .post(SERVER_URL + ENDPOINT_DELETE_MSGAF, msgAF_Json)
    .then((response) => {
      if (response.data.Status === 0) {
        setProcessData((prevData) => {
          let processObject = JSON.parse(JSON.stringify(prevData));
          processObject.MSGAFS = JSON.parse(JSON.stringify(prevData.MSGAFS));
          processObject.MSGAFS.forEach((msgAF, index) => {
            if (msgAF.MsgAFId === msgAFId) {
              processObject.MSGAFS.splice(index, 1);
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
