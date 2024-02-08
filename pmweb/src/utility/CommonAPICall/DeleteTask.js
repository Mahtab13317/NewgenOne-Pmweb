import {
  SERVER_URL,
  ENDPOINT_REMOVETASK,
  BASE_URL,
  ENDPOINT_DELETE_TASK_FORM,
} from "../../Constants/appConstants";
import axios from "axios";
import { selectedTask } from "../../redux-store/actions/selectedCellActions";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";

export const deleteTask = (
  taskId,
  taskName,
  processDefId,
  setProcessData,
  dispatch,
  t
) => {
  var obj = {
    processDefId: processDefId,
    taskId: taskId,
    taskName: taskName,
  };
  axios
    .post(SERVER_URL + ENDPOINT_REMOVETASK, obj)
    .then((response) => {
      // if (response.data.Status == 0) {

      axios
        .post(
          BASE_URL + `${ENDPOINT_DELETE_TASK_FORM}/${taskId}/${processDefId}`
        )
        .then((res) => {
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.Tasks?.forEach((task, index) => {
              if (task.TaskId === Number(taskId)) {
                //removes task from Tasks array
                newProcessData.Tasks.splice(index, 1);
              }
            });

            return newProcessData;
          });
          // Changes made to solve Bug 130695
          if (response.data?.Status === 0) {
            dispatch(
              setToastDataFunc({
                message: t("TaskRemoved"),
                severity: "success",
                open: true,
              })
            );
          }
          // code added on 30 Jan 2023 for BugId 122774
          dispatch(selectedTask(null, null, null, null));
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
