import {
    SERVER_URL,
    ENDPOINT_MODIFY_DATAOBJECT,
  } from "../../Constants/appConstants";
  import axios from "axios";
  
  export const ModifyDataObject = (
    processDefId,
    processState,
    dataObjName,
    dataObjId,
    xLeftLoc,
    yTopLoc,
    laneId,
    setProcessData,
    oldDataObjName
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
      .post(SERVER_URL + ENDPOINT_MODIFY_DATAOBJECT, dataObjectJson)
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
              processObject.DataObjects[index].Data = oldDataObjName;
            }
          });
          return processObject;
        });
      });
  };
  