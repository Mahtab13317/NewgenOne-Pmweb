import {
  SERVER_URL,
  ENDPOINT_REMOVEACTIVITY,
} from "../../Constants/appConstants";
import axios from "axios";
import {
  setActivityDependencies,
  setShowDependencyModal,
} from "../../redux-store/actions/Properties/activityAction";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { checkIfSwimlaneCheckedOut } from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { selectedCell } from "../../redux-store/actions/selectedCellActions";
/*****************************************************************************************
 * @author asloob_ali BUG ID : 112542 The workdesk activities should not get deleted if connected as per ibps 5
 *  Resolution : added dependency check while deleting.
 *  Date : 13/09/2022             ****************/
export const deleteActivity = function DeleteActivity(
  activityId,
  activityName,
  actType,
  actSubType,
  processDefId,
  setProcessData,
  checkOutProcess,
  dispatch,
  translation,
  isPrimaryAct
) {
  if (isPrimaryAct) {
    dispatch(
      setToastDataFunc({
        message: translation("errorDefaultActivityDelete"),
        severity: "error",
        open: true,
      })
    );
    return;
  }
  var obj = {
    processDefId: processDefId,
    actName: activityName,
    actId: activityId,
    actType: actType,
    actSubType: actSubType,
    checkOutProcess,
  };
  let temp;
  setProcessData((prev) => {
    temp = prev;
    return prev;
  });
  if (checkIfSwimlaneCheckedOut(temp)?.length > 0) {
    let isDeleted = false;
    setProcessData((prevProcessData) => {
      let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
      newProcessData.SwimlaneCheckinChanges = true;
      newProcessData.MileStones.forEach((milestone) => {
        milestone.Activities.forEach((activity, index) => {
          if (activity.ActivityId === Number(activityId)) {
            if (activity.status === "I") {
              //removes activity from Activities array
              milestone.Activities.splice(index, 1);
              isDeleted = true;
            }
          }
          if (activity.EmbeddedActivity) {
            activity.EmbeddedActivity[0].forEach((embAct, indexAct) => {
              if (embAct.ActivityId === Number(activityId)) {
                if (embAct.status === "I") {
                  //removes activity from Activities array
                  milestone.Activities[index].EmbeddedActivity[0].splice(
                    indexAct,
                    1
                  );
                  isDeleted = true;
                }
              }
            });
          }
        });
      });
      if (isDeleted) {
        //delete all connecting edges to this activity
        newProcessData.Connections.forEach((connection, index) => {
          if (
            connection.SourceId === Number(activityId) ||
            connection.TargetId === Number(activityId)
          ) {
            newProcessData.Connections.splice(index, 1);
          }
        });
      }
      return newProcessData;
    });
  } else {
    axios
      .post(SERVER_URL + ENDPOINT_REMOVEACTIVITY, obj)
      .then((response) => {
        // if (response.data.Status == 0) {
        if (
          response.data?.Validations &&
          response.data?.Validations.length > 0
        ) {
          dispatch(setShowDependencyModal(true));
          dispatch(setActivityDependencies(response.data.Validations));
        } else {
          if (
            response.data?.Status === 0 &&
            (response.data?.Validations?.length === 0 ||
              !response.data.Validations)
          ) {
            dispatch(
              setToastDataFunc({
                message: response.data.Message || translation("DeletedSuccessfully"),
                severity: "success",
                open: true,
              })
            );
            // code added on 30 Jan 2023 for BugId 122774
            dispatch(
              selectedCell(null, null, null, null, null, null, null, null, null)
            );
          }
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.MileStones.forEach((milestone) => {
              milestone.Activities.forEach((activity, index) => {
                if (activity.ActivityId === Number(activityId)) {
                  //removes activity from Activities array
                  milestone.Activities.splice(index, 1);
                }
                if (activity.EmbeddedActivity) {
                  activity.EmbeddedActivity[0].forEach((embAct, indexAct) => {
                    if (embAct.ActivityId === Number(activityId)) {
                      milestone.Activities[index].EmbeddedActivity[0].splice(
                        indexAct,
                        1
                      );
                    }
                  });
                }
              });
            });
            //delete all connecting edges to this activity
            newProcessData.Connections.forEach((connection, index) => {
              if (
                connection.SourceId === Number(activityId) ||
                connection.TargetId === Number(activityId)
              ) {
                newProcessData.Connections.splice(index, 1);
              }
            });

            return newProcessData;
          });
        }
        // }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
