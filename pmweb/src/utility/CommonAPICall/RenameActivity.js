import {
  SERVER_URL,
  ENDPOINT_RENAMEACTIVITY,
} from "../../Constants/appConstants";
import axios from "axios";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import {
  setActivityDependencies,
  setDependencyErrorMsg,
  setQueueRenameModalOpen,
  setRenameActivityData,
  setShowDependencyModal,
  setWorkitemFlag,
} from "./../../redux-store/actions/Properties/activityAction";
import { checkIfSwimlaneCheckedOut } from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";

export const renameActivity = (
  actId,
  oldActName,
  newActivityName,
  setProcessData,
  processDefId,
  processName,
  queueId,
  queueInfo,
  isBpmn,
  queueRename,
  dispatch,
  t
) => {
  let obj = {
    actName: newActivityName,
    actId: actId,
    oldName: oldActName,
    processDefId: processDefId,
    processName: processName,
    queueId: queueId,
    // code added on 22 July 2022 for BugId 113305
    queueInfo: queueInfo,
    queueExist: queueInfo.queueExist,
    queueRename,
  };
  let temp;
  setProcessData((prev) => {
    temp = prev;
    return prev;
  });
  if (checkIfSwimlaneCheckedOut(temp)?.length > 0) {
    setProcessData((prevProcessData) => {
      let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
      newProcessData.SwimlaneCheckinChanges = true;
      newProcessData.MileStones?.forEach((milestone) => {
        milestone.Activities &&
          milestone.Activities.map((activity) => {
            if (activity.ActivityId === actId) {
              //rename activity name
              activity.ActivityName = newActivityName;
            }
            activity.EmbeddedActivity &&
              activity.EmbeddedActivity[0]?.map((embAct) => {
                if (embAct.ActivityId === actId) {
                  //rename activity name
                  embAct.ActivityName = newActivityName;
                }
              });
          });
      });
      if (!queueInfo.queueExist) {
        newProcessData.Queue?.forEach((el, index) => {
          if (+queueId === +el.QueueId) {
            newProcessData.Queue[index].QueueName = queueInfo?.queueName;
            newProcessData.Queue[index].QueueDescription = queueInfo?.queueDesc;
          }
        });
      }
      return newProcessData;
    });
  } else {
    axios
      .post(SERVER_URL + ENDPOINT_RENAMEACTIVITY, obj)
      .then((response) => {
        if (+response.data.Status === 0) {
          dispatch(setQueueRenameModalOpen(false));
          dispatch(setRenameActivityData(null));
          dispatch &&
            dispatch(
              setToastDataFunc({
                message: response.data.Message || t("RenamedSuccessfully"),
                severity: "success",
                open: true,
              })
            );
          if (!isBpmn) {
            //value already set in bpmn view
            setProcessData((prevProcessData) => {
              let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
              newProcessData.MileStones?.forEach((milestone) => {
                milestone.Activities &&
                  milestone.Activities.map((activity) => {
                    if (activity.ActivityId === actId) {
                      //rename activity name
                      activity.ActivityName = newActivityName;
                    }
                    activity.EmbeddedActivity &&
                      activity.EmbeddedActivity[0]?.map((embAct) => {
                        if (embAct.ActivityId === actId) {
                          //rename activity name
                          embAct.ActivityName = newActivityName;
                        }
                      });
                  });
              });
              // code added on 22 July 2022 for BugId 113305
              if (!queueInfo.queueExist) {
                newProcessData.Queue?.forEach((el, index) => {
                  if (+queueId === +el.QueueId) {
                    newProcessData.Queue[index].QueueName =
                      queueInfo?.queueName;
                    newProcessData.Queue[index].QueueDescription =
                      queueInfo?.queueDesc;
                  }
                });
              }
              return newProcessData;
            });
          }
        }
      })
      .catch((err) => {
        if (dispatch) {
          dispatch(
            setToastDataFunc({
              message: err?.response?.data?.Message || t("operationFailed"),
              severity: "error",
              open: true,
            })
          );
          dispatch(setShowDependencyModal(false));
          dispatch(setActivityDependencies([]));
          dispatch(setDependencyErrorMsg(""));
          dispatch(setWorkitemFlag(false));
          dispatch(setQueueRenameModalOpen(false));
          dispatch(setRenameActivityData(null));
        }
        if (isBpmn) {
          // revert to old activity name if api fails
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.MileStones?.forEach((milestone) => {
              milestone.Activities &&
                milestone.Activities.map((activity) => {
                  if (activity.ActivityId === actId) {
                    //rename activity name
                    activity.ActivityName = oldActName;
                  }
                  activity.EmbeddedActivity &&
                    activity.EmbeddedActivity[0]?.forEach((embAct) => {
                      if (embAct.ActivityId === actId) {
                        //rename activity name
                        embAct.ActivityName = oldActName;
                      }
                    });
                });
            });
            // code added on 22 July 2022 for BugId 113305
            if (!queueInfo.queueExist) {
              newProcessData.Queue?.forEach((el, index) => {
                if (+queueId === +el.QueueId) {
                  newProcessData.Queue[index].QueueName =
                    queueInfo?.oldQueueName;
                  newProcessData.Queue[index].QueueDescription =
                    queueInfo?.oldQueueDesc;
                }
              });
            }
            return newProcessData;
          });
        }
      });
  }
};
