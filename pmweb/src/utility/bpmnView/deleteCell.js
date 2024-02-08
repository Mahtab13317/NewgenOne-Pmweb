import { deleteSwimlane } from "../CommonAPICall/DeleteSwimlane";
import { deleteMilestone } from "../CommonAPICall/DeleteMilestone";
import {
  deleteLaneActivity,
  deleteMilestoneActivity,
  deleteMilestoneArray,
} from "../InputForAPICall/deleteMilestoneArray";
import { deleteActivity } from "../CommonAPICall/DeleteActivity";
import axios from "axios";
import {
  ENDPOINT_DELETE_CONNECTION,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  SERVER_URL,
} from "../../Constants/appConstants";
import { getTaskDependency } from "../CommonAPICall/GetTaskDependency";
import { artifacts, style } from "../../Constants/bpmnView";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { DeleteDataObject } from "../CommonAPICall/DeleteDataObject";
import { DeleteAnnotation } from "../CommonAPICall/DeleteAnnotation";
import { DeleteGroupBox } from "../CommonAPICall/DeleteGroupBox";
import { DeleteMsgAF } from "../CommonAPICall/DeleteMSGAFs";
import {
  checkActivityStatus,
  checkIfParentSwimlaneCheckedOut,
  checkIfSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxConstants = mxgraphobj.mxConstants;

export function deleteCell(
  graph,
  setProcessData,
  setTaskAssociation,
  setShowDependencyModal,
  dispatch,
  translation
) {
  let message = null;
  let anyDeletion = false;

  let selectedCells = graph.getSelectionCells();
  if (selectedCells.length === 0) {
    message = {
      langKey: "messages.selectToDelete",
      defaultWord: "Please Select to Delete! default",
    };
    return [message, false];
  }

  for (var j of selectedCells) {
    let cell = j;
    let processType, temp;
    setProcessData((prev) => {
      temp = prev;
      processType = prev.ProcessType;
      return prev;
    });
    if (graph.isSwimlane(cell) === false) {
      //code added on 22 August 2022 for BugId 114452
      if (cell.getStyle() !== "layer") {
        //don't delete swimlane /milestone add button
        let id = cell.getId();
        if (cell.isVertex()) {
          if (
            cell.getStyle() === style.taskTemplate ||
            cell.getStyle() === style.newTask ||
            cell.getStyle() === style.processTask
          ) {
            /*code edited on 14 July 2023 for tasks cannot be deleted in deployed processes */
            if (
              processType === PROCESSTYPE_LOCAL ||
              processType === PROCESSTYPE_LOCAL_CHECKED
            ) {
              let selectedTask = null,
                processDefId,
                processType;
              setProcessData((prevProcessData) => {
                prevProcessData.Tasks?.forEach((task) => {
                  if (task.TaskId === +id) {
                    selectedTask = task;
                  }
                });
                processDefId = prevProcessData.ProcessDefId;
                processType = prevProcessData.ProcessType;
                return prevProcessData;
              });
              getTaskDependency(
                id,
                selectedTask.TaskName,
                processDefId,
                processType,
                setTaskAssociation,
                setShowDependencyModal,
                setProcessData,
                dispatch,
                translation
              );
            }
          } else if (
            cell.getStyle() !== style.taskTemplate &&
            cell.getStyle() !== style.newTask &&
            cell.getStyle() !== style.processTask &&
            !artifacts.includes(cell.getStyle())
          ) {
            // code edited on 14 July 2023 for BugId 130715 - swimlane checkout>>not able to delete activity
            // activities already present in swimlane, while check-out cannot be deleted and renamed
            let parentLaneChecked =
              cell.parent.style === style.expandedEmbeddedProcess
                ? checkIfParentSwimlaneCheckedOut(
                    temp,
                    cell?.parent?.parent?.id
                  )?.length > 0
                : checkIfParentSwimlaneCheckedOut(temp, cell?.parent?.id)
                    ?.length > 0;
            if (
              processType === PROCESSTYPE_LOCAL ||
              processType === PROCESSTYPE_LOCAL_CHECKED ||
              (parentLaneChecked && checkActivityStatus(temp, cell?.id))
            ) {
              let processDefId,
                activityName,
                checkedOut,
                isPrimaryAct,
                actType,
                actSubType;
              setProcessData((prevProcessData) => {
                prevProcessData.MileStones.forEach((milestone) => {
                  milestone.Activities.forEach((activity) => {
                    if (activity.ActivityId === Number(id)) {
                      activityName = activity.ActivityName;
                      actType = +activity.ActivityType;
                      actSubType = +activity.ActivitySubType;
                      isPrimaryAct =
                        activity.PrimaryActivity === "Y" ? true : false;
                    }
                    if (activity.EmbeddedActivity) {
                      activity.EmbeddedActivity[0]?.forEach((embAct) => {
                        if (embAct.ActivityId === Number(id)) {
                          activityName = embAct.ActivityName;
                          actType = +embAct.ActivityType;
                          actSubType = +embAct.ActivitySubType;
                          isPrimaryAct =
                            embAct.PrimaryActivity === "Y" ? true : false;
                        }
                      });
                    }
                  });
                });
                processDefId = prevProcessData.ProcessDefId;
                checkedOut = prevProcessData.CheckedOut;
                return prevProcessData;
              });
              deleteActivity(
                id,
                activityName,
                actType,
                actSubType,
                processDefId,
                setProcessData,
                checkedOut,
                dispatch,
                translation,
                isPrimaryAct
              );
            }
          } else if (artifacts.includes(cell.getStyle())) {
            if (cell.getStyle() === style.dataObject) {
              let processDefId, processState, selectedDataObj;
              setProcessData((prevProcessData) => {
                prevProcessData.DataObjects.forEach((dataObj) => {
                  if (dataObj.DataObjectId === Number(id)) {
                    selectedDataObj = dataObj;
                  }
                });
                processDefId = prevProcessData.ProcessDefId;
                processState = prevProcessData.ProcessType;
                return prevProcessData;
              });
              DeleteDataObject(
                processDefId,
                processState,
                selectedDataObj.Data,
                id,
                selectedDataObj.xLeftLoc,
                selectedDataObj.yTopLoc,
                selectedDataObj.LaneId,
                setProcessData
              );
            } else if (cell.getStyle() === style.textAnnotations) {
              let processDefId, processState, selectedAnnotation;
              setProcessData((prevProcessData) => {
                prevProcessData.Annotations.forEach((annotation) => {
                  if (annotation.AnnotationId === Number(id)) {
                    selectedAnnotation = annotation;
                  }
                });
                processDefId = prevProcessData.ProcessDefId;
                processState = prevProcessData.ProcessType;
                return prevProcessData;
              });
              DeleteAnnotation(
                processDefId,
                processState,
                selectedAnnotation.Comment,
                id,
                selectedAnnotation.xLeftLoc,
                selectedAnnotation.yTopLoc,
                selectedAnnotation.Height,
                selectedAnnotation.Width,
                selectedAnnotation.LaneId,
                setProcessData
              );
            } else if (cell.getStyle() === style.groupBox) {
              let processDefId, processState, selectedGB;
              setProcessData((prevProcessData) => {
                prevProcessData.GroupBoxes.forEach((groupBox) => {
                  if (groupBox.GroupBoxId === Number(id)) {
                    selectedGB = groupBox;
                  }
                });
                processDefId = prevProcessData.ProcessDefId;
                processState = prevProcessData.ProcessType;
                return prevProcessData;
              });
              DeleteGroupBox(
                processDefId,
                processState,
                selectedGB.BlockName,
                id,
                selectedGB.ILeft,
                selectedGB.ITop,
                selectedGB.LaneId,
                setProcessData,
                selectedGB.GroupBoxWidth,
                selectedGB.GroupBoxHeight
              );
            } else if (cell.getStyle() === style.message) {
              let processDefId, processState, selectedMsg;
              setProcessData((prevProcessData) => {
                prevProcessData.MSGAFS.forEach((msg) => {
                  if (msg.MsgAFId === Number(id)) {
                    selectedMsg = msg;
                  }
                });
                processDefId = prevProcessData.ProcessDefId;
                processState = prevProcessData.ProcessType;
                return prevProcessData;
              });
              DeleteMsgAF(
                processDefId,
                processState,
                selectedMsg.MsgAFName,
                id,
                selectedMsg.xLeftLoc,
                selectedMsg.yTopLoc,
                selectedMsg.LaneId,
                setProcessData
              );
            }
          }
        } else if (cell.isEdge()) {
          let processDefId, processMode, processData, connectionId;
          setProcessData((prevProcessData) => {
            processDefId = prevProcessData.ProcessDefId;
            processMode = prevProcessData.ProcessType;
            processData = prevProcessData;
            prevProcessData.Connections?.forEach((connection) => {
              if (`conn_${connection.ConnectionId}` === id) {
                connectionId = connection.ConnectionId;
              }
            });
            return prevProcessData;
          });
          let json = {
            processDefId: processDefId,
            processMode: processMode,
            connId: connectionId,
            connType: cell.connType,
          };
          const deleteConnectionProcessData = () => {
            setProcessData((prevProcessData) => {
              let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
              newProcessData.Connections?.forEach((connection, index) => {
                if (connection.ConnectionId === connectionId) {
                  newProcessData.Connections.splice(index, 1);
                }
              });
              return newProcessData;
            });
          };
          let checkedOutLaneId =
            checkIfSwimlaneCheckedOut(processData)?.length > 0
              ? checkIfSwimlaneCheckedOut(processData)[0]?.laneId
              : null;
          if (!!checkedOutLaneId) {
            const getSwimlaneIdFromActId = (id) => {
              let laneId;
              processData.SwimlaneCheckinChanges = true;
              processData.MileStones.forEach((mile) => {
                mile.Activities.forEach((act) => {
                  if (act.ActivityId == id) {
                    laneId = act.LaneId;
                  }
                });
              });
              return laneId;
            };
            processData.Connections?.forEach((conn) => {
              if (
                conn.ConnectionId === connectionId &&
                getSwimlaneIdFromActId(conn.SourceId) == checkedOutLaneId &&
                getSwimlaneIdFromActId(conn.TargetId) == checkedOutLaneId
              ) {
                deleteConnectionProcessData();
              }
            });
          } else {
            axios
              .post(SERVER_URL + ENDPOINT_DELETE_CONNECTION, json)
              .then((response) => {
                if (response.data.Status === 0) {
                  deleteConnectionProcessData();
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      }
    } else {
      //delete only if there is atleast one swimlane and milestone present
      [cell]?.forEach((cellItem) => {
        let id = cellItem.getId();
        let horizontal = graph
          .getStylesheet()
          .getCellStyle(cellItem.getStyle())[mxConstants.STYLE_HORIZONTAL];
        if (horizontal) {
          //cell to be deleted is milestone
          let processDefId,
            mileArray,
            mileAct,
            processType,
            isDefaultMile = false;
          setProcessData((prevProcessData) => {
            mileArray = deleteMilestoneArray(prevProcessData, id);
            mileAct = deleteMilestoneActivity(prevProcessData, id);
            processDefId = prevProcessData.ProcessDefId;
            processType = prevProcessData.ProcessType;
            //code added on 14 Oct 2022 for BugId 117104
            prevProcessData.MileStones?.forEach((item) => {
              if (+item.iMileStoneId === +id) {
                item.Activities?.forEach((act) => {
                  if (act.PrimaryActivity === "Y") {
                    isDefaultMile = true;
                  }
                });
              }
            });
            return prevProcessData;
          });
          //code added on 14 Oct 2022 for BugId 117104
          if (isDefaultMile) {
            dispatch(
              setToastDataFunc({
                message: translation("milestone/swimlaneCantBeDeleted"),
                severity: "error",
                open: true,
              })
            );
          } else {
            deleteMilestone(
              id,
              setProcessData,
              processDefId,
              mileArray.array,
              mileArray.index,
              processType,
              mileAct.activityNameList,
              mileAct.activityIdList,
              dispatch
            );
          }
        } else {
          //cell to be deleted is swimlane
          let selectedlane,
            processDefId,
            processName,
            processType,
            laneAct,
            isDefaultLane = false;
          setProcessData((prevProcessData) => {
            selectedlane = prevProcessData.Lanes?.filter(
              (item) => +item.LaneId === +id
            );
            laneAct = deleteLaneActivity(prevProcessData, id);
            processDefId = prevProcessData.ProcessDefId;
            processName = prevProcessData.ProcessName;
            processType = prevProcessData.ProcessType;
            //code added on 14 Oct 2022 for BugId 117104
            prevProcessData.MileStones?.forEach((item) => {
              item.Activities?.forEach((act) => {
                if (+act.LaneId === +id && act.PrimaryActivity === "Y") {
                  isDefaultLane = true;
                }
              });
            });
            return prevProcessData;
          });
          //code added on 14 Oct 2022 for BugId 117104
          if (isDefaultLane) {
            dispatch(
              setToastDataFunc({
                message: translation("milestone/swimlaneCantBeDeleted"),
                severity: "error",
                open: true,
              })
            );
          } else if (cellItem.getStyle() === style.tasklane) {
            dispatch(
              setToastDataFunc({
                message: translation("tasklaneCantBeDeleted"),
                severity: "error",
                open: true,
              })
            );
          } else {
            deleteSwimlane(
              id,
              selectedlane[0],
              setProcessData,
              processDefId,
              processName,
              processType,
              laneAct.activityNameList,
              laneAct.activityIdList,
              dispatch,
              translation
            );
          }
        }
      });
      anyDeletion = true;
    }
  }

  return [message, anyDeletion];
}
