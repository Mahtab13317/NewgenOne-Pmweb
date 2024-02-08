import {
  SERVER_URL,
  ENDPOINT_DEASSOCIATETASK,
} from "../../Constants/appConstants";
import axios from "axios";
import {
  setActivityDependencies,
  setDependencyErrorMsg,
  setShowDependencyModal,
  setWorkitemFlag,
} from "../../redux-store/actions/Properties/activityAction";

export const deassociateTask = (
  taskId,
  taskName,
  setProcessData,
  processDefId,
  milestoneIndex,
  activityindex,
  activityName,
  activityId,
  errorMsg,
  dispatch
) => {
  const onSuccess = () => {
    setProcessData((prevProcessData) => {
      let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
      const tasks =
        newProcessData.MileStones[milestoneIndex].Activities[activityindex]
          .AssociatedTasks;
      /* code edited on 29/08/2023 for BugId 134913 - task deassociate>>getting error while 
      deassociating the task */
      let filteredArray = tasks?.filter((elem) => +elem !== +taskId);
      newProcessData.MileStones[milestoneIndex].Activities[
        activityindex
      ].AssociatedTasks = [...filteredArray];
      return newProcessData;
    });
  };

  var obj = {
    processDefId: processDefId,
    taskId: taskId,
    taskName: taskName,
    associatedActivityName: activityName,
    associatedActivityId: activityId,
  };
  axios
    .post(SERVER_URL + ENDPOINT_DEASSOCIATETASK, obj)
    .then((response) => {
      if (response.data.Status === 0) {
        // code edited on 10 Feb 2023 for BugId 123476
        if (response.data.Validations?.length > 0) {
          dispatch(setShowDependencyModal(true));
          dispatch(setActivityDependencies(response.data.Validations));
          dispatch(setDependencyErrorMsg(errorMsg));
          if (response.data.WorkitemValidation) {
            dispatch(setWorkitemFlag(response.data.WorkitemValidation));
          }
        } else {
          onSuccess();
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
