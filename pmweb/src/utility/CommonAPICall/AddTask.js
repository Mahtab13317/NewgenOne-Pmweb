import {
  SERVER_URL,
  ENDPOINT_ADDTASK,
  TaskType,
} from "../../Constants/appConstants";
import axios from "axios";

export const addTaskAPI = (
  taskId,
  taskName,
  taskType,
  xLeftLoc,
  yTopLoc,
  setProcessData,
  processDefId,
  milestoneIndex,
  activityindex,
  activityName,
  activityId,
  milestoneWidthIncreased,
  view,
  isNewTask,
  taskTemplateId,
  taskMode = ""
) => {
  let obj = {
    taskId: taskId,
    taskName: taskName,
    taskType: taskType,
    xLeftLoc: xLeftLoc + "",
    yTopLoc: yTopLoc + "",
    taskMode: taskMode,
    taskScope: "P",
    associatedActivityName: activityName,
    associatedActivityId: activityId,
    processDefId: +processDefId,
    createdByGlobal: !isNewTask,
  };
  if (taskTemplateId !== undefined) {
    obj.globalTemplateId = taskTemplateId;
  }
  if (milestoneWidthIncreased) {
    obj = { ...obj, ...milestoneWidthIncreased };
  }
  axios
    .post(SERVER_URL + ENDPOINT_ADDTASK, obj)
    .then((response) => {
      if (response.data.Status === 0) {
        // code edited on 6 Jan 2022 for BugId 121893
        let newId = +response.data.data?.id;
        if (view !== "BPMN") {
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            let taskObj = {
              CheckedOut: "N",
              Description: "",
              Goal: "",
              Instructions: "",
              NotifyEmail: "N",
              Repeatable: "N",
              TaskId: newId ? newId : obj.taskId,
              TaskName: obj.taskName,
              TaskType: taskType, // code edited on 3 Oct 2022 for BugId 116511
              StrTaskType:
                taskType === 1 ? TaskType.globalTask : TaskType.processTask, // code edited on 3 Oct 2022 for BugId 116511
              TemplateId: -1,
              isActive: "true",
              xLeftLoc: obj.xLeftLoc,
              yTopLoc: obj.yTopLoc + "",
              TaskMode: taskMode,
            };
            newProcessData.Tasks.splice(
              newProcessData.Tasks?.length,
              0,
              taskObj
            );
            newProcessData.MileStones[milestoneIndex].Activities[
              activityindex
            ].AssociatedTasks.push(taskId);
            return newProcessData;
          });
        } else {
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.Tasks?.forEach((task, idx) => {
              if (+task.TaskId === +obj.taskId) {
                newProcessData.Tasks[idx].TaskId = newId;
              }
            });
            return newProcessData;
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      setProcessData((prevProcessData) => {
        let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        newProcessData.Tasks.splice(0, 1);
        return newProcessData;
      });
    });
};
