import { SERVER_URL, ENDPOINT_RENAMELANE } from "../../Constants/appConstants";
import axios from "axios";

export const renameSwimlane = (
  laneId,
  oldLaneName,
  newLaneName,
  queueId,
  setProcessData,
  processDefId,
  processName,
  t,
  isBpmn
) => {
  let obj = {
    laneId: laneId,
    laneName: newLaneName,
    oldLaneName: oldLaneName,
    queueId: queueId,
    queueInfo: {
      queueId: queueId,
      queueName: `${processName}_${newLaneName}`,
      comments: `${t("SwimlaneQueueComment")}`,
      sortOrder: "A",
      orderBy: 2,
      refreshInterval: 0,
      allowReassignment: "N",
      queueType: "N",
    },
    processDefId: processDefId,
    processName: processName,
  };
  axios
    .post(SERVER_URL + ENDPOINT_RENAMELANE, obj)
    .then((response) => {
      if (response.data.Status == 0) {
        if (!isBpmn) {
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.Lanes.forEach((swimlane) => {
              if (swimlane.LaneId === laneId) {
                //rename swimlane name
                swimlane.LaneName = newLaneName;
              }
            });
            return newProcessData;
          });
        }
      } else {
        if (isBpmn) {
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.Lanes.forEach((swimlane) => {
              if (swimlane.LaneId === laneId) {
                //revert old swimlane name
                swimlane.LaneName = oldLaneName;
              }
            });
            return newProcessData;
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
