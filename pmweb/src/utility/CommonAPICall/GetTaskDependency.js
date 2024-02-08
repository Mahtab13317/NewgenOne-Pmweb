import {
  SERVER_URL,
  ENDPOINT_PROCESS_ASSOCIATION,
} from "../../Constants/appConstants";
import axios from "axios";
import { deleteTask } from "./DeleteTask";

export const getTaskDependency = (
  taskId,
  taskName,
  processDefId,
  processType,
  setTaskAssociation,
  setShowDependencyModal,
  setProcessData,
  dispatch,
  t
) => {
  // code edited on 24 Jan 2023 for BugId 122659
  let payload = {
    processId: processDefId,
    processType: processType,
    objectName: taskName,
    objectId: taskId,
    wsType: "Task",
    deviceType: "D",
  };
  axios
    .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
    .then((res) => {
      if (res.data.Status === 0) {
        setTaskAssociation(res.data.Validations);
        if (res.data.Validations?.length > 0) {
          setShowDependencyModal(true);
        } else {
          deleteTask(taskId, taskName, processDefId, setProcessData, dispatch, t);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
