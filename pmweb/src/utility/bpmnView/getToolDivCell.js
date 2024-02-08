import {
  gridSize,
  cellSize,
  defaultShapeVertex,
  widthForDefaultVertex,
  heightForDefaultVertex,
  swimlaneTitleWidth,
  milestoneTitleWidth,
  AddVertexType,
  activitiesNotAllowedInEmbedded,
  style,
  artifacts,
} from "../../Constants/bpmnView";
import { AddActivity } from "../CommonAPICall/AddActivity";
import { configureStyleForCell } from "./configureStyleForCell";
import { getMilestoneAt } from "./getMilestoneAt";
import { getNextCell } from "./getNextCell";
import { getSwimlaneAt } from "./getSwimlaneAt";
import { getActivityQueueObj } from "../abstarctView/getActivityQueueObj";
import disabledIcon from "../../assets/bpmnView/cancelIcon.png";
import { isAllowedOutsideMilestone } from "./dropOutsideMilestone";
import axios from "axios";
import {
  ENDPOINT_ADD_CONNECTION,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  SERVER_URL,
} from "../../Constants/appConstants";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";
import { getActivityAt } from "./getActivityAt";
import { getFullWidth } from "../abstarctView/addWorkstepAbstractView";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { validateConnections } from "./validateConnections";
import {
  getExpandedSubprocess,
  isSubprocessExpanded,
} from "./getExpandedSubprocess";
import {
  checkIfParentSwimlaneCheckedOut,
  checkIfSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import {
  checkStyle,
  isActNameAlreadyPresent,
} from "../CommonFunctionCall/CommonFunctionCall";
import { AddActivityInSubprocess } from "../CommonAPICall/AddActivityInSubprocess";
import { getActivityProps } from "../abstarctView/getActivityProps";
import { LatestVersionOfProcess } from "../abstarctView/checkLatestVersion";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxUtils = mxgraphobj.mxUtils;
const mxGeometry = mxgraphobj.mxGeometry;
const mxRectangle = mxgraphobj.mxRectangle;
const mxEvent = mxgraphobj.mxEvent;
const mxPoint = mxgraphobj.mxPoint;
const mxEventObject = mxgraphobj.mxEventObject;

let toolDiv = document.createElement("div");
let visibility = false;
let nextCells = [];
let tool = [];
let dummy_graph;
let isActivityPresent = null,
  isExpandedProcessPresent = null;
let isEmbeddedSubprocessExpanded = false;

let clearOldValues = () => {
  if (tool != null) {
    for (var i of tool) {
      var img = i;
      img.parentNode.removeChild(img);
    }
  }
  tool = [];
  nextCells = [];
};
let mileStoneWidthIncreasedFlag = false;
let laneHeightIncreasedFlag = false;
let mileStoneInfo = {};
let lanesInfo = {};

let toDropOnGraph = (graph, cell, x, y, t, mainCell, props, dispatch) => {
  let processDefId,
    processName,
    mileIndex,
    MaxseqId = 0,
    mileWidth = 0;
  let { caseEnabled } = props;
  let activityType = cell.activityTypeId;
  let activitySubType = cell.activitySubTypeId;
  let title = t(cell.title);
  let mileAtXY = getMilestoneAt(x, y);
  let swimlaneAtXY = getSwimlaneAt(x, y, AddVertexType);
  if (
    (mileAtXY === null || swimlaneAtXY === null) &&
    !isAllowedOutsideMilestone(cell.styleName)
  ) {
    return;
  }
  if (
    isExpandedProcessPresent !== null &&
    isActivityPresent &&
    !isActivityPresent.style.includes(style.subProcess) &&
    !artifacts.includes(cell.styleName)
  ) {
    return;
  }
  if (
    isExpandedProcessPresent !== null &&
    activitiesNotAllowedInEmbedded.includes(cell.styleName)
  ) {
    return;
  }
  if (
    isExpandedProcessPresent === null &&
    isActivityPresent !== null &&
    !artifacts.includes(cell.styleName)
  ) {
    return;
  }
  // added on 28/09/23 for BugId 135837 and BugId 135836
  if (
    mainCell?.parent?.style === style.expandedEmbeddedProcess &&
    isExpandedProcessPresent === null
  ) {
    return;
  }

  if (isEmbeddedSubprocessExpanded && !isExpandedProcessPresent) {
    dispatch(
      setToastDataFunc({
        message: t("expandedEmbeddedSubprocessDropMsg"),
        severity: "warning",
        open: true,
      })
    );
    return;
  }

  var prototype = new mxgraphobj.mxCell(
    title,
    new mxGeometry(0, 0, cellSize.w, cellSize.h),
    cell.styleName
  );
  prototype.setVertex(true);

  let { isValid, msg } = validateConnections(mainCell, prototype, t);

  if (isValid) {
    //add to graph only if point is inside a swimlane
    if (mileAtXY !== null && graph.isSwimlane(prototype) === false) {
      // added on 28/09/23 for BugId 135837 and BugId 135836
      if (
        mainCell?.parent?.style === style.expandedEmbeddedProcess &&
        isExpandedProcessPresent !== null
      ) {
        let parentCell = isExpandedProcessPresent;
        let vertexX = x - parentCell.geometry.x;
        let vertexY = y - parentCell.geometry.y;
        let mileId = parseInt(mileAtXY.getId());
        //if drop is near border, stretch border so that the vertex is completely inside
        //milestone/swimlane
        let newActivityId = 0;
        let processDefId, processName;
        let parentActivity,
          MaxseqId = 0,
          queueInfo,
          mileIndex,
          newProcessData,
          newWidth,
          newHeight,
          expandedActWidth,
          expandedActHeight;
        let maxEdgeId = 0;
        props.setProcessData((prevProcessData) => {
          newProcessData = { ...prevProcessData };
          processDefId = newProcessData.ProcessDefId;
          processName = newProcessData.ProcessName;
          prevProcessData.Connections?.forEach((connection) => {
            if (+connection.ConnectionId > +maxEdgeId) {
              maxEdgeId = +connection.ConnectionId;
            }
          });
          return prevProcessData;
        });
        props.setNewId((oldIds) => {
          newActivityId = oldIds.activityId + 1;
          return { ...oldIds, activityId: newActivityId };
        });
        // Added on 22-01-24 for Bug 141498
        let newActName = title + "_" + newActivityId;
        // Till here for Bug 141498
        props.setProcessData((prevProcessData) => {
          newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          // Added on 22-01-24 for Bug 141498
          if (
            isActNameAlreadyPresent(
              title + "_" + newActivityId,
              newProcessData.MileStones
            )
          ) {
            newActName = title + "_" + (newActivityId + 1);
          }
          // Till here for Bug 141498
          prevProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((act) => {
              if (
                +act.ActivityType === 35 &&
                +act.ActivitySubType === 1 &&
                act.hide === +act.ActivityId // code added on 1 March 2023 for BugId 124474
              ) {
                parentActivity = act;
                newWidth = act.Width;
                newHeight = act.Height;
                expandedActWidth = act.Width;
                expandedActHeight = act.Height;
              }
            });
          });
          return prevProcessData;
        });
        newWidth = Math.max(
          newWidth,
          vertexX +
            (checkStyle(defaultShapeVertex, prototype.getStyle())
              ? widthForDefaultVertex + gridSize
              : cellSize.w + gridSize)
        );
        newHeight = Math.max(
          newHeight,
          vertexY +
            (checkStyle(defaultShapeVertex, prototype.getStyle())
              ? heightForDefaultVertex + gridSize
              : cellSize.h + gridSize)
        );
        graph.insertEdge(parentCell, null, "", mainCell, prototype);
        queueInfo = getActivityQueueObj(
          props.setNewId,
          activityType,
          activitySubType,
          // Modified on 22-01-24 for Bug 141498
          newActName,
          // Till here for Bug 141498
          newProcessData,
          parentActivity.LaneId,
          t
        );
        let newEdgeId = maxEdgeId + 1;

        let json = {
          processDefId: processDefId,
          processMode: newProcessData?.ProcessType,
          connId: Number(newEdgeId),
          sourceId: mainCell.getId(),
          targetId: newActivityId,
          connType: "D",
          sourcePosition: [],
          targetPosition: [],
        };
        processDefId = newProcessData.ProcessDefId;
        processName = newProcessData.ProcessName;
        props.setProcessData((prevProcessData) => {
          //code edited on 5 August 2022 for Bug 113802
          let newData = JSON.parse(JSON.stringify(prevProcessData));
          newData.Connections = JSON.parse(
            JSON.stringify(prevProcessData?.Connections)
          );
          newData.Connections.push({
            ConnectionId: Number(newEdgeId),
            Type: "D",
            SourceId: mainCell.getId(),
            TargetId: newActivityId,
            xLeft: [],
            yTop: [],
          });
          newData.MileStones = JSON.parse(
            JSON.stringify(prevProcessData.MileStones)
          );
          newData.MileStones?.forEach((milestone, index) => {
            if (milestone.iMileStoneId === mileId) {
              milestone.Activities?.forEach((activity) => {
                if (+activity.SequenceId > +MaxseqId) {
                  MaxseqId = activity.SequenceId;
                }
                if (
                  +activity.ActivityType === 35 &&
                  +activity.ActivitySubType === 1 // code added on 1 March 2023 for BugId 124474
                ) {
                  activity.EmbeddedActivity[0]?.forEach((embAct) => {
                    if (+embAct.SequenceId > +MaxseqId) {
                      MaxseqId = embAct.SequenceId;
                    }
                  });
                }
              });
            }
          });
          let mileArr = [];
          //assumption that each milestone have unique iMilestoneId
          mileArr = newData.MileStones?.map((milestone, index) => {
            if (milestone.iMileStoneId === mileId) {
              let mileActivities = [];
              mileIndex = index;
              mileActivities = milestone.Activities?.map((activity) => {
                if (
                  +activity.ActivityType === 35 &&
                  +activity.ActivitySubType === 1 &&
                  activity.hide === +activity.ActivityId // code added on 1 March 2023 for BugId 124474
                ) {
                  let embActivities = [];
                  let newActObj = {
                    xLeftLoc: vertexX,
                    yTopLoc: vertexY,
                    ActivityType: activityType,
                    ActivitySubType: activitySubType,
                    ActivityId: newActivityId,
                    ActivityName: newActName,
                    LaneId: activity.LaneId,
                    isActive: "true",
                    BlockId: 0,
                    CheckedOut: "",
                    Color: "1234",
                    FromRegistered: "N",
                    QueueCategory: "",
                    QueueId: queueInfo.queueId,
                    SequenceId: +MaxseqId + 1,
                    id: "",
                    AssociatedTasks: [],
                    Height: newHeight,
                    Width: newWidth,
                    EmbeddedActivityType: "I", // code added on 1 March 2023 for BugId 124474
                  };
                  if (
                    checkIfParentSwimlaneCheckedOut(
                      newProcessData,
                      activity.LaneId
                    )?.length > 0
                  ) {
                    newActObj.status = "I";
                    newProcessData.SwimlaneCheckinChanges = true;
                    embActivities = [
                      ...activity.EmbeddedActivity[0],
                      newActObj,
                    ];
                  } else if (
                    checkIfSwimlaneCheckedOut(newProcessData)?.length === 0
                  ) {
                    embActivities = [
                      ...activity.EmbeddedActivity[0],
                      newActObj,
                    ];
                  }
                  return {
                    ...activity,
                    EmbeddedActivity: [[...embActivities]],
                    Width: newWidth,
                    Height: newHeight,
                  };
                }

                if (expandedActWidth !== newWidth) {
                  let activityHeight = checkStyle(
                    defaultShapeVertex,
                    getActivityProps(
                      activity.ActivityType,
                      activity.ActivitySubType
                    )[5]
                  )
                    ? heightForDefaultVertex
                    : gridSize;
                  if (
                    activity.LaneId === parentActivity.LaneId &&
                    +activity.xLeftLoc >
                      +parentActivity.xLeftLoc + expandedActWidth &&
                    (+activity.yTopLoc >= +parentActivity.yTopLoc ||
                      +activity.yTopLoc + activityHeight >=
                        +parentActivity.yTopLoc) &&
                    (+activity.yTopLoc <=
                      +parentActivity.yTopLoc + heightForDefaultVertex ||
                      +activity.yTopLoc + activityHeight <=
                        +parentActivity.yTopLoc + heightForDefaultVertex)
                  ) {
                    activity.xLeftLoc =
                      +activity.xLeftLoc + newWidth - expandedActWidth;
                  }
                }

                if (expandedActHeight !== newHeight) {
                  let activityWidth = checkStyle(
                    defaultShapeVertex,
                    getActivityProps(
                      activity.ActivityType,
                      activity.ActivitySubType
                    )[5]
                  )
                    ? widthForDefaultVertex
                    : gridSize;

                  if (
                    activity.LaneId === parentActivity.LaneId &&
                    +activity.yTopLoc > +parentActivity.yTopLoc &&
                    ((+activity.xLeftLoc <=
                      +parentActivity.xLeftLoc + newWidth &&
                      +activity.xLeftLoc >= +parentActivity.xLeftLoc) ||
                      (+activity.xLeftLoc + activityWidth <=
                        +parentActivity.xLeftLoc + newWidth &&
                        +activity.xLeftLoc + activityWidth >=
                          +parentActivity.xLeftLoc))
                  ) {
                    activity.yTopLoc =
                      +activity.yTopLoc + newHeight - expandedActHeight;
                  }
                }
                return activity;
              });
              return { ...milestone, Activities: mileActivities };
            }
            return milestone;
          });
          return { ...newData, MileStones: mileArr };
        });
        prototype.geometry.x = dimensionInMultipleOfGridSize(vertexX);
        prototype.geometry.y = dimensionInMultipleOfGridSize(vertexY);
        parentCell.geometry.width = newWidth;
        parentCell.geometry.height = newHeight;
        if (checkStyle(defaultShapeVertex, prototype.getStyle())) {
          prototype.geometry.width = widthForDefaultVertex;
          prototype.geometry.height = heightForDefaultVertex;
        } else {
          prototype.geometry.width = gridSize;
          prototype.geometry.height = gridSize;
        }
        parentCell.insert(prototype);
        prototype.edges = [];
        // Modified on 22-01-24 for Bug 141498
        prototype.title = newActName;
        // Till here for Bug 141498
        prototype.id = newActivityId;
        graph.setSelectionCell(prototype);
        graph.fireEvent(new mxEventObject("cellsInserted", "cells", prototype));
        if (
          // modified on 20/10/23 for BugId 136278
          // checkIfParentSwimlaneCheckedOut(newProcessData, parentActivity.LaneId)?.length === 0
          checkIfSwimlaneCheckedOut(newProcessData, parentActivity.LaneId)
            ?.length === 0
        ) {
          AddActivityInSubprocess(
            processDefId,
            processName,
            {
              name: newActName,
              id: newActivityId,
              actType: activityType,
              actSubType: activitySubType,
              actAssocId: 0,
              seqId: +MaxseqId + 1,
              laneId: parentActivity.LaneId,
              blockId: 0,
              queueInfo: queueInfo,
              xLeftLoc: vertexX,
              yTopLoc: vertexY,
              view: "BPMN",
              height: newHeight,
              width: newWidth,
            },
            { mileId: mileId, mileIndex: mileIndex },
            parentActivity.ActivityId
          );
          axios
            .post(SERVER_URL + ENDPOINT_ADD_CONNECTION, json)
            .then((response) => {
              if (response.data.Status === 0) {
                dispatch(
                  setToastDataFunc({
                    message: t("ConnectionCreatedSuccessfully"),
                    severity: "success",
                    open: true,
                  })
                );
              }
            })
            .catch((err) => {
              console.log(err);
              props.setProcessData((prevProcessData) => {
                //do not do shallow copy process Data, else original state will get change
                let newProcessData = JSON.parse(
                  JSON.stringify(prevProcessData)
                );
                newProcessData.Connections = JSON.parse(
                  JSON.stringify(prevProcessData.Connections)
                );
                let index = null;
                newProcessData.Connections?.forEach((conn, idx) => {
                  if (+conn.ConnectionId === Number(newEdgeId)) {
                    index = idx;
                  }
                });
                if (index !== null) {
                  newProcessData.Connections.splice(index, 1);
                }
                return newProcessData;
              });
            });
        }
        return true;
      } else {
        let parentCell = swimlaneAtXY;
        let vertexX = x - mileAtXY.geometry.x + gridSize;
        let vertexY = y - parentCell.geometry.y;
        let parentCellId = parseInt(parentCell.getId());

        let mileId = parseInt(mileAtXY.getId());
        //if drop is near border, stretch border so that the vertex is completely
        //inside milestone/swimlane
        let newWidth = Math.max(
          mileAtXY.geometry.width,
          vertexX +
            (checkStyle(defaultShapeVertex, prototype.getStyle())
              ? widthForDefaultVertex
              : cellSize.w)
        );
        let newHeight = Math.max(
          parentCell.geometry.height,
          y -
            swimlaneAtXY.geometry.y +
            (checkStyle(defaultShapeVertex, prototype.getStyle())
              ? heightForDefaultVertex + gridSize
              : cellSize.h + gridSize)
        );
        graph.insertEdge(parentCell, null, "", mainCell, prototype);
        let newActivityId = 0;
        let queueInfo, newProcessData;
        let laneHeight = milestoneTitleWidth,
          isLaneFound = false;
        let maxEdgeId = 0;
        props.setProcessData((prevProcessData) => {
          newProcessData = { ...prevProcessData };
          processDefId = newProcessData.ProcessDefId;
          processName = newProcessData.ProcessName;
          prevProcessData.Connections?.forEach((connection) => {
            if (+connection.ConnectionId > +maxEdgeId) {
              maxEdgeId = +connection.ConnectionId;
            }
          });
          return prevProcessData;
        });
        queueInfo = getActivityQueueObj(
          props.setNewId,
          activityType,
          activitySubType,
          // Modified on 22-01-24 for Bug 141498
          newActName,
          // Till here for Bug 141498
          newProcessData,
          parentCellId,
          t
        );
        props.setNewId((oldIds) => {
          newActivityId = oldIds.activityId + 1;
          return { ...oldIds, activityId: newActivityId };
        });
        // Modified on 22-01-24 for Bug 141498
        let newActName = title + "_" + newActivityId;
        // Till here for Bug 141498

        let newEdgeId = maxEdgeId + 1;

        let json = {
          processDefId: processDefId,
          processMode: newProcessData?.ProcessType,
          connId: Number(newEdgeId),
          sourceId: mainCell.getId(),
          targetId: newActivityId,
          connType: "D",
          sourcePosition: [],
          targetPosition: [],
        };
        // code edited on 28 Nov 2022 for BugId 119605
        props.setProcessData((prevProcessData) => {
          //do not do shallow copy process Data, else original state will get change
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          // Modified on 22-01-24 for Bug 141498
          if (
            isActNameAlreadyPresent(
              title + "_" + newActivityId,
              newProcessData.MileStones
            )
          ) {
            newActName = title + "_" + (newActivityId + 1);
          }
          // Till here for Bug 141498
          //newProcessData.MileStones = [...prevProcessData.MileStones];
          //Bug 126841 - regression>>activity connection>>screen is crashing while connecting it to the other activity through property option
          //doing the deep cloning
          newProcessData.MileStones = JSON.parse(
            JSON.stringify(prevProcessData?.MileStones)
          );

          //newProcessData.Lanes = [...prevProcessData.Lanes];
          //Bug 126841 - regression>>activity connection>>screen is crashing while connecting it to the other activity through property option
          //doing the deep cloning
          newProcessData.Lanes = JSON.parse(
            JSON.stringify(prevProcessData?.Lanes)
          );
          newProcessData.Connections = JSON.parse(
            JSON.stringify(prevProcessData?.Connections)
          );
          newProcessData.Connections.push({
            ConnectionId: Number(newEdgeId),
            Type: "D",
            SourceId: mainCell.getId(),
            TargetId: newActivityId,
            xLeft: [],
            yTop: [],
          });
          newProcessData.MileStones?.forEach((milestone) => {
            if (milestone.iMileStoneId === mileId) {
              milestone?.Activities?.forEach((activity) => {
                if (+activity.SequenceId > +MaxseqId) {
                  MaxseqId = +activity.SequenceId;
                }
                if (
                  +activity.ActivityType === 35 &&
                  +activity.ActivitySubType === 1
                ) {
                  activity.EmbeddedActivity[0]?.forEach((embAct) => {
                    if (+embAct.SequenceId > +MaxseqId) {
                      MaxseqId = embAct.SequenceId;
                    }
                  });
                }
              });
            }
          });
          newProcessData.Lanes?.forEach((lane) => {
            if (lane.LaneId === parentCell.id) {
              isLaneFound = true;
            }
            if (!isLaneFound) {
              if (!caseEnabled && lane.LaneId !== -99) {
                laneHeight = laneHeight + +lane.Height;
              } else if (caseEnabled) {
                laneHeight = laneHeight + +lane.Height;
              }
            }
          });
          //assumption that each milestone have unique iMilestoneId
          newProcessData.MileStones.forEach((milestone, index) => {
            milestone["oldWidth"] = milestone.Width;
            if (milestone.iMileStoneId === mileId) {
              mileIndex = index;
              if (+newWidth !== +milestone.Width) {
                mileStoneWidthIncreasedFlag = true;
                newProcessData.MileStones[index] = { ...milestone };
                newProcessData.MileStones[index].Width = newWidth + "";
                newProcessData.MileStones[index].Activities = [
                  ...newProcessData.MileStones[index].Activities,
                ];
              }
              let newActObj = {
                xLeftLoc: vertexX,
                yTopLoc: +laneHeight + vertexY,
                ActivityType: activityType,
                ActivitySubType: activitySubType,
                ActivityId: newActivityId,
                ActivityName: newActName,
                LaneId: parentCellId,
                isActive: "true",
                BlockId: 0,
                CheckedOut: "",
                Color: "1234",
                FromRegistered: "N",
                QueueCategory: "",
                QueueId: queueInfo.queueId,
                SequenceId: +MaxseqId + 1,
                id: "",
                AssociatedTasks: [],
              };
              if (
                checkIfParentSwimlaneCheckedOut(newProcessData, parentCellId)
                  ?.length > 0
              ) {
                newActObj.status = "I";
                // added on 09/10/23 for BugId 138932
                newActObj.newXLeft =
                  mileIndex === 0 ? vertexX : +mileWidth + vertexX;
                newActObj.newYTop = +laneHeight + vertexY;
                newProcessData.MileStones[index].Activities.splice(
                  0,
                  0,
                  newActObj
                );
                newProcessData.SwimlaneCheckinChanges = true;
              }
              // modified on 20/10/23 for BugId 136278
              // else
              else if (
                checkIfSwimlaneCheckedOut(newProcessData)?.length === 0
              ) {
                newProcessData.MileStones[index].Activities.splice(
                  0,
                  0,
                  newActObj
                );
              }
            }
            if (!mileIndex) {
              mileWidth = mileWidth + +milestone.Width;
            }
          });

          if (mileStoneWidthIncreasedFlag) {
            mileStoneInfo = {
              arrMilestoneInfos: newProcessData?.MileStones?.map(
                (mile, index) => {
                  return {
                    milestoneId: mile.iMileStoneId,
                    milestoneName: mile.MileStoneName,
                    width: mile.Width,
                    oldWidth: mile.oldWidth,
                    activities: mile?.Activities?.filter(
                      (act) => +act.ActivityId !== +newActivityId
                    )?.map((act) => {
                      return {
                        actId: act.ActivityId,
                        xLeftLoc:
                          +getFullWidth(index, newProcessData) +
                          +act.xLeftLoc +
                          "",
                      };
                    }),
                  };
                }
              ),
            };
          }
          //change height of swimlane , if drop is near boundary
          newProcessData?.Lanes?.forEach((swimlane, index) => {
            swimlane["oldHeight"] = swimlane.Height;
            if (swimlane.LaneId === parentCellId) {
              newProcessData.Lanes[index] = { ...swimlane };
              if (newHeight !== parentCell.geometry.height) {
                laneHeightIncreasedFlag = true;
                newProcessData.Lanes[index].Height = newHeight + "";
              }
            }
          });

          if (laneHeightIncreasedFlag) {
            lanesInfo = {
              arrLaneInfos: newProcessData?.Lanes?.map((lane) => {
                return {
                  laneId: lane.LaneId,
                  laneName: lane.LaneName,
                  laneSeqId: lane.LaneSeqId,
                  height: lane.Height,
                  oldHeight: lane.oldHeight,
                  width: lane.Width,
                  oldWidth: lane.Width,
                };
              }),
            };
          }
          // code added on 22 July 2022 for BugId 113305
          if (!queueInfo.queueExist) {
            newProcessData.Queue?.splice(0, 0, {
              QueueFilter: "",
              OrderBy: queueInfo?.orderBy,
              AllowReassignment: queueInfo?.allowReassignment,
              UG: [],
              FilterOption: "0",
              RefreshInterval: queueInfo?.refreshInterval,
              QueueId: queueInfo?.queueId,
              SortOrder: queueInfo?.sortOrder,
              QueueName: queueInfo?.queueName,
              QueueDescription: queueInfo?.QueueDescription,
              QueueType: queueInfo?.queueType,
              FilterValue: "",
            });
          }
          return newProcessData;
        });
        prototype.geometry.x =
          dimensionInMultipleOfGridSize(x) - swimlaneTitleWidth;
        prototype.geometry.y = dimensionInMultipleOfGridSize(vertexY);
        if (checkStyle(defaultShapeVertex, prototype.getStyle())) {
          prototype.geometry.width = widthForDefaultVertex;
          prototype.geometry.height = heightForDefaultVertex;
        } else {
          prototype.geometry.width = gridSize;
          prototype.geometry.height = gridSize;
        }
        parentCell.insert(prototype);
        prototype.id = newActivityId;
        configureStyleForCell(graph, cell.icon, cell.styleName);
        graph.setSelectionCell(prototype);
        graph.fireEvent(new mxEventObject("cellsInserted", "cells", prototype));
        if (checkIfSwimlaneCheckedOut(newProcessData)?.length === 0) {
          AddActivity(
            processDefId,
            processName,
            {
              name: newActName,
              id: newActivityId,
              actType: activityType,
              actSubType: activitySubType,
              actAssocId: 0,
              seqId: +MaxseqId + 1,
              laneId: parentCellId,
              laneName: parentCellId.value,
              blockId: 0,
              queueInfo:
                queueInfo.existingQueue === "Y"
                  ? { queueId: queueInfo.queueId }
                  : queueInfo,
              xLeftLoc: mileIndex === 0 ? vertexX : +mileWidth + vertexX,
              yTopLoc: +laneHeight + vertexY,
              view: "BPMN",
            },
            { mileId: mileId, mileIndex: mileIndex },
            props.setProcessData,
            vertexX,
            mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
            laneHeightIncreasedFlag ? lanesInfo : null
          );
          axios
            .post(SERVER_URL + ENDPOINT_ADD_CONNECTION, json)
            .then((response) => {
              if (response.data.Status === 0) {
                dispatch(
                  setToastDataFunc({
                    message: t("ConnectionCreatedSuccessfully"),
                    severity: "success",
                    open: true,
                  })
                );
              }
            })
            .catch((err) => {
              console.log(err);
              props.setProcessData((prevProcessData) => {
                //do not do shallow copy process Data, else original state will get change
                let newProcessData = JSON.parse(
                  JSON.stringify(prevProcessData)
                );
                newProcessData.Connections = JSON.parse(
                  JSON.stringify(prevProcessData.Connections)
                );
                let index = null;
                newProcessData.Connections?.forEach((conn, idx) => {
                  if (+conn.ConnectionId === Number(newEdgeId)) {
                    index = idx;
                  }
                });
                if (index !== null) {
                  newProcessData.Connections.splice(index, 1);
                }
                return newProcessData;
              });
            });
        }
      }
      return true;
    }
  } else if (msg) {
    dispatch(
      setToastDataFunc({
        message: msg,
        severity: "error",
        open: true,
      })
    );
    return;
  }
};

export function getToolDivCell(
  graph,
  mainCell,
  t,
  setProcessData,
  showDrawer,
  setNewId,
  caseEnabled,
  dispatch
) {
  clearOldValues();
  dummy_graph = graph;
  nextCells = getNextCell(mainCell);
  if (!nextCells || nextCells === null) {
    visibility = false;
    toolDiv.style.opacity = 0;
    return;
  }
  visibility = true;
  toolDiv.setAttribute(
    "style",
    "border: 1px solid #C4C4C4;box-shadow: 0px 3px 6px #DADADA; border-radius: 1px; background: white; display: flex; position: absolute; flex-wrap: wrap; justify-content: center; z-index:10"
  );
  toolDiv.setAttribute("id", `toolDiv_${mainCell.id}`);
  toolDiv.style.left =
    mainCell.geometry.x +
    mainCell.parent.geometry.x +
    mainCell.geometry.width +
    gridSize * 0.15 +
    "px";
  toolDiv.style.top = mainCell.geometry.y + mainCell.parent.geometry.y + "px";
  toolDiv.style.padding = gridSize * 0.05 + "px";
  toolDiv.style.width = 2.5 * gridSize + "px";
  /* code added on 30 May 2023 for BugId 127948 - workdesk>>activities are getting hided due to
  tool tip of activity name, causing usability issue for connecting to those activities */
  toolDiv.addEventListener("mouseenter", () => {
    graph.tooltipHandler.hide();
  });
  nextCells?.forEach((subCell) => {
    let iconDiv = document.createElement("div");
    iconDiv.style.marginLeft = gridSize * 0.1 + "px";
    iconDiv.style.marginRight = gridSize * 0.1 + "px";
    iconDiv.style.height = "20px";
    // code added on 21 June 2022 for BugId 110965
    iconDiv.style.cursor = "move";
    var icon = mxUtils.createImage(subCell.icon);
    icon.style.width = "16px";
    icon.style.height = "16px";
    icon.setAttribute("title", t(subCell.title));
    let div = document.createElement("div");
    if (checkStyle(defaultShapeVertex, subCell.styleName)) {
      div.setAttribute(
        "style",
        `width: ${widthForDefaultVertex}px; height:${heightForDefaultVertex}px; border:1px dotted black;`
      );
    } else {
      div.setAttribute(
        "style",
        `width: ${gridSize}px; height:${gridSize}px; border:1px dotted black;`
      );
    }
    let dragImage = document.createElement("img");
    dragImage.src = subCell.icon;
    dragImage.style.width = "16px";
    dragImage.style.height = "16px";
    div.appendChild(dragImage);
    let dragSource = mxUtils.makeDraggable(
      icon,
      graph,
      (newGraph, evt, cell, x, y) =>
        toDropOnGraph(
          newGraph,
          subCell,
          x,
          y,
          t,
          mainCell,
          {
            setProcessData,
            showDrawer,
            setNewId,
            caseEnabled,
          },
          dispatch
        ),
      div,
      null,
      null,
      graph.autoscroll,
      true
    );

    //overwrite function to show disableIcon if current point is not inside milestone
    dragSource.dragOver = function (graph, evt) {
      var offset = mxUtils.getOffset(graph.container);
      var origin = mxUtils.getScrollOrigin(graph.container);
      var x = mxEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
      var y = mxEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;

      if (graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
        graph.scrollPointToVisible(x, y, graph.autoExtend);
      }
      // Highlights the drop target under the mouse
      if (this.currentHighlight != null && graph.isDropEnabled()) {
        this.currentDropTarget = this.getDropTarget(graph, x, y, evt);
        var state = graph.getView().getState(this.currentDropTarget);
        this.currentHighlight.highlight(state);
      }
      let width = this.previewElement.style.width.replace("px", "");
      let height = this.previewElement.style.height.replace("px", "");
      let isMilestonePresent = getMilestoneAt(x, y);
      // Updates the location of the preview
      if (this.previewElement != null) {
        let newProcessData, processType;
        setProcessData((prevProcessData) => {
          newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          processType = prevProcessData.ProcessType;
          return prevProcessData;
        });
        //here if the currentPoint is not inside milestone then disabled icon is displayed
        if (isMilestonePresent === null) {
          if (!isAllowedOutsideMilestone(subCell.styleName)) {
            this.previewElement.children[0].src = disabledIcon;
            this.previewElement.style.border = "none";
          }
        } else if (isMilestonePresent !== null) {
          let isSwimlanePresent = getSwimlaneAt(x, y, AddVertexType);
          isActivityPresent = getActivityAt(
            x,
            y,
            isSwimlanePresent,
            graph,
            width,
            height,
            null
          );
          isExpandedProcessPresent = getExpandedSubprocess(x, y, null, graph);
          isEmbeddedSubprocessExpanded = isSubprocessExpanded(graph);
          if (isSwimlanePresent === null) {
            this.previewElement.children[0].src = disabledIcon;
            this.previewElement.style.border = "none";
          } else {
            if (
              (processType !== PROCESSTYPE_LOCAL &&
                processType !== PROCESSTYPE_LOCAL_CHECKED &&
                checkIfParentSwimlaneCheckedOut(
                  newProcessData,
                  isSwimlanePresent?.id
                )?.length === 0) ||
              +LatestVersionOfProcess(newProcessData?.Versions) !==
                +newProcessData?.VersionNo
            ) {
              this.previewElement.children[0].src = disabledIcon;
              this.previewElement.style.border = "1px dotted black";
            } else {
              if (isEmbeddedSubprocessExpanded) {
                if (isExpandedProcessPresent) {
                  if (
                    !activitiesNotAllowedInEmbedded.includes(subCell.styleName)
                  ) {
                    this.previewElement.children[0].src = subCell.icon;
                    this.previewElement.style.border = "1px dotted black";
                  } else {
                    this.previewElement.children[0].src = disabledIcon;
                    this.previewElement.style.border = "1px dotted black";
                  }
                } else {
                  this.previewElement.children[0].src = disabledIcon;
                  this.previewElement.style.border = "1px dotted black";
                }
              } else if (isActivityPresent) {
                if (isExpandedProcessPresent) {
                  if (
                    !activitiesNotAllowedInEmbedded.includes(subCell.styleName)
                  ) {
                    this.previewElement.children[0].src = subCell.icon;
                    this.previewElement.style.border = "1px dotted black";
                  } else {
                    this.previewElement.children[0].src = disabledIcon;
                    this.previewElement.style.border = "1px dotted black";
                  }
                } else {
                  this.previewElement.children[0].src = disabledIcon;
                  this.previewElement.style.border = "1px dotted black";
                }
              } else {
                this.previewElement.children[0].src = subCell.icon;
                this.previewElement.style.border = "1px dotted black";
              }
            }
          }
        }

        if (this.previewElement.parentNode == null) {
          graph.container.appendChild(this.previewElement);
          this.previewElement.style.zIndex = "3";
          this.previewElement.style.position = "absolute";
        }

        var gridEnabled = this.isGridEnabled() && graph.isGridEnabledEvent(evt);
        var hideGuide = true;

        // Grid and guides
        if (
          this.currentGuide != null &&
          this.currentGuide.isEnabledForEvent(evt)
        ) {
          // LATER: HTML preview appears smaller than SVG preview
          var w = parseInt(this.previewElement.style.width);
          var h = parseInt(this.previewElement.style.height);
          var bounds = new mxRectangle(0, 0, w, h);
          var delta = new mxPoint(x, y);
          delta = this.currentGuide.move(bounds, delta, gridEnabled, true);
          hideGuide = false;
          x = delta.x;
          y = delta.y;
        } else if (gridEnabled) {
          var scale = graph.view.scale;
          var tr = graph.view.translate;
          var off = graph.gridSize / 2;
          x = (graph.snap(x / scale - tr.x - off) + tr.x) * scale;
          y = (graph.snap(y / scale - tr.y - off) + tr.y) * scale;
        }

        if (this.currentGuide != null && hideGuide) {
          this.currentGuide.hide();
        }
        if (this.previewOffset != null) {
          x += this.previewOffset.x;
          y += this.previewOffset.y;
        }

        this.previewElement.style.left = Math.round(x) + "px";
        this.previewElement.style.top = Math.round(y) + "px";
        this.previewElement.style.visibility = "visible";
      }
      this.currentPoint = new mxPoint(x, y);
    };
    iconDiv.appendChild(icon);
    toolDiv.appendChild(iconDiv);
    tool.push(iconDiv);
  });
  graph.view.graph.container.appendChild(toolDiv);
}

export function removeToolDivCell() {
  if (
    visibility &&
    dummy_graph &&
    toolDiv.parentNode === dummy_graph.view.graph.container
  ) {
    dummy_graph.view.graph.container.removeChild(toolDiv);
    clearOldValues();
    visibility = false;
  }
}
