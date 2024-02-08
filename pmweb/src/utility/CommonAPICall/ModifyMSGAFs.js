import {
  SERVER_URL,
  ENDPOINT_MODIFY_MSGAF,
} from "../../Constants/appConstants";
import axios from "axios";

export const ModifyMsgAF = (
  processDefId,
  processState,
  msgAFName,
  msgAFId,
  xLeftLoc,
  yTopLoc,
  laneId,
  setProcessData,
  oldMsgAFName
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
    .post(SERVER_URL + ENDPOINT_MODIFY_MSGAF, msgAF_Json)
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
            processObject.MSGAFS[index].MsgAFName = oldMsgAFName;
          }
        });
        return processObject;
      });
    });
};
