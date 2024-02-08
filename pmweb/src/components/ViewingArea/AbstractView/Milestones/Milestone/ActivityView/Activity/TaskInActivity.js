import React, { useState } from "react";
import AddToListDropdown from "../../../../../../../UI/AddToListDropdown/AddToListDropdown";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { Box, Grid, Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { addTaskAPI } from "../../../../../../../utility/CommonAPICall/AddTask";
import { deassociateTask } from "../../../../../../../utility/CommonAPICall/DeassociateTask";
import { associateTask } from "../../../../../../../utility/CommonAPICall/AssociateTask";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  RTL_DIRECTION,
} from "../../../../../../../Constants/appConstants";
import TaskAbstract from "../../../../../../../assets/abstractView/Icons/PD_Task - Abstract.svg";
import {
  gridSize,
  swimlaneTitleWidth,
  widthForDefaultVertex,
} from "../../../../../../../Constants/bpmnView";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";
import "../activitiesArabic.css";

export const TaskInActivity = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { isReadOnly } = props;
  const [addTask, setAddTask] = useState(false);
  const dispatch = useDispatch();

  const activityName =
    props.processData.MileStones[props.milestoneIndex].Activities[
      props.activityindex
    ].ActivityName;

  const activityId =
    props.processData.MileStones[props.milestoneIndex].Activities[
      props.activityindex
    ].ActivityId;

  const tasks =
    props.processData.MileStones[props.milestoneIndex].Activities[
      props.activityindex
    ].AssociatedTasks;

  const associatedTask = tasks
    ? tasks
        .map((elem) => {
          let taskObj = {};
          props.processData.Tasks.forEach((elem1) => {
            if (+elem1.TaskId === +elem) {
              //Changes made to solve Bug 124958
              taskObj = elem1;
            }
          });
          return taskObj;
        })
        .filter((task) => !!Object.keys(task).length)
    : [];

  const taskData = props.processData.Tasks?.map((x) => {
    return {
      id: x.TaskId,
      name: x.TaskName,
    };
  });

  const selectedTaskList = associatedTask?.map((ele) => {
    return ele.TaskId;
  });

  const addNewTaskToList = (value) => {
    if (value?.trim() !== "") {
      let maxId = 0;
      let maxXLeftLoc = 0;
      let maxYTopLoc = gridSize;
      let laneHeightIncreasedFlag = false;
      let mileWidth = swimlaneTitleWidth,
        lanesInfo = {};

      let newProcessData = JSON.parse(JSON.stringify(props.processData));
      newProcessData.MileStones?.forEach((mile) => {
        mileWidth = mileWidth + +mile.Width;
      });
      for (let i of newProcessData.Tasks) {
        if (+i.xLeftLoc > maxXLeftLoc) {
          maxXLeftLoc = +i.xLeftLoc;
        }
        if (maxId < +i.TaskId) {
          maxId = +i.TaskId;
        }
      }
      if (+maxXLeftLoc > 0) {
        maxXLeftLoc = +maxXLeftLoc + gridSize + widthForDefaultVertex;
      } else {
        maxXLeftLoc = +maxXLeftLoc + gridSize * 2;
      }
      if (+maxXLeftLoc + widthForDefaultVertex + gridSize > mileWidth) {
        laneHeightIncreasedFlag = true;
        newProcessData.Lanes[0].oldWidth = mileWidth;
        newProcessData.Lanes[0].Width =
          +maxXLeftLoc + widthForDefaultVertex + gridSize;
        let lastMileWidth =
          +newProcessData.MileStones[newProcessData.MileStones?.length - 1]
            .Width;
        newProcessData.MileStones[newProcessData.MileStones?.length - 1].Width =
          lastMileWidth +
          +maxXLeftLoc +
          widthForDefaultVertex +
          gridSize -
          +mileWidth;
      }
      props.setprocessData(newProcessData);

      if (laneHeightIncreasedFlag) {
        lanesInfo = {
          pMSwimlaneInfo: {
            laneId: newProcessData.Lanes[0].LaneId,
            laneName: newProcessData.Lanes[0].LaneName,
            laneSeqId: newProcessData.Lanes[0].LaneSeqId,
            height: newProcessData.Lanes[0].Height,
            oldHeight: newProcessData.Lanes[0].Height,
            width: newProcessData.Lanes[0].Width + "",
            oldWidth: newProcessData.Lanes[0].oldWidth + "",
          },
        };
      }
      let activityName =
        props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivityName;
      let activityId =
        props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivityId;
      addTaskAPI(
        maxId + 1,
        value,
        1, //taskType default value for new/ generic task type = 1
        maxXLeftLoc,
        maxYTopLoc,
        props.setprocessData,
        props.processData.ProcessDefId,
        props.milestoneIndex,
        props.activityindex,
        activityName,
        activityId,
        laneHeightIncreasedFlag ? lanesInfo : null,
        null
      );
    } else {
      dispatch(
        setToastDataFunc({
          message: t("EntityCantBeBlank", {
            entityName: t("TaskName"),
          }),
          severity: "error",
          open: true,
        })
      );
    }
  };

  const deleteTasks = (id) => {
    let taskName;
    props.processData.Tasks.forEach((elem) => {
      /* code edited on 29/08/2023 for BugId 134913 - task deassociate>>getting error while 
      deassociating the task */
      if (+elem.TaskId === +id) {
        taskName = elem.TaskName;
      }
    });
    // code edited on 10 Feb 2023 for BugId 123476
    deassociateTask(
      id,
      taskName,
      props.setprocessData,
      props.processData.ProcessDefId,
      props.milestoneIndex,
      props.activityindex,
      activityName,
      activityId,
      `${t("deassociateValidationErrorMsg")}`,
      dispatch
    );
  };

  const associateTaskFromList = (id, type) => {
    let taskName;
    props.processData.Tasks.forEach((elem) => {
      if (elem.TaskId === id) {
        taskName = elem.TaskName;
      }
    });
    if (type === 0) {
      associateTask(
        id,
        taskName,
        props.setprocessData,
        props.processData.ProcessDefId,
        props.milestoneIndex,
        props.activityindex,
        activityName,
        activityId
      );
    } else if (type === 1) {
      // code edited on 10 Feb 2023 for BugId 123476
      deassociateTask(
        id,
        taskName,
        props.setprocessData,
        props.processData.ProcessDefId,
        props.milestoneIndex,
        props.activityindex,
        activityName,
        activityId,
        `${t("deassociateValidationErrorMsg")}`,
        dispatch
      );
    }
    setAddTask(false);
  };

  return (
    <Box pl={1} ml={1} style={{ marginLeft: "0" }}>
      <Grid
        container
        className={
          direction === RTL_DIRECTION
            ? "selectedActivityTypeArabic"
            : "selectedActivityType"
        }
        style={{
          display: "flex",
          color: props.color,
          background: props.BackgroundColor + " 0% 0% no-repeat padding-box",
        }}
      >
        <Grid item style={{ flex: "1", padding: "4px 8px" }}>
          <p
            className={
              direction === RTL_DIRECTION
                ? "task_count_activityArabic"
                : "task_count_activity"
            }
          >
            {associatedTask.length}{" "}
            {associatedTask.length !== 1 ? t("tasks") : t("task")}
          </p>
        </Grid>
        <Grid
          item
          style={{
            textAlign: direction === RTL_DIRECTION ? "left" : "right",
            flex: "1",
            marginTop: "4px",
          }}
        >
          <span style={{ position: "relative" }}>
            {!isReadOnly &&
            (props.processType === PROCESSTYPE_LOCAL ||
              props.processType === PROCESSTYPE_LOCAL_CHECKED) ? (
              <AddIcon
                style={{
                  color: addTask ? "#0072C6" : "#606060",
                  width: "15px",
                  height: "15px",
                  cursor: "pointer",
                  outline: "0",
                }}
                className="taskSvg"
                onClick={() => setAddTask(true)}
                id={`pmweb_taskAddIcon_${props.activityId}`}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.code === "Enter") {
                    setAddTask(true);
                  }
                }}
              />
            ) : null}
            {addTask ? (
              <AddToListDropdown
                processData={props.processData}
                completeList={taskData}
                multiple="true"
                onChange={associateTaskFromList}
                associatedList={selectedTaskList}
                addNewLabel={t("newTask")}
                noDataLabel={t("noTask")}
                onKeydown={addNewTaskToList}
                labelKey="name"
                handleClickAway={() => setAddTask(false)}
                entityName={t("TaskName")}
              />
            ) : null}
          </span>
          {props.taskExpanded && associatedTask.length > 0 ? (
            <ExpandLessIcon
              style={{
                color: "#606060",
                width: "15px",
                height: "15px",
                marginInline: "0.5vw",
                cursor: "pointer",
                outline: "0",
              }}
              className="taskSvg"
              id={`pmweb_taskExpandLessIcon_${props.activityId}`}
              onClick={() => props.setTaskExpanded(false)}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.code === "Enter") {
                  props.setTaskExpanded(false);
                }
              }}
            />
          ) : (
            <ExpandMoreIcon
              style={{
                color: "#606060",
                width: "15px",
                height: "15px",
                marginInline: "0.5vw",
                cursor: "pointer",
                outline: "0",
              }}
              className="taskSvg"
              id={`pmweb_taskExpandMoreIcon_${props.activityId}`}
              onClick={() => {
                if (associatedTask.length > 0) props.setTaskExpanded(true);
              }}
              tabIndex={associatedTask.length > 0 ? 0 : -1}
              onKeyPress={(e) => {
                if (e.code === "Enter") {
                  props.setTaskExpanded(true);
                }
              }}
            />
          )}
        </Grid>
      </Grid>
      {props.taskExpanded
        ? associatedTask?.map((elem) => {
            return (
              <Grid
                container
                className={
                  direction === RTL_DIRECTION
                    ? "selectedActivityTypeArabic"
                    : "selectedActivityType"
                }
                style={{
                  background:
                    props.BackgroundColor + " 0% 0% no-repeat padding-box",
                }}
              >
                <Grid
                  item
                  style={{
                    display: "flex",
                    padding: "4px 8px",
                    background: "white",
                    margin: "3px 8px",
                    border: "1px solid #C4C4C4",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? "task_activityArabic"
                        : "task_activity"
                    }
                  >
                    <img
                      src={TaskAbstract}
                      alt="Taskname"
                      style={{
                        height: "1.25rem",
                        width: "1.25rem",
                        marginRight:
                          direction === RTL_DIRECTION ? "0px" : "4px",
                        marginLeft: direction === RTL_DIRECTION ? "4px" : "0px",
                      }}
                    />
                    {elem.TaskName}
                  </p>
                  {/*Code added on 06-09-23 for Bug 134914*/}
                  {props.processType === PROCESSTYPE_LOCAL ||
                  props.processType === PROCESSTYPE_LOCAL_CHECKED ? (
                    // <Tooltip title={t("delete")} code commented on 27-10-23 for bug 134914>
                    <Tooltip title={t("deassociate")}>
                      <DeleteOutlineIcon
                        style={{
                          color: "#606060",
                          width: "1.25rem",
                          height: "1.25rem",
                          cursor: "pointer",
                          outline: "0",
                        }}
                        className="taskSvg"
                        id={`pmweb_deleteTask_${props.activityId}_${elem.TaskId}`}
                        onClick={() => deleteTasks(elem.TaskId)}
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.code === "Enter") {
                            deleteTasks(elem.TaskId);
                          }
                        }}
                      />
                    </Tooltip>
                  ) : null}
                  {/*till here*/}
                </Grid>
              </Grid>
            );
          })
        : null}
    </Box>
  );
};
