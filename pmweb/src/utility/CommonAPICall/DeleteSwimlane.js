import {
  SERVER_URL,
  ENDPOINT_REMOVELANE,
  ENDPOINT_PROCESS_ASSOCIATION,
} from "../../Constants/appConstants";
import axios from "axios";
import {
  setActivityDependencies,
  setShowDependencyModal,
} from "../../redux-store/actions/Properties/activityAction";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";

export const deleteSwimlane = (
  swimlaneId,
  selectedlane,
  setProcessData,
  processDefId,
  processName,
  processType,
  activityNameList,
  activityIdList,
  dispatch,
  t
) => {
  if (activityNameList.length > 0 && activityIdList.length > 0) {
    // code edited on 24 Jan 2023 for BugId 122659
    let payload = {
      processId: processDefId,
      processType: processType,
      objectName: activityNameList,
      objectId: activityIdList,
      wsType: "AC",
      deviceType: "D",
    };
    axios
      .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
      .then((res) => {
        if (res.data.Status === 0) {
          if (res.data.Validations?.length > 0) {
            dispatch(setShowDependencyModal(true));
            dispatch(setActivityDependencies(res.data.Validations));
          } else {
            deleteSwimlaneFunc(
              swimlaneId,
              selectedlane,
              setProcessData,
              processDefId,
              processName,
              dispatch,
              t
            );
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    deleteSwimlaneFunc(
      swimlaneId,
      selectedlane,
      setProcessData,
      processDefId,
      processName,
      dispatch,
      t
    );
  }
};

export const deleteSwimlaneFunc = (
  swimlaneId,
  selectedlane,
  setProcessData,
  processDefId,
  processName,
  dispatch,
  t
) => {
  var obj = {
    laneId: selectedlane.LaneId,
    laneName: selectedlane.LaneName,
    queueInfo: {
      queueId: selectedlane.QueueId,
      queueName: `${processName}_${selectedlane.LaneName}`,
    },
    laneSeqId: selectedlane.LaneSeqId, // code added on 14 Oct 2022 for BugId 116887
    height: +selectedlane.Height, // code added on 14 Oct 2022 for BugId 116887
    processDefId: processDefId,
    processName: processName,
  };
  axios
    .post(SERVER_URL + ENDPOINT_REMOVELANE, obj)
    .then((response) => {
      if (response.data.Status === 0) {
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          let laneList = [];
          // code edited on 18 Oct 2022 for BugId 117239
          newProcessData.Lanes.forEach((swimlane, index) => {
            if (swimlane.LaneId === swimlaneId) {
              newProcessData.Lanes.splice(index, 1);
            }
          });
          // code edited on 18 Oct 2022 for BugId 117239
          newProcessData.MileStones.forEach((milestone, idx) => {
            let actArr = [];
            milestone.Activities.forEach((activity, activityIndex) => {
              if (activity.LaneId !== Number(swimlaneId)) {
                //adds activity from Activities array
                actArr.push(activity);
              }
              // code edited on 6 Dec 2022 for BugId 120203
              if (activity.LaneId === Number(swimlaneId)) {
                newProcessData.Connections.forEach(
                  (connection, connectionIndex) => {
                    //delete all connecting edges to this activity
                    if (connection.SourceId === activity.ActivityId) {
                      newProcessData.Connections.splice(connectionIndex, 1);
                    }
                  }
                );
              }
            });
            newProcessData.MileStones[idx].Activities = [...actArr];
          });
          // code added on 14 Oct 2022 for BugId 116887
          newProcessData.Lanes.forEach((swimlane) => {
            if (swimlane.LaneSeqId > selectedlane.LaneSeqId) {
              laneList.push(swimlane.LaneId);
            }
          });
          newProcessData.MileStones.forEach((milestone, mileIndex) => {
            milestone.Activities.forEach((activity, activityIndex) => {
              if (laneList.includes(activity.LaneId)) {
                newProcessData.MileStones[mileIndex].Activities[
                  activityIndex
                ].yTopLoc = +activity.yTopLoc - +selectedlane.Height;
              }
            });
          });
          dispatch(
            setToastDataFunc({
              message: t("SwimlaneDeletedSuccessfully"),
              severity: "success",
              open: true,
            })
          );
          return newProcessData;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
