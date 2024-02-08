import disabledIcon from "../../assets/bpmnView/cancelIcon.png";
import {
  cellSize,
  defaultShapeVertex,
  gridSize,
  gridStartPoint,
  style,
  widthForDefaultVertex,
  heightForDefaultVertex,
  graphGridSize,
  swimlaneTitleWidth,
  milestoneTitleWidth,
  AddVertexType,
  groupboxWidth,
  groupboxHeight,
  artifacts,
  commentHeight,
  commentWidth,
  activitiesNotAllowedInEmbedded,
  expandedViewHeight,
  expandedViewWidth,
  maxLabelCharacter,
} from "../../Constants/bpmnView";
import { getMilestoneAt } from "./getMilestoneAt";
import { getSwimlaneAt, getTasklaneAt } from "./getSwimlaneAt";
import {
  dropDirectltyToGraphGlobally,
  isAllowedOutsideMilestone,
} from "./dropOutsideMilestone";
import { AddActivity } from "../CommonAPICall/AddActivity";
import { getActivityQueueObj } from "../abstarctView/getActivityQueueObj";
import { getActivityAt, getTaskAt } from "./getActivityAt";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";
import { embeddedEndEvent, embeddedStartEvent } from "./toolboxIcon";
import { AddEmbeddedActivity } from "../CommonAPICall/AddEmbeddedActivity";
import {
  getExpandedSubprocess,
  isSubprocessExpanded,
} from "./getExpandedSubprocess";
import { AddActivityInSubprocess } from "../CommonAPICall/AddActivityInSubprocess";
import { getFullWidth } from "../abstarctView/addWorkstepAbstractView";
import { addTaskAPI } from "../CommonAPICall/AddTask";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  SPACE,
  TaskType,
} from "../../Constants/appConstants";
import { AddDataObject } from "../CommonAPICall/AddDataObject";
import { AddGroupBox } from "../CommonAPICall/AddGroupBox";
import { AddMsgAF } from "../CommonAPICall/AddMSGAFs";
import { AddAnnotation } from "../CommonAPICall/AddAnnotation";
import {
  checkIfParentSwimlaneCheckedOut,
  checkIfSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { getGroupBoxAt } from "./getGroupBoxAt";
import { getActivityProps } from "../abstarctView/getActivityProps";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import {
  checkRegex,
  checkStyle,
  getLocale,
  isActNameAlreadyPresent,
  isArabicLocaleSelected,
  replaceNChars,
} from "../CommonFunctionCall/CommonFunctionCall";
import { getVariableType } from "../ProcessSettings/Triggers/getVariableType";
import { saveQueueData } from "../CommonAPICall/SaveQueueData";
import { PMWEB_ARB_REGEX, PMWEB_REGEX } from "../../validators/validator";
import { LatestVersionOfProcess } from "../abstarctView/checkLatestVersion";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxUtils = mxgraphobj.mxUtils;
const mxEvent = mxgraphobj.mxEvent;
const mxEventObject = mxgraphobj.mxEventObject;
const mxToolbar = mxgraphobj.mxToolbar;
const mxGeometry = mxgraphobj.mxGeometry;
const mxRectangle = mxgraphobj.mxRectangle;
const mxPoint = mxgraphobj.mxPoint;

let toDropOnGraph;

function addToolbarItem(
  graph,
  toolbar,
  prototype,
  image,
  props,
  translation,
  dispatch,
  taskTemplateId,
  taskTemplateVar
) {
  //processData json
  let setProcessData = props.setProcessData;
  let setNewId = props.setNewId;
  let title = props.title;
  // code edited on 22 April 2023 for BugId 127405 - not able to drop artifacts
  let isActivityPresent = null,
    isTaskPresent = null,
    isGroupBoxPresent = null;
  let isExpandedProcessPresent = null;
  let isEmbeddedSubprocessExpanded = false;
  let mileStoneWidthIncreasedFlag = false;
  let laneHeightIncreasedFlag = false;
  let mileStoneInfo = {};
  let lanesInfo = {};
  let { caseEnabled } = props;

  //to show preview with same size of activity in graph
  let div = document.createElement("div");
  if (checkStyle(defaultShapeVertex, prototype.getStyle())) {
    div.setAttribute(
      "style",
      `width: ${widthForDefaultVertex}px; height:${heightForDefaultVertex}px; border:1px dotted black;`
    );
  } else if (prototype.getStyle() === style.groupBox) {
    div.setAttribute(
      "style",
      `width: ${groupboxWidth}px; height:${groupboxHeight}px; border:1px dotted black;`
    );
  } else {
    div.setAttribute(
      "style",
      `width: ${gridSize}px; height:${gridSize}px; border:1px dotted black;`
    );
  }
  let icon = document.createElement("img");
  icon.src = image;
  icon.style.width = "16px";
  icon.style.height = "16px";
  div.appendChild(icon);

  // Function that is executed when the image is dropped on the graph.
  // The cell argument points to the cell under the mousepointer if there is one.
  toDropOnGraph = function (graph, evt, cell, x, y, cellToDrop) {
    let activityType = props.activityType;
    let activitySubType = props.activitySubType;
    title = prototype.value;
    let mileAtXY = getMilestoneAt(x, y);
    let swimlaneAtXY = getSwimlaneAt(x, y, AddVertexType);
    let tasklaneAtXY = getTasklaneAt(x, y, AddVertexType);
    if (
      prototype.getStyle() !== style.taskTemplate &&
      prototype.getStyle() !== style.newTask &&
      prototype.getStyle() !== style.processTask &&
      (mileAtXY === null || swimlaneAtXY === null) &&
      !isAllowedOutsideMilestone(prototype.getStyle())
    ) {
      return;
    }
    if (
      isExpandedProcessPresent !== null &&
      isActivityPresent &&
      !isActivityPresent.style.includes(style.subProcess) &&
      !artifacts.includes(prototype.getStyle())
    ) {
      return;
    }
    if (
      isExpandedProcessPresent !== null &&
      activitiesNotAllowedInEmbedded.includes(prototype.getStyle())
    ) {
      return;
    }
    if (prototype.getStyle() === style.groupBox && isGroupBoxPresent) {
      return;
    }
    if (
      isExpandedProcessPresent === null &&
      isActivityPresent !== null &&
      !artifacts.includes(prototype.getStyle())
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

    // code added on 29 May 2023 for BugId 127062
    let newData;
    setProcessData((prevProcessData) => {
      newData = JSON.parse(JSON.stringify(prevProcessData));
      return prevProcessData;
    });
    if (
      (prototype.getStyle() === style.taskTemplate ||
        prototype.getStyle() === style.newTask ||
        prototype.getStyle() === style.processTask) &&
      (tasklaneAtXY === null ||
        isTaskPresent ||
        checkIfSwimlaneCheckedOut(newData)?.length > 0) // code edited on 29 May 2023 for BugId 127062
    ) {
      return;
    }

    if (dropDirectltyToGraphGlobally(prototype.getStyle())) {
      let xLeftLoc = x - gridStartPoint.x;
      let yTopLoc = y - gridStartPoint.y;

      let vertexStyle = prototype.getStyle();
      //groupBox will be visually inside milestone
      if (vertexStyle === style.groupBox && swimlaneAtXY !== null) {
        let groupBoxId = 0,
          processDefId,
          processState;
        let laneHeight = 0,
          isLaneFound = false;
        yTopLoc =
          isExpandedProcessPresent !== null
            ? yTopLoc - isExpandedProcessPresent.geometry.y
            : yTopLoc - swimlaneAtXY.geometry.y;
        //if drop is near border, stretch border so that the vertex is completely
        //inside milestone/swimlane
        let newHeight = Math.max(
          swimlaneAtXY.geometry.height,
          yTopLoc + groupboxHeight + gridSize
        );
        let mileWidth = 0,
          actArr = [],
          isActExpanded = null,
          expandedHeight = 0,
          isHeightUpdated = false;
        setNewId((oldIds) => {
          groupBoxId = oldIds.groupBoxId + 1;
          return { ...oldIds, groupBoxId: groupBoxId };
        });
        setProcessData((oldProcessData) => {
          //deep copy instead of shallow copy
          //code edited on 5 August 2022 for Bug 113802
          let newProcessData = JSON.parse(JSON.stringify(oldProcessData));
          newProcessData.GroupBoxes = JSON.parse(
            JSON.stringify(oldProcessData.GroupBoxes)
          );
          processDefId = newProcessData.ProcessDefId;
          processState = newProcessData.ProcessType;
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (+activity.hide === +activity.ActivityId) {
                isActExpanded = activity;
                expandedHeight = +activity.Height;
              }
            });
          });
          newProcessData.Lanes?.forEach((lane) => {
            if (lane.LaneId === swimlaneAtXY.id) {
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
          newProcessData.GroupBoxes.push({
            GroupBoxId: groupBoxId,
            GroupBoxWidth: groupboxWidth,
            GroupBoxHeight: groupboxHeight,
            ITop: isExpandedProcessPresent ? yTopLoc : +laneHeight + +yTopLoc,
            ILeft: isExpandedProcessPresent
              ? xLeftLoc - isExpandedProcessPresent.geometry.x + gridSize
              : xLeftLoc,
            BlockName: title + "_" + groupBoxId,
            LaneId: parseInt(swimlaneAtXY.getId()),
            ParentActivityId: isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : 0,
          });
          newProcessData.MileStones = newProcessData.MileStones.map(
            (milestone) => {
              milestone["oldWidth"] = milestone.Width;
              let tempActArr = [...milestone.Activities];

              milestone?.Activities?.forEach((act, index) => {
                if (
                  isExpandedProcessPresent &&
                  +act.LaneId === +swimlaneAtXY.id &&
                  act.EmbeddedActivity
                ) {
                  act.EmbeddedActivity[0]?.forEach((embAct, embIdx) => {
                    let actStyle = getActivityProps(
                      embAct.ActivityType,
                      embAct.ActivitySubType
                    )[5];
                    let actWidth = checkStyle(defaultShapeVertex, actStyle)
                      ? widthForDefaultVertex
                      : gridSize;
                    let actHeight = checkStyle(defaultShapeVertex, actStyle)
                      ? heightForDefaultVertex
                      : gridSize;
                    if (
                      +embAct.xLeftLoc +
                        isExpandedProcessPresent.geometry.x -
                        gridSize >
                        xLeftLoc &&
                      +embAct.xLeftLoc +
                        isExpandedProcessPresent.geometry.x -
                        gridSize <
                        xLeftLoc + groupboxWidth
                    ) {
                      if (
                        (+embAct.yTopLoc > yTopLoc &&
                          +embAct.yTopLoc < yTopLoc + groupboxHeight) ||
                        (+embAct.yTopLoc + actHeight > yTopLoc &&
                          +embAct.yTopLoc + actHeight <
                            yTopLoc + groupboxHeight)
                      ) {
                        actArr.push({
                          actId: embAct.ActivityId,
                        });
                        tempActArr[embIdx].BlockId = groupBoxId;
                      }
                    } else if (
                      +embAct.xLeftLoc +
                        isExpandedProcessPresent.geometry.x -
                        gridSize +
                        actWidth >
                        xLeftLoc &&
                      +embAct.xLeftLoc +
                        isExpandedProcessPresent.geometry.x -
                        gridSize +
                        actWidth <
                        xLeftLoc + groupboxWidth
                    ) {
                      if (
                        (+embAct.yTopLoc > yTopLoc &&
                          +embAct.yTopLoc < yTopLoc + groupboxHeight) ||
                        (+embAct.yTopLoc + actHeight > yTopLoc &&
                          +embAct.yTopLoc + actHeight <
                            yTopLoc + groupboxHeight)
                      ) {
                        actArr.push({
                          actId: embAct.ActivityId,
                        });
                        tempActArr[embIdx].BlockId = groupBoxId;
                      }
                    }
                  });
                } else if (+act.LaneId === +swimlaneAtXY.id) {
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
                    +act.xLeftLoc + mileWidth > xLeftLoc &&
                    +act.xLeftLoc + mileWidth < xLeftLoc + groupboxWidth
                  ) {
                    if (
                      (+act.yTopLoc - laneHeight > yTopLoc &&
                        +act.yTopLoc - laneHeight < yTopLoc + groupboxHeight) ||
                      (+act.yTopLoc - laneHeight + actHeight > yTopLoc &&
                        +act.yTopLoc - laneHeight + actHeight <
                          yTopLoc + groupboxHeight)
                    ) {
                      actArr.push({
                        actId: act.ActivityId,
                      });
                      tempActArr[index].BlockId = groupBoxId;
                    }
                  } else if (
                    +act.xLeftLoc + mileWidth + actWidth > xLeftLoc &&
                    +act.xLeftLoc + mileWidth + actWidth <
                      xLeftLoc + groupboxWidth
                  ) {
                    if (
                      (+act.yTopLoc - laneHeight > yTopLoc &&
                        +act.yTopLoc - laneHeight < yTopLoc + groupboxHeight) ||
                      (+act.yTopLoc - laneHeight + actHeight > yTopLoc &&
                        +act.yTopLoc - laneHeight + actHeight <
                          yTopLoc + groupboxHeight)
                    ) {
                      actArr.push({
                        actId: act.ActivityId,
                      });
                      tempActArr[index].BlockId = groupBoxId;
                    }
                  }
                }
              });
              mileWidth = mileWidth + +milestone.Width;
              return { ...milestone, Activities: [...tempActArr] };
            }
          );

          // commented on 25/01/24 for BugId 140984
          // if (mileStoneWidthIncreasedFlag) {
          //   mileStoneInfo = {
          //     arrMilestoneInfos: newProcessData.MileStones?.map(
          //       (mile, index) => {
          //         return {
          //           milestoneId: mile.iMileStoneId,
          //           milestoneName: mile.MileStoneName,
          //           width:
          //             isActExpanded &&
          //             isActExpanded.mileId === mile.iMileStoneId
          //               ? newWidth
          //               : mile.Width,
          //           oldWidth:
          //             isActExpanded &&
          //             isActExpanded?.mileId === mile.iMileStoneId
          //               ? mile.oldWidth - expandedWidth + widthForDefaultVertex
          //               : mile.oldWidth,
          //           activities: mile.Activities?.map((act) => {
          //             if (
          //               isActExpanded &&
          //               isActExpanded?.mileId === mile.iMileStoneId &&
          //               +act.xLeftLoc > +isActExpanded.xLeftLoc &&
          //               +act.xLeftLoc >
          //                 +isActExpanded.xLeftLoc + expandedWidth &&
          //               +act.LaneId === +isActExpanded.LaneId
          //             ) {
          //               return {
          //                 actId: act.ActivityId,
          //                 xLeftLoc:
          //                   +getFullWidth(index, newProcessData) +
          //                   +act.xLeftLoc -
          //                   expandedWidth +
          //                   widthForDefaultVertex +
          //                   "",
          //               };
          //             } else {
          //               return {
          //                 actId: act.ActivityId,
          //                 xLeftLoc:
          //                   +getFullWidth(index, newProcessData) +
          //                   +act.xLeftLoc +
          //                   "",
          //               };
          //             }
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
            if (+swimlane.LaneId === +swimlaneAtXY.id) {
              newProcessData.Lanes[index] = { ...swimlane };
              if (+newHeight !== +swimlaneAtXY.geometry.height) {
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
          return newProcessData;
        });
        AddGroupBox(
          processDefId,
          processState,
          title + "_" + groupBoxId,
          groupBoxId,
          isExpandedProcessPresent
            ? xLeftLoc - isExpandedProcessPresent.geometry.x + gridSize
            : xLeftLoc,
          isExpandedProcessPresent
            ? yTopLoc
            : isHeightUpdated
            ? +laneHeight +
              +yTopLoc -
              expandedHeight +
              heightForDefaultVertex +
              ""
            : +laneHeight + +yTopLoc,
          parseInt(swimlaneAtXY.getId()),
          setProcessData,
          groupboxWidth,
          groupboxHeight,
          // modified on 25/01/24 for BugId 140984
          // mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
          null,
          // till here BugId 140984
          laneHeightIncreasedFlag ? lanesInfo : null,
          actArr,
          isExpandedProcessPresent ? isExpandedProcessPresent.embeddedId : null
        );
      } else if (vertexStyle === style.textAnnotations) {
        let annotationId = 0,
          processDefId,
          processState;
        let laneHeight = 0,
          isLaneFound = false;
        yTopLoc =
          isExpandedProcessPresent !== null
            ? yTopLoc - isExpandedProcessPresent.geometry.y
            : swimlaneAtXY !== null
            ? yTopLoc - swimlaneAtXY.geometry.y
            : yTopLoc;
        let mileId = mileAtXY ? parseInt(mileAtXY.getId()) : null;
        //if drop is near border, stretch border so that the vertex is completely
        //inside milestone/swimlane
        let newWidth = mileAtXY ? 0 : null;
        let newHeight = swimlaneAtXY
          ? Math.max(
              swimlaneAtXY.geometry.height,
              yTopLoc + cellSize.h + gridSize
            )
          : null;
        let mileIndex,
          mileWidth = 0,
          isActExpanded = null,
          expandedHeight = 0,
          expandedWidth = 0,
          isHeightUpdated = false;
        setNewId((oldIds) => {
          annotationId = oldIds.annotationId + 1;
          return { ...oldIds, annotationId: annotationId };
        });

        const addAnnotationFunc = () => {
          let isValid = true;
          if (btnInput.value?.trim() === "") {
            isValid = false;
            dispatch(
              setToastDataFunc({
                message: translation("EntityCantBeBlank", {
                  entityName: translation("AnnotationName"),
                }),
                severity: "error",
                open: true,
              })
            );
          } else if (
            !checkRegex(
              btnInput.value?.trim(),
              PMWEB_REGEX.Activity_Mile_Lane_Task_Name,
              PMWEB_ARB_REGEX.Activity_Mile_Lane_Task_Name
            )
          ) {
            isValid = false;
            let message = "";
            if (isArabicLocaleSelected()) {
              message =
                translation("AnnotationName") +
                SPACE +
                translation("cannotContain") +
                SPACE +
                "& * | \\ : \" ' < > ? /" +
                SPACE +
                translation("charactersInIt");
            } else {
              message =
                translation("AllCharactersAreAllowedExcept") +
                SPACE +
                "& * | \\ : \" ' < > ? /" +
                SPACE +
                translation("AndFirstCharacterShouldBeAlphabet") +
                SPACE +
                translation("in") +
                SPACE +
                translation("AnnotationName") +
                ".";
            }
            dispatch(
              setToastDataFunc({
                message: message,
                severity: "error",
                open: true,
              })
            );
          } else if (btnInput.value?.trim()?.length > 255) {
            isValid = false;
            dispatch(
              setToastDataFunc({
                message: translation("messages.minMaxChar", {
                  maxChar: 255,
                  entityName: translation("AnnotationName"),
                }),
                severity: "error",
                open: true,
              })
            );
          }

          setProcessData((oldProcessData) => {
            //code edited on 5 August 2022 for Bug 113802
            let newProcessData = JSON.parse(JSON.stringify(oldProcessData));
            newProcessData.Annotations = JSON.parse(
              JSON.stringify(oldProcessData.Annotations)
            );
            processDefId = newProcessData.ProcessDefId;
            processState = newProcessData.ProcessType;
            newProcessData.MileStones?.forEach((mile) => {
              mile.Activities?.forEach((activity) => {
                if (+activity.hide === +activity.ActivityId) {
                  isActExpanded = activity;
                  expandedHeight = +activity.Height;
                  expandedWidth = +activity.Width;
                }
              });
            });
            if (mileAtXY) {
              newWidth = isActExpanded
                ? Math.max(
                    mileAtXY.geometry.width -
                      expandedWidth +
                      widthForDefaultVertex,
                    xLeftLoc - mileAtXY.geometry.x + gridSize + cellSize.w
                  )
                : Math.max(
                    mileAtXY.geometry.width,
                    xLeftLoc - mileAtXY.geometry.x + gridSize + cellSize.w
                  );
            }
            if (
              swimlaneAtXY &&
              (isExpandedProcessPresent === null || !isExpandedProcessPresent)
            ) {
              newProcessData.Lanes?.forEach((lane) => {
                if (lane.LaneId === swimlaneAtXY.id) {
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
            newProcessData.Annotations.push({
              AnnotationId: annotationId,
              xLeftLoc: isExpandedProcessPresent
                ? xLeftLoc - isExpandedProcessPresent.geometry.x
                : xLeftLoc,
              yTopLoc:
                swimlaneAtXY &&
                (isExpandedProcessPresent === null || !isExpandedProcessPresent)
                  ? +laneHeight + +yTopLoc
                  : yTopLoc,
              Height: cellSize.h,
              Width: cellSize.w,
              Comment:
                btnInput.value?.trim() !== "" && isValid
                  ? btnInput.value
                  : translation("EnterComment"),
              LaneId: swimlaneAtXY ? parseInt(swimlaneAtXY.getId()) : 0,
              ParentActivityId: isExpandedProcessPresent
                ? isExpandedProcessPresent.embeddedId
                : 0,
            });
            if (
              swimlaneAtXY &&
              (isExpandedProcessPresent === null || !isExpandedProcessPresent)
            ) {
              newProcessData.MileStones = newProcessData.MileStones.map(
                (milestone, index) => {
                  milestone["oldWidth"] = milestone.Width;
                  if (milestone.iMileStoneId === mileId) {
                    mileIndex = index;
                    if (
                      isActExpanded &&
                      +newWidth !==
                        +milestone.Width - expandedWidth + widthForDefaultVertex
                    ) {
                      mileStoneWidthIncreasedFlag = true;
                      isActExpanded = {
                        ...isActExpanded,
                        mileId: milestone.iMileStoneId,
                      };
                      milestone.widthUpdated = true;
                      milestone.newWidth = newWidth;
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
                  }
                  if (!mileIndex) {
                    mileWidth = mileWidth + +milestone.Width;
                  }
                  return milestone;
                }
              );

              if (mileStoneWidthIncreasedFlag) {
                mileStoneInfo = {
                  arrMilestoneInfos: newProcessData.MileStones?.map(
                    (mile, index) => {
                      return {
                        milestoneId: mile.iMileStoneId,
                        milestoneName: mile.MileStoneName,
                        width:
                          isActExpanded &&
                          isActExpanded?.mileId === mile.iMileStoneId
                            ? newWidth
                            : mile.Width,
                        oldWidth:
                          isActExpanded &&
                          isActExpanded?.mileId === mile.iMileStoneId
                            ? mile.oldWidth -
                              expandedWidth +
                              widthForDefaultVertex
                            : mile.oldWidth,
                        activities: mile.Activities?.map((act) => {
                          if (
                            isActExpanded &&
                            isActExpanded.mileId === mile.iMileStoneId &&
                            +act.xLeftLoc > +isActExpanded.xLeftLoc &&
                            +act.xLeftLoc >
                              +isActExpanded.xLeftLoc + expandedWidth &&
                            +act.LaneId === +isActExpanded.LaneId
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
                if (+swimlane.LaneId === +swimlaneAtXY.id) {
                  newProcessData.Lanes[index] = { ...swimlane };
                  if (+newHeight !== +swimlaneAtXY.geometry.height) {
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
            return newProcessData;
          });
          AddAnnotation(
            processDefId,
            processState,
            btnInput.value?.trim() !== "" && isValid
              ? btnInput.value
              : translation("EnterComment"),
            annotationId,
            isExpandedProcessPresent
              ? xLeftLoc - isExpandedProcessPresent.geometry.x
              : xLeftLoc,
            swimlaneAtXY &&
              (isExpandedProcessPresent === null || !isExpandedProcessPresent)
              ? isHeightUpdated
                ? +laneHeight +
                  +yTopLoc -
                  expandedHeight +
                  heightForDefaultVertex +
                  ""
                : +laneHeight + +yTopLoc
              : yTopLoc,
            cellSize.h,
            cellSize.w,
            swimlaneAtXY ? parseInt(swimlaneAtXY.getId()) : 0,
            setProcessData,
            mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
            laneHeightIncreasedFlag ? lanesInfo : null,
            isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : null
          );
        };

        let btnDiv = document.createElement("div");
        let btnInput = document.createElement("input");
        btnDiv.setAttribute("id", "commentDiv");
        btnInput.setAttribute("id", "commentInput");
        btnDiv.setAttribute(
          "style",
          `position:absolute;display:flex;justify-content:end;z-index:10;width:${commentWidth}px;height:${commentHeight}px;padding:${
            0.2 * gridSize
          }px 1vw;`
        );
        btnInput.setAttribute("value", translation("EnterComment"));
        btnInput.setAttribute(
          "style",
          `position:relative;width:100%;height:100%;`
        );
        let btnSubDiv = document.createElement("div");
        btnSubDiv.setAttribute(
          "style",
          `position:absolute;bottom: -4px;
          left: 75%;
          margin-left: -10px;
          content: "";
          display: block;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid #d7d7d7;`
        );
        btnDiv.style.left =
          Math.max(
            dimensionInMultipleOfGridSize(x) -
              swimlaneTitleWidth -
              commentWidth * 0.5,
            0
          ) + "px";
        btnDiv.style.top =
          isExpandedProcessPresent !== null
            ? Math.max(
                dimensionInMultipleOfGridSize(yTopLoc) +
                  isExpandedProcessPresent.geometry.y -
                  commentHeight,
                0
              ) + "px"
            : swimlaneAtXY !== null
            ? Math.max(
                dimensionInMultipleOfGridSize(yTopLoc) +
                  swimlaneAtXY.geometry.y -
                  commentHeight,
                0
              ) + "px"
            : Math.max(
                dimensionInMultipleOfGridSize(yTopLoc) - commentHeight,
                0
              ) + "px";
        btnDiv.appendChild(btnInput);
        btnDiv.appendChild(btnSubDiv);
        document.addEventListener("click", (e) => {
          if (
            e.target.id !== "commentInput" &&
            graph.view.graph.container.contains(btnDiv)
          ) {
            graph.view.graph.container.removeChild(btnDiv);
            addAnnotationFunc();
          }
        });
        btnInput.addEventListener("keyup", (e) => {
          if (e.code === "Enter") {
            graph.view.graph.container.removeChild(btnDiv);
            addAnnotationFunc();
          }
        });
        graph.view.graph.container.appendChild(btnDiv);
        btnInput.select();
        btnInput.focus();
      } else if (vertexStyle === style.message) {
        let messageId = 0,
          processDefId,
          processState;
        let laneHeight = 0,
          isLaneFound = false;
        yTopLoc =
          isExpandedProcessPresent !== null
            ? yTopLoc - isExpandedProcessPresent.geometry.y
            : swimlaneAtXY !== null
            ? yTopLoc - swimlaneAtXY.geometry.y
            : yTopLoc;
        let mileId = mileAtXY ? parseInt(mileAtXY.getId()) : null;
        //if drop is near border, stretch border so that the vertex is completely
        //inside milestone/swimlane
        let newWidth = mileAtXY ? 0 : null;
        let newHeight = swimlaneAtXY
          ? Math.max(
              swimlaneAtXY.geometry.height,
              yTopLoc + cellSize.h + gridSize
            )
          : null;
        let mileIndex,
          mileWidth = 0,
          isActExpanded = null,
          expandedHeight = 0,
          expandedWidth = 0,
          isHeightUpdated = false;
        setNewId((oldIds) => {
          messageId = oldIds.messageId + 1;
          return { ...oldIds, messageId: messageId };
        });

        setProcessData((oldProcessData) => {
          //code edited on 5 August 2022 for Bug 113802
          let newProcessData = JSON.parse(JSON.stringify(oldProcessData));
          newProcessData.MSGAFS = JSON.parse(
            JSON.stringify(oldProcessData.MSGAFS)
          );
          processDefId = newProcessData.ProcessDefId;
          processState = newProcessData.ProcessType;
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (+activity.hide === +activity.ActivityId) {
                isActExpanded = activity;
                expandedHeight = +activity.Height;
                expandedWidth = +activity.Width;
              }
            });
          });
          if (mileAtXY) {
            newWidth = isActExpanded
              ? Math.max(
                  mileAtXY.geometry.width -
                    expandedWidth +
                    widthForDefaultVertex,
                  xLeftLoc - mileAtXY.geometry.x + gridSize + cellSize.w
                )
              : Math.max(
                  mileAtXY.geometry.width,
                  xLeftLoc - mileAtXY.geometry.x + gridSize + cellSize.w
                );
          }

          if (
            swimlaneAtXY &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.Lanes?.forEach((lane) => {
              if (lane.LaneId === swimlaneAtXY.id) {
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
          newProcessData.MSGAFS.push({
            MsgAFId: messageId,
            xLeftLoc: isExpandedProcessPresent
              ? xLeftLoc - isExpandedProcessPresent.geometry.x
              : xLeftLoc,
            yTopLoc:
              swimlaneAtXY &&
              (isExpandedProcessPresent === null || !isExpandedProcessPresent)
                ? +laneHeight + +yTopLoc
                : yTopLoc,
            MsgAFName: title + "_" + messageId,
            LaneId: swimlaneAtXY ? parseInt(swimlaneAtXY.getId()) : 0,
            ParentActivityId: isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : 0,
          });

          if (
            swimlaneAtXY &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.MileStones = newProcessData.MileStones.map(
              (milestone, index) => {
                milestone["oldWidth"] = milestone.Width;
                if (milestone.iMileStoneId === mileId) {
                  mileIndex = index;
                  if (
                    isActExpanded &&
                    +newWidth !==
                      +milestone.Width - expandedWidth + widthForDefaultVertex
                  ) {
                    mileStoneWidthIncreasedFlag = true;
                    isActExpanded = {
                      ...isActExpanded,
                      mileId: milestone.iMileStoneId,
                    };
                    milestone.widthUpdated = true;
                    milestone.newWidth = newWidth;
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
                }
                if (!mileIndex) {
                  mileWidth = mileWidth + +milestone.Width;
                }
                return milestone;
              }
            );

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
                          ? newWidth
                          : mile.Width,
                      oldWidth:
                        isActExpanded &&
                        isActExpanded?.mileId === mile.iMileStoneId
                          ? mile.oldWidth -
                            expandedWidth +
                            widthForDefaultVertex
                          : mile.oldWidth,
                      activities: mile.Activities?.map((act) => {
                        if (
                          isActExpanded &&
                          isActExpanded?.mileId === mile.iMileStoneId &&
                          +act.xLeftLoc > +isActExpanded.xLeftLoc &&
                          +act.xLeftLoc >
                            +isActExpanded.xLeftLoc + expandedWidth &&
                          +act.LaneId === +isActExpanded.LaneId
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
              if (+swimlane.LaneId === +swimlaneAtXY.id) {
                newProcessData.Lanes[index] = { ...swimlane };
                if (+newHeight !== +swimlaneAtXY.geometry.height) {
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
          return newProcessData;
        });

        AddMsgAF(
          processDefId,
          processState,
          title + "_" + messageId,
          messageId,
          isExpandedProcessPresent
            ? xLeftLoc - isExpandedProcessPresent.geometry.x
            : xLeftLoc,
          swimlaneAtXY &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
            ? isHeightUpdated
              ? +laneHeight +
                +yTopLoc -
                expandedHeight +
                heightForDefaultVertex +
                ""
              : +laneHeight + +yTopLoc
            : yTopLoc,
          swimlaneAtXY ? parseInt(swimlaneAtXY.getId()) : 0,
          setProcessData,
          mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
          laneHeightIncreasedFlag ? lanesInfo : null,
          isExpandedProcessPresent ? isExpandedProcessPresent.embeddedId : null
        );
      } else if (vertexStyle === style.dataObject) {
        let dataObjectId = 0,
          processDefId,
          processState;
        let laneHeight = 0,
          isLaneFound = false;
        yTopLoc =
          isExpandedProcessPresent !== null
            ? yTopLoc - isExpandedProcessPresent.geometry.y
            : swimlaneAtXY !== null
            ? yTopLoc - swimlaneAtXY.geometry.y
            : yTopLoc;
        let mileId = mileAtXY ? parseInt(mileAtXY.getId()) : null;
        //if drop is near border, stretch border so that the vertex is completely
        //inside milestone/swimlane
        let newWidth = mileAtXY ? 0 : null;

        let newHeight = swimlaneAtXY
          ? Math.max(
              swimlaneAtXY.geometry.height,
              yTopLoc + cellSize.h + gridSize
            )
          : null;
        let mileIndex,
          mileWidth = 0,
          isActExpanded = null,
          expandedHeight = 0,
          expandedWidth = 0,
          isHeightUpdated = false;
        setNewId((oldIds) => {
          dataObjectId = oldIds.dataObjectId + 1;
          return { ...oldIds, dataObjectId: dataObjectId };
        });

        setProcessData((oldProcessData) => {
          //code edited on 5 August 2022 for Bug 113802
          let newProcessData = JSON.parse(JSON.stringify(oldProcessData));
          newProcessData.DataObjects = JSON.parse(
            JSON.stringify(oldProcessData.DataObjects)
          );
          processDefId = newProcessData.ProcessDefId;
          processState = newProcessData.ProcessType;
          newProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (+activity.hide === +activity.ActivityId) {
                isActExpanded = activity;
                expandedHeight = +activity.Height;
                expandedWidth = +activity.Width;
              }
            });
          });
          if (mileAtXY) {
            newWidth = isActExpanded
              ? Math.max(
                  mileAtXY.geometry.width -
                    expandedWidth +
                    widthForDefaultVertex,
                  xLeftLoc - mileAtXY.geometry.x + gridSize + cellSize.w
                )
              : Math.max(
                  mileAtXY.geometry.width,
                  xLeftLoc - mileAtXY.geometry.x + gridSize + cellSize.w
                );
          }

          if (
            swimlaneAtXY &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.Lanes?.forEach((lane) => {
              if (lane.LaneId === swimlaneAtXY.id) {
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
          newProcessData.DataObjects.push({
            DataObjectId: dataObjectId,
            xLeftLoc: isExpandedProcessPresent
              ? xLeftLoc - isExpandedProcessPresent.geometry.x
              : xLeftLoc,
            yTopLoc:
              swimlaneAtXY &&
              (isExpandedProcessPresent === null || !isExpandedProcessPresent)
                ? +laneHeight + +yTopLoc
                : yTopLoc,
            Data: title + "_" + dataObjectId,
            LaneId: swimlaneAtXY ? parseInt(swimlaneAtXY.getId()) : 0,
            ParentActivityId: isExpandedProcessPresent
              ? isExpandedProcessPresent.embeddedId
              : 0,
          });
          if (
            swimlaneAtXY &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
          ) {
            newProcessData.MileStones = newProcessData.MileStones.map(
              (milestone, index) => {
                milestone["oldWidth"] = milestone.Width;
                if (milestone.iMileStoneId === mileId) {
                  mileIndex = index;
                  if (
                    isActExpanded &&
                    +newWidth !==
                      +milestone.Width - expandedWidth + widthForDefaultVertex
                  ) {
                    mileStoneWidthIncreasedFlag = true;
                    isActExpanded = {
                      ...isActExpanded,
                      mileId: milestone.iMileStoneId,
                    };
                    milestone.widthUpdated = true;
                    milestone.newWidth = newWidth;
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
                }
                if (!mileIndex) {
                  mileWidth = mileWidth + +milestone.Width;
                }
                return milestone;
              }
            );

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
                          ? newWidth
                          : mile.Width,
                      oldWidth:
                        isActExpanded &&
                        isActExpanded?.mileId === mile.iMileStoneId
                          ? mile.oldWidth -
                            expandedWidth +
                            widthForDefaultVertex
                          : mile.oldWidth,
                      activities: mile.Activities?.map((act) => {
                        if (
                          isActExpanded &&
                          isActExpanded?.mileId === mile.iMileStoneId &&
                          +act.xLeftLoc > +isActExpanded.xLeftLoc &&
                          +act.xLeftLoc >
                            +isActExpanded.xLeftLoc + expandedWidth &&
                          +act.LaneId === +isActExpanded.LaneId
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
              if (+swimlane.LaneId === +swimlaneAtXY.id) {
                newProcessData.Lanes[index] = { ...swimlane };
                if (+newHeight !== +swimlaneAtXY.geometry.height) {
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
          return newProcessData;
        });

        AddDataObject(
          processDefId,
          processState,
          title + "_" + dataObjectId,
          dataObjectId,
          isExpandedProcessPresent
            ? xLeftLoc - isExpandedProcessPresent.geometry.x
            : xLeftLoc,
          swimlaneAtXY &&
            (isExpandedProcessPresent === null || !isExpandedProcessPresent)
            ? isHeightUpdated
              ? +laneHeight +
                +yTopLoc -
                expandedHeight +
                heightForDefaultVertex +
                ""
              : +laneHeight + +yTopLoc
            : yTopLoc,
          swimlaneAtXY ? parseInt(swimlaneAtXY.getId()) : 0,
          setProcessData,
          mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
          laneHeightIncreasedFlag ? lanesInfo : null,
          isExpandedProcessPresent ? isExpandedProcessPresent.embeddedId : null
        );
      }
    }
    // to add tasks in tasklane
    else if (
      (prototype.getStyle() === style.taskTemplate ||
        prototype.getStyle() === style.newTask ||
        prototype.getStyle() === style.processTask) &&
      tasklaneAtXY !== null
    ) {
      let parentCell = tasklaneAtXY;
      let vertexX = x - parentCell.geometry.x;
      let vertexY = y - parentCell.geometry.y;
      let newHeight = Math.max(
        parentCell.geometry.height,
        vertexY + heightForDefaultVertex + gridSize
      );
      let newWidth = Math.max(
        parentCell.geometry.width,
        vertexX + widthForDefaultVertex + gridSize
      );
      let mileWidth = swimlaneTitleWidth;
      let maxId = 0;
      let processDefId;
      let newProcessData;
      setProcessData((prevProcessData) => {
        //code edited on 5 August 2022 for Bug 113802
        newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        processDefId = newProcessData.ProcessDefId;
        for (let i of newProcessData.Tasks) {
          if (maxId < +i.TaskId) {
            maxId = +i.TaskId;
          }
        }
        newProcessData.MileStones?.forEach((mile) => {
          mileWidth = mileWidth + +mile.Width;
        });
        // code added on 13 April 2023 for BugId 126775
        let taskTempVar = taskTemplateVar
          ? taskTemplateVar?.map((taskVr) => {
              return {
                ControlType: "",
                DBLinking: taskVr.m_strDBLinking,
                DisplayName: taskVr.m_strDisplayName,
                OrderId: taskVr.m_iOrderId,
                TemplateVariableId: taskVr.m_iTempVarId,
                VariableName: taskVr.m_strVariableName,
                VariableType: getVariableType(`${taskVr.m_strVariableType}`),
              };
            })
          : [];
        newProcessData.Tasks.splice(newProcessData.Tasks?.length, 0, {
          CheckedOut: "N",
          Description: "",
          Goal: "",
          Instructions: "",
          NotifyEmail: "N",
          Repeatable: "N",
          TaskId: maxId + 1,
          TaskName: `${title}_${maxId + 1}`,
          TaskType: prototype.getStyle() === style.processTask ? 2 : 1, // code edited on 3 Oct 2022 for BugId 116511
          StrTaskType:
            prototype.getStyle() === style.processTask
              ? TaskType.processTask
              : TaskType.globalTask, // code edited on 3 Oct 2022 for BugId 116511
          TemplateId: -1,
          TaskTemplateVar: [...taskTempVar], // code added on 13 April 2023 for BugId 126775
          isActive: "true",
          xLeftLoc: vertexX,
          yTopLoc: vertexY,
          TaskMode: prototype.getStyle() === style.processTask ? "S" : "",
        });
        newProcessData.Lanes[0].oldHeight = newProcessData.Lanes[0].Height + "";
        newProcessData.Lanes[0].oldWidth = mileWidth + "";
        //change height of tasklane , if drop is near boundary
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
          // code added to update activities yTopLoc when tasklane height increased
          newProcessData.MileStones?.forEach((mile, mileIdx) => {
            mile.Activities?.forEach((act, actidx) => {
              newProcessData.MileStones[mileIdx].Activities[actidx].yTopLoc =
                +act.yTopLoc +
                +newProcessData.Lanes[0].Height -
                +newProcessData.Lanes[0].oldHeight;
            });
          });
        }
        return newProcessData;
      });
      addTaskAPI(
        maxId + 1,
        `${title}_${maxId + 1}`,
        prototype.getStyle() === style.processTask ? 2 : 1, //taskType value for global/new task = 1, for process task = 2
        vertexX,
        vertexY,
        setProcessData,
        processDefId,
        null,
        null,
        "",
        -1,
        laneHeightIncreasedFlag ? lanesInfo : null,
        "BPMN",
        prototype.getStyle() === style.newTask ? true : false,
        taskTemplateId,
        prototype.getStyle() === style.processTask ? "S" : ""
      );
    }
    // to add activity on graph, expanded Embedded subprocess is present on graph
    else if (
      mileAtXY !== null &&
      isExpandedProcessPresent !== null &&
      prototype.getStyle() !== style.taskTemplate &&
      prototype.getStyle() !== style.newTask &&
      prototype.getStyle() !== style.processTask
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
      setNewId((oldIds) => {
        newActivityId = oldIds.activityId + 1;
        return { ...oldIds, activityId: newActivityId };
      });
      // Added on 22-01-24 for Bug 141498
      let newActName = title + "_" + newActivityId;
      // Till here for Bug 141498
      setProcessData((prevProcessData) => {
        //code edited on 5 August 2022 for Bug 113802
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
      queueInfo = getActivityQueueObj(
        setNewId,
        activityType,
        activitySubType,
        // Modified on 22-01-24 for Bug 141498
        newActName,
        // Till here for Bug 141498
        newProcessData,
        parentActivity.LaneId,
        translation
      );
      processDefId = newProcessData.ProcessDefId;
      processName = newProcessData.ProcessName;
      let maxLaneHeight = 0,
        currentLaneHeight = 0,
        currentLaneSeqId = null;
      let isLaneUpdated = false;
      setProcessData((prevProcessData) => {
        //code edited on 5 August 2022 for Bug 113802
        let newData = JSON.parse(JSON.stringify(prevProcessData));
        newData.MileStones = JSON.parse(
          JSON.stringify(prevProcessData.MileStones)
        );
        newData.Lanes = JSON.parse(JSON.stringify(prevProcessData.Lanes));
        let laneSeqHeightMap = new Map();
        let laneIdSeqMap = new Map();
        let nextLaneArr = [];
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
        newData.Lanes?.forEach((lane) => {
          if (currentLaneSeqId !== null) {
            nextLaneArr.push(lane.LaneId);
          }
          if (+lane.LaneId === +parentActivity.LaneId) {
            maxLaneHeight = +lane.Height;
            currentLaneHeight = +lane.Height;
            currentLaneSeqId = lane.LaneSeqId;
          }
          laneSeqHeightMap.set(lane.LaneSeqId, lane.Height);
          laneIdSeqMap.set(lane.LaneId, lane.LaneSeqId);
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
                  // Modified on 22-01-24 for Bug 141498
                  ActivityName: newActName,
                  // Till here for Bug 141498
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
                  embActivities = [...activity.EmbeddedActivity[0], newActObj];
                } else if (
                  checkIfSwimlaneCheckedOut(newProcessData)?.length === 0
                ) {
                  embActivities = [...activity.EmbeddedActivity[0], newActObj];
                }
                return {
                  ...activity,
                  EmbeddedActivity: [[...embActivities]],
                  Width: newWidth,
                  Height: newHeight,
                };
              }

              let isDefaultVertex = checkStyle(
                defaultShapeVertex,
                getActivityProps(
                  activity.ActivityType,
                  activity.ActivitySubType
                )[5]
              );
              let isNewActDefault = checkStyle(
                defaultShapeVertex,
                getActivityProps(activityType, activitySubType)[5]
              );

              if (expandedActWidth !== newWidth) {
                let activityHeight = isDefaultVertex
                  ? heightForDefaultVertex
                  : gridSize;
                let newActivityWidth = isNewActDefault
                  ? widthForDefaultVertex
                  : gridSize;
                let maxMileWidth = +milestone.Width;
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
                  if (
                    maxMileWidth <=
                    activity.xLeftLoc + newActivityWidth + gridSize
                  ) {
                    maxMileWidth = maxMileWidth + newWidth - expandedActWidth;
                  }
                }
                milestone.Width = maxMileWidth;
              }

              if (expandedActHeight !== newHeight) {
                let activityWidth = isDefaultVertex
                  ? widthForDefaultVertex
                  : gridSize;
                let actHeight = isDefaultVertex
                  ? heightForDefaultVertex
                  : gridSize;
                if (
                  +activity.LaneId === +parentActivity.LaneId &&
                  +activity.yTopLoc > +parentActivity.yTopLoc &&
                  ((+activity.xLeftLoc <= +parentActivity.xLeftLoc + newWidth &&
                    +activity.xLeftLoc >= +parentActivity.xLeftLoc) ||
                    (+activity.xLeftLoc + activityWidth <=
                      +parentActivity.xLeftLoc + newWidth &&
                      +activity.xLeftLoc + activityWidth >=
                        +parentActivity.xLeftLoc))
                ) {
                  activity.yTopLoc =
                    +activity.yTopLoc + newHeight - expandedActHeight;
                  let laneSeqId = laneIdSeqMap.get(activity.LaneId);
                  let totalHeight = 0;
                  for (let i = 0; i < laneSeqId; i++) {
                    totalHeight = +totalHeight + +laneSeqHeightMap.get(i);
                  }
                  if (
                    maxLaneHeight <=
                    activity.yTopLoc - +totalHeight + actHeight - gridSize
                  ) {
                    maxLaneHeight =
                      maxLaneHeight + newHeight - expandedActHeight;
                    isLaneUpdated = true;
                  }
                }
                if (isLaneUpdated) {
                  if (nextLaneArr.includes(activity.LaneId)) {
                    activity.yTopLoc =
                      +activity.yTopLoc + maxLaneHeight - currentLaneHeight;
                  }
                }
              }
              return activity;
            });
            return { ...milestone, Activities: mileActivities };
          } else {
            let mileActivities = [];
            mileIndex = index;
            mileActivities = milestone.Activities?.map((activity) => {
              if (isLaneUpdated) {
                if (nextLaneArr.includes(activity.LaneId)) {
                  activity.yTopLoc =
                    +activity.yTopLoc + maxLaneHeight - currentLaneHeight;
                }
              }
              return activity;
            });
            return { ...milestone, Activities: mileActivities };
          }
        });
        let laneArr = [];
        laneArr = newData.Lanes?.map((lane) => {
          if (+lane.LaneId === +parentActivity.LaneId) {
            lane.Height = maxLaneHeight;
          }
          return lane;
        });
        return { ...newData, MileStones: mileArr, Lanes: laneArr };
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
        checkIfParentSwimlaneCheckedOut(newProcessData, parentActivity.LaneId)
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
      }

      return true;
    }
    // to add activity in swimlane
    else if (
      mileAtXY !== null &&
      graph.isSwimlane(prototype) === false &&
      prototype.getStyle() !== style.taskTemplate &&
      prototype.getStyle() !== style.newTask &&
      prototype.getStyle() !== style.processTask
    ) {
      let parentCell = swimlaneAtXY;
      let vertexX = x - mileAtXY.geometry.x + gridSize;
      let vertexY = y - parentCell.geometry.y;
      let parentCellId = parseInt(parentCell.getId());
      let mileId = parseInt(mileAtXY.getId());
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
        expandedActMile = null,
        expandedHeight = 0,
        expandedWidth = 0,
        isHeightUpdated = false;
      let laneHeight = milestoneTitleWidth;
      let isLaneFound = false,
        nextLanes = [],
        parentLaneSeq = null;
      let isActYTopExpanded = false,
        isActXLeftExpanded = false;

      let startName = "",
        endName = "";

      setNewId((oldIds) => {
        newActivityId = oldIds.activityId + 1;
        return { ...oldIds, activityId: newActivityId };
      });
      // Added on 22-01-24 for Bug 141498
      let newActName = title + "_" + newActivityId;
      // Till here for Bug 141498

      setProcessData((prevProcessData) => {
        //code edited on 5 August 2022 for Bug 113802
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
        processDefId = newProcessData.ProcessDefId;
        processName = newProcessData.ProcessName;
        return prevProcessData;
      });

      queueInfo = getActivityQueueObj(
        setNewId,
        activityType,
        activitySubType,
        // Modified on 22-01-24 for Bug 141498
        newActName,
        // Till here for Bug 141498
        newProcessData,
        parentCellId,
        translation
      );

      /* code edited on 4 August 2023 for BugId 130480 - Jboss EAP+Oracle: If click on convert to 
      Case Workstep option for checked out process, getting error connect failed */
      const addActFunc = () => {
        setProcessData((prevProcessData) => {
          //code edited on 5 August 2022 for Bug 113802
          //do not do shallow copy process Data, else original state will get change
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          newProcessData.MileStones = JSON.parse(
            JSON.stringify(prevProcessData.MileStones)
          );
          newProcessData.Lanes = JSON.parse(
            JSON.stringify(prevProcessData.Lanes)
          );
          let nextMileArr = [],
            nextLaneArr = [];
          let expandedMileSeqId = null,
            expandedLaneSeqId = null;
          let actAddExpSP_Right = false,
            actAddExpSP_Left = false;

          newProcessData.MileStones?.forEach((milestone) => {
            if (expandedMileSeqId !== null) {
              nextMileArr.push(milestone.iMileStoneId);
            }
            if (+milestone.iMileStoneId === +mileId) {
              milestone?.Activities?.forEach((activity) => {
                if (+activity.SequenceId > +MaxseqId) {
                  MaxseqId = +activity.SequenceId;
                }
                if (
                  +activity.ActivityType === 35 &&
                  +activity.ActivitySubType === 1 // code added on 1 March 2023 for BugId 124474
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
                expandedMileSeqId = milestone.SequenceId;
              }
            });
          });
          let newVStyle = checkStyle(defaultShapeVertex, prototype.getStyle());
          // code edited on 28 Feb 2023 for BugId 124065
          newWidth =
            isActExpanded && +expandedActMile === +mileId
              ? Math.max(
                  mileAtXY.geometry.width -
                    expandedWidth +
                    widthForDefaultVertex,
                  vertexX + (newVStyle ? widthForDefaultVertex : cellSize.w)
                )
              : Math.max(
                  mileAtXY.geometry.width,
                  vertexX + (newVStyle ? widthForDefaultVertex : cellSize.w)
                );
          if (
            newWidth ===
              vertexX + (newVStyle ? widthForDefaultVertex : cellSize.w) &&
            isActExpanded &&
            +expandedActMile === +mileId
          ) {
            if (
              +vertexX - expandedWidth + widthForDefaultVertex >
              +isActExpanded.xLeftLoc
            ) {
              actAddExpSP_Right = true;
            } else {
              actAddExpSP_Left = true;
            }
          }

          // code edited on 28 Feb 2023 for BugId 124065
          newHeight =
            isActExpanded && isActExpanded.LaneId === swimlaneAtXY.id
              ? Math.max(
                  swimlaneAtXY.geometry.height -
                    expandedHeight +
                    heightForDefaultVertex,
                  y -
                    swimlaneAtXY.geometry.y +
                    (newVStyle
                      ? heightForDefaultVertex + gridSize
                      : cellSize.h + gridSize)
                )
              : Math.max(
                  swimlaneAtXY.geometry.height,
                  y -
                    swimlaneAtXY.geometry.y +
                    (newVStyle
                      ? heightForDefaultVertex + gridSize
                      : cellSize.h + gridSize)
                );

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
            if (expandedLaneSeqId !== null) {
              nextLaneArr.push(lane.LaneId);
            }
            if (
              isActExpanded !== null &&
              lane.LaneId === isActExpanded.LaneId
            ) {
              expandedLaneSeqId = lane.LaneSeqId;
            }
          });

          //assumption that each milestone have unique iMilestoneId
          newProcessData.MileStones = newProcessData.MileStones.map(
            (milestone, index) => {
              milestone["oldWidth"] = milestone.Width;
              if (milestone.iMileStoneId === mileId) {
                mileIndex = index;
                let tempActArr = [...milestone.Activities];
                if (
                  isActExpanded &&
                  +expandedActMile === +milestone.iMileStoneId &&
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
                  if (actAddExpSP_Left) {
                    milestone.newWidth = newWidth;
                  } else {
                    milestone.newWidth =
                      newWidth - expandedWidth + widthForDefaultVertex;
                  }

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
                  // code added on 29 March 2023 for BugId 124819
                  startName =
                    translation(embeddedStartEvent.title) +
                    "_" +
                    title +
                    "_" +
                    (newActivityId + 1);
                  if (startName.length >= maxLabelCharacter) {
                    startName =
                      translation(embeddedStartEvent.title) +
                      "_" +
                      replaceNChars(
                        title,
                        `_${newActivityId + 1}`,
                        `_${newActivityId + 1}`.length
                      );
                  }

                  endName =
                    translation(embeddedEndEvent.title) +
                    "_" +
                    title +
                    "_" +
                    (newActivityId + 2);
                  if (endName.length >= maxLabelCharacter) {
                    endName =
                      translation(embeddedEndEvent.title) +
                      "_" +
                      replaceNChars(
                        title,
                        `_${newActivityId + 2}`,
                        `_${newActivityId + 2}`.length
                      );
                  }
                  // code added on 1 March 2023 for BugId 124474
                  newActObj = {
                    ActivityId: newActivityId,
                    ActivityName: newActName,
                    ActivityType: activityType,
                    ActivitySubType: activitySubType,
                    LaneId: parentCellId,
                    xLeftLoc: vertexX,
                    yTopLoc: +laneHeight + vertexY,
                    isActive: "true",
                    Height: expandedViewHeight,
                    Width: expandedViewWidth,
                    BlockId:
                      isGroupBoxPresent !== null ? +isGroupBoxPresent.id : 0,
                    CheckedOut: "",
                    Color: "1234",
                    FromRegistered: "N",
                    EmbeddedActivity: [
                      [
                        {
                          ActivityId: newActivityId + 1,
                          ActivityName: startName,
                          ActivityType: 1,
                          ActivitySubType: 1,
                          LaneId: parentCellId,
                          xLeftLoc: 2 * graphGridSize,
                          yTopLoc: 6 * graphGridSize,
                          isActive: "true",
                          BlockId:
                            isGroupBoxPresent !== null
                              ? +isGroupBoxPresent.id
                              : 0,
                          CheckedOut: "",
                          Color: "1234",
                          FromRegistered: "N",
                          QueueCategory: "",
                          QueueId: 0,
                          Height: expandedViewHeight,
                          Width: expandedViewWidth,
                          SequenceId: +MaxseqId + 2,
                          EmbeddedActivityType: "S", // code added on 1 March 2023 for BugId 124474
                          id: "",
                          AssociatedTasks: [],
                        },
                        {
                          ActivityId: newActivityId + 2,
                          ActivityName: endName,
                          ActivityType: 2,
                          ActivitySubType: 1,
                          LaneId: parentCellId,
                          xLeftLoc: 28 * graphGridSize,
                          yTopLoc: 6 * graphGridSize,
                          isActive: "true",
                          BlockId:
                            isGroupBoxPresent !== null
                              ? +isGroupBoxPresent.id
                              : 0,
                          CheckedOut: "",
                          Color: "1234",
                          FromRegistered: "N",
                          QueueCategory: "",
                          QueueId: 0,
                          SequenceId: +MaxseqId + 3,
                          id: "",
                          AssociatedTasks: [],
                          EmbeddedActivityType: "E", // code added on 1 March 2023 for BugId 124474
                          Height: expandedViewHeight,
                          Width: expandedViewWidth,
                        },
                      ],
                    ],
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
                    BlockId:
                      isGroupBoxPresent !== null ? +isGroupBoxPresent.id : 0,
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
                } else if (isActExpanded !== null) {
                  if (nextMileArr.includes(+milestone.iMileStoneId)) {
                    isActXLeftExpanded = true;
                    newActObj.isActXLeftExpanded = true;
                  }
                  if (nextLaneArr.includes(newActObj.LaneId)) {
                    isActYTopExpanded = true;
                  }
                }
                if (
                  checkIfParentSwimlaneCheckedOut(newProcessData, parentCellId)
                    ?.length > 0
                ) {
                  newActObj.status = "I";
                  // added on 09/10/23 for BugId 138932
                  newActObj.newXLeft =
                    mileIndex === 0
                      ? isActXLeftExpanded
                        ? vertexX - expandedWidth + widthForDefaultVertex
                        : vertexX
                      : isActXLeftExpanded
                      ? +mileWidth +
                        vertexX -
                        expandedWidth +
                        widthForDefaultVertex
                      : +mileWidth + vertexX;
                  newActObj.newYTop =
                    isHeightUpdated || isActYTopExpanded
                      ? +laneHeight +
                        vertexY -
                        expandedHeight +
                        heightForDefaultVertex +
                        ""
                      : +laneHeight + vertexY;
                  newProcessData.SwimlaneCheckinChanges = true;
                  tempActArr.push(newActObj);
                } else if (
                  checkIfSwimlaneCheckedOut(newProcessData)?.length === 0
                ) {
                  tempActArr.push(newActObj);
                }
                return { ...milestone, Activities: [...tempActArr] };
              }
              if (!mileIndex) {
                mileWidth = mileWidth + +milestone.Width;
              }
              return milestone;
            }
          );
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
                        ? actAddExpSP_Left
                          ? newWidth
                          : newWidth - expandedWidth + widthForDefaultVertex
                        : mile.Width,
                    oldWidth:
                      isActExpanded &&
                      isActExpanded?.mileId === mile.iMileStoneId
                        ? mile.oldWidth - expandedWidth + widthForDefaultVertex
                        : mile.oldWidth,
                    activities: mile.Activities?.map((act) => {
                      if (
                        isActExpanded &&
                        isActExpanded?.mileId === mile.iMileStoneId &&
                        +act.xLeftLoc >
                          +isActExpanded.xLeftLoc + expandedWidth &&
                        +act.LaneId === +isActExpanded.LaneId
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
                        if (
                          nextMileArr.includes(mile.iMileStoneId) &&
                          actAddExpSP_Left
                        ) {
                          return {
                            actId: act.ActivityId,
                            xLeftLoc:
                              +getFullWidth(
                                index,
                                newProcessData,
                                true,
                                isActExpanded.mileId
                              ) +
                              +act.xLeftLoc +
                              "",
                          };
                        }
                        if (
                          nextMileArr.includes(mile.iMileStoneId) &&
                          actAddExpSP_Right
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
                        }
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
            // added on 26/09/2023 for BugId 135854 - embedded subprocess>>getting error while droping any
            // activity in swimlane 2 when embedded subprocess is in expanded mode
            else {
              if (isActExpanded && +isActExpanded.LaneId === +swimlane.LaneId) {
                newProcessData.Lanes[index].updatedHeight =
                  swimlane.Height - expandedHeight + heightForDefaultVertex;
              } else {
                newProcessData.Lanes[index].updatedHeight = swimlane.Height;
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
        graph.setSelectionCell(prototype);
        graph.fireEvent(new mxEventObject("cellsInserted", "cells", prototype));

        if (
          // modified on 20/10/23 for BugId 136278
          // checkIfParentSwimlaneCheckedOut(newProcessData, parentCellId)?.length === 0
          checkIfSwimlaneCheckedOut(newProcessData)?.length === 0
        ) {
          if (+activityType === 35 && +activitySubType === 1) {
            // code added on 1 March 2023 for BugId 124474
            AddEmbeddedActivity(
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
                blockId: isGroupBoxPresent !== null ? +isGroupBoxPresent.id : 0,
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
              [
                {
                  processDefId: processDefId,
                  processName: processName,
                  actName: startName,
                  actId: +newActivityId + 1,
                  actType: 1,
                  actSubType: 1,
                  actAssocId: 0,
                  seqId: +MaxseqId + 2,
                  laneId: parentCellId,
                  blockId:
                    isGroupBoxPresent !== null ? +isGroupBoxPresent.id : 0,
                  queueId: 0,
                  queueInfo: { queueId: 0 },
                  queueExist: false,
                  xLeftLoc: 2 * graphGridSize,
                  yTopLoc: 6 * graphGridSize,
                  milestoneId: mileId,
                  parentActivityId: +newActivityId,
                  embeddedActivityType: "S", // code added on 1 March 2023 for BugId 124474
                  height: expandedViewHeight,
                  width: expandedViewWidth,
                },
                {
                  processDefId: processDefId,
                  processName: processName,
                  actName: endName,
                  actId: +newActivityId + 2,
                  actType: 2,
                  actSubType: 1,
                  actAssocId: 0,
                  seqId: +MaxseqId + 3,
                  laneId: parentCellId,
                  blockId:
                    isGroupBoxPresent !== null ? +isGroupBoxPresent.id : 0,
                  queueId: 0,
                  queueInfo: { queueId: 0 },
                  queueExist: false,
                  xLeftLoc: 28 * graphGridSize,
                  yTopLoc: 6 * graphGridSize,
                  milestoneId: mileId,
                  parentActivityId: +newActivityId,
                  embeddedActivityType: "E", // code added on 1 March 2023 for BugId 124474
                  height: expandedViewHeight,
                  width: expandedViewWidth,
                },
              ],
              mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
              laneHeightIncreasedFlag ? lanesInfo : null
            );
          } else {
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
                blockId: isGroupBoxPresent !== null ? +isGroupBoxPresent.id : 0,
                queueInfo: queueInfo,
                xLeftLoc:
                  mileIndex === 0
                    ? isActXLeftExpanded
                      ? vertexX - expandedWidth + widthForDefaultVertex
                      : vertexX
                    : isActXLeftExpanded
                    ? +mileWidth +
                      vertexX -
                      expandedWidth +
                      widthForDefaultVertex
                    : +mileWidth + vertexX, // code edited on 9 March 2023 for BugId 124704
                yTopLoc:
                  isHeightUpdated || isActYTopExpanded
                    ? +laneHeight +
                      vertexY -
                      expandedHeight +
                      heightForDefaultVertex +
                      ""
                    : +laneHeight + vertexY, // code edited on 28 Feb 2023 for BugId 124065
                view: "BPMN",
              },
              { mileId: mileId, mileIndex: mileIndex },
              setProcessData,
              vertexX,
              mileStoneWidthIncreasedFlag ? mileStoneInfo : null,
              laneHeightIncreasedFlag ? lanesInfo : null
            );
          }
        }
      };

      /* code added on 4 August 2023 for BugId 130480 - Jboss EAP+Oracle: If click on convert to 
      Case Workstep option for checked out process, getting error connect failed */
      if (
        checkIfParentSwimlaneCheckedOut(newProcessData, parentCellId)?.length >
          0 &&
        queueInfo.queueId !== 0 &&
        !queueInfo.queueExist
      ) {
        saveQueueData(
          processDefId,
          processName,
          // Modified on 22-01-24 for Bug 141498
          newActName,
          // Till here for Bug 141498
          newActivityId,
          activityType,
          activitySubType,
          queueInfo,
          queueInfo,
          (queueId) => {
            queueInfo.queueId = queueId;
            addActFunc();
          },
          1
        );
      } else {
        addActFunc();
      }

      return true;
    }
    graph.setSelectionCell(prototype);
    return false;
  };

  // Creates the image which is used as the drag icon (preview)
  var img = toolbar.addMode(title, image, function (evt, cell) {
    var pt = this.graph.getPointForEvent(evt);
    toDropOnGraph(graph, evt, cell, pt.x, pt.y);
  });

  // This listener is always called first before any other listener
  // in all browsers.
  mxEvent.addListener(img, "mousedown", function (evt) {
    if (img.enabled === false) {
      mxEvent.consume(evt);
    }
  });

  //adds drag and drop feature to toolbox
  let dragSource = mxUtils.makeDraggable(
    toolbar.container.parentElement,
    graph,
    toDropOnGraph,
    div,
    null,
    null,
    graph.autoScroll,
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
    // Updates the location of the preview
    if (this.previewElement != null) {
      let newProcessData, processType;
      setProcessData((prevProcessData) => {
        newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        processType = prevProcessData.ProcessType;
        return prevProcessData;
      });
      if (
        prototype.getStyle() === style.taskTemplate ||
        prototype.getStyle() === style.newTask ||
        prototype.getStyle() === style.processTask
      ) {
        let isTasklanePresent = getTasklaneAt(x, y, AddVertexType);
        isTaskPresent = getTaskAt(
          x,
          y,
          isTasklanePresent,
          graph,
          width,
          height,
          null
        );
        if (isTasklanePresent === null) {
          this.previewElement.children[0].src = disabledIcon;
        } else {
          if (isTaskPresent) {
            this.previewElement.children[0].src = disabledIcon;
          } else {
            // code edited on 29 May 2023 for BugId 127062
            if (checkIfSwimlaneCheckedOut(newProcessData)?.length > 0) {
              this.previewElement.children[0].src = disabledIcon;
            } else {
              this.previewElement.children[0].src = image;
              this.previewElement.style.border = "1px dotted black";
            }
          }
        }
      } else if (
        prototype.getStyle() !== style.taskTemplate &&
        prototype.getStyle() !== style.newTask &&
        prototype.getStyle() !== style.processTask &&
        !isAllowedOutsideMilestone(prototype.getStyle())
      ) {
        let isMilestonePresent = getMilestoneAt(x, y);
        //here if the currentPoint is not inside milestone then disabled icon is displayed
        if (isMilestonePresent === null) {
          if (!isAllowedOutsideMilestone(prototype.getStyle())) {
            this.previewElement.children[0].src = disabledIcon;
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
          isGroupBoxPresent = getGroupBoxAt(
            x,
            y,
            isSwimlanePresent,
            graph,
            width,
            height,
            null
          );
          isEmbeddedSubprocessExpanded = isSubprocessExpanded(graph);

          if (isSwimlanePresent === null) {
            this.previewElement.children[0].src = disabledIcon;
            this.previewElement.style.border = "1px dotted black";
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
                    !activitiesNotAllowedInEmbedded.includes(
                      prototype.getStyle()
                    )
                  ) {
                    this.previewElement.children[0].src = image;
                    this.previewElement.style.border = "1px dotted black";
                  } else {
                    this.previewElement.children[0].src = disabledIcon;
                    this.previewElement.style.border = "1px dotted black";
                  }
                } else {
                  this.previewElement.children[0].src = disabledIcon;
                  this.previewElement.style.border = "1px dotted black";
                }
              } else if (
                !artifacts.includes(prototype.getStyle()) &&
                isActivityPresent
              ) {
                if (isExpandedProcessPresent) {
                  if (
                    !activitiesNotAllowedInEmbedded.includes(
                      prototype.getStyle()
                    )
                  ) {
                    this.previewElement.children[0].src = image;
                    this.previewElement.style.border = "1px dotted black";
                  } else {
                    this.previewElement.children[0].src = disabledIcon;
                    this.previewElement.style.border = "1px dotted black";
                  }
                } else {
                  this.previewElement.children[0].src = disabledIcon;
                  this.previewElement.style.border = "1px dotted black";
                }
              } else if (prototype.getStyle() === style.groupBox) {
                if (isGroupBoxPresent) {
                  this.previewElement.children[0].src = disabledIcon;
                  this.previewElement.style.border = "1px dotted black";
                } else {
                  this.previewElement.children[0].src = image;
                  this.previewElement.style.border = "1px dotted black";
                }
              } else {
                this.previewElement.children[0].src = image;
                this.previewElement.style.border = "1px dotted black";
              }
            }
          }
        }
      } else if (isAllowedOutsideMilestone(prototype.getStyle())) {
        let isSwimlanePresent = getSwimlaneAt(x, y, AddVertexType);
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
          this.previewElement.children[0].src = image;
          this.previewElement.style.border = "1px dotted black";
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

  return img;
}

export function addVertexFromToolbox(props, toolRef, translation, dispatch) {
  var w = cellSize.w;
  var h = cellSize.h;
  var graph = props.graph;
  var vertexStyle = props.styleGraph;
  var title = props.title;
  var icon = props.icon;

  var toolbar = new mxToolbar(toolRef);
  toolbar.enabled = false;

  var vertex = new mxgraphobj.mxCell(
    title,
    new mxGeometry(0, 0, w, h),
    vertexStyle
  );
  vertex.setVertex(true);
  var img = addToolbarItem(
    graph,
    toolbar,
    vertex,
    icon,
    props,
    translation,
    dispatch,
    props.taskTemplateId,
    props.taskTemplateVar // code added on 13 April 2023 for BugId 126775
  );
  img.enabled = true;

  graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
    var tmp = graph.isSelectionEmpty();
    mxUtils.setOpacity(img, tmp ? 100 : 20);
    img.enabled = tmp;
  });

  return toolbar;
}
