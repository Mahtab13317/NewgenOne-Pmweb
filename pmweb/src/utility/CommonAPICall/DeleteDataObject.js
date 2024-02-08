import {
  SERVER_URL,
  ENDPOINT_DELETE_DATAOBJECT,
} from "../../Constants/appConstants";
import axios from "axios";

export const DeleteDataObject = (
  processDefId,
  processState,
  dataObjName,
  dataObjId,
  xLeftLoc,
  yTopLoc,
  laneId,
  setProcessData
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

  axios
    .post(SERVER_URL + ENDPOINT_DELETE_DATAOBJECT, dataObjectJson)
    .then((response) => {
      if (response.data.Status === 0) {
        setProcessData((prevData) => {
          let processObject = JSON.parse(JSON.stringify(prevData));
          processObject.DataObjects = JSON.parse(
            JSON.stringify(prevData.DataObjects)
          );
          processObject.DataObjects.forEach((dataObj, index) => {
            if (dataObj.DataObjectId === dataObjId) {
              processObject.DataObjects.splice(index, 1);
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
