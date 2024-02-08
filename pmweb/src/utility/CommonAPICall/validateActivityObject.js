import {
  SERVER_URL,
  ENDPOINT_PROCESS_ASSOCIATION,
} from "../../Constants/appConstants";
import axios from "axios";
import {
  setActivityDependencies,
  setDependencyErrorMsg,
  setShowDependencyModal,
  setWorkitemFlag,
} from "../../redux-store/actions/Properties/activityAction";

export const validateActivityObject = ({
  processDefId,
  processType,
  activityName,
  activityId,
  errorMsg,
  onSuccess = () => {
    // console.log("please provide onSuccess call fn");
  },
  dispatch,
}) => {
  // code edited on 24 Jan 2023 for BugId 122659
  let payload = {
    processId: processDefId,
    processType: processType,
    objectName: activityName,
    objectId: activityId,
    wsType: "AR",
    deviceType: "D",
  };
  axios
    .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
    .then((res) => {
      if (res.data.Status === 0) {
        if (res.data.Validations?.length > 0) {
          if (res.data.WorkitemValidation) {
            dispatch(setShowDependencyModal(true));
            dispatch(setActivityDependencies(res.data.Validations));
            dispatch(setDependencyErrorMsg(errorMsg));
            dispatch(setWorkitemFlag(res.data.WorkitemValidation));
          } else {
            onSuccess(res.data.WorkitemValidation);
          }
        } else {
          onSuccess(res.data.WorkitemValidation);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// code added on 16 Nov 2022 for BugId 119109
export const validateTaskObject = ({
  processDefId,
  processType,
  taskName,
  taskId,
  errorMsg,
  onSuccess = () => {
    console.log("please provide onSuccess call fn");
  },
  dispatch,
  onFailure = null,
  wsType = "Task",
}) => {
  // code edited on 24 Jan 2023 for BugId 122659
  let payload = {
    processId: processDefId,
    processType: processType,
    objectName: taskName,
    objectId: taskId,
    wsType: wsType,
    deviceType: "D",
  };
  axios
    .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
    .then((res) => {
      if (res.data.Status === 0) {
        if (res.data.Validations?.length > 0) {
          if (onFailure !== null) {
            dispatch(setActivityDependencies(res.data.Validations));
            dispatch(setDependencyErrorMsg(errorMsg));
            onFailure(res.data.Validations);
          } else {
            dispatch(setShowDependencyModal(true));
            dispatch(setActivityDependencies(res.data.Validations));
            dispatch(setDependencyErrorMsg(errorMsg));
            if (res.data.WorkitemValidation) {
              dispatch(setWorkitemFlag(res.data.WorkitemValidation));
            }
          }
        } else {
          onSuccess(res.data.WorkitemValidation);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
