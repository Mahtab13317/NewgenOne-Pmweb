import { getMilestoneAt } from "./getMilestoneAt";
import { isAllowedOutsideMilestone } from "./dropOutsideMilestone";
import disabledIcon from "../../assets/bpmnView/cancelIcon.png";
import {
  graphGridSize,
  gridStartPoint,
  style,
  gridSize,
  cellSize,
  swimlaneTitleWidth,
  milestoneTitleWidth,
  defaultShapeVertex,
  widthForDefaultVertex,
  heightForDefaultVertex,
  MoveVertexType,
  artifacts,
  activitiesNotAllowedInEmbedded,
} from "../../Constants/bpmnView";
import { getSwimlaneAt, getTasklaneAt } from "./getSwimlaneAt";
import { getActivityAt, getTaskAt } from "./getActivityAt";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";
import axios from "axios";
import {
  SERVER_URL,
  ENDPOINT_MOVEACTIVITY,
  ENDPOINT_UPDATE_ACTIVITY,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  ENDPOINT_MOVE_CONNECTION,
} from "../../Constants/appConstants";
import {
  getExpandedSubprocess,
  isSubprocessExpanded,
} from "./getExpandedSubprocess";
import { getFullWidth } from "../abstarctView/addWorkstepAbstractView";
import { MoveTask } from "../CommonAPICall/MoveTask";
import { MoveDataObject } from "../CommonAPICall/MoveDataObject";
import { MoveMsgAF } from "../CommonAPICall/MoveMSGAFs";
import { MoveAnnotation } from "../CommonAPICall/MoveAnnotation";
import { MoveGroupBox } from "../CommonAPICall/MoveGroupBox";
import {
  checkIfParentSwimlaneCheckedOut,
  checkIfSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { getGroupBoxAt } from "./getGroupBoxAt";
import { getActivityProps } from "../abstarctView/getActivityProps";
import { LatestVersionOfProcess } from "../abstarctView/checkLatestVersion";
import { checkStyle } from "../CommonFunctionCall/CommonFunctionCall";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxUtils = mxgraphobj.mxUtils;
const mxConstants = mxgraphobj.mxEvent;
const mxPoint = mxgraphobj.mxPoint;
const mxEvent = mxgraphobj.mxEvent;
const mxEventObject = mxgraphobj.mxEventObject;

export const cellRepositioned = (
  graph,
  setProcessData,
  caseEnabled,
  rootLayer,
  dispatch,
  translation
) => {
  // code edited on 22 April 2023 for BugId 127405 - not able to drop artifacts
  let targetMilestone = null;
  let targetSwimlane = null;
  let targetTasklane = null;
  let isActivityPresent = null;
  let isTasklanePresent = null;
  let isTaskPresent = null,
    isGroupBoxPresent = null;
  let isExpandedProcessPresent = null;
  let isEmbeddedSubprocessExpanded = false;
  let leftPos, topPos;
  let processData = {},
    processType;

  //to show preview with same size of activity in graph
  let div = document.createElement("div");
  div.setAttribute(
    "style",
    `border:1px dotted black;position:absolute;z-index:1;display:none;`
  );
  //dragElement to be used inside mouseMove function, if a cell is selected
  let dragElement = document.createElement("img");
  dragElement.setAttribute("alt", "");
  dragElement.style.width = "16px";
  dragElement.style.height = "16px";
  div.appendChild(dragElement);
  graph.container.appendChild(div);

  //code added on 3 Nov 2022 for BugId 117608
  //overwrites the cellsAdded function,to add the specified cells to the given parent. This method fires
  //<mxEvent.CELLS_ADDED> while the transaction is in progress
  graph.cellsAdded = function (cells, parent, index, source, target, absolute) {
    if (cells != null && parent != null && index != null) {
      this.model.beginUpdate();
      try {
        for (var i = 0; i < cells.length; i++) {
          if (cells[i] == null) {
            index--;
          } else {
            var previous = this.model.getParent(cells[i]);
            // Decrements all following indices
            // if cell is already in parent
            if (
              parent == previous &&
              index + i > this.model.getChildCount(parent)
            ) {
              index--;
            }

            this.model.add(parent, cells[i], index + i);

            if (this.autoSizeCellsOnAdd) {
              this.autoSizeCell(cells[i], true);
            }

            // Sets the source terminal
            if (source != null) {
              this.cellConnected(cells[i], source, true);
            }

            // Sets the target terminal
            if (target != null) {
              this.cellConnected(cells[i], target, false);
            }
          }
        }
        this.fireEvent(
          new mxEventObject(
            mxEvent.CELLS_ADDED,
            "cells",
            cells,
            "parent",
            parent,
            "index",
            index,
            "source",
            source,
            "target",
            target,
            "absolute",
            absolute
          )
        );
      } finally {
        this.model.endUpdate();
      }
    }
  };

  //overwrites the cellsMoved function,to update state for activities with its new position
  graph.translateCell = function (cell, dx, dy) {
    // code added on 20 Feb 2023 for BugId 124068
    div.style.display = "none";
    let laneHeightIncreasedFlag = false;
    let mileWidthIncreased = false;
    let mileStoneInfo = {};
    let lanesInfo = {};
    var geo = graph.model.getGeometry(cell);
    //do not translate for swimlane / milestone and edges
    if (
      graph.model.isEdge(cell) ||
      cell.style.includes(style.swimlane) ||
      cell.style === style.tasklane ||
      cell.style.includes(style.swimlane_collapsed) ||
      cell.style === style.tasklane_collapsed ||
      cell.style === style.milestone ||
      cell.style === "layer" ||
      cell.style === style.expandedEmbeddedProcess
    ) {
      return;
    }
    //code edited on 27 Jan 2023 for BugId 122912
    if (
      processType !== PROCESSTYPE_LOCAL &&
      processType !== PROCESSTYPE_LOCAL_CHECKED &&
      checkIfParentSwimlaneCheckedOut(processData, targetSwimlane?.id)
        ?.length === 0
    ) {
      return;
    }

    if (geo != null) {
      dx = parseFloat(dx);
      // dy = parseFloat(dy);
      geo = geo.clone();
      geo.translate(
        targetSwimlane ? leftPos - geo.x - gridSize : leftPos - geo.x,
        targetSwimlane
          ? topPos - targetSwimlane.geometry.y - geo.y
          : topPos - geo.y
      );
      if (
        !geo.relative &&
        graph.model.isVertex(cell) &&
        !graph.isAllowNegativeCoordinates()
      ) {
        geo.x = Math.max(0, parseFloat(geo.x));
        geo.y = Math.max(0, parseFloat(geo.y));
      }

      if (geo.relative && !graph.model.isEdge(cell)) {
        var parent = graph.model.getParent(cell);
        var angle = 0;
        if (graph.model.isVertex(parent)) {
          let currentCellStyle = graph.getCurrentCellStyle(parent);
          angle = mxUtils.getValue(
            currentCellStyle,
            mxConstants.STYLE_ROTATION,
            0
          );
        }
        if (angle != 0) {
          var rad = mxUtils.toRadians(-angle);
          var cos = Math.cos(rad);
          var sin = Math.sin(rad);
          var pt = mxUtils.getRotatedPoint(
            new mxPoint(dx, dy),
            cos,
            sin,
            new mxPoint(0, 0)
          );
          dx = pt.x;
          dy = pt.y;
        }
        if (geo.offset == null) {
          geo.offset = new mxPoint(dx, dy);
        } else {
          geo.offset.x = parseFloat(geo.offset.x) + dx;
          geo.offset.y = parseFloat(geo.offset.y) + dy;
        }
      }

      graph.model.setGeometry(cell, geo);

      let milestoneId, prevLaneId, xLeftLoc, yTopLoc;
      let xPos = leftPos;
      let yPos = topPos;
      //update the state as per the new geometry of cell
      setProcessData((prevProcessData) => {
        let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        let cellStyle = cell.getStyle();
        if (cellStyle === style.dataObject) {
          let laneHeight = 0,
            isLaneFound = false;
          let selectedDO = null,
            newDO = null;
          let newWidth = targetMilestone
            ? Math.max(
                targetMilestone.geometry.width,
                leftPos - targetMilestone.geometry.x + gridSize + cellSize.w
              )
            : null;
          let newHeight = targetSwimlane
            ? Math.max(
                targetSwimlane.geometry.height,
                topPos - targetSwimlane.geometry.y + cellSize.h + gridSize
              )
            : null;
          let mileIndex,
            mileWidth = 0,
            isActExpanded = null,
            expandedHeight = 0,
            isHeightUpdated = false;
          // code edited on 29 July 2022 for BugId 113146
          newProcessData.DataObjects = JSON.parse(
            JSON.stringify(prevProcessData.DataObjects)
          );
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (+activity.hide === +activity.ActivityId) {
                isActExpanded = activity;
                expandedHeight = +activity.Height;
              }
            });
          });
          if (
            targetSwimlane &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.Lanes?.forEach((lane) => {
              if (lane.LaneId === targetSwimlane.id) {
                isLaneFound = true;
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
          for (let itr of newProcessData.DataObjects) {
            if (itr.DataObjectId === parseInt(cell.getId())) {
              selectedDO = itr;
              //update x and y location value when id matches
              itr.yTopLoc =
                isExpandedProcessPresent !== null
                  ? yPos - isExpandedProcessPresent.geometry.y + ""
                  : targetSwimlane
                  ? yPos - targetSwimlane.geometry.y + laneHeight + ""
                  : yPos + "";
              itr.xLeftLoc = isExpandedProcessPresent
                ? xPos -
                  isExpandedProcessPresent.geometry.x -
                  gridStartPoint.x +
                  ""
                : xPos - gridStartPoint.x + "";
              itr.LaneId = targetSwimlane
                ? parseInt(targetSwimlane.getId())
                : 0;
              itr.ParentActivityId = isExpandedProcessPresent
                ? isExpandedProcessPresent.embeddedId
                : 0;
              newDO = itr;
              break;
            }
          }
          // code edited on 3 Jan 2023 for BugId 121670
          if (
            targetSwimlane &&
            targetMilestone &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.MileStones = newProcessData.MileStones.map(
              (milestone, index) => {
                milestone["oldWidth"] = milestone.Width;
                if (+milestone.iMileStoneId === +targetMilestone.id) {
                  mileIndex = index;
                  if (+newWidth !== +milestone.Width) {
                    mileWidthIncreased = true;
                    milestone.Width = newWidth + "";
                  }
                }
                if (!mileIndex) {
                  mileWidth = mileWidth + +milestone.Width;
                }
                return milestone;
              }
            );

            if (mileWidthIncreased) {
              mileStoneInfo = {
                arrMilestoneInfos: newProcessData.MileStones?.map(
                  (mile, index) => {
                    return {
                      milestoneId: mile.iMileStoneId,
                      milestoneName: mile.MileStoneName,
                      width: mile.Width,
                      oldWidth: mile.oldWidth,
                      activities: mile.Activities?.map((act) => {
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
            newProcessData.Lanes?.forEach((swimlane, index) => {
              swimlane["oldHeight"] = swimlane.Height;
              if (+swimlane.LaneId === +targetSwimlane.id) {
                newProcessData.Lanes[index] = { ...swimlane };
                if (+newHeight !== +targetSwimlane.geometry.height) {
                  laneHeightIncreasedFlag = true;
                  newProcessData.Lanes[index].Height = newHeight + "";
                }
              }
            });

            if (laneHeightIncreasedFlag) {
              lanesInfo = {
                arrLaneInfos: newProcessData.Lanes?.map((lane) => {
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
          }
          MoveDataObject(
            newProcessData.ProcessDefId,
            newProcessData.ProcessType,
            selectedDO.Data,
            selectedDO.DataObjectId,
            newDO.xLeftLoc,
            isHeightUpdated
              ? +newDO.yTopLoc - expandedHeight + heightForDefaultVertex + ""
              : newDO.yTopLoc,
            newDO.LaneId,
            setProcessData,
            selectedDO.xLeftLoc,
            selectedDO.yTopLoc,
            selectedDO.LaneId,
            mileWidthIncreased ? mileStoneInfo : null,
            laneHeightIncreasedFlag ? lanesInfo : null,
            isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : null
          );
        } else if (cellStyle === style.message) {
          let laneHeight = 0,
            isLaneFound = false;
          let selectedDO = null,
            newDO = null;
          let newWidth = targetMilestone
            ? Math.max(
                targetMilestone.geometry.width,
                leftPos - targetMilestone.geometry.x + gridSize + cellSize.w
              )
            : null;
          let newHeight = targetSwimlane
            ? Math.max(
                targetSwimlane.geometry.height,
                topPos - targetSwimlane.geometry.y + cellSize.h + gridSize
              )
            : null;
          let mileIndex,
            mileWidth = 0,
            isActExpanded = null,
            expandedHeight = 0,
            isHeightUpdated = false;
          // code edited on 29 July 2022 for BugId 113146
          newProcessData.MSGAFS = JSON.parse(
            JSON.stringify(prevProcessData.MSGAFS)
          );
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (+activity.hide === +activity.ActivityId) {
                isActExpanded = activity;
                expandedHeight = +activity.Height;
              }
            });
          });
          if (
            targetSwimlane &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.Lanes?.forEach((lane) => {
              if (lane.LaneId === targetSwimlane.id) {
                isLaneFound = true;
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
          for (let itr of newProcessData.MSGAFS) {
            if (itr.MsgAFId === parseInt(cell.getId())) {
              selectedDO = itr;
              //update x and y location value when id matches
              itr.yTopLoc =
                isExpandedProcessPresent !== null
                  ? yPos - isExpandedProcessPresent.geometry.y + ""
                  : targetSwimlane
                  ? yPos - targetSwimlane.geometry.y + laneHeight + ""
                  : yPos + "";
              itr.xLeftLoc = isExpandedProcessPresent
                ? xPos -
                  isExpandedProcessPresent.geometry.x -
                  gridStartPoint.x +
                  ""
                : xPos - gridStartPoint.x + "";
              itr.LaneId = targetSwimlane
                ? parseInt(targetSwimlane.getId())
                : 0;
              itr.ParentActivityId = isExpandedProcessPresent
                ? isExpandedProcessPresent.embeddedId
                : 0;
              newDO = itr;
              break;
            }
          }
          // code edited on 3 Jan 2023 for BugId 121670
          if (
            targetSwimlane &&
            targetMilestone &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.MileStones = newProcessData.MileStones.map(
              (milestone, index) => {
                milestone["oldWidth"] = milestone.Width;
                if (+milestone.iMileStoneId === +targetMilestone.id) {
                  mileIndex = index;
                  if (+newWidth !== +milestone.Width) {
                    mileWidthIncreased = true;
                    milestone.Width = newWidth + "";
                  }
                }
                if (!mileIndex) {
                  mileWidth = mileWidth + +milestone.Width;
                }
                return milestone;
              }
            );

            if (mileWidthIncreased) {
              mileStoneInfo = {
                arrMilestoneInfos: newProcessData.MileStones?.map(
                  (mile, index) => {
                    return {
                      milestoneId: mile.iMileStoneId,
                      milestoneName: mile.MileStoneName,
                      width: mile.Width,
                      oldWidth: mile.oldWidth,
                      activities: mile.Activities?.map((act) => {
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
            newProcessData.Lanes?.forEach((swimlane, index) => {
              swimlane["oldHeight"] = swimlane.Height;
              if (+swimlane.LaneId === +targetSwimlane.id) {
                newProcessData.Lanes[index] = { ...swimlane };
                if (+newHeight !== +targetSwimlane.geometry.height) {
                  laneHeightIncreasedFlag = true;
                  newProcessData.Lanes[index].Height = newHeight + "";
                }
              }
            });

            if (laneHeightIncreasedFlag) {
              lanesInfo = {
                arrLaneInfos: newProcessData.Lanes?.map((lane) => {
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
          }
          MoveMsgAF(
            newProcessData.ProcessDefId,
            newProcessData.ProcessType,
            selectedDO.MsgAFName,
            selectedDO.MsgAFId,
            newDO.xLeftLoc,
            isHeightUpdated
              ? +newDO.yTopLoc - expandedHeight + heightForDefaultVertex + ""
              : newDO.yTopLoc,
            newDO.LaneId,
            setProcessData,
            selectedDO.xLeftLoc,
            selectedDO.yTopLoc,
            selectedDO.LaneId,
            mileWidthIncreased ? mileStoneInfo : null,
            laneHeightIncreasedFlag ? lanesInfo : null,
            isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : null
          );
        } else if (cellStyle === style.textAnnotations) {
          let laneHeight = 0,
            isLaneFound = false;
          let selectedDO = null,
            newDO = null;
          let newWidth = targetMilestone
            ? Math.max(
                targetMilestone.geometry.width,
                leftPos - targetMilestone.geometry.x + gridSize + cellSize.w
              )
            : null;
          let newHeight = targetSwimlane
            ? Math.max(
                targetSwimlane.geometry.height,
                topPos - targetSwimlane.geometry.y + cellSize.h + gridSize
              )
            : null;
          let mileIndex,
            mileWidth = 0,
            isActExpanded = null,
            expandedHeight = 0,
            isHeightUpdated = false;
          // code edited on 29 July 2022 for BugId 113146
          newProcessData.Annotations = JSON.parse(
            JSON.stringify(prevProcessData.Annotations)
          );
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (+activity.hide === +activity.ActivityId) {
                isActExpanded = activity;
                expandedHeight = +activity.Height;
              }
            });
          });
          if (
            targetSwimlane &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.Lanes?.forEach((lane) => {
              if (lane.LaneId === targetSwimlane.id) {
                isLaneFound = true;
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
          for (let itr of newProcessData.Annotations) {
            if (itr.AnnotationId === parseInt(cell.getId())) {
              selectedDO = itr;
              //update x and y location value when id matches
              itr.yTopLoc =
                isExpandedProcessPresent !== null
                  ? yPos - isExpandedProcessPresent.geometry.y + ""
                  : targetSwimlane
                  ? yPos - targetSwimlane.geometry.y + laneHeight + ""
                  : yPos + "";
              itr.xLeftLoc = isExpandedProcessPresent
                ? xPos -
                  isExpandedProcessPresent.geometry.x -
                  gridStartPoint.x +
                  ""
                : xPos - gridStartPoint.x + "";
              itr.LaneId = targetSwimlane
                ? parseInt(targetSwimlane.getId())
                : 0;
              itr.ParentActivityId = isExpandedProcessPresent
                ? isExpandedProcessPresent.embeddedId
                : 0;
              newDO = itr;
              break;
            }
          }
          // code edited on 3 Jan 2023 for BugId 121670
          if (
            targetSwimlane &&
            targetMilestone &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.MileStones = newProcessData.MileStones.map(
              (milestone, index) => {
                milestone["oldWidth"] = milestone.Width;
                if (+milestone.iMileStoneId === +targetMilestone.id) {
                  mileIndex = index;
                  if (+newWidth !== +milestone.Width) {
                    mileWidthIncreased = true;
                    milestone.Width = newWidth + "";
                  }
                }
                if (!mileIndex) {
                  mileWidth = mileWidth + +milestone.Width;
                }
                return milestone;
              }
            );

            if (mileWidthIncreased) {
              mileStoneInfo = {
                arrMilestoneInfos: newProcessData.MileStones?.map(
                  (mile, index) => {
                    return {
                      milestoneId: mile.iMileStoneId,
                      milestoneName: mile.MileStoneName,
                      width: mile.Width,
                      oldWidth: mile.oldWidth,
                      activities: mile.Activities?.map((act) => {
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
            newProcessData.Lanes?.forEach((swimlane, index) => {
              swimlane["oldHeight"] = swimlane.Height;
              if (+swimlane.LaneId === +targetSwimlane.id) {
                newProcessData.Lanes[index] = { ...swimlane };
                if (+newHeight !== +targetSwimlane.geometry.height) {
                  laneHeightIncreasedFlag = true;
                  newProcessData.Lanes[index].Height = newHeight + "";
                }
              }
            });

            if (laneHeightIncreasedFlag) {
              lanesInfo = {
                arrLaneInfos: newProcessData.Lanes?.map((lane) => {
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
          }
          MoveAnnotation(
            newProcessData.ProcessDefId,
            newProcessData.ProcessType,
            selectedDO.Comment,
            selectedDO.AnnotationId,
            newDO.xLeftLoc,
            isHeightUpdated
              ? +newDO.yTopLoc - expandedHeight + heightForDefaultVertex + ""
              : newDO.yTopLoc,
            selectedDO.Height,
            selectedDO.Width,
            newDO.LaneId,
            setProcessData,
            selectedDO.xLeftLoc,
            selectedDO.yTopLoc,
            selectedDO.LaneId,
            mileWidthIncreased ? mileStoneInfo : null,
            laneHeightIncreasedFlag ? lanesInfo : null,
            isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : null
          );
        } else if (cellStyle === style.groupBox) {
          let laneHeight = 0,
            isLaneFound = false;
          let selectedDO = null,
            newDO = null;
          let mileWidth = 0,
            isActExpanded = null,
            expandedHeight = 0,
            isHeightUpdated = false,
            actArr = [];
          // code edited on 29 July 2022 for BugId 113146
          newProcessData.GroupBoxes = JSON.parse(
            JSON.stringify(prevProcessData.GroupBoxes)
          );
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (+activity.hide === +activity.ActivityId) {
                isActExpanded = activity;
                expandedHeight = +activity.Height;
              }
            });
          });
          if (
            targetSwimlane &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.Lanes?.forEach((lane) => {
              if (lane.LaneId === targetSwimlane.id) {
                isLaneFound = true;
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
          for (let itr of newProcessData.GroupBoxes) {
            if (itr.GroupBoxId === parseInt(cell.getId())) {
              selectedDO = itr;
              //update x and y location value when id matches
              itr.ITop =
                isExpandedProcessPresent !== null
                  ? yPos - isExpandedProcessPresent.geometry.y + ""
                  : targetSwimlane
                  ? yPos - targetSwimlane.geometry.y + laneHeight + ""
                  : yPos + "";
              itr.ILeft = isExpandedProcessPresent
                ? xPos - isExpandedProcessPresent.geometry.x + ""
                : xPos - gridStartPoint.x + "";
              itr.LaneId = targetSwimlane
                ? parseInt(targetSwimlane.getId())
                : 0;
              itr.ParentActivityId = isExpandedProcessPresent
                ? isExpandedProcessPresent.embeddedId
                : 0;
              newDO = itr;
              break;
            }
          }
          let newHeight = Math.max(
            targetSwimlane.geometry.height,
            topPos -
              targetSwimlane.geometry.y +
              +selectedDO.GroupBoxHeight +
              gridSize
          );
          // code edited on 3 Jan 2023 for BugId 121670
          if (
            targetSwimlane &&
            targetMilestone &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.MileStones = newProcessData.MileStones.map(
              (milestone, index) => {
                milestone["oldWidth"] = milestone.Width;
                let tempActArr = [...milestone.Activities];
                milestone?.Activities?.forEach((act, index) => {
                  if (
                    isGroupBoxPresent !== null &&
                    +act.BlockId === +isGroupBoxPresent.id
                  ) {
                    tempActArr[index].BlockId = 0;
                  }
                  if (+act.LaneId === +targetSwimlane.id) {
                    let actStyle = getActivityProps(
                      act.ActivityType,
                      act.ActivitySubType
                    )[5];
                    let actWidth = checkStyle(defaultShapeVertex, actStyle)
                      ? widthForDefaultVertex
                      : gridSize;
                    let actHeight = checkStyle(defaultShapeVertex, actStyle)
                      ? heightForDefaultVertex
                      : gridSize;
                    if (
                      +act.xLeftLoc + mileWidth > xPos - gridStartPoint.x &&
                      +act.xLeftLoc + mileWidth <
                        xPos - gridStartPoint.x + +selectedDO.GroupBoxWidth
                    ) {
                      if (
                        (+act.yTopLoc - laneHeight >
                          yPos - targetSwimlane.geometry.y &&
                          +act.yTopLoc - laneHeight <
                            yPos -
                              targetSwimlane.geometry.y +
                              +selectedDO.GroupBoxHeight) ||
                        (+act.yTopLoc - laneHeight + actHeight >
                          yPos - targetSwimlane.geometry.y &&
                          +act.yTopLoc - laneHeight + actHeight <
                            yPos -
                              targetSwimlane.geometry.y +
                              +selectedDO.GroupBoxHeight)
                      ) {
                        actArr.push({
                          actId: act.ActivityId,
                        });
                        tempActArr[index].BlockId = cell.getId();
                      }
                    } else if (
                      +act.xLeftLoc + mileWidth + actWidth >
                        xPos - gridStartPoint.x &&
                      +act.xLeftLoc + mileWidth + actWidth <
                        xPos - gridStartPoint.x + +selectedDO.GroupBoxWidth
                    ) {
                      if (
                        (+act.yTopLoc - laneHeight >
                          yPos - targetSwimlane.geometry.y &&
                          +act.yTopLoc - laneHeight <
                            yPos -
                              targetSwimlane.geometry.y +
                              +selectedDO.GroupBoxHeight) ||
                        (+act.yTopLoc - laneHeight + actHeight >
                          yPos - targetSwimlane.geometry.y &&
                          +act.yTopLoc - laneHeight + actHeight <
                            yPos -
                              targetSwimlane.geometry.y +
                              +selectedDO.GroupBoxHeight)
                      ) {
                        actArr.push({
                          actId: act.ActivityId,
                        });
                        tempActArr[index].BlockId = cell.getId();
                      }
                    }
                  }
                });
                mileWidth = mileWidth + +milestone.Width;
                return { ...milestone, Activities: [...tempActArr] };
              }
            );

            // commented on 25/01/24 for BugId 140984
            // if (mileWidthIncreased) {
            //   mileStoneInfo = {
            //     arrMilestoneInfos: newProcessData.MileStones?.map(
            //       (mile, index) => {
            //         return {
            //           milestoneId: mile.iMileStoneId,
            //           milestoneName: mile.MileStoneName,
            //           width: mile.Width,
            //           oldWidth: mile.oldWidth,
            //           activities: mile.Activities?.map((act) => {
            //             return {
            //               actId: act.ActivityId,
            //               xLeftLoc:
            //                 +getFullWidth(index, newProcessData) +
            //                 +act.xLeftLoc +
            //                 "",
            //             };
            //           }),
            //         };
            //       }
            //     ),
            //   };
            // }
            // till here BugId 140984

            //change height of swimlane , if drop is near boundary
            newProcessData.Lanes?.forEach((swimlane, index) => {
              swimlane["oldHeight"] = swimlane.Height;
              if (+swimlane.LaneId === +targetSwimlane.id) {
                newProcessData.Lanes[index] = { ...swimlane };
                if (+newHeight !== +targetSwimlane.geometry.height) {
                  laneHeightIncreasedFlag = true;
                  newProcessData.Lanes[index].Height = newHeight + "";
                }
              }
            });

            if (laneHeightIncreasedFlag) {
              lanesInfo = {
                arrLaneInfos: newProcessData.Lanes?.map((lane) => {
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
          }
          MoveGroupBox(
            newProcessData.ProcessDefId,
            newProcessData.ProcessType,
            selectedDO.BlockName,
            selectedDO.GroupBoxId,
            newDO.ILeft,
            isHeightUpdated
              ? +newDO.ITop - expandedHeight + heightForDefaultVertex + ""
              : newDO.ITop,
            newDO.LaneId,
            setProcessData,
            selectedDO.GroupBoxWidth,
            selectedDO.GroupBoxHeight,
            selectedDO.ILeft,
            selectedDO.ITop,
            selectedDO.LaneId,
            // modified on 25/01/24 for BugId 140984
            // mileWidthIncreased ? mileStoneInfo : null,
            null,
            // till here BugId 140984
            laneHeightIncreasedFlag ? lanesInfo : null,
            actArr,
            isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : null
          );
        } else if (
          cellStyle === style.taskTemplate ||
          cellStyle === style.newTask ||
          cellStyle === style.processTask
        ) {
          // code added for Bug 110259
          let parentCell = getTasklaneAt(xPos, yPos, MoveVertexType);
          let lanesInfo = {};
          let mileWidth = swimlaneTitleWidth;
          let newHeight = Math.max(
            parentCell.geometry.height,
            yPos + heightForDefaultVertex + gridSize
          );
          let newWidth = Math.max(
            parentCell.geometry.width,
            xPos - gridStartPoint.x + widthForDefaultVertex + gridSize
          );
          newProcessData.MileStones?.forEach((mile) => {
            mileWidth = mileWidth + +mile.Width;
          });
          // code edited on 29 July 2022 for BugId 113146
          newProcessData.Tasks = JSON.parse(
            JSON.stringify(prevProcessData.Tasks)
          );
          for (let itr of newProcessData.Tasks) {
            if (itr.TaskId === parseInt(cell.getId())) {
              //update x and y location value when id matches
              itr.yTopLoc = yPos + "";
              itr.xLeftLoc = xPos - gridStartPoint.x + "";
              break;
            }
          }
          newProcessData.Lanes[0].oldHeight =
            newProcessData.Lanes[0].Height + "";
          newProcessData.Lanes[0].oldWidth = mileWidth + "";
          if (+newHeight !== +parentCell.geometry.height) {
            laneHeightIncreasedFlag = true;
            newProcessData.Lanes[0].Height = newHeight + "";
          }
          if (+newWidth !== +mileWidth) {
            laneHeightIncreasedFlag = true;
            newProcessData.Lanes[0].Width = newWidth + "";
            let lastMileWidth =
              +newProcessData.MileStones[newProcessData.MileStones?.length - 1]
                .Width;
            newProcessData.MileStones[
              newProcessData.MileStones?.length - 1
            ].Width = lastMileWidth + +newWidth - +mileWidth;
          }
          if (laneHeightIncreasedFlag) {
            lanesInfo = {
              pMSwimlaneInfo: {
                laneId: newProcessData.Lanes[0].LaneId,
                laneName: newProcessData.Lanes[0].LaneName,
                laneSeqId: newProcessData.Lanes[0].LaneSeqId,
                height: newProcessData.Lanes[0].Height,
                oldHeight: newProcessData.Lanes[0].oldHeight,
                width: newProcessData.Lanes[0].Width + "",
                oldWidth: newProcessData.Lanes[0].oldWidth + "",
              },
            };
            newProcessData.MileStones?.forEach((mile, mileIdx) => {
              mile.Activities?.forEach((act, actidx) => {
                newProcessData.MileStones[mileIdx].Activities[actidx].yTopLoc =
                  +act.yTopLoc +
                  +newProcessData.Lanes[0].Height -
                  +newProcessData.Lanes[0].oldHeight;
              });
            });
          }
          MoveTask(
            newProcessData.ProcessDefId,
            cell.getId(),
            cell.value,
            xPos - gridStartPoint.x,
            yPos,
            laneHeightIncreasedFlag ? lanesInfo : null
          );
        } else if (
          cellStyle !== style.taskTemplate &&
          cellStyle !== style.newTask &&
          cellStyle !== style.processTask
        ) {
          let swimlaneAtXY = getSwimlaneAt(leftPos, topPos, MoveVertexType);
          let mileAtXY = getMilestoneAt(leftPos, topPos);
          let vertexX = leftPos - mileAtXY.geometry.x + gridSize;
          let newWidth = Math.max(
            mileAtXY.geometry.width,
            vertexX +
              (checkStyle(defaultShapeVertex, cell.getStyle())
                ? widthForDefaultVertex
                : cellSize.w)
          );
          let parentCellId = parseInt(swimlaneAtXY.getId());
          let newHeight = Math.max(
            swimlaneAtXY.geometry.height,
            topPos -
              swimlaneAtXY.geometry.y +
              (checkStyle(defaultShapeVertex, cell.getStyle())
                ? heightForDefaultVertex + gridSize
                : cellSize.h + gridSize)
          );
          let embeddedSubActivity = false;
          //code to check whether the cell moved is sub activity of embedded subprocess or normal activity
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (activity.ActivityId === Number(cell.getId())) {
                embeddedSubActivity = false;
              } else if (
                +activity.ActivityType === 35 &&
                +activity.ActivitySubType === 1 // code added on 1 March 2023 for BugId 124474
              ) {
                activity.EmbeddedActivity[0]?.forEach((embAct) => {
                  if (embAct.ActivityId === Number(cell.getId())) {
                    embeddedSubActivity = true;
                    prevLaneId = embAct.LaneId;
                    milestoneId = mile.iMileStoneId;
                  }
                });
              }
            });
          });
          //if cell is dropped on expanded embedded subprocess
          if (mileAtXY !== null && isExpandedProcessPresent !== null) {
            //if cell is dropped on expanded embedded subprocess and the cell moved is sub activity of
            //embedded subprocess
            if (embeddedSubActivity) {
              newProcessData.MileStones?.forEach((mile) => {
                mile.Activities?.forEach((activity) => {
                  if (
                    +activity.ActivityType === 35 &&
                    +activity.ActivitySubType === 1 // code added on 1 March 2023 for BugId 124474
                  ) {
                    activity.EmbeddedActivity[0]?.forEach((embAct) => {
                      if (embAct.ActivityId === Number(cell.getId())) {
                        embAct.yTopLoc =
                          yPos - isExpandedProcessPresent.geometry.y + "";
                        embAct.xLeftLoc =
                          xPos - isExpandedProcessPresent.geometry.x + "";
                        xLeftLoc = xPos - isExpandedProcessPresent.geometry.x;
                        yTopLoc = yPos - isExpandedProcessPresent.geometry.y;
                        cell.seqId = embAct.SequenceId;
                      }
                    });
                  }
                });
              });
              //code edited on 27 Jan 2023 for BugId 122912
              if (
                checkIfParentSwimlaneCheckedOut(newProcessData, prevLaneId)
                  ?.length > 0
              ) {
                newProcessData.SwimlaneCheckinChanges = true;
              } else {
                moveApiCall(
                  newProcessData,
                  prevLaneId,
                  prevLaneId,
                  milestoneId,
                  milestoneId,
                  cell,
                  xLeftLoc,
                  yTopLoc,
                  cell.seqId,
                  0,
                  laneHeightIncreasedFlag,
                  mileWidthIncreased,
                  true
                );
              }
            }
            //if cell is dropped on expanded embedded subprocess and the cell moved is not sub
            //activity of embedded subprocess and a normal activity
            else {
              let activityIndex,
                mileIndex,
                localActivity,
                embeddedActIndex,
                embeddedMileIndex,
                newLaneId,
                parentId,
                prevMileId;
              let seqIdArray = [],
                seqId,
                prevSeqId;
              newProcessData.MileStones?.forEach((mile, index) => {
                mile.Activities?.forEach((activity, indexAct) => {
                  if (activity.ActivityId === Number(cell.getId())) {
                    mileIndex = index;
                    activityIndex = indexAct;
                    localActivity = activity;
                    prevMileId = mile.iMileStoneId;
                  }
                  if (
                    +activity.ActivityType === 35 &&
                    +activity.ActivitySubType === 1 &&
                    activity.hide === +activity.ActivityId // code added on 1 March 2023 for BugId 124474
                  ) {
                    embeddedActIndex = indexAct;
                    embeddedMileIndex = index;
                    newLaneId = activity.LaneId;
                    parentId = activity.ActivityId;
                    milestoneId = mile.iMileStoneId;
                  }
                });
              });
              if (+prevMileId !== +milestoneId) {
                newProcessData.MileStones?.forEach((mile) => {
                  if (mile.iMileStoneId === milestoneId) {
                    mile.Activities?.forEach((act) => {
                      if (act.ActivityId !== Number(cell.getId())) {
                        seqIdArray.push(+act.SequenceId);
                        if (
                          +act.ActivityType === 35 &&
                          +act.ActivitySubType === 1 // code added on 1 March 2023 for BugId 124474
                        ) {
                          act.EmbeddedActivity[0]?.forEach((embAct) => {
                            if (embAct.ActivityId !== Number(cell.getId())) {
                              seqIdArray.push(+embAct.SequenceId);
                            }
                          });
                        }
                      }
                    });
                  }
                });
              }
              prevSeqId = localActivity.SequenceId;
              // code edited on 29 July 2022 for BugId 118811
              seqId =
                seqIdArray.length <= 0
                  ? localActivity.SequenceId
                  : Math.max(...seqIdArray) + 1;
              localActivity.yTopLoc =
                yPos - isExpandedProcessPresent.geometry.y + "";
              localActivity.xLeftLoc =
                xPos - isExpandedProcessPresent.geometry.x + "";
              localActivity.LaneId = newLaneId;
              localActivity.SequenceId = seqId;
              localActivity.BlockId = 0;
              cell.seqId = seqId;
              newProcessData.MileStones[mileIndex].Activities.splice(
                activityIndex,
                1
              );
              embeddedActIndex =
                embeddedMileIndex === mileIndex &&
                embeddedActIndex > activityIndex
                  ? embeddedActIndex - 1
                  : embeddedActIndex;
              newProcessData.MileStones[embeddedMileIndex]?.Activities[
                embeddedActIndex
              ]?.EmbeddedActivity[0].push(localActivity);
              //code edited on 27 Jan 2023 for BugId 122912
              if (
                checkIfParentSwimlaneCheckedOut(newProcessData, newLaneId)
                  ?.length > 0
              ) {
                newProcessData.SwimlaneCheckinChanges = true;
              } else {
                moveApiCall(
                  newProcessData,
                  prevLaneId,
                  newLaneId,
                  prevMileId,
                  milestoneId,
                  cell,
                  localActivity.xLeftLoc,
                  localActivity.yTopLoc,
                  prevSeqId,
                  0,
                  false,
                  false,
                  false,
                  parentId,
                  "I" // code added on 1 March 2023 for BugId 124474
                );
              }
            }
          }
          //if cell is dropped on graph and not outside milestones
          else {
            //if cell is dropped on milestones, outside expanded embedded subprocess and the cell moved
            //is sub activity of embedded subprocess
            if (embeddedSubActivity) {
              let mileWidth = 0;
              let laneHeight = milestoneTitleWidth;
              let activityIndex, embActIndex;
              let localActivity;
              let isLaneFound = false;
              let seqIdArray = [],
                seqId,
                prevSeqId;

              newProcessData.MileStones?.forEach((mile) => {
                mile.Activities?.forEach((activity, indexAct) => {
                  if (
                    +activity.ActivityType === 35 &&
                    +activity.ActivitySubType === 1 &&
                    activity.hide === +activity.ActivityId // code added on 1 March 2023 for BugId 124474
                  ) {
                    activity.EmbeddedActivity[0]?.forEach(
                      (embAct, embIndex) => {
                        if (embAct.ActivityId === Number(cell.getId())) {
                          //update x and y location value when id matches
                          activityIndex = indexAct;
                          localActivity = embAct;
                          embActIndex = embIndex;
                        }
                      }
                    );
                  }
                });
              });

              newProcessData.MileStones?.forEach((mile) => {
                if (milestoneId === mile.iMileStoneId) {
                  mile.Activities[activityIndex].EmbeddedActivity[0].splice(
                    embActIndex,
                    1
                  );
                }
                if (targetMilestone.id === mile.iMileStoneId) {
                  mile.Activities.push(localActivity);
                  if (milestoneId !== targetMilestone.id) {
                    mile.Activities.forEach((act) => {
                      if (act.ActivityId !== Number(cell.getId())) {
                        seqIdArray.push(+act.SequenceId);
                        if (
                          +act.ActivityType === 35 &&
                          +act.ActivitySubType === 1 // code added on 1 March 2023 for BugId 124474
                        ) {
                          act.EmbeddedActivity[0]?.forEach((embAct) => {
                            if (embAct.ActivityId !== Number(cell.getId())) {
                              seqIdArray.push(+embAct.SequenceId);
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
              prevSeqId = localActivity.SequenceId;
              // code edited on 29 July 2022 for BugId 118811
              seqId =
                seqIdArray.length <= 0
                  ? localActivity.SequenceId
                  : Math.max(...seqIdArray) + 1;
              // code edited on 29 July 2022 for BugId 113146
              newProcessData.Lanes?.forEach((lane) => {
                if (lane.LaneId === targetSwimlane.id) {
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
              newProcessData.MileStones?.forEach((mile, index) => {
                mile["oldWidth"] = mile.Width;
                if (mile.iMileStoneId === targetMilestone.id) {
                  if (+newWidth !== +mile.Width) {
                    mileWidthIncreased = true;
                    newProcessData.MileStones[index] = { ...mile };
                    newProcessData.MileStones[index].Width = newWidth + "";
                  }
                }
                mile.Activities?.forEach((activity) => {
                  if (activity.ActivityId === Number(cell.getId())) {
                    //update x and y location value when id matches
                    xLeftLoc = xPos - gridStartPoint.x + "";
                    yTopLoc =
                      yPos - targetSwimlane.geometry.y + laneHeight + "";
                    activity.yTopLoc = yTopLoc + "";
                    activity.xLeftLoc =
                      xPos - mileWidth - gridStartPoint.x + "";
                    activity.BlockId =
                      isGroupBoxPresent !== null ? isGroupBoxPresent.id : 0;
                    activity.LaneId = targetSwimlane.id;
                    activity.SequenceId = seqId;
                    cell.seqId = seqId;
                    //code edited on 27 Jan 2023 for BugId 122912
                    if (
                      checkIfParentSwimlaneCheckedOut(
                        newProcessData,
                        targetSwimlane.id
                      )?.length > 0
                    ) {
                      activity.status = "U";
                      // added on 09/10/23 for BugId 138932
                      activity.newXLeft = xLeftLoc;
                      activity.newYTop = yTopLoc;
                    }
                  }
                });
                mileWidth = mileWidth + +mile.Width;
              });
              // code edited on 29 July 2022 for BugId 113146
              newProcessData.Lanes = JSON.parse(
                JSON.stringify(prevProcessData.Lanes)
              );
              // code edited on 29 July 2022 for BugId 113146
              newProcessData.Lanes?.forEach((swimlane, index) => {
                swimlane["oldHeight"] = swimlane.Height;
                if (swimlane.LaneId === parentCellId) {
                  if (+newHeight !== +swimlaneAtXY.geometry.height) {
                    laneHeightIncreasedFlag = true;
                    newProcessData.Lanes[index].Height = newHeight + "";
                  }
                }
              });
              //code edited on 27 Jan 2023 for BugId 122912
              if (
                checkIfParentSwimlaneCheckedOut(
                  newProcessData,
                  targetSwimlane.id
                )?.length > 0
              ) {
                newProcessData.SwimlaneCheckinChanges = true;
              } else {
                moveApiCall(
                  newProcessData,
                  prevLaneId,
                  targetSwimlane.id,
                  milestoneId,
                  targetMilestone.id,
                  cell,
                  xLeftLoc,
                  yTopLoc,
                  prevSeqId,
                  isGroupBoxPresent !== null ? isGroupBoxPresent.id : 0,
                  laneHeightIncreasedFlag,
                  mileWidthIncreased,
                  false,
                  0,
                  null // code added on 1 March 2023 for BugId 124474
                );
              }
            }
            //if cell is dropped on milestones, outside expanded embedded subprocess and the
            //cell moved is normal activity
            else {
              let mileWidth = 0;
              let laneHeight = milestoneTitleWidth;
              let activityIndex;
              let localActivity;
              let isLaneFound = false;
              let seqIdArray = [],
                seqId,
                prevSeqId;

              newProcessData.MileStones?.forEach((mile, index) => {
                mile.Activities?.forEach((activity, indexAct) => {
                  if (activity.ActivityId === Number(cell.getId())) {
                    //update x and y location value when id matches
                    milestoneId = mile.iMileStoneId;
                    activityIndex = indexAct;
                    localActivity = activity;
                  }
                });
              });
              if (milestoneId !== targetMilestone.id) {
                newProcessData.MileStones?.forEach((mile, index) => {
                  if (milestoneId === mile.iMileStoneId) {
                    mile.Activities.splice(activityIndex, 1);
                  } else if (targetMilestone.id === mile.iMileStoneId) {
                    mile.Activities.push(localActivity);
                    mile.Activities.forEach((act) => {
                      if (act.ActivityId !== Number(cell.getId())) {
                        seqIdArray.push(+act.SequenceId);
                        if (
                          +act.ActivityType === 35 &&
                          +act.ActivitySubType === 1
                        ) {
                          act.EmbeddedActivity[0]?.forEach((embAct) => {
                            if (embAct.ActivityId !== Number(cell.getId())) {
                              seqIdArray.push(+embAct.SequenceId);
                            }
                          });
                        }
                      }
                    });
                  }
                });
              }
              prevSeqId = localActivity.SequenceId;
              // code edited on 29 July 2022 for BugId 118811
              seqId =
                seqIdArray.length <= 0
                  ? localActivity.SequenceId
                  : Math.max(...seqIdArray) + 1;
              newProcessData.Lanes?.forEach((lane) => {
                if (lane.LaneId === targetSwimlane.id) {
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
              newProcessData.MileStones?.forEach((mile, index) => {
                mile["oldWidth"] = mile.Width;
                if (mile.iMileStoneId === targetMilestone.id) {
                  if (+newWidth !== +mile.Width) {
                    mileWidthIncreased = true;
                    newProcessData.MileStones[index] = { ...mile };
                    newProcessData.MileStones[index].Width = newWidth + "";
                  }
                }
                mile.Activities?.forEach((activity) => {
                  if (activity.ActivityId === Number(cell.getId())) {
                    //update x and y location value when id matches
                    xLeftLoc = xPos - gridStartPoint.x + "";
                    yTopLoc =
                      yPos - targetSwimlane.geometry.y + laneHeight + "";
                    prevLaneId = activity.LaneId;
                    activity.yTopLoc = yTopLoc;
                    activity.xLeftLoc =
                      xPos - mileWidth - gridStartPoint.x + "";
                    activity.LaneId = targetSwimlane.id;
                    activity.BlockId =
                      isGroupBoxPresent !== null ? isGroupBoxPresent.id : 0;
                    activity.SequenceId = seqId;
                    cell.seqId = seqId;
                    //code edited on 27 Jan 2023 for BugId 122912
                    if (
                      checkIfParentSwimlaneCheckedOut(
                        newProcessData,
                        targetSwimlane.id
                      )?.length > 0
                    ) {
                      activity.status = "U";
                      // added on 09/10/23 for BugId 138932
                      activity.newXLeft = xLeftLoc;
                      activity.newYTop = yTopLoc;
                    }
                  }
                });
                mileWidth = mileWidth + +mile.Width;
              });
              newProcessData.Lanes?.forEach((swimlane, index) => {
                swimlane["oldHeight"] = swimlane.Height;
                if (swimlane.LaneId === parentCellId) {
                  if (+newHeight !== +swimlaneAtXY.geometry.height) {
                    laneHeightIncreasedFlag = true;
                    newProcessData.Lanes[index].Height = newHeight + "";
                  }
                }
              });
              //code edited on 27 Jan 2023 for BugId 122912
              if (
                checkIfParentSwimlaneCheckedOut(
                  newProcessData,
                  targetSwimlane.id
                )?.length > 0
              ) {
                newProcessData.SwimlaneCheckinChanges = true;
              } else {
                moveApiCall(
                  newProcessData,
                  prevLaneId,
                  targetSwimlane.id,
                  milestoneId,
                  targetMilestone.id,
                  cell,
                  xLeftLoc,
                  yTopLoc,
                  prevSeqId,
                  isGroupBoxPresent !== null ? isGroupBoxPresent.id : 0,
                  laneHeightIncreasedFlag,
                  mileWidthIncreased,
                  true
                );
              }
            }
          }
        }
        return newProcessData;
      });
    }
  };

  const moveApiCall = (
    newProcess,
    prevLaneId,
    laneId,
    prevMilestoneId,
    milestoneId,
    cell,
    xLeftLoc,
    yTopLoc,
    prevSeqId,
    blockId,
    laneHeightIncreasedFlag,
    mileWidthIncreased,
    actMovedInSameLayer,
    parentActivityId,
    embeddedActivityType
  ) => {
    let processDefId, actName, actId, seqId;
    processDefId = newProcess.ProcessDefId;
    actId = Number(cell.getId());
    actName = cell.value;
    seqId = cell.seqId;
    let payload = {
      processDefId: processDefId,
      actName: actName,
      actId: actId,
      seqId: seqId, // added on 24/01/24 for BugId 142649
      prevSeqId: prevSeqId,
      milestoneId: milestoneId,
      prevMilestoneId: prevMilestoneId,
      laneId: laneId,
      prevLaneId: prevLaneId,
      xLeftLoc: xLeftLoc,
      yTopLoc: yTopLoc,
      blockId: blockId,
    };

    if (!actMovedInSameLayer) {
      payload = { ...payload, parentActivityId, embeddedActivityType };
    }
    if (laneHeightIncreasedFlag) {
      payload = {
        ...payload,
        arrLaneInfos: newProcess.Lanes.map((lane) => {
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
    if (mileWidthIncreased) {
      payload = {
        ...payload,
        arrMilestoneInfos: newProcess.MileStones.map((mile, index) => {
          return {
            milestoneId: mile.iMileStoneId,
            milestoneName: mile.MileStoneName,
            width: mile.Width,
            oldWidth: mile.oldWidth,
            activities: mile.Activities.map((act) => {
              return {
                actId: act.ActivityId,
                xLeftLoc: +getFullWidth(index, newProcess) + +act.xLeftLoc + "",
              };
            }),
          };
        }),
      };
    }
    //code edited on 27 Jan 2023 for BugId 122912
    axios
      .post(
        SERVER_URL +
          (actMovedInSameLayer
            ? ENDPOINT_MOVEACTIVITY
            : ENDPOINT_UPDATE_ACTIVITY),
        payload
      )
      .then((res) => {
        if (res.data.Status === 0) {
          // code added on 27 March 2023 for BugId 124336
          let processDefId,
            processMode,
            connObjGroup = {};
          let temp;
          setProcessData((prevProcessData) => {
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            processDefId = prevProcessData.ProcessDefId;
            processMode = prevProcessData.ProcessType;
            newProcessData.Connections?.forEach((con, index) => {
              let isEdgePointsUpdated = false,
                connectionId,
                connType;
              if (actId === +con.TargetId && con.xLeft?.length > 0) {
                let lastXCord = con.xLeft[con.xLeft?.length - 1];
                let firstXCord = con.xLeft[0];
                if (+firstXCord > +xLeftLoc) {
                  isEdgePointsUpdated = true;
                  connectionId = con.ConnectionId;
                  connType = con.Type;
                  newProcessData.Connections[index].xLeft = [];
                  newProcessData.Connections[index].yTop = [];
                } else if (+lastXCord > +xLeftLoc) {
                  let diff = +lastXCord - +xLeftLoc;
                  con.xLeft?.forEach((xCord, index1) => {
                    if (+xCord > +xLeftLoc) {
                      isEdgePointsUpdated = true;
                      connectionId = con.ConnectionId;
                      connType = con.Type;
                      newProcessData.Connections[index].xLeft[index1] =
                        +xCord - diff;
                    }
                  });
                }
                if (isEdgePointsUpdated) {
                  let connObj = {
                    connectionId: connectionId,
                    connType: connType,
                    sourceArr: [...newProcessData.Connections[index].xLeft],
                    targetArr: [...newProcessData.Connections[index].yTop],
                  };
                  connObjGroup = { ...connObjGroup, connObj };
                }
              }
            });
            temp = newProcessData;
            return newProcessData;
          });
          if (Object.keys(connObjGroup)?.length > 0) {
            Object.keys(connObjGroup)?.forEach((connKey) => {
              let connection = connObjGroup[connKey];
              let json = {
                processDefId: processDefId,
                processMode: processMode,
                connId: connection.connectionId,
                connType: connection.connType,
                sourcePosition: connection.sourceArr,
                targetPosition: connection.targetArr,
              };

              if (checkIfSwimlaneCheckedOut(temp)?.length > 0) {
                setProcessData((prev) => {
                  prev.SwimlaneCheckinChanges = true;
                  return prev;
                });
              } else {
                axios
                  .post(SERVER_URL + ENDPOINT_MOVE_CONNECTION, json)
                  .then((res) => {
                    if (res.data.Status === 0) {
                      return 0;
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
          }
        }
      });
  };

  //overwrite the function to enable cell drop only inside milestone
  let moveCellsHandler = graph.graphHandler.moveCells.bind(graph.graphHandler);
  graph.graphHandler.moveCells = function (cells, dx, dy, clone, target, evt) {
    targetMilestone = getMilestoneAt(leftPos, topPos);
    targetSwimlane = getSwimlaneAt(leftPos, topPos, MoveVertexType);
    targetTasklane = getTasklaneAt(leftPos, topPos, MoveVertexType);

    //restrict drag drop if dragged cell is swimlane
    for (let itr of cells) {
      //code edited on 27 Jan 2023 for BugId 122912
      if (
        itr.style.includes(style.swimlane) ||
        itr.style === style.tasklane ||
        itr.style.includes(style.swimlane_collapsed) ||
        itr.style === style.tasklane_collapsed ||
        itr.style === style.milestone ||
        itr.style === "layer" ||
        itr.style === style.expandedEmbeddedProcess ||
        (processType !== PROCESSTYPE_LOCAL &&
          processType !== PROCESSTYPE_LOCAL_CHECKED &&
          checkIfParentSwimlaneCheckedOut(processData, itr?.parent?.id)
            ?.length === 0 &&
          checkIfParentSwimlaneCheckedOut(processData, targetSwimlane?.id)
            ?.length === 0) ||
        (processType !== PROCESSTYPE_LOCAL &&
          processType !== PROCESSTYPE_LOCAL_CHECKED &&
          checkIfParentSwimlaneCheckedOut(processData, itr?.parent?.id)
            ?.length === 0 &&
          checkIfParentSwimlaneCheckedOut(processData, targetSwimlane?.id)
            ?.length !== 0) ||
        (processType !== PROCESSTYPE_LOCAL &&
          processType !== PROCESSTYPE_LOCAL_CHECKED &&
          checkIfParentSwimlaneCheckedOut(processData, itr?.parent?.id)
            ?.length !== 0 &&
          checkIfParentSwimlaneCheckedOut(processData, targetSwimlane?.id)
            ?.length === 0) ||
        +LatestVersionOfProcess(processData?.Versions) !==
          +processData?.VersionNo
      ) {
        return;
      }
      //restrict the drop target
      if (
        itr.style === style.taskTemplate ||
        itr.style === style.newTask ||
        itr.style === style.processTask
      ) {
        if (
          targetTasklane === null ||
          targetTasklane === undefined ||
          isTaskPresent
        ) {
          return;
        }
      } else if (
        itr.style !== style.taskTemplate &&
        itr.style !== style.newTask &&
        itr.style !== style.processTask
      ) {
        if (
          (itr.style === style.embStartEvent ||
            itr.style === style.embEndEvent) &&
          itr.parent.style === style.expandedEmbeddedProcess
        ) {
          return;
        }
        if (
          itr.edges?.length > 0 &&
          itr.parent.style === style.expandedEmbeddedProcess &&
          !isExpandedProcessPresent
        ) {
          return;
        }
        if (targetMilestone === null || targetMilestone === undefined) {
          for (let itr of cells) {
            if (!isAllowedOutsideMilestone(itr.getStyle())) {
              return;
            }
          }
        }
        //restrict drag drop if activity is already present at drop coordinates
        if (
          targetSwimlane === null &&
          !isAllowedOutsideMilestone(itr.getStyle())
        ) {
          return;
        }
      }
      if (
        isExpandedProcessPresent !== null &&
        isActivityPresent &&
        !isActivityPresent.style.includes(style.subProcess) &&
        !artifacts.includes(itr.getStyle())
      ) {
        return;
      }
      if (
        isExpandedProcessPresent !== null &&
        activitiesNotAllowedInEmbedded.includes(itr.getStyle())
      ) {
        return;
      }
      if (
        isExpandedProcessPresent === null &&
        isActivityPresent !== null &&
        !artifacts.includes(itr.getStyle())
      ) {
        return;
      }
      if (isEmbeddedSubprocessExpanded && !isExpandedProcessPresent) {
        dispatch(
          setToastDataFunc({
            message: translation("expandedEmbeddedSubprocessDropMsg"),
            severity: "warning",
            open: true,
          })
        );
        return;
      }
      if (itr.getStyle() === style.groupBox && isGroupBoxPresent) {
        return;
      }
    }

    //same as defined in mxGraph library
    if (targetSwimlane) {
      moveCellsHandler(cells, dx, dy, clone, targetSwimlane, evt);
    } else {
      moveCellsHandler(cells, dx, dy, clone, rootLayer, evt);
    }
  };

  let mouseMoveGraphHandler = graph.graphHandler.mouseMove.bind(
    graph.graphHandler
  );
  let dragOffset = { x: 0, y: 0 };
  graph.graphHandler.updatePreview = function (remote) {
    return null;
  };
  graph.graphHandler.scrollOnMove = false;

  graph.graphHandler.mouseMove = function (sender, me) {
    // set the dragElement
    // if inside milestone , show image, else show disable Icon
    if (this.cell !== null && this.cell !== undefined) {
      //milestones,swimlanes and tasklanes cannot be dragged and dropped
      if (
        this.cell?.style &&
        (this.cell.style.includes(style.swimlane) ||
          this.cell.style === style.tasklane ||
          this.cell.style.includes(style.swimlane_collapsed) ||
          this.cell.style === style.tasklane_collapsed ||
          this.cell.style === style.milestone ||
          this.cell.style === style.expandedEmbeddedProcess ||
          this.cell.style.includes(
            `${style.subProcess};opacity=0;noLabel=true`
          )) // code edited on 17 Feb 2023 for BugId 124062
      ) {
        div.style.display = "none";
        return;
      }
      setProcessData((prev) => {
        processData = prev;
        processType = prev.ProcessType;
        return prev;
      });
      //code edited on 27 Jan 2023 for BugId 122912
      if (
        (processType !== PROCESSTYPE_LOCAL &&
          processType !== PROCESSTYPE_LOCAL_CHECKED &&
          checkIfParentSwimlaneCheckedOut(processData, this.cell?.parent?.id)
            ?.length === 0) ||
        +LatestVersionOfProcess(processData?.Versions) !==
          +processData?.VersionNo
      ) {
        div.style.display = "none";
        return;
      }
      let evt = me.getEvent();
      let offset = mxUtils.getOffset(graph.container);
      let origin = mxUtils.getScrollOrigin(graph.container);
      let x = mxEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
      let y = mxEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;
      let imgSrc = graph
        .getStylesheet()
        .getCellStyle(this.cell?.getStyle()).image;
      div.children[0].src = imgSrc;
      leftPos = dimensionInMultipleOfGridSize(x + dragOffset.x) - graphGridSize;
      div.style.left = leftPos + "px";
      topPos = dimensionInMultipleOfGridSize(y + dragOffset.y) - graphGridSize;
      div.style.top = topPos + "px";
      div.style.width = this.cell.geometry
        ? this.cell.geometry.width + "px"
        : "0px";
      div.style.height = this.cell.geometry
        ? this.cell.geometry.height + "px"
        : "0px";
      div.style.display = "block";
      let width = this.cell.geometry ? this.cell.geometry.width : null;
      let height = this.cell.geometry ? this.cell.geometry.height : null;
      if (
        this.cell.getStyle() === style.taskTemplate ||
        this.cell.getStyle() === style.newTask ||
        this.cell.getStyle() === style.processTask
      ) {
        isTasklanePresent = getTasklaneAt(leftPos, topPos, MoveVertexType);
        isTaskPresent = getTaskAt(
          leftPos,
          topPos,
          isTasklanePresent,
          graph,
          width,
          height,
          this.cell.id
        );
        if (isTasklanePresent === null) {
          div.children[0].src = disabledIcon;
        } else {
          if (isTaskPresent) {
            div.children[0].src = disabledIcon;
          } else {
            div.children[0].src = imgSrc;
          }
        }
      } else if (
        this.cell.getStyle() !== style.taskTemplate &&
        this.cell.getStyle() !== style.newTask &&
        this.cell.getStyle() !== style.processTask &&
        !isAllowedOutsideMilestone(this.cell.getStyle())
      ) {
        let isSwimlanePresent = getSwimlaneAt(leftPos, topPos, MoveVertexType);
        isExpandedProcessPresent = getExpandedSubprocess(
          leftPos,
          topPos,
          isSwimlanePresent,
          graph
        );
        isEmbeddedSubprocessExpanded = isSubprocessExpanded(graph);
        if (
          (this.cell.getStyle() === style.embStartEvent ||
            this.cell.getStyle() === style.embEndEvent) &&
          this.cell.parent.style === style.expandedEmbeddedProcess
        ) {
          div.children[0].src = disabledIcon;
        } else if (
          this.cell.edges?.length > 0 &&
          this.cell.parent.style === style.expandedEmbeddedProcess &&
          !isExpandedProcessPresent
        ) {
          div.children[0].src = disabledIcon;
        } else {
          let isMilestonePresent = getMilestoneAt(leftPos, topPos);
          if (isMilestonePresent === null) {
            //here if the currentPoint is not inside milestone then disabled icon is displayed
            if (!isAllowedOutsideMilestone(this.cell.getStyle())) {
              div.children[0].src = disabledIcon;
            }
          } else if (isMilestonePresent !== null) {
            isActivityPresent = getActivityAt(
              leftPos,
              topPos,
              isSwimlanePresent,
              graph,
              width,
              height,
              this.cell.id
            );
            isGroupBoxPresent = getGroupBoxAt(
              leftPos,
              topPos,
              isSwimlanePresent,
              graph,
              width,
              height,
              this.cell.id
            );
            if (isSwimlanePresent === null) {
              div.children[0].src = disabledIcon;
            } else {
              if (isEmbeddedSubprocessExpanded) {
                if (isExpandedProcessPresent) {
                  if (
                    !activitiesNotAllowedInEmbedded.includes(
                      this.cell.getStyle()
                    )
                  ) {
                    div.children[0].src = imgSrc;
                  } else {
                    div.children[0].src = disabledIcon;
                  }
                } else {
                  div.children[0].src = disabledIcon;
                }
              } else if (
                !artifacts.includes(this.cell?.getStyle()) &&
                isActivityPresent
              ) {
                if (isExpandedProcessPresent) {
                  if (
                    !activitiesNotAllowedInEmbedded.includes(
                      this.cell.getStyle()
                    )
                  ) {
                    div.children[0].src = imgSrc;
                  } else {
                    div.children[0].src = disabledIcon;
                  }
                } else {
                  div.children[0].src = disabledIcon;
                }
              } else if (this.cell.getStyle() === style.groupBox) {
                if (isGroupBoxPresent) {
                  div.children[0].src = disabledIcon;
                } else {
                  div.children[0].src = imgSrc;
                }
              }
              //code edited on 27 Jan 2023 for BugId 122912
              else if (
                processType !== PROCESSTYPE_LOCAL &&
                processType !== PROCESSTYPE_LOCAL_CHECKED &&
                checkIfParentSwimlaneCheckedOut(
                  processData,
                  isSwimlanePresent?.id
                )?.length === 0
              ) {
                div.children[0].src = disabledIcon;
              } else {
                div.children[0].src = imgSrc;
              }
            }
          }
        }
      } else if (isAllowedOutsideMilestone(this.cell.getStyle())) {
        div.children[0].src = imgSrc;
      }
    } else {
      if (!div.children[0].src.includes("null")) {
        div.children[0].src = null;
        div.style.display = "none";
      }
    }
    mouseMoveGraphHandler(sender, me);
  };
};
