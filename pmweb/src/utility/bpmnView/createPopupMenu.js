import {
  AddVertexType,
  artifacts,
  cellSize,
  defaultShapeVertex,
  graphGridSize,
  gridSize,
  heightForDefaultVertex,
  maxLabelCharacter,
  milestoneTitleWidth,
  style,
  swimlaneTitleWidth,
  widthForDefaultVertex,
} from "../../Constants/bpmnView";
import { getFullWidth } from "../abstarctView/addWorkstepAbstractView";
import { getActivityProps } from "../abstarctView/getActivityProps";
import { getActivityQueueObj } from "../abstarctView/getActivityQueueObj";
import { PasteActivity } from "../CommonAPICall/PasteActivity";
import { PasteEmbeddedActivity } from "../CommonAPICall/PasteEmbeddedActivity";
import {
  checkStyle,
  replaceNChars,
} from "../CommonFunctionCall/CommonFunctionCall";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";
import { getExpandedSubprocess } from "./getExpandedSubprocess";
import { getMilestoneAt } from "./getMilestoneAt";
import { getSwimlaneAt } from "./getSwimlaneAt";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxGeometry = mxgraphobj.mxGeometry;

export function createPopupMenu(
  graph,
  menu,
  setProcessData,
  setNewId,
  translation,
  caseEnabled
) {
  if (
    (graph?.copiedCell &&
      graph?.copiedCell !== null &&
      graph?.copiedCell !== undefined &&
      graph?.copiedCell?.geometry !== null) ||
    menu
  ) {
    let x = menu
      ? Math.floor(menu.triggerX / graphGridSize) * graphGridSize
      : graph?.copiedCell?.geometry?.x +
        graph?.copiedCell?.parent?.geometry?.x +
        graphGridSize;
    let y = menu
      ? Math.floor(menu.triggerY / graphGridSize) * graphGridSize
      : graph?.copiedCell?.geometry?.y +
        graph?.copiedCell?.parent?.geometry?.y +
        graphGridSize;
    let isExpandedProcessPresent = getExpandedSubprocess(x, y, null, graph);
    if (
      graph.copiedCell.style !== style.taskTemplate &&
      graph.copiedCell.style !== style.processTask &&
      graph.copiedCell.style !== style.newTask &&
      !graph.copiedCell.style.includes(style.swimlane) &&
      graph.copiedCell.style !== style.tasklane &&
      !graph.copiedCell.style.includes(style.swimlane_collapsed) &&
      graph.copiedCell.style !== style.tasklane_collapsed &&
      graph.copiedCell.style !== style.milestone &&
      graph.copiedCell.style !== style.expandedEmbeddedProcess &&
      !artifacts.includes(graph.copiedCell.style) &&
      graph.copiedCell.style !== style.subProcess && // code added on 31 Jan 2023 for BugId 122911
      ((isExpandedProcessPresent &&
        graph.copiedCell.style !== style.embStartEvent &&
        graph.copiedCell.style !== style.embEndEvent) ||
        isExpandedProcessPresent === null) // code added on 2 March 2023 for BugId 124586
    ) {
      menu.addItem(translation("paste"), null, () =>
        pasteFunction(
          graph,
          menu,
          setProcessData,
          setNewId,
          translation,
          caseEnabled
        )
      );
    }
  }
}

export function pasteFunction(
  graph,
  menu,
  setProcessData,
  setNewId,
  translation,
  caseEnabled
) {
  let copiedCell = graph.copiedCell;
  if (
    (copiedCell && copiedCell !== null && copiedCell !== undefined && copiedCell?.geometry !== null) ||
    menu
  ) {
    let x = menu
      ? Math.floor(menu.triggerX / graphGridSize) * graphGridSize
      : copiedCell?.geometry?.x +
        copiedCell?.parent?.geometry?.x +
        graphGridSize;
    let y = menu
      ? Math.floor(menu.triggerY / graphGridSize) * graphGridSize
      : copiedCell?.geometry?.y +
        copiedCell?.parent?.geometry?.y +
        graphGridSize;
    let isExpandedProcessPresent = getExpandedSubprocess(x, y, null, graph);
    if (
      copiedCell.style !== style.taskTemplate &&
      copiedCell.style !== style.processTask &&
      copiedCell.style !== style.newTask &&
      !copiedCell.style.includes(style.swimlane) &&
      copiedCell.style !== style.tasklane &&
      !copiedCell.style.includes(style.swimlane_collapsed) &&
      copiedCell.style !== style.tasklane_collapsed &&
      copiedCell.style !== style.milestone &&
      copiedCell.style !== style.expandedEmbeddedProcess &&
      !artifacts.includes(copiedCell.style) &&
      copiedCell.style !== style.subProcess && // code added on 31 Jan 2023 for BugId 122911
      ((isExpandedProcessPresent &&
        graph.copiedCell.style !== style.embStartEvent &&
        graph.copiedCell.style !== style.embEndEvent) ||
        isExpandedProcessPresent === null) // code added on 2 March 2023 for BugId 124586
    ) {
      let mileStoneWidthIncreasedFlag = false;
      let laneHeightIncreasedFlag = false;
      let mileStoneInfo = {};
      let lanesInfo = {};
      let mileAtXY = getMilestoneAt(x, y);
      let swimlaneAtXY = getSwimlaneAt(x, y, AddVertexType);
      let parentCell = isExpandedProcessPresent
        ? isExpandedProcessPresent
        : swimlaneAtXY;
      let vertexX = isExpandedProcessPresent
        ? x - isExpandedProcessPresent.geometry.x + graphGridSize
        : x - mileAtXY.geometry.x + gridSize;
      let vertexY = y - parentCell.geometry.y;
      let parentCellId = parseInt(swimlaneAtXY.getId());
      let mileId = parseInt(mileAtXY.getId());
      let vertex = new mxgraphobj.mxCell(
        "",
        new mxGeometry(0, 0, cellSize.w, cellSize.h),
        copiedCell.getStyle()
      );
      vertex.setVertex(true);
      //if drop is near border, stretch border so that the vertex is completely
      //inside milestone/swimlane
      let newWidth = 0;
      let newHeight = 0;
      let newActivityId = 0;
      let processDefId, processName;
      let mileIndex,
        MaxseqId = 0,
        queueInfo,
        newProcessData,
        mileWidth = 0,
        isActExpanded = null,
        expandedHeight = 0,
        expandedWidth = 0,
        isHeightUpdated = false;
      let activityType,
        activitySubType,
        actName = "";
      let embeddedObj = [];
      let laneHeight = milestoneTitleWidth;
      let isLaneFound = false,
        parentActivity,
        expandedActWidth,
        expandedActHeight,
        parentLaneSeq = null,
        expandedActMile = null,
        isActYTopExpanded = false,
        isActXLeftExpanded = false,
        nextLanes = [];
      setNewId((oldIds) => {
        newActivityId = oldIds.activityId + 1;
        return { ...oldIds, activityId: newActivityId };
      });
      setProcessData((prevProcessData) => {
        newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        newProcessData.MileStones?.forEach((mile) => {
          mile.Activities?.forEach((act) => {
            if (act.ActivityId === copiedCell.id) {
              activityType = act.ActivityType;
              activitySubType = act.ActivitySubType;
              actName = act.ActivityName;
            }
            if (act.EmbeddedActivity) {
              act.EmbeddedActivity[0]?.forEach((embAct) => {
                if (embAct.ActivityId === copiedCell.id) {
                  activityType = embAct.ActivityType;
                  activitySubType = embAct.ActivitySubType;
                  actName = embAct.ActivityName;
                }
              });
            }
            if (
              isExpandedProcessPresent &&
              +isExpandedProcessPresent?.embeddedId === +act.ActivityId
            ) {
              parentActivity = act;
              expandedActWidth = act.Width;
              expandedActHeight = act.Height;
            }
          });
        });
        return prevProcessData;
      });
      // code edited on 9 Feb 2023 for BugId 122819
      let newActName =
        actName.length >= maxLabelCharacter
          ? replaceNChars(
              actName,
              `_${newActivityId}`,
              `_${newActivityId}`.length
            )
          : actName + "_" + newActivityId;
      queueInfo = getActivityQueueObj(
        setNewId,
        activityType,
        activitySubType,
        newActName,
        newProcessData,
        parentCellId,
        translation
      );

      // code edited on 10 March 2023 for BugId 124605 and BugId 124722
      setProcessData((prevProcessData) => {
        //do not do shallow copy process Data, else original state will get change
        let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        processDefId = newProcessData.ProcessDefId;
        processName = newProcessData.ProcessName;
        newProcessData.MileStones = JSON.parse(
          JSON.stringify(prevProcessData.MileStones)
        );
        newProcessData.Lanes = JSON.parse(
          JSON.stringify(prevProcessData.Lanes)
        );
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
                    MaxseqId = +embAct.SequenceId;
                  }
                });
              }
            });
          }
          milestone?.Activities?.forEach((activity) => {
            if (+activity.hide === +activity.ActivityId) {
              isActExpanded = activity;
              expandedHeight = +activity.Height;
              expandedWidth = +activity.Width;
              expandedActMile = milestone.iMileStoneId;
            }
          });
        });
        newWidth =
          isExpandedProcessPresent !== null
            ? Math.max(
                expandedActWidth,
                vertexX +
                  (checkStyle(defaultShapeVertex, graph.copiedCell.style)
                    ? widthForDefaultVertex + gridSize
                    : cellSize.w + gridSize)
              )
            : isActExpanded
            ? Math.max(
                mileAtXY.geometry.width - expandedWidth + widthForDefaultVertex,
                vertexX +
                  (checkStyle(defaultShapeVertex, copiedCell.getStyle())
                    ? widthForDefaultVertex
                    : cellSize.w)
              )
            : Math.max(
                mileAtXY.geometry.width,
                vertexX +
                  (checkStyle(defaultShapeVertex, copiedCell.getStyle())
                    ? widthForDefaultVertex
                    : cellSize.w)
              );
        newHeight =
          isExpandedProcessPresent !== null
            ? Math.max(
                expandedActHeight,
                vertexY +
                  (checkStyle(defaultShapeVertex, graph.copiedCell.style)
                    ? heightForDefaultVertex + gridSize
                    : cellSize.h + gridSize)
              )
            : isActExpanded && isActExpanded.LaneId === swimlaneAtXY.id
            ? Math.max(
                swimlaneAtXY.geometry.height -
                  expandedHeight +
                  heightForDefaultVertex,
                y -
                  swimlaneAtXY.geometry.y +
                  (checkStyle(defaultShapeVertex, copiedCell.getStyle())
                    ? heightForDefaultVertex + gridSize
                    : cellSize.h + gridSize)
              )
            : Math.max(
                swimlaneAtXY.geometry.height,
                y -
                  swimlaneAtXY.geometry.y +
                  (checkStyle(defaultShapeVertex, copiedCell.getStyle())
                    ? heightForDefaultVertex + gridSize
                    : cellSize.h + gridSize)
              );
        if (isExpandedProcessPresent === null) {
          newProcessData.Lanes?.forEach((lane) => {
            if (lane.LaneId === parentCell.id) {
              isLaneFound = true;
              parentLaneSeq = lane.LaneSeqId;
            }
            if (!isLaneFound) {
              if ((!caseEnabled && lane.LaneId !== -99) || caseEnabled) {
                if (
                  isActExpanded !== null &&
                  +lane.LaneId === +isActExpanded?.LaneId
                ) {
                  isHeightUpdated = true;
                }
                laneHeight = laneHeight + +lane.Height;
              }
            }
          });
        }

        // code when embedded subprocess is copied and pasted, which is not available as of now.
        // if (+activityType === 35 && +activitySubType === 1) {
        //   newProcessData.MileStones?.forEach((milestone) => {
        //     if (milestone.iMileStoneId === mileId) {
        //       milestone?.Activities?.forEach((activity) => {
        //         if (activity.ActivityId === copiedCell.id) {
        //           activity.EmbeddedActivity[0]?.forEach((embAct, index) => {
        //             let queueInfo = getActivityQueueObj(
        //               setNewId,
        //               embAct.ActivityType,
        //               embAct.ActivitySubType,
        //               embAct.ActivityName + "_" + (newActivityId + index + 1),
        //               newProcessData,
        //               parentCellId,
        //               translation
        //             );
        //             embeddedObj.push({
        //               ...embAct,
        //               ActivityId: newActivityId + index + 1,
        //               ActivityName:
        //                 embAct.ActivityName + "_" + (newActivityId + index + 1),
        //               LaneId: parentCellId,
        //               QueueId: queueInfo.queueId,
        //               QueueInfo: queueInfo,
        //               SequenceId: +MaxseqId + index + 2,
        //             });
        //           });
        //         }
        //       });
        //     }
        //   });
        // }
        //assumption that each milestone have unique iMilestoneId
        newProcessData.MileStones = newProcessData.MileStones.map(
          (milestone, index) => {
            if (isExpandedProcessPresent === null) {
              milestone["oldWidth"] = milestone.Width;
              if (milestone.iMileStoneId === mileId) {
                mileIndex = index;
                let tempActArr = [...milestone.Activities];
                if (
                  isActExpanded &&
                  +newWidth !==
                    +milestone.Width - expandedWidth + widthForDefaultVertex
                ) {
                  mileStoneWidthIncreasedFlag = true;
                  isActExpanded = {
                    ...isActExpanded,
                    mileId: milestone.iMileStoneId,
                    mileSeqId: milestone.SequenceId,
                  };
                  // code edited on 28 Feb 2023 for BugId 124065
                  milestone.widthUpdated = true;
                  milestone.newWidth =
                    newWidth - expandedWidth + widthForDefaultVertex;
                  if (newWidth > +milestone.Width) {
                    milestone.Width = newWidth + "";
                  }
                } else if (
                  isActExpanded === null &&
                  +newWidth !== +milestone.Width
                ) {
                  mileStoneWidthIncreasedFlag = true;
                  milestone.Width = newWidth + "";
                }
                let newActObj = {};
                if (+activityType === 35 && +activitySubType === 1) {
                  newActObj = {
                    ActivityId: newActivityId,
                    ActivityName: newActName,
                    ActivityType: activityType,
                    ActivitySubType: activitySubType,
                    LaneId: parentCellId,
                    xLeftLoc: vertexX,
                    yTopLoc: +laneHeight + vertexY,
                    isActive: "true",
                    BlockId: 0,
                    CheckedOut: "",
                    Color: "1234",
                    FromRegistered: "N",
                    EmbeddedActivity: [embeddedObj],
                    QueueCategory: "",
                    QueueId: queueInfo.queueId,
                    SequenceId: +MaxseqId + 1,
                    id: "",
                    AssociatedTasks: [],
                  };
                } else {
                  newActObj = {
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
                }
                if (
                  isActExpanded !== null &&
                  +newActObj.LaneId === +isActExpanded?.LaneId &&
                  +milestone.iMileStoneId === +expandedActMile
                ) {
                  let activityWidth = checkStyle(
                    defaultShapeVertex,
                    getActivityProps(
                      newActObj.ActivityType,
                      newActObj.ActivitySubType
                    )[5]
                  )
                    ? widthForDefaultVertex
                    : gridSize;
                  let activityHeight = checkStyle(
                    defaultShapeVertex,
                    getActivityProps(
                      newActObj.ActivityType,
                      newActObj.ActivitySubType
                    )[5]
                  )
                    ? heightForDefaultVertex
                    : gridSize;
                  if (
                    +newActObj.yTopLoc -
                      expandedHeight +
                      heightForDefaultVertex >
                      isActExpanded?.yTopLoc &&
                    ((+newActObj.xLeftLoc <=
                      isActExpanded?.xLeftLoc + expandedWidth &&
                      +newActObj.xLeftLoc >= isActExpanded?.xLeftLoc) ||
                      (+newActObj.xLeftLoc + activityWidth <=
                        isActExpanded?.xLeftLoc + expandedWidth &&
                        +newActObj.xLeftLoc + activityWidth >=
                          isActExpanded?.xLeftLoc))
                  ) {
                    isActYTopExpanded = true;
                  }
                  // code edited on 9 March 2023 for BugId 124704
                  if (
                    +newActObj.xLeftLoc -
                      expandedWidth +
                      widthForDefaultVertex >
                      +isActExpanded.xLeftLoc &&
                    (+newActObj.yTopLoc >= +isActExpanded.yTopLoc ||
                      +newActObj.yTopLoc + activityHeight >=
                        +isActExpanded.yTopLoc) &&
                    (+newActObj.yTopLoc <=
                      +isActExpanded.yTopLoc + expandedHeight ||
                      +newActObj.yTopLoc + activityHeight <=
                        +isActExpanded.yTopLoc + expandedHeight)
                  ) {
                    isActXLeftExpanded = true;
                    newActObj.isActXLeftExpanded = true;
                  }
                }
                tempActArr.push(newActObj);
                return { ...milestone, Activities: [...tempActArr] };
              }
              if (!mileIndex) {
                mileWidth = mileWidth + +milestone.Width;
              }
              return milestone;
            } else {
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
                      Height: newHeight,
                      Width: newWidth,
                      EmbeddedActivityType: "I", // code added on 1 March 2023 for BugId 124474
                    };
                    embActivities = [
                      ...activity.EmbeddedActivity[0],
                      newActObj,
                    ];
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
                    milestone.Width =
                      milestone.Width + +newWidth - +expandedActWidth;
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
            }
          }
        );

        if (isExpandedProcessPresent === null) {
          if (mileStoneWidthIncreasedFlag) {
            mileStoneInfo = {
              arrMilestoneInfos: newProcessData.MileStones?.map(
                (mile, index) => {
                  return {
                    milestoneId: mile.iMileStoneId,
                    milestoneName: mile.MileStoneName,
                    width:
                      isActExpanded &&
                      isActExpanded.mileId === mile.iMileStoneId
                        ? newWidth - expandedWidth + widthForDefaultVertex
                        : mile.Width,
                    oldWidth:
                      isActExpanded &&
                      isActExpanded?.mileId === mile.iMileStoneId
                        ? mile.oldWidth - expandedWidth + widthForDefaultVertex
                        : mile.oldWidth,
                    activities: mile.Activities?.map((act) => {
                      if (
                        isActExpanded &&
                        ((isActExpanded?.mileId === mile.iMileStoneId &&
                          +act.xLeftLoc >
                            +isActExpanded.xLeftLoc + expandedWidth &&
                          +act.LaneId === +isActExpanded.LaneId) ||
                          +isActExpanded?.mileSeqId < +mile.SequenceId)
                      ) {
                        return {
                          actId: act.ActivityId,
                          xLeftLoc:
                            +getFullWidth(index, newProcessData) +
                            +act.xLeftLoc -
                            expandedWidth +
                            widthForDefaultVertex +
                            "",
                        };
                      } else {
                        return {
                          actId: act.ActivityId,
                          xLeftLoc:
                            +getFullWidth(index, newProcessData) +
                            +act.xLeftLoc +
                            "",
                        };
                      }
                    }),
                  };
                }
              ),
            };
          }

          //change height of swimlane , if drop is near boundary
          newProcessData.Lanes?.forEach((swimlane, index) => {
            swimlane["oldHeight"] = swimlane.Height;
            if (swimlane.LaneId === parentCellId) {
              newProcessData.Lanes[index] = { ...swimlane };
              // code edited on 28 Feb 2023 for BugId 124065
              if (
                isActExpanded &&
                +newHeight !==
                  +swimlane.Height - expandedHeight + heightForDefaultVertex
              ) {
                laneHeightIncreasedFlag = true;
                if (newHeight > +swimlane.Height) {
                  newProcessData.Lanes[index].Height = newHeight + "";
                  newProcessData.Lanes[index].updatedHeight =
                    newHeight - expandedHeight + heightForDefaultVertex;
                  newProcessData.Lanes[index].newHeight =
                    newHeight - expandedHeight + heightForDefaultVertex;
                } else {
                  newProcessData.Lanes[index].updatedHeight =
                    +swimlane.Height - expandedHeight + heightForDefaultVertex;
                  newProcessData.Lanes[index].newHeight =
                    +swimlane.Height - expandedHeight + heightForDefaultVertex;
                }
                newProcessData.Lanes[index].heightUpdated = true;
              } else if (
                isActExpanded === null &&
                +newHeight !== +parentCell.geometry.height
              ) {
                laneHeightIncreasedFlag = true;
                newProcessData.Lanes[index].Height = newHeight + "";
                newProcessData.Lanes[index].updatedHeight = newHeight;
              }
            }
            if (
              +swimlane.LaneSeqId > +parentLaneSeq &&
              !nextLanes.includes(swimlane.LaneId)
            ) {
              nextLanes.push(swimlane.LaneId);
            }
          });
          if (laneHeightIncreasedFlag) {
            lanesInfo = {
              arrLaneInfos: newProcessData.Lanes?.map((lane) => {
                return {
                  laneId: lane.LaneId,
                  laneName: lane.LaneName,
                  laneSeqId: lane.LaneSeqId,
                  height:
                    isActExpanded && isActExpanded.LaneId === lane.LaneId
                      ? lane.updatedHeight
                      : lane.Height, // code edited on 28 Feb 2023 for BugId 124065
                  oldHeight:
                    isActExpanded && isActExpanded.LaneId === lane.LaneId
                      ? lane.oldHeight - expandedHeight + heightForDefaultVertex
                      : lane.oldHeight, // code edited on 28 Feb 2023 for BugId 124065
                  width: lane.Width,
                  oldWidth: lane.Width,
                };
              }),
            };
            newProcessData.MileStones?.forEach((mile, mileIdx) => {
              mile.Activities.forEach((act, actidx) => {
                if (nextLanes.includes(act.LaneId)) {
                  // code edited on 28 Feb 2023 for BugId 124065
                  if (
                    (isActExpanded &&
                      isActExpanded.LaneId === swimlaneAtXY.id &&
                      newHeight > +parentCell.geometry.height) ||
                    isActExpanded === null
                  ) {
                    newProcessData.MileStones[mileIdx].Activities[
                      actidx
                    ].yTopLoc =
                      +act.yTopLoc + +newHeight - +parentCell.geometry.height;
                  }
                }
              });
            });
          }
        } else {
          newProcessData.Lanes?.forEach((swimlane, index) => {
            swimlane["oldHeight"] = swimlane.Height;
            if (+swimlane.LaneId === +parentActivity.LaneId) {
              newProcessData.Lanes[index].Height =
                swimlane.Height + +newHeight - +expandedActHeight + "";
            }
          });
        }

        return newProcessData;
      });

      vertex.geometry.x = dimensionInMultipleOfGridSize(x) - swimlaneTitleWidth;
      vertex.geometry.y = dimensionInMultipleOfGridSize(vertexY);
      if (checkStyle(defaultShapeVertex, copiedCell.getStyle())) {
        vertex.geometry.width = widthForDefaultVertex;
        vertex.geometry.height = heightForDefaultVertex;
      } else {
        vertex.geometry.width = gridSize;
        vertex.geometry.height = gridSize;
      }
      // code edited on 10 March 2023 for BugId 124605 and BugId 124722
      if (isExpandedProcessPresent !== null) {
        parentCell.geometry.width = newWidth;
        parentCell.geometry.height = newHeight;
      }
      parentCell.insert(vertex);
      vertex.value = newActName;
      vertex.id = newActivityId;
      graph.setSelectionCell(vertex);
      // code when embedded subprocess is copied and pasted, which is not available as of now.
      if (+activityType === 35 && +activitySubType === 1) {
        let embArr = embeddedObj.map((embAct) => {
          return {
            processDefId: processDefId,
            processName: processName,
            actName: embAct.ActivityName,
            actId: embAct.ActivityId,
            actType: embAct.ActivityType,
            actSubType: embAct.ActivitySubType,
            actAssocId: 0,
            seqId: embAct.SequenceId,
            laneId: embAct.LaneId,
            blockId: 0,
            queueId: embAct.QueueId,
            queueInfo: embAct.QueueInfo,
            queueExist: embAct.QueueInfo?.queueExist,
            xLeftLoc: embAct.xLeftLoc,
            yTopLoc: embAct.yTopLoc,
            milestoneId: mileId,
            parentActivityId: +newActivityId,
          };
        });
        PasteEmbeddedActivity(
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
            queueInfo: queueInfo,
            xLeftLoc: mileIndex === 0 ? vertexX : +mileWidth + vertexX,
            yTopLoc: isHeightUpdated
              ? +laneHeight +
                vertexY -
                expandedHeight +
                heightForDefaultVertex +
                ""
              : +laneHeight + vertexY,
            view: "BPMN",
          },
          { mileId: mileId, mileIndex: mileIndex },
          setProcessData,
          vertexX,
          embArr,
          copiedCell.value,
          copiedCell.id,
          mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
          laneHeightIncreasedFlag ? lanesInfo : null
        );
      } else {
        PasteActivity(
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
            queueInfo: queueInfo,
            xLeftLoc:
              isExpandedProcessPresent !== null
                ? vertexX
                : mileIndex === 0
                ? isActXLeftExpanded
                  ? vertexX - expandedWidth + widthForDefaultVertex
                  : vertexX
                : isActXLeftExpanded
                ? +mileWidth + vertexX - expandedWidth + widthForDefaultVertex
                : +mileWidth + vertexX,
            yTopLoc:
              isExpandedProcessPresent !== null
                ? vertexY
                : isHeightUpdated || isActYTopExpanded
                ? +laneHeight +
                  vertexY -
                  expandedHeight +
                  heightForDefaultVertex +
                  ""
                : +laneHeight + vertexY,
            view: "BPMN",
          },
          { mileId: mileId, mileIndex: mileIndex },
          setProcessData,
          vertexX,
          copiedCell.value,
          copiedCell.id,
          mileStoneWidthIncreasedFlag && isExpandedProcessPresent === null
            ? mileStoneInfo
            : null,
          laneHeightIncreasedFlag && isExpandedProcessPresent === null
            ? lanesInfo
            : null,
          isExpandedProcessPresent
            ? isExpandedProcessPresent?.embeddedId
            : null,
          isExpandedProcessPresent ? newWidth : null,
          isExpandedProcessPresent ? newHeight : null
        );
      }
      graph.copiedCell = null;
    }
  }
}
