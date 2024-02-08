import collapsedImage from "../../assets/bpmnView/swimlaneCollapse.svg";
import expandedImage from "../../assets/bpmnView/swimlaneExpand.svg";
import { cellEditor } from "./cellEditor";
import { cellOnMouseClick } from "./cellOnMouseClick";
import { addDefaultsToGraph } from "./addDefaultsToGraph";
import { paintGrid } from "./paintGrid";
import { createConnections } from "./createConnections";
import { cellRepositioned } from "./cellsMoved";
import {
  startEvents,
  activities,
  intermediateEvents,
  gateway,
  endEvents,
  integrationPoints,
  artefacts,
  extras,
} from "./toolboxIcon";

import {
  gridSize,
  defaultShapeVertex,
  graphGridSize,
  widthForDefaultVertex,
  style,
  heightForDefaultVertex,
  milestoneTitleWidth,
  swimlaneTitleSize,
  groupboxWidth,
  groupboxHeight,
  endVertex,
  minSegmentWidth,
  swimlaneTitleWidth,
  minSwimlaneHeight,
  minWidthSpace,
  artifacts,
} from "../../Constants/bpmnView";
import { configureStyleForCell } from "./configureStyleForCell";
import { collapseExpandCell } from "./collapseExpandCell";
import { ResizeMilestone } from "../CommonAPICall/ResizeMilestone";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";
import { ResizeSwimlane } from "../CommonAPICall/ResizeSwimlane";
import { cellOnMouseHover } from "./cellOnMouseHover";
import { getActivityProps } from "../abstarctView/getActivityProps";
import { edgeOnMouseHover } from "./edgeOnMouseHover";
import { getFullWidth } from "../abstarctView/addWorkstepAbstractView";
import { createPopupMenu } from "./createPopupMenu";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
} from "../../Constants/appConstants";
import { checkIfParentSwimlaneCheckedOut } from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { ResizeGroupBox } from "../CommonAPICall/ResizeGroupBox";
import { validateConnections } from "./validateConnections";
import { ResizeActivity } from "../CommonAPICall/ResizeActivity";
import { checkStyle } from "../CommonFunctionCall/CommonFunctionCall";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});
const mxGraph = mxgraphobj.mxGraph;
const mxRubberband = mxgraphobj.mxRubberband;
const mxImage = mxgraphobj.mxImage;
const mxConnectionHandler = mxgraphobj.mxConnectionHandler;
const mxKeyHandler = mxgraphobj.mxKeyHandler;
const mxEvent = mxgraphobj.mxEvent;
const mxPoint = mxgraphobj.mxPoint;
const mxShape = mxgraphobj.mxShape;
const mxConnectionConstraint = mxgraphobj.mxConnectionConstraint;
const mxPolyline = mxgraphobj.mxPolyline;
const mxCellState = mxgraphobj.mxCellState;
const mxSwimlaneManager = mxgraphobj.mxSwimlaneManager;
const mxConstants = mxgraphobj.mxConstants;
const mxRectangle = mxgraphobj.mxRectangle;
const mxVertexHandler = mxgraphobj.mxVertexHandler;
const mxUtils = mxgraphobj.mxUtils;
const mxGraphView = mxgraphobj.mxGraphView;
const mxConstraintHandler = mxgraphobj.mxConstraintHandler;

let graph = null;

//array object which store layer of swimlane and milestone
// and root layer where the other are two are inserted
let layers = [];

//buttons stores buutons to add swimlane and milestone
let buttons = {};
let swimlaneLayer, milestoneLayer, rootLayer;

const fixedConnectionPoint = (setProcessData) => {
  // Overridden to define per-shape connection points
  mxGraph.prototype.getAllConnectionConstraints = function (terminal, source) {
    // code added on 26 Oct 2022 for BugId 111723
    let processData = {},
      processType;
    setProcessData((prev) => {
      processData = prev;
      // code edited on 11 March 2023 for BugId 124899
      processType = prev.ProcessType;
      return prev;
    });
    let parentLaneChecked =
      terminal?.cell?.parent?.style === style.expandedEmbeddedProcess
        ? checkIfParentSwimlaneCheckedOut(
            processData,
            terminal?.cell?.parent?.parent?.id
          )?.length > 0
        : checkIfParentSwimlaneCheckedOut(
            processData,
            terminal?.cell?.parent?.id
          )?.length > 0;
    // code edited on 9 March 2023 for BugId 124792 - not able to make connections after swimlane checkout
    if (
      processType === PROCESSTYPE_LOCAL ||
      processType === PROCESSTYPE_LOCAL_CHECKED ||
      parentLaneChecked
    ) {
      if (
        terminal != null &&
        terminal.shape != null &&
        !checkStyle(endVertex, terminal?.cell?.style) &&
        terminal?.cell?.style !== style.taskTemplate &&
        terminal?.cell?.style !== style.newTask &&
        terminal?.cell?.style !== style.processTask
      ) {
        if (terminal.shape.stencil != null) {
          if (terminal.shape.stencil.constraints != null) {
            mxConnectionHandler.prototype.connectImage = "";
            return terminal.shape.stencil.constraints;
          }
        } else if (terminal.shape.constraints != null) {
          mxConnectionHandler.prototype.connectImage = "";
          return terminal.shape.constraints;
        }
      } else {
        mxConnectionHandler.prototype.connectImage = "";
      }
    } else {
      mxConnectionHandler.prototype.connectImage = "";
    }

    return null;
  };

  // Defines the default constraints for all shapes
  mxShape.prototype.constraints = [
    new mxConnectionConstraint(new mxPoint(0.25, 0), true),
    new mxConnectionConstraint(new mxPoint(0.5, 0), true),
    new mxConnectionConstraint(new mxPoint(0.75, 0), true),
    new mxConnectionConstraint(new mxPoint(0, 0.25), true),
    new mxConnectionConstraint(new mxPoint(0, 0.5), true),
    new mxConnectionConstraint(new mxPoint(0, 0.75), true),
    new mxConnectionConstraint(new mxPoint(1, 0.25), true),
    new mxConnectionConstraint(new mxPoint(1, 0.5), true),
    new mxConnectionConstraint(new mxPoint(1, 0.75), true),
    new mxConnectionConstraint(new mxPoint(0.25, 1), true),
    new mxConnectionConstraint(new mxPoint(0.5, 1), true),
    new mxConnectionConstraint(new mxPoint(0.75, 1), true),
  ];

  // Edges have no connection points
  mxPolyline.prototype.constraints = null;
};

export function addMxGraph({
  containerRef,
  setNewId,
  showDrawer,
  translation,
  setProcessData,
  caseEnabled,
  isReadOnly,
  setOpenDeployedProcess,
  setTaskAssociation,
  setShowDependencyModal,
  setShowQueueModal,
  setActionModal,
  dispatch,
  menuRightsList,
}) {
  let processType;
  setProcessData((prev) => {
    // code added on 7 March 2023 for BugId 124772
    processType = prev.ProcessType;
    return prev;
  });

  // code edited on 9 March 2023 for BugId 124792 - not able to make connections after swimlane checkout
  //add fixed connection point to cells
  fixedConnectionPoint(setProcessData);

  let container = containerRef.current;
  // Disables the built-in context menu
  mxEvent.disableContextMenu(container);
  graph = new mxGraph(container);
  graph.graphHandler.scaleGrid = true;
  graph.setPanning(true);
  graph.setTooltips(true);
  mxConstraintHandler.prototype.pointImage = "";
  mxGraph.prototype.collapsedImage = new mxImage(collapsedImage, 16, 16);
  mxGraph.prototype.expandedImage = new mxImage(expandedImage, 16, 16);
  // added on 15/09/23 for BugId 136863
  mxGraph.prototype.collapseExpandResource = translation("collapseExpandIcon");
  let model = graph.getModel();
  // to avoid common ancestor of source and terminal vertices as parent for edge
  model.maintainEdgeParent = false;
  if (isReadOnly) {
    graph.setConnectable(false);
    graph.isDropEnabled = false;
    graph.isCellEditable = false;
    graph.isCellSelectable = function (cell) {
      if (this.model.isEdge(cell)) return false;
      return true;
    };
  } else {
    // Enables new connections in the graph
    graph.setConnectable(true);
  }
  graph.setAllowDanglingEdges(false);
  graph.setMultigraph(false);

  graph.resetEdgesOnConnect = false;
  graph.swimlaneSelectionEnabled = false;
  // code added on 17 Dec 2022 for BugId 120440
  graph.enterStopsCellEditing = true;
  graph.invokesStopCellEditing = false;
  graph.edgeLabelsMovable = false;

  graph.minimumGraphSize = new mxRectangle(0, 0, 100, 100);
  graph.setResizeContainer(false);

  graph.isHtmlLabel = function (cell) {
    return true;
  };

  // html code for labels of vertices, excluding milestones, swimlanes, tasklanes
  graph.getLabel = function (cell) {
    var tmp = mxGraph.prototype.getLabel.apply(this, arguments);
    if (
      cell.style &&
      cell.style !== style.tasklane &&
      !cell.style.includes(style.swimlane_collapsed) &&
      cell.style !== style.tasklane_collapsed
    ) {
      if (cell.style.includes(style.swimlane)) {
        tmp =
          `<div style="max-width:${
            cell.geometry.height - graphGridSize * 6
          }px ; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-align: center;cursor:default;" title="${tmp}">` +
          tmp +
          "</div>";
      } else if (cell.style === style.milestone) {
        tmp =
          `<div style="max-width:${
            cell.geometry.width - graphGridSize * 6
          }px ; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-align: center;cursor:default;" title="${tmp}">` +
          tmp +
          "</div>";
      } else if (checkStyle(defaultShapeVertex, cell.style)) {
        tmp =
          `<div style="width:${
            cell.geometry.width - graphGridSize * 0.5
          }px ; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-align: center;cursor:default;">` +
          tmp +
          "</div>";
      } else if (this.model.isEdge(cell)) {
        tmp =
          `<div style="width:10px ; overflow-wrap: break-word; text-align: center;">` +
          tmp +
          "</div>";
      } else {
        tmp =
          `<div style="width:${
            gridSize * 2.8
          }px ; overflow: hidden; text-overflow: ellipsis; text-align: center; white-space: nowrap; cursor:default;">` +
          tmp +
          "</div>";
      }
    }
    return tmp;
  };
  // to wrap labels
  graph.isWrapping = function (state) {
    return !this.model.isEdge(state.cell);
  };
  // Installs a custom tooltip for cells
  graph.getTooltipForCell = function (cell) {
    if (cell && cell.style === style.textAnnotations) {
      return cell.value;
    }
    if (
      cell.style &&
      !this.model.isEdge(cell) &&
      cell.style !== style.tasklane &&
      cell.style !== style.tasklane_collapsed &&
      !cell.style.includes(style.swimlane) &&
      !cell.style.includes(style.swimlane_collapsed) &&
      cell.style !== style.milestone
    ) {
      return cell.value;
    }
  };

  // code added on 14 Dec 2022 for BugId 116294
  graph.getEdgeValidationError = function (edge, source, target) {
    if (source?.id === target?.id) {
      return "";
    }
    if (
      target &&
      (target?.style === style.milestone ||
        target?.style?.includes(style.swimlane) ||
        target?.style?.includes(style.swimlane_collapsed) ||
        target?.style === style.tasklane ||
        target?.style === style.tasklane_collapsed ||
        target?.style === style.newTask ||
        target?.style === style.processTask ||
        target?.style === style.taskTemplate ||
        artifacts.includes(target?.style))
    ) {
      return "";
    }
    // code added on 2 March 2023 for BugId 124628
    // modified on 06/02/2024 for BugId 143220
    /*if (
      (!source?.parent?.style?.includes(style.swimlane) ||
        !target?.parent?.style?.includes(style.swimlane)) &&
      source?.parent?.style !== target?.parent?.style
    ) {
      return "";
    } */
    if (
      (source?.parent?.style === style.expandedEmbeddedProcess &&
        target?.parent?.style !== style.expandedEmbeddedProcess) ||
      (source?.parent?.style !== style.expandedEmbeddedProcess &&
        target?.parent?.style === style.expandedEmbeddedProcess) ||
      (source?.parent?.id !== target?.parent?.id &&
        source?.parent?.style === style.expandedEmbeddedProcess &&
        target?.parent?.style === style.expandedEmbeddedProcess)
    ) {
      return "";
    }
    // till here BugId 143220 and BugId 124628

    // added on 06/02/2024 for BugId 143220
    if (
      (source?.style === style.expandedEmbeddedProcess &&
        target?.style?.includes(style.subProcess) &&
        source?.embeddedId === target?.id) ||
      (source?.style?.includes(style.subProcess) &&
        target?.style === style.expandedEmbeddedProcess &&
        source?.id === target?.embeddedId)
    ) {
      return "";
    }
    // till here BugId 143220

    let isValid = validateConnections(source, target, translation);
    if (isValid) {
      return null;
    }
    return "";
  };

  if (!isReadOnly) {
    createConnections(graph, setProcessData, setNewId, dispatch, translation);

    //overwrite some function of mxCellEditor
    cellEditor(graph, setProcessData, translation, dispatch);
  }
  //to show icons, tooldiv on mouse click on cell
  cellOnMouseClick(
    graph,
    translation,
    setProcessData,
    showDrawer,
    setNewId,
    caseEnabled,
    isReadOnly,
    setOpenDeployedProcess,
    setTaskAssociation,
    setShowDependencyModal,
    setActionModal,
    dispatch
  );

  //show icon for click on embedded subprocess and call Activity/ more options for milestone
  cellOnMouseHover({
    graph,
    setProcessData,
    translation,
    dispatch,
    setShowQueueModal,
    setActionModal,
    menuRightsList,
    isReadOnly,
    showDrawer,
  });

  //adding default swimlane, taskplane and milestone to the graph
  [layers, buttons] = addDefaultsToGraph({
    graph,
    setNewId,
    translation,
    setProcessData,
    showTasklane: caseEnabled,
    processType,
    menuRightsList,
    isReadOnly,
  });

  //set style for all activities
  let allActivities = [
    startEvents,
    activities,
    intermediateEvents,
    gateway,
    integrationPoints,
    endEvents,
    artefacts,
    extras,
  ];
  for (let itr of allActivities) {
    let subActivities = itr.tools;
    for (let itr2 of subActivities) {
      configureStyleForCell(graph, itr2.icon, itr2.styleName);
    }
  }

  rootLayer = layers[0];
  swimlaneLayer = layers[1];
  milestoneLayer = layers[2];

  //function when swimlane is collapsed or expanded
  collapseExpandCell(graph, buttons, milestoneLayer, swimlaneLayer, rootLayer);
  if (!isReadOnly)
    cellRepositioned(
      graph,
      setProcessData,
      caseEnabled,
      rootLayer,
      dispatch,
      translation
    );

  // Implements a listener for hover and click handling on edges
  if (!isReadOnly)
    edgeOnMouseHover(graph, setProcessData, rootLayer, isReadOnly);

  // Redirects the perimeter to the label bounds if intersection between edge and label is found
  let mxGraphViewGetPerimeterPoint = mxGraphView.prototype.getPerimeterPoint;
  mxGraphView.prototype.getPerimeterPoint = function (
    terminal,
    next,
    orthogonal
  ) {
    var point = mxGraphViewGetPerimeterPoint.apply(this, arguments);
    if (point != null) {
      var perimeter = this.getPerimeterFunction(terminal);
      if (terminal.text != null && terminal.text.boundingBox != null) {
        // Adds a small border to the label bounds
        var b = terminal.text.boundingBox.clone();
        b.grow(3);
        if (mxUtils.rectangleIntersectsSegment(b, point, next) && perimeter) {
          point = perimeter(b, terminal, next, orthogonal);
        }
      }
    }
    return point;
  };

  //to stop the movement of resize cursor when either min width of milestone is reached or
  //maxXLeft position of activities is reached
  var vertexHandlerUnion = mxVertexHandler.prototype.union;
  mxVertexHandler.prototype.union = function () {
    var result = vertexHandlerUnion.apply(this, arguments);
    let cellId = this.state.cell.id;
    let maxXLeft = 0,
      maxYTop = 0,
      maxXLeftlane = 0,
      maxTaskXLeft = 0,
      maxTaskYTop = 0,
      isLaneFound = false,
      isTaskLast = false,
      mileWidth = 0,
      laneHeight = milestoneTitleWidth,
      lastMileHasAct = false,
      lastMileWidth = 0;
    let lastAct, lastTopAct, lastActLane;
    if (this.state.cell.style !== style.groupBox) {
      setProcessData((prevProcessData) => {
        // code added on 6 Feb 2023 for BugId 122789
        if (this.state.cell.style === style.expandedEmbeddedProcess) {
          prevProcessData.MileStones?.forEach((mile) => {
            mile.Activities?.forEach((activity) => {
              if (
                +activity.ActivityId === +this.state.cell?.embeddedId &&
                activity.EmbeddedActivity
              ) {
                activity.EmbeddedActivity[0]?.forEach((embAct) => {
                  if (+maxXLeft < +embAct.xLeftLoc) {
                    maxXLeft = +embAct.xLeftLoc;
                    lastAct = embAct;
                  }
                  if (+maxYTop < +embAct.yTopLoc) {
                    maxYTop = +embAct.yTopLoc;
                    lastTopAct = embAct;
                  }
                });
              }
            });
          });
        } else {
          prevProcessData.Lanes?.forEach((lane) => {
            if (lane.LaneId === cellId) {
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
          prevProcessData.MileStones?.forEach((mile, index) => {
            // to get min width of mile as per max xLeftLoc of activities present in it
            if (mile.iMileStoneId === cellId) {
              mile.Activities?.forEach((activity) => {
                if (+maxXLeft < +activity.xLeftLoc) {
                  maxXLeft = +activity.xLeftLoc;
                  lastAct = activity;
                }
              });
            }
            // to get min height of lane as per max yTopLoc of activities present in it
            mile.Activities?.forEach((activity) => {
              if (activity.LaneId === cellId) {
                if (+maxYTop < +activity.yTopLoc - laneHeight) {
                  maxYTop = +activity.yTopLoc - laneHeight;
                  lastTopAct = activity;
                }
              }
            });
            if (index === prevProcessData.MileStones?.length - 1) {
              lastMileWidth = +mile.Width;
              mile.Activities?.forEach((activity) => {
                if (+maxXLeftlane < +activity.xLeftLoc) {
                  maxXLeftlane = +activity.xLeftLoc;
                  lastActLane = activity;
                  lastMileHasAct = true;
                }
              });
              maxXLeftlane = maxXLeftlane + mileWidth;
            }
            mileWidth = mileWidth + +mile.Width;
          });
          prevProcessData.Tasks?.forEach((task) => {
            if (+task.xLeftLoc > +maxTaskXLeft) {
              maxTaskXLeft = +task.xLeftLoc;
            }
            if (+task.yTopLoc > +maxTaskYTop) {
              maxTaskYTop = +task.yTopLoc;
            }
          });
        }
        return prevProcessData;
      });
      if (this.state.style.horizontal) {
        // code added on 6 Feb 2023 for BugId 122789
        if (this.state.cell.style === style.expandedEmbeddedProcess) {
          let isPreviousActDefault = lastAct
            ? checkStyle(
                defaultShapeVertex,
                getActivityProps(
                  lastAct.ActivityType,
                  lastAct.ActivitySubType
                )[5]
              )
            : false;
          let minWidth = Math.max(
            minSegmentWidth,
            dimensionInMultipleOfGridSize(+maxXLeft) +
              (isPreviousActDefault
                ? widthForDefaultVertex + gridSize
                : gridSize * 2)
          );
          let isPreviousTopActDefault = lastTopAct
            ? checkStyle(
                defaultShapeVertex,
                getActivityProps(
                  lastTopAct.ActivityType,
                  lastTopAct.ActivitySubType
                )[5]
              )
            : false;
          let minHeight = Math.max(
            minSwimlaneHeight,
            dimensionInMultipleOfGridSize(+maxYTop) +
              (isPreviousTopActDefault
                ? heightForDefaultVertex + gridSize
                : gridSize * 2)
          );
          if (this.index === 4) {
            result.width = Math.max(
              result.width,
              mxUtils.getNumber(this.state.style, "minWidth", minWidth)
            );
          } else if (this.index === 6) {
            result.height = Math.max(
              result.height,
              mxUtils.getNumber(this.state.style, "minHeight", minHeight)
            );
          } else if (this.index === 7) {
            result.height = Math.max(
              result.height,
              mxUtils.getNumber(this.state.style, "minHeight", minHeight)
            );
            result.width = Math.max(
              result.width,
              mxUtils.getNumber(this.state.style, "minWidth", minWidth)
            );
          } else {
            result.x = this.bounds.x;
            result.width = this.bounds.width;
            result.y = this.bounds.y;
            result.height = this.bounds.height;
          }
        } else {
          let minWidth;
          if (
            +maxTaskXLeft > +maxXLeft &&
            +maxTaskXLeft > this.state.cell.geometry.x
          ) {
            isTaskLast = true;
          }
          if (isTaskLast) {
            minWidth = Math.max(
              minSegmentWidth,
              dimensionInMultipleOfGridSize(+maxTaskXLeft) +
                widthForDefaultVertex
            );
          } else {
            let isPreviousActDefault = lastAct
              ? checkStyle(
                  defaultShapeVertex,
                  getActivityProps(
                    lastAct.ActivityType,
                    lastAct.ActivitySubType
                  )[5]
                )
              : false;
            minWidth = Math.max(
              minSegmentWidth,
              dimensionInMultipleOfGridSize(+maxXLeft) +
                (isPreviousActDefault ? widthForDefaultVertex : gridSize)
            );
          }
          if (this.index === 4) {
            result.width = Math.max(
              result.width,
              mxUtils.getNumber(this.state.style, "minWidth", minWidth)
            );
          } else {
            result.x = this.bounds.x;
            result.width = this.bounds.width;
            result.y = this.bounds.y;
            result.height = this.bounds.height;
          }
        }
      } else {
        let minWidth, minHeight;
        if (
          +maxTaskXLeft > +maxXLeftlane &&
          +maxTaskXLeft > mileWidth - lastMileWidth + swimlaneTitleWidth
        ) {
          isTaskLast = true;
        }
        if (isTaskLast) {
          minWidth = Math.max(
            gridSize * 3,
            dimensionInMultipleOfGridSize(+maxTaskXLeft) +
              widthForDefaultVertex +
              gridSize
          );
        } else {
          // code edited on 19 Dec 2022 for BugId 120738
          if (lastMileHasAct) {
            let isPreviousActDefault = lastActLane
              ? checkStyle(
                  defaultShapeVertex,
                  getActivityProps(
                    lastActLane.ActivityType,
                    lastActLane.ActivitySubType
                  )[5]
                )
              : false;
            minWidth = Math.max(
              minSegmentWidth,
              dimensionInMultipleOfGridSize(+maxXLeftlane) +
                (isPreviousActDefault
                  ? widthForDefaultVertex + minWidthSpace
                  : gridSize + minWidthSpace)
            );
          } else {
            minWidth =
              mileWidth - lastMileWidth + minSegmentWidth + swimlaneTitleWidth;
          }
        }

        if (this.state.cell.style?.includes(style.tasklane)) {
          minHeight = Math.max(
            minSwimlaneHeight,
            dimensionInMultipleOfGridSize(+maxTaskYTop) +
              (heightForDefaultVertex + gridSize)
          );
        } else {
          let isPreviousTopActDefault = lastTopAct
            ? checkStyle(
                defaultShapeVertex,
                getActivityProps(
                  lastTopAct.ActivityType,
                  lastTopAct.ActivitySubType
                )[5]
              )
            : false;
          minHeight = Math.max(
            minSwimlaneHeight,
            dimensionInMultipleOfGridSize(+maxYTop) +
              (isPreviousTopActDefault
                ? heightForDefaultVertex + gridSize
                : gridSize * 2)
          );
        }

        if (this.index === 4) {
          result.width = Math.max(
            result.width,
            mxUtils.getNumber(this.state.style, "minWidth", minWidth)
          );
        } else if (this.index === 6) {
          result.height = Math.max(
            result.height,
            mxUtils.getNumber(this.state.style, "minHeight", minHeight)
          );
        } else if (this.index === 7) {
          result.height = Math.max(
            result.height,
            mxUtils.getNumber(this.state.style, "minHeight", minHeight)
          );
          result.width = Math.max(
            result.width,
            mxUtils.getNumber(this.state.style, "minWidth", minWidth)
          );
        } else {
          result.x = this.bounds.x;
          result.width = this.bounds.width;
          result.y = this.bounds.y;
          result.height = this.bounds.height;
        }
      }
    }

    return result;
  };

  //Redraws the handles, show draggable handles only on east edge for milestone and only for
  //south, east, south-east points for swimlane
  var vertexHandlerRedraw = mxVertexHandler.prototype.redrawHandles;
  mxVertexHandler.prototype.redrawHandles = function () {
    var result = vertexHandlerRedraw.apply(this, arguments);
    //code edited on 26 August 2022 for BugId 110986
    if (this.sizers != null && this.sizers.length > 7) {
      if (this.state.cell.style !== style.groupBox) {
        //No cursor drags should be there if isReadOnly Graph
        if (isReadOnly) {
          this.sizers[0].node.style.display = "none";
          this.sizers[1].node.style.display = "none";
          this.sizers[2].node.style.display = "none";
          this.sizers[3].node.style.display = "none";
          this.sizers[4].node.style.display = "none";
          this.sizers[5].node.style.display = "none";
          this.sizers[6].node.style.display = "none";
          this.sizers[7].node.style.display = "none";
        } else {
          //cursor drags for milestone
          if (this.state.style.horizontal) {
            // code added on 6 Feb 2023 for BugId 122789
            if (this.state.cell.style === style.expandedEmbeddedProcess) {
              this.sizers[0].node.style.display = "none"; //nw
              this.sizers[1].node.style.display = "none"; //n
              this.sizers[2].node.style.display = "none"; //ne
              this.sizers[3].node.style.display = "none"; //w
              this.sizers[5].node.style.display = "none"; //sw
            } else {
              this.sizers[0].node.style.display = "none"; //nw
              this.sizers[1].node.style.display = "none"; //n
              this.sizers[2].node.style.display = "none"; //ne
              this.sizers[3].node.style.display = "none"; //w
              this.sizers[5].node.style.display = "none"; //sw
              this.sizers[6].node.style.display = "none"; //s
              this.sizers[7].node.style.display = "none"; //se
            }
          }
          //cursor drags for swimlane
          else {
            this.sizers[0].node.style.display = "none"; //nw
            this.sizers[1].node.style.display = "none"; //n
            this.sizers[2].node.style.display = "none"; //ne
            this.sizers[3].node.style.display = "none"; //w
            this.sizers[5].node.style.display = "none"; //sw
          }
        }
      }
    }
  };

  graph.popupMenuHandler.autoExpand = true;
  // Installs a popupmenu handler using local function (see below).
  graph.popupMenuHandler.factoryMethod = function (menu) {
    createPopupMenu(
      graph,
      menu,
      setProcessData,
      setNewId,
      translation,
      caseEnabled
    );
  };

  // Function called on resize of swimlanes and milestones
  let swimlaneManager = new mxSwimlaneManager(graph);
  swimlaneManager.cellsResized = function (cells) {
    cells.forEach((cell) => {
      if (graph.isSwimlane(cell)) {
        let horizontal = graph.getStylesheet().getCellStyle(cell.getStyle())[
          mxConstants.STYLE_HORIZONTAL
        ];
        let cellId = cell.getId();
        //milestone and expanded embedded subprocess is resized
        if (horizontal) {
          // code added on 6 Feb 2023 for BugId 122789
          //expanded embedded subprocess is resized
          if (cell.style === style.expandedEmbeddedProcess) {
            let processDefId,
              oldHeight,
              oldWidth,
              actName,
              diffWidth,
              diffHeight,
              laneArr = [],
              laneSeqId = null,
              mileId;
            let xLeftLocAct;
            let yTopLocAct;
            setProcessData((prevProcessData) => {
              let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
              newProcessData.MileStones = JSON.parse(
                JSON.stringify(prevProcessData.MileStones)
              );
              newProcessData.MileStones = newProcessData.MileStones?.map(
                (mile) => {
                  let tempAct = mile.Activities?.map((act) => {
                    if (+act.ActivityId === +cell.embeddedId) {
                      actName = act.ActivityName;
                      mileId = mile.iMileStoneId;
                      oldWidth = +act.Width;
                      oldHeight = +act.Height;
                      diffWidth = cell.geometry.width - oldWidth;
                      diffHeight = cell.geometry.height - oldHeight;
                      act.Width = cell.geometry.width;
                      act.Height = cell.geometry.height;
                      xLeftLocAct = +act.xLeftLoc;
                      yTopLocAct = +act.yTopLoc;
                      return act;
                    }
                    return act;
                  });
                  return { ...mile, Activities: tempAct };
                }
              );
              processDefId = prevProcessData.ProcessDefId;
              // update
              newProcessData.Lanes?.forEach((lane) => {
                if (+lane.LaneId === +cell.parent.id) {
                  lane.Height = +lane.Height + diffHeight;
                  laneSeqId = +lane.LaneSeqId;
                }
                if (laneSeqId !== null && +lane.LaneSeqId > laneSeqId) {
                  laneArr.push(lane.LaneId);
                }
              });
              newProcessData.MileStones?.forEach((mile) => {
                if (mile.iMileStoneId === mileId) {
                  mile.Activities.forEach((activity) => {
                    if (
                      +activity.LaneId === +cell.parent.id &&
                      +activity.xLeftLoc > xLeftLocAct
                    ) {
                      activity.xLeftLoc = +activity.xLeftLoc + diffWidth;
                    }
                    if (
                      +activity.LaneId === +cell.parent.id &&
                      +activity.yTopLoc > yTopLocAct &&
                      +activity.xLeftLoc <= xLeftLocAct + cell.geometry.width &&
                      +activity.xLeftLoc > xLeftLocAct
                    ) {
                      activity.yTopLoc = +activity.yTopLoc + diffHeight;
                    }
                    if (laneArr.includes(activity.LaneId)) {
                      activity.yTopLoc = +activity.yTopLoc + diffHeight;
                    }
                  });
                  let width = +mile.Width + diffWidth;
                  mile.Width = width;
                }
              });
              newProcessData.DataObjects?.forEach((dataObj) => {
                if (
                  +dataObj.LaneId === +cell.parent.id &&
                  +dataObj.xLeftLoc > xLeftLocAct
                ) {
                  dataObj.xLeftLoc = +dataObj.xLeftLoc + diffWidth;
                }
                if (
                  +dataObj.LaneId === +cell.parent.id &&
                  +dataObj.yTopLoc > yTopLocAct &&
                  +dataObj.xLeftLoc <= xLeftLocAct + cell.geometry.width &&
                  +dataObj.xLeftLoc > xLeftLocAct
                ) {
                  dataObj.yTopLoc = +dataObj.yTopLoc + diffHeight;
                }
                if (
                  +dataObj.LaneId !== 0 &&
                  laneArr.includes(+dataObj.LaneId)
                ) {
                  dataObj.yTopLoc = +dataObj.yTopLoc + diffHeight;
                }
              });
              newProcessData.MSGAFS?.forEach((mxsgaf) => {
                if (
                  +mxsgaf.LaneId === +cell.parent.id &&
                  +mxsgaf.xLeftLoc > xLeftLocAct
                ) {
                  mxsgaf.xLeftLoc = +mxsgaf.xLeftLoc + diffWidth;
                }
                if (
                  +mxsgaf.LaneId === +cell.parent.id &&
                  +mxsgaf.yTopLoc > yTopLocAct &&
                  +mxsgaf.xLeftLoc <= xLeftLocAct + cell.geometry.width &&
                  +mxsgaf.xLeftLoc > xLeftLocAct
                ) {
                  mxsgaf.yTopLoc = +mxsgaf.yTopLoc + diffHeight;
                }
                if (+mxsgaf.LaneId !== 0 && laneArr.includes(+mxsgaf.LaneId)) {
                  mxsgaf.yTopLoc = +mxsgaf.yTopLoc + diffHeight;
                }
              });
              newProcessData.Annotations?.forEach((annotation) => {
                if (
                  +annotation.LaneId === +cell.parent.id &&
                  +annotation.xLeftLoc > xLeftLocAct
                ) {
                  annotation.xLeftLoc = +annotation.xLeftLoc + diffWidth;
                }
                if (
                  +annotation.LaneId === +cell.parent.id &&
                  +annotation.yTopLoc > yTopLocAct &&
                  +annotation.xLeftLoc <= xLeftLocAct + cell.geometry.width &&
                  +annotation.xLeftLoc > xLeftLocAct
                ) {
                  annotation.yTopLoc = +annotation.yTopLoc + diffHeight;
                }
                if (
                  +annotation.LaneId !== 0 &&
                  laneArr.includes(+annotation.LaneId)
                ) {
                  annotation.yTopLoc = +annotation.yTopLoc + diffHeight;
                }
              });
              newProcessData.GroupBoxes?.forEach((groupBox) => {
                if (
                  +groupBox.LaneId === +cell.parent.id &&
                  +groupBox.ILeft > xLeftLocAct
                ) {
                  groupBox.ILeft = +groupBox.ILeft + diffWidth;
                }
                if (
                  +groupBox.LaneId === +cell.parent.id &&
                  +groupBox.ITop > yTopLocAct &&
                  +groupBox.ILeft <= xLeftLocAct + cell.geometry.width &&
                  +groupBox.ILeft > xLeftLocAct
                ) {
                  groupBox.ITop = +groupBox.ITop + diffHeight;
                }
                if (
                  +groupBox.LaneId !== 0 &&
                  laneArr.includes(+groupBox.LaneId)
                ) {
                  groupBox.ITop = +groupBox.ITop + diffHeight;
                }
              });
              return newProcessData;
            });
            let collapseBtn = document.getElementById(
              `embeddedCollapseBtn_${cellId}`
            );
            if (collapseBtn) {
              collapseBtn.style.width = `${
                parseInt(collapseBtn.style.width.replace("px", "")) + diffWidth
              }px`;
            }
            ResizeActivity(
              processDefId,
              actName,
              cell.embeddedId,
              setProcessData,
              cell.geometry.width,
              cell.geometry.height,
              oldWidth,
              oldHeight,
              cell.parent.id
            );
          }
          //milestone is resized
          else {
            //height of all milestone are common
            let newArray = [];
            let ProcessDefId;
            let prevMileWidth;
            setProcessData((prevProcessData) => {
              //do not shallow copy process Data, else original state will get change
              let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
              newProcessData.MileStones = JSON.parse(
                JSON.stringify(prevProcessData.MileStones)
              );
              newProcessData.Lanes = JSON.parse(
                JSON.stringify(prevProcessData.Lanes)
              );
              newProcessData.Connections = JSON.parse(
                JSON.stringify(prevProcessData.Connections)
              );
              //assumption that each milestone have unique iMilestoneId
              let mIndex;
              newArray = newProcessData.MileStones?.map((mile, index) => {
                //create activities array for all milestones
                let activitiesArray = mile.Activities?.map((activity) => {
                  return {
                    activityId: activity.ActivityId,
                    xLeftLoc:
                      +activity.xLeftLoc +
                      getFullWidth(index, newProcessData) +
                      "",
                  };
                });
                // Case 1: milestone which is resized
                if (mile.iMileStoneId === cellId) {
                  mIndex = index;
                  prevMileWidth = +mile.Width;
                  return {
                    milestoneName: mile.MileStoneName,
                    milestoneId: mile.iMileStoneId,
                    width: cell.geometry.width + "",
                    oldWidth: mile.Width,
                    activities: activitiesArray,
                  };
                }
                // Case 2: milestones to the right of milestone which is resized
                else if (mIndex >= 0 && mIndex < index) {
                  //update activities array with updated width of resized milestone
                  activitiesArray = activitiesArray.map((activity1) => {
                    return {
                      activityId: activity1.activityId,
                      xLeftLoc:
                        +activity1.xLeftLoc -
                        +prevMileWidth +
                        cell.geometry.width +
                        "",
                    };
                  });
                  return {
                    milestoneName: mile.MileStoneName,
                    milestoneId: mile.iMileStoneId,
                    width: mile.Width,
                    oldWidth: mile.Width,
                    activities: activitiesArray,
                  };
                }
                // Case 3: milestones to the left of milestone which is resized
                else {
                  return {
                    milestoneName: mile.MileStoneName,
                    milestoneId: mile.iMileStoneId,
                    width: mile.Width,
                    oldWidth: mile.Width,
                    activities: activitiesArray,
                  };
                }
              });
              newProcessData.MileStones?.forEach((mile, index) => {
                if (mile.iMileStoneId === cellId) {
                  newProcessData.MileStones[index].Width = cell.geometry.width;
                }
              });
              prevProcessData.Connections?.forEach((conn, index) => {
                conn.xLeft?.forEach((x, idx) => {
                  if (x > cell.geometry.x + prevMileWidth) {
                    newProcessData.Connections[index].xLeft[idx] =
                      +x +
                      cell.geometry.width -
                      dimensionInMultipleOfGridSize(prevMileWidth);
                  }
                });
              });
              ProcessDefId = newProcessData.ProcessDefId;
              return newProcessData;
            });
            ResizeMilestone(
              ProcessDefId,
              newArray,
              setProcessData,
              cellId,
              prevMileWidth
            );
          }
        }
        //swimlane is resized
        else {
          //width of all swimlane are common
          let newArray = [];
          let nextLanes = [],
            selectedLaneIdx = null,
            oldHeight;
          let ProcessDefId;
          setProcessData((prevProcessData) => {
            //do not do shallow copy process Data, else original state will get change
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.Lanes = JSON.parse(
              JSON.stringify(prevProcessData.Lanes)
            );
            let totalMileWidth = newProcessData.MileStones?.reduce(
              (acc, el) => {
                acc = acc + +el.Width;
                return acc;
              },
              0
            );
            newArray = newProcessData.Lanes?.map((lane, index) => {
              if (selectedLaneIdx !== null) {
                nextLanes.push(lane.LaneId);
              }
              if (+lane.LaneId === cell.id) {
                selectedLaneIdx = index;
                oldHeight = +newProcessData.Lanes[index].Height;
                newProcessData.Lanes[index].Height = cell.geometry.height;
              }
              return {
                laneId: lane.LaneId,
                laneSeqId: lane.LaneSeqId,
                laneName: lane.LaneName,
                width:
                  +lane.LaneId === cell.id
                    ? cell.geometry.width - swimlaneTitleSize + ""
                    : totalMileWidth + "",
                oldWidth: totalMileWidth + "",
                height: lane.Height + "",
                oldHeight:
                  +lane.LaneId === cell.id ? oldHeight + "" : lane.Height,
              };
            });
            newProcessData.MileStones?.forEach((mile, mileIdx) => {
              mile.Activities.forEach((act, actidx) => {
                if (nextLanes.includes(act.LaneId)) {
                  newProcessData.MileStones[mileIdx].Activities[
                    actidx
                  ].yTopLoc = +act.yTopLoc + +cell.geometry.height - +oldHeight;
                }
              });
            });
            newProcessData.MileStones[
              newProcessData.MileStones.length - 1
            ].Width =
              +newProcessData.MileStones[newProcessData.MileStones.length - 1]
                .Width +
              (cell.geometry.width - +swimlaneTitleSize - +totalMileWidth);
            prevProcessData.Connections?.forEach((conn, index) => {
              conn.yTop?.forEach((y, idx) => {
                if (y > +cell.geometry.y + +oldHeight) {
                  newProcessData.Connections[index].yTop[idx] =
                    +y +
                    +cell.geometry.height -
                    dimensionInMultipleOfGridSize(+oldHeight);
                }
              });
            });
            ProcessDefId = newProcessData.ProcessDefId;
            return newProcessData;
          });
          ResizeSwimlane(
            ProcessDefId,
            newArray,
            setProcessData,
            cellId,
            oldHeight
          );
        }
      } else if (cell.style === style.groupBox) {
        let leftPos = cell.geometry.x;
        let topPos = cell.geometry.y;
        let targetSwimlane = cell.parent;
        let newHeight = Math.max(
          targetSwimlane.geometry.height,
          topPos + groupboxHeight + 2 * gridSize
        );

        let laneHeight = 0,
          isLaneFound = false;
        let selectedDO = null,
          newDO = null;
        let mileWidth = 0,
          processDefId,
          processType,
          laneHeightIncreasedFlag = false,
          lanesInfo = {},
          actArr = [];
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          newProcessData.GroupBoxes = JSON.parse(
            JSON.stringify(prevProcessData.GroupBoxes)
          );
          processDefId = newProcessData.ProcessDefId;
          processType = newProcessData.ProcessType;
          if (
            targetSwimlane &&
            targetSwimlane?.style !== style.expandedEmbeddedProcess
          ) {
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
          }
          let gbLaneId = null;
          for (let itr of newProcessData.GroupBoxes) {
            if (itr.GroupBoxId === parseInt(cell.getId())) {
              selectedDO = itr;
              //update x and y location value when id matches
              itr.ITop = topPos + laneHeight + "";
              itr.ILeft = leftPos;
              itr.GroupBoxWidth = cell.geometry.width;
              itr.GroupBoxHeight = cell.geometry.height;
              gbLaneId = itr.LaneId;
              newDO = itr;
              break;
            }
          }
          newProcessData.MileStones = newProcessData.MileStones.map(
            (milestone) => {
              milestone["oldWidth"] = milestone.Width;
              let tempActArr = [...milestone.Activities];
              milestone?.Activities?.forEach((act, index) => {
                if (+act.BlockId === parseInt(cell.getId())) {
                  tempActArr[index].BlockId = 0;
                }
                if (
                  targetSwimlane?.style === style.expandedEmbeddedProcess &&
                  +act.LaneId === +gbLaneId &&
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
                      +embAct.xLeftLoc > leftPos &&
                      +embAct.xLeftLoc < leftPos + groupboxWidth
                    ) {
                      if (
                        (+embAct.yTopLoc > topPos &&
                          +embAct.yTopLoc < topPos + groupboxHeight) ||
                        (+embAct.yTopLoc + actHeight > topPos &&
                          +embAct.yTopLoc + actHeight < topPos + groupboxHeight)
                      ) {
                        actArr.push({
                          actId: embAct.ActivityId,
                        });
                        tempActArr[embIdx].BlockId = cell.getId();
                      }
                    } else if (
                      +embAct.xLeftLoc + actWidth > leftPos &&
                      +embAct.xLeftLoc + actWidth < leftPos + groupboxWidth
                    ) {
                      if (
                        (+embAct.yTopLoc > topPos &&
                          +embAct.yTopLoc < topPos + groupboxHeight) ||
                        (+embAct.yTopLoc + actHeight > topPos &&
                          +embAct.yTopLoc + actHeight < topPos + groupboxHeight)
                      ) {
                        actArr.push({
                          actId: embAct.ActivityId,
                        });
                        tempActArr[embIdx].BlockId = cell.getId();
                      }
                    }
                  });
                } else if (+act.LaneId === +gbLaneId) {
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
                    +act.xLeftLoc + mileWidth > leftPos &&
                    +act.xLeftLoc + mileWidth < leftPos + cell.geometry.width
                  ) {
                    if (
                      (+act.yTopLoc - laneHeight > topPos &&
                        +act.yTopLoc - laneHeight <
                          topPos + cell.geometry.height) ||
                      (+act.yTopLoc - laneHeight + actHeight > topPos &&
                        +act.yTopLoc - laneHeight + actHeight <
                          topPos + cell.geometry.height)
                    ) {
                      actArr.push({
                        actId: act.ActivityId,
                      });
                      tempActArr[index].BlockId = cell.getId();
                    }
                  } else if (
                    +act.xLeftLoc + mileWidth + actWidth > leftPos &&
                    +act.xLeftLoc + mileWidth + actWidth <
                      leftPos + cell.geometry.width
                  ) {
                    if (
                      (+act.yTopLoc - laneHeight > topPos &&
                        +act.yTopLoc - laneHeight <
                          topPos + cell.geometry.height) ||
                      (+act.yTopLoc - laneHeight + actHeight > topPos &&
                        +act.yTopLoc - laneHeight + actHeight <
                          topPos + cell.geometry.height)
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
          return newProcessData;
        });

        ResizeGroupBox(
          processDefId,
          processType,
          selectedDO.BlockName,
          selectedDO.GroupBoxId,
          newDO.ILeft,
          newDO.ITop,
          newDO.LaneId,
          setProcessData,
          newDO.GroupBoxWidth,
          newDO.GroupBoxHeight,
          selectedDO.ILeft,
          selectedDO.ITop,
          selectedDO.GroupBoxWidth,
          selectedDO.GroupBoxHeight,
          // modified on 25/01/24 for BugId 140984
          // mileWidthIncreased ? mileStoneInfo : null,
          null,
          // till here BugId 140984
          laneHeightIncreasedFlag ? lanesInfo : null,
          actArr,
          targetSwimlane?.style === style.expandedEmbeddedProcess
            ? targetSwimlane.embeddedId
            : null
        );
      }
    });
  };

  // Enables connect preview for the default edge style
  graph.connectionHandler.createEdgeState = function (me) {
    var edge = graph.createEdge(null, null, null, null, null);
    return new mxCellState(
      this.graph.view,
      edge,
      this.graph.getCellStyle(edge)
    );
  };
  // graph.connectionHandler.marker.validColor = "#A5C9E5";
  // graph.connectionHandler.marker.highlight.strokeWidth = 2;

  // Specifies the default edge style
  graph.getStylesheet().getDefaultEdgeStyle()["edgeStyle"] =
    "orthogonalEdgeStyle";
  // Specifies the default edge color
  graph.getStylesheet().getDefaultEdgeStyle()["strokeColor"] = "#767676";
  // Specifies the default selection outline style
  mxConstants.VERTEX_SELECTION_COLOR = "#A5C9E5";
  mxConstants.VERTEX_SELECTION_DASHED = false;
  mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
  // mxConstants.VALID_COLOR = "#A5C9E5";

  new mxRubberband(graph);

  //paints graph grid
  var repaintGrid = paintGrid(graph, buttons);
  repaintGrid();

  // Stops editing on enter or escape keypress
  new mxKeyHandler(graph);
  new mxRubberband(graph);

  return [graph, rootLayer, swimlaneLayer, milestoneLayer, buttons];
}

/*
1. mxGraph.splitEnabled =	Specifies if dropping onto edges should be enabled.
2. mxGraph.splitEdge =	Splits the given edge by adding the newEdge between the previous source and the given cell and reconnecting the source of the given edge to the given cell.
*/
