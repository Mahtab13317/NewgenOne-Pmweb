import hoverIcon from "../../assets/bpmnView/workstepOnHover/New workstep.png";
import editIcon from "../../assets/bpmnViewIcons/EditIcon.svg";
import moreIcon from "../../assets/ProcessView/MoreIcon.svg";
import connector from "../../assets/bpmnView/connector.gif";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  SPACE,
  userRightsMenuNames,
} from "../../Constants/appConstants";
import {
  cellSize,
  defaultShapeVertex,
  gridSize,
  heightForDefaultVertex,
  smallIconSize,
  swimlaneTitleWidth,
  widthForDefaultVertex,
  style,
  graphGridSize,
  commentWidth,
  commentHeight,
  MoveVertexType,
  artifacts,
  milestoneTitleWidth,
  endVertex,
  gateways,
} from "../../Constants/bpmnView";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { getActivityProps } from "../abstarctView/getActivityProps";
import { ModifyAnnotation } from "../CommonAPICall/ModifyAnnotation";
import {
  validateActivityObject,
  validateTaskObject,
} from "../CommonAPICall/validateActivityObject";
import {
  checkActivityStatus,
  checkIfParentSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { getMenuNameFlag } from "../UserRightsFunctions";
import { hideIcons, hideRenameIcons } from "./cellOnMouseClick";
import { removeContextMenu } from "./getContextMenu";
import {
  getLaneContextMenu,
  removeLaneContextMenu,
} from "./getLaneContextMenu";
import {
  getMileContextMenu,
  removeMileContextMenu,
} from "./getMileContextMenu";
import { getMilestoneAt } from "./getMilestoneAt";
import { getSwimlaneAt } from "./getSwimlaneAt";
import { removeToolDivCell } from "./getToolDivCell";
import {
  checkRegex,
  checkStyle,
  getLocale,
  isArabicLocaleSelected,
} from "../CommonFunctionCall/CommonFunctionCall";
import { PMWEB_ARB_REGEX, PMWEB_REGEX } from "../../validators/validator";
import DOMPurify from "dompurify";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxUtils = mxgraphobj.mxUtils;
const mxEvent = mxgraphobj.mxEvent;
const mxRectangle = mxgraphobj.mxRectangle;
const mxCell = mxgraphobj.mxCell;
const mxGeometry = mxgraphobj.mxGeometry;
const mxVertexHandler = mxgraphobj.mxVertexHandler;

let milestonePresent = null,
  swimlanePresent = null;

// code added on 29 March 2023 for BugId 124045
function mxVertexToolHandler(state, setProcessData, isReadOnly) {
  let processData, processType;
  setProcessData((prev) => {
    processData = prev;
    processType = prev.ProcessType;
    return prev;
  });
  let parentLaneChecked =
    state?.cell?.parent?.style === style.expandedEmbeddedProcess
      ? checkIfParentSwimlaneCheckedOut(
          processData,
          state?.cell?.parent?.parent?.id
        )?.length > 0
      : checkIfParentSwimlaneCheckedOut(processData, state?.cell?.parent?.id)
          ?.length > 0;
  // code edited on 9 March 2023 for BugId 124792 - not able to make connections after swimlane checkout
  if (
    (processType === PROCESSTYPE_LOCAL ||
      processType === PROCESSTYPE_LOCAL_CHECKED ||
      parentLaneChecked) &&
    !isReadOnly
  ) {
    mxVertexHandler.apply(this, arguments);
  }
}

mxVertexToolHandler.prototype = new mxVertexHandler();
mxVertexToolHandler.prototype.constructor = mxVertexToolHandler;

mxVertexToolHandler.prototype.domNode = null;

mxVertexToolHandler.prototype.init = function () {
  mxVertexHandler.prototype.init.apply(this, arguments);
  this.domNode = document.createElement("div");
  this.domNode.style.position = "absolute";
  this.domNode.style.whiteSpace = "nowrap";
  this.domNode.style.zIndex = "1";

  var img = mxUtils.createImage(connector);
  img.style.cursor = "pointer";
  img.style.width = 14 + "px";
  img.style.height = 14 + "px";
  mxEvent.addGestureListeners(
    img,
    mxUtils.bind(this, function (evt) {
      var pt = mxUtils.convertPoint(
        this.graph.container,
        mxEvent.getClientX(evt),
        mxEvent.getClientY(evt)
      );
      this.graph.connectionHandler.start(this.state, pt.x, pt.y);
      this.graph.isMouseDown = true;
      this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
      mxEvent.consume(evt);
    })
  );
  this.domNode.appendChild(img);

  this.graph.container.appendChild(this.domNode);
  this.redrawTools();
  // added on 06/02/2024 for BugId 143220
  this.hideSizers();
  // till here BugId 143220
};

mxVertexToolHandler.prototype.redraw = function () {
  mxVertexHandler.prototype.redraw.apply(this);
  this.redrawTools();
};

mxVertexToolHandler.prototype.redrawTools = function () {
  if (this.state != null && this.domNode != null) {
    if (checkStyle(defaultShapeVertex, this.state.cell?.style)) {
      this.domNode.style.left =
        this.state.x + this.state.width - graphGridSize / 2 + "px";
      this.domNode.style.top =
        this.state.cell.geometry.y +
        this.state.cell.parent.geometry.y +
        5 +
        "px";
    } else if (gateways.includes(this.state.cell?.style)) {
      this.domNode.style.left = this.state.x + this.state.width - 10 + "px";
      this.domNode.style.top =
        this.state.cell.geometry.y +
        this.state.cell.parent.geometry.y +
        1 +
        "px";
    } 
    // added on 06/02/2024 for BugId 143220
    else if (this.state.cell?.style === style.expandedEmbeddedProcess) {
      this.domNode.style.left = this.state.x + this.state.width - 5 + "px";
      this.domNode.style.top = this.state.cell.geometry.y + 7 + "px";
    } 
    // till here BugId 143220
    else {
      this.domNode.style.left = this.state.x + this.state.width - 10 + "px";
      this.domNode.style.top =
        this.state.cell.geometry.y +
        this.state.cell.parent.geometry.y +
        2 +
        "px";
    }
  }
};

mxVertexToolHandler.prototype.getSelectionColor = function () {
  return "none";
};

mxVertexToolHandler.prototype.destroy = function (sender, me) {
  mxVertexHandler.prototype.destroy.apply(this, arguments);
  if (this.domNode != null) {
    this.domNode.parentNode.removeChild(this.domNode);
    this.domNode = null;
  }
};

function doNotHoverForTheseCell(graph, cell, evt, milestonePresent) {
  if (graph.isSwimlane(cell)) {
    if (
      cell.style === style.milestone ||
      (milestonePresent !== null && cell.style !== style.tasklane)
    ) {
      return false;
    }
    return true;
  }
  if (cell.style === style.groupBox) {
    return true;
  }
  if (cell.style === style.expandedEmbeddedProcess) {
    return true;
  }
  if (cell.id === "rootLayer") {
    return true;
  }
  return false;
}

export function collapseExpandedProcess(setProcessData, graph, cell) {
  // code edited on 9 March 2023 for BugID 124056 - while expanding the emebedded subprocess the connection of other system workstep is also getting expanded
  hideRenameIcons();
  hideIcons();
  removeToolDivCell();
  removeLaneContextMenu();
  removeMileContextMenu();
  removeContextMenu();
  setProcessData((prevData) => {
    //to keep prevState as it is
    let newData = JSON.parse(JSON.stringify(prevData));
    let isActExpanded;
    let mileId,
      expandedWidth = 0,
      expandedHeight = 0,
      laneArr = [],
      laneSeqId = null,
      isHeightUpdated = null;
    let layers = graph.getChildVertices();
    newData.MileStones?.forEach((mile) => {
      mile.Activities?.forEach((activity) => {
        if (cell) {
          if (+activity.hide === +cell.id) {
            mileId = mile.iMileStoneId;
            activity.hide = null;
            isActExpanded = activity;
            expandedWidth = +activity.Width;
            expandedHeight = +activity.Height;
          }
        } else {
          if (activity.hide === +activity.ActivityId) {
            mileId = mile.iMileStoneId;
            activity.hide = null;
            isActExpanded = activity;
            expandedWidth = +activity.Width;
            expandedHeight = +activity.Height;
          }
        }
      });
    });
    newData.Lanes?.forEach((lane) => {
      // code edited on 21 Feb 2023 for BugId 124065
      if (isActExpanded && lane.LaneId === isActExpanded.LaneId) {
        if (lane.heightUpdated) {
          isHeightUpdated = +lane.Height - +lane.newHeight;
        }
        lane.Height = lane.heightUpdated
          ? +lane.newHeight
          : +lane.Height - expandedHeight + heightForDefaultVertex;
        delete lane.heightUpdated;
        delete lane.newHeight;
        laneSeqId = +lane.LaneSeqId;
      }
      if (laneSeqId !== null && +lane.LaneSeqId > laneSeqId) {
        laneArr.push(lane.LaneId);
      }
    });
    newData.MileStones?.forEach((mile) => {
      mile.Activities?.forEach((activity) => {
        let activityWidth = checkStyle(
          defaultShapeVertex,
          getActivityProps(activity.ActivityType, activity.ActivitySubType)[5]
        )
          ? widthForDefaultVertex
          : gridSize;
        let activityHeight = checkStyle(
          defaultShapeVertex,
          getActivityProps(activity.ActivityType, activity.ActivitySubType)[5]
        )
          ? heightForDefaultVertex
          : gridSize;
        // code edited on 21 Feb 2023 for BugId 124051
        if (
          isActExpanded &&
          activity.LaneId === isActExpanded.LaneId &&
          +activity.yTopLoc > +isActExpanded.yTopLoc &&
          ((+activity.xLeftLoc <= +isActExpanded.xLeftLoc + expandedWidth &&
            +activity.xLeftLoc >= +isActExpanded.xLeftLoc) ||
            (+activity.xLeftLoc + activityWidth <=
              +isActExpanded.xLeftLoc + expandedWidth &&
              +activity.xLeftLoc + activityWidth >= +isActExpanded.xLeftLoc)) &&
          mileId === mile.iMileStoneId
        ) {
          activity.yTopLoc =
            +activity.yTopLoc - expandedHeight + heightForDefaultVertex;
        }
        if (
          (isActExpanded &&
            +activity.LaneId === isActExpanded.LaneId &&
            +activity.xLeftLoc >
              +isActExpanded.xLeftLoc + widthForDefaultVertex &&
            (+activity.yTopLoc >= +isActExpanded.yTopLoc ||
              +activity.yTopLoc + activityHeight >= +isActExpanded.yTopLoc) &&
            (+activity.yTopLoc <=
              +isActExpanded.yTopLoc + heightForDefaultVertex ||
              +activity.yTopLoc + activityHeight <=
                +isActExpanded.yTopLoc + heightForDefaultVertex) &&
            mileId === mile.iMileStoneId) ||
          activity.isActXLeftExpanded // code edited on 9 March 2023 for BugId 124704
        ) {
          activity.xLeftLoc =
            +activity.xLeftLoc - expandedWidth + widthForDefaultVertex;
          delete activity.isActXLeftExpanded;
        }
        if (laneArr.includes(activity.LaneId)) {
          activity.yTopLoc =
            isHeightUpdated !== null
              ? +activity.yTopLoc - isHeightUpdated
              : +activity.yTopLoc - expandedHeight + heightForDefaultVertex;
        }
      });
      // code edited on 21 Feb 2023 for BugId 124065
      if (mile.iMileStoneId === mileId && mile.embeddedWidthAdded) {
        let width = mile.widthUpdated
          ? +mile.newWidth + ""
          : +mile.Width - expandedWidth + widthForDefaultVertex;
        mile.Width = width;
        delete mile.widthUpdated;
        delete mile.newWidth;
        delete mile.embeddedWidthAdded;
      }
    });
    newData.DataObjects?.forEach((dataObj) => {
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        isActExpanded &&
        dataObj.LaneId === isActExpanded.LaneId &&
        +dataObj.yTopLoc > +isActExpanded.yTopLoc - milestoneTitleWidth &&
        ((+dataObj.xLeftLoc <= +isActExpanded.xLeftLoc + expandedWidth &&
          +dataObj.xLeftLoc >= +isActExpanded.xLeftLoc) ||
          (+dataObj.xLeftLoc + gridSize <=
            +isActExpanded.xLeftLoc + expandedWidth &&
            +dataObj.xLeftLoc + gridSize >= +isActExpanded.xLeftLoc))
      ) {
        dataObj.yTopLoc =
          +dataObj.yTopLoc - expandedHeight + heightForDefaultVertex;
      }
      if (
        isActExpanded &&
        +dataObj.LaneId === isActExpanded.LaneId &&
        +dataObj.xLeftLoc > +isActExpanded.xLeftLoc + widthForDefaultVertex &&
        (+dataObj.yTopLoc >= +isActExpanded.yTopLoc ||
          +dataObj.yTopLoc + gridSize >= +isActExpanded.yTopLoc) &&
        (+dataObj.yTopLoc <= +isActExpanded.yTopLoc + heightForDefaultVertex ||
          +dataObj.yTopLoc + gridSize <=
            +isActExpanded.yTopLoc + heightForDefaultVertex)
      ) {
        dataObj.xLeftLoc =
          +dataObj.xLeftLoc - expandedWidth + widthForDefaultVertex;
      }
      if (+dataObj.LaneId !== 0 && laneArr.includes(+dataObj.LaneId)) {
        dataObj.yTopLoc =
          isHeightUpdated !== null
            ? +dataObj.yTopLoc - isHeightUpdated
            : +dataObj.yTopLoc - expandedHeight + heightForDefaultVertex;
      }
    });
    newData.MSGAFS?.forEach((mxsgaf) => {
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        isActExpanded &&
        mxsgaf.LaneId === isActExpanded.LaneId &&
        +mxsgaf.yTopLoc > isActExpanded.yTopLoc - milestoneTitleWidth &&
        ((+mxsgaf.xLeftLoc <= +isActExpanded.xLeftLoc + expandedWidth &&
          +mxsgaf.xLeftLoc >= +isActExpanded.xLeftLoc) ||
          (+mxsgaf.xLeftLoc + gridSize <=
            +isActExpanded.xLeftLoc + expandedWidth &&
            +mxsgaf.xLeftLoc + gridSize >= +isActExpanded.xLeftLoc))
      ) {
        mxsgaf.yTopLoc =
          +mxsgaf.yTopLoc - expandedHeight + heightForDefaultVertex;
      }
      if (
        isActExpanded &&
        +mxsgaf.LaneId === isActExpanded.LaneId &&
        +mxsgaf.xLeftLoc > +isActExpanded.xLeftLoc + widthForDefaultVertex &&
        (+mxsgaf.yTopLoc >= +isActExpanded.yTopLoc ||
          +mxsgaf.yTopLoc + gridSize >= +isActExpanded.yTopLoc) &&
        (+mxsgaf.yTopLoc <= +isActExpanded.yTopLoc + heightForDefaultVertex ||
          +mxsgaf.yTopLoc + gridSize <=
            +isActExpanded.yTopLoc + heightForDefaultVertex)
      ) {
        mxsgaf.xLeftLoc =
          +mxsgaf.xLeftLoc - expandedWidth + widthForDefaultVertex;
      }
      if (+mxsgaf.LaneId !== 0 && laneArr.includes(+mxsgaf.LaneId)) {
        mxsgaf.yTopLoc =
          isHeightUpdated !== null
            ? +mxsgaf.yTopLoc - isHeightUpdated
            : +mxsgaf.yTopLoc - expandedHeight + heightForDefaultVertex;
      }
    });
    newData.Annotations?.forEach((annotation) => {
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        isActExpanded &&
        annotation.LaneId === isActExpanded.LaneId &&
        +annotation.yTopLoc > isActExpanded.yTopLoc - milestoneTitleWidth &&
        ((+annotation.xLeftLoc <= +isActExpanded.xLeftLoc + expandedWidth &&
          +annotation.xLeftLoc >= +isActExpanded.xLeftLoc) ||
          (+annotation.xLeftLoc + gridSize <=
            +isActExpanded.xLeftLoc + expandedWidth &&
            +annotation.xLeftLoc + gridSize >= +isActExpanded.xLeftLoc))
      ) {
        annotation.yTopLoc =
          +annotation.yTopLoc - expandedHeight + heightForDefaultVertex;
      }
      if (
        isActExpanded &&
        +annotation.LaneId === isActExpanded.LaneId &&
        +annotation.xLeftLoc >
          +isActExpanded.xLeftLoc + widthForDefaultVertex &&
        (+annotation.yTopLoc >= +isActExpanded.yTopLoc ||
          +annotation.yTopLoc + gridSize >= +isActExpanded.yTopLoc) &&
        (+annotation.yTopLoc <=
          +isActExpanded.yTopLoc + heightForDefaultVertex ||
          +annotation.yTopLoc + gridSize <=
            +isActExpanded.yTopLoc + heightForDefaultVertex)
      ) {
        annotation.xLeftLoc =
          +annotation.xLeftLoc - expandedWidth + widthForDefaultVertex;
      }
      if (+annotation.LaneId !== 0 && laneArr.includes(+annotation.LaneId)) {
        annotation.yTopLoc =
          isHeightUpdated !== null
            ? +annotation.yTopLoc - isHeightUpdated
            : +annotation.yTopLoc - expandedHeight + heightForDefaultVertex;
      }
    });
    newData.GroupBoxes?.forEach((groupBox) => {
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        isActExpanded &&
        groupBox.LaneId === isActExpanded.LaneId &&
        +groupBox.ITop > isActExpanded.yTopLoc - milestoneTitleWidth &&
        ((+groupBox.ILeft <= +isActExpanded.xLeftLoc + expandedWidth &&
          +groupBox.ILeft >= +isActExpanded.xLeftLoc) ||
          (+groupBox.ILeft + +groupBox.GroupBoxWidth <=
            +isActExpanded.xLeftLoc + expandedWidth &&
            +groupBox.ILeft + +groupBox.GroupBoxWidth >=
              +isActExpanded.xLeftLoc))
      ) {
        groupBox.ITop =
          +groupBox.ITop - expandedHeight + heightForDefaultVertex;
      }
      if (
        isActExpanded &&
        +groupBox.LaneId === isActExpanded.LaneId &&
        +groupBox.ILeft > +isActExpanded.xLeftLoc + widthForDefaultVertex &&
        (+groupBox.ITop >= +isActExpanded.yTopLoc ||
          +groupBox.ITop + +groupBox.GroupBoxHeight >=
            +isActExpanded.yTopLoc) &&
        (+groupBox.ITop <= +isActExpanded.yTopLoc + heightForDefaultVertex ||
          +groupBox.ITop + +groupBox.GroupBoxHeight <=
            +isActExpanded.yTopLoc + heightForDefaultVertex)
      ) {
        groupBox.ILeft =
          +groupBox.ILeft - expandedWidth + widthForDefaultVertex;
      }
      if (+groupBox.LaneId !== 0 && laneArr.includes(+groupBox.LaneId)) {
        groupBox.ITop =
          isHeightUpdated !== null
            ? +groupBox.ITop - isHeightUpdated
            : +groupBox.ITop - expandedHeight + heightForDefaultVertex;
      }
    });
    layers?.forEach((layer) => {
      if (
        layer.getStyle() === style.expandedEmbeddedProcess &&
        layer.geometry.x > +isActExpanded.xLeftLoc + expandedWidth
      ) {
        layer.geometry.x =
          +layer.geometry.x - expandedWidth + widthForDefaultVertex;
      }
    });
    return newData;
  });
}

export function expandEmbeddedProcess(graph, cell1, setProcessData, t) {
  // code edited on 9 March 2023 for BugID 124056 - while expanding the emebedded subprocess the connection of other system workstep is also getting expanded
  hideRenameIcons();
  hideIcons();
  removeToolDivCell();
  removeLaneContextMenu();
  removeMileContextMenu();
  removeContextMenu();
  let mileId;
  var vertex = new mxCell(
    null,
    new mxGeometry(0, 0, 0, 0),
    style.expandedEmbeddedProcess
  );
  vertex.setVertex(true);
  vertex.setConnectable(false);
  vertex.setId(`emb_${cell1.id}`);
  vertex.embeddedId = cell1.id;
  // added on 06/02/2024 for BugId 143220
  vertex.embeddedCellEdges = [...cell1.edges];
  // till here BugId 143220
  vertex.geometry.x = cell1.geometry.x + swimlaneTitleWidth;
  vertex.geometry.y = cell1.geometry.y + cell1.parent.geometry.y;
  let expandedWidth;
  setProcessData((prevData) => {
    //to keep prevState as it is
    let newData = JSON.parse(JSON.stringify(prevData));
    let xLeftLocAct;
    let yTopLocAct;
    let newWidth = 0,
      newHeight = 0,
      laneArr = [],
      laneSeqId = null;
    newData.MileStones?.forEach((mile) => {
      mile.Activities?.forEach((activity) => {
        if (activity.ActivityId === cell1.id) {
          mileId = mile.iMileStoneId;
          activity.hide = cell1.id;
          xLeftLocAct = +activity.xLeftLoc;
          yTopLocAct = +activity.yTopLoc;
          expandedWidth = +activity.Width;
          newWidth = +activity.Width - widthForDefaultVertex;
          vertex.geometry.width = +activity.Width;
          vertex.geometry.height = +activity.Height;
          newHeight = +activity.Height - heightForDefaultVertex;
        }
      });
    });
    newData.Lanes?.forEach((lane) => {
      if (lane.LaneId === cell1.parent.id) {
        lane.Height = +lane.Height + newHeight;
        laneSeqId = +lane.LaneSeqId;
      }
      if (laneSeqId !== null && +lane.LaneSeqId > laneSeqId) {
        laneArr.push(lane.LaneId);
      }
    });
    let isActMovedRight = false;
    newData.MileStones?.forEach((mile) => {
      mile.Activities.forEach((activity) => {
        let activityWidth = checkStyle(
          defaultShapeVertex,
          getActivityProps(activity.ActivityType, activity.ActivitySubType)[5]
        )
          ? widthForDefaultVertex
          : gridSize;
        let activityHeight = checkStyle(
          defaultShapeVertex,
          getActivityProps(activity.ActivityType, activity.ActivitySubType)[5]
        )
          ? heightForDefaultVertex
          : gridSize;
        if (
          activity.LaneId === cell1.parent.id &&
          +activity.xLeftLoc > xLeftLocAct + widthForDefaultVertex &&
          (+activity.yTopLoc >= yTopLocAct ||
            +activity.yTopLoc + activityHeight >= yTopLocAct) &&
          (+activity.yTopLoc <= yTopLocAct + heightForDefaultVertex ||
            +activity.yTopLoc + activityHeight <=
              yTopLocAct + heightForDefaultVertex) &&
          mile.iMileStoneId === mileId
        ) {
          activity.xLeftLoc = +activity.xLeftLoc + newWidth;
          if (activityWidth + activity.xLeftLoc >= +mile.Width + newWidth) {
            isActMovedRight = true;
          }
        }
        // code edited on 21 Feb 2023 for BugId 124051
        if (
          activity.LaneId === cell1.parent.id &&
          +activity.yTopLoc > yTopLocAct &&
          ((+activity.xLeftLoc <= xLeftLocAct + expandedWidth &&
            +activity.xLeftLoc >= xLeftLocAct) ||
            (+activity.xLeftLoc + activityWidth <=
              xLeftLocAct + expandedWidth &&
              +activity.xLeftLoc + activityWidth >= xLeftLocAct)) &&
          mile.iMileStoneId === mileId
        ) {
          activity.yTopLoc = +activity.yTopLoc + newHeight;
        }
        if (laneArr.includes(activity.LaneId)) {
          activity.yTopLoc = +activity.yTopLoc + newHeight;
        }
      });
      // code edited on 21 Feb 2023 for BugId 124065
      if (
        mile.iMileStoneId === mileId &&
        (isActMovedRight || mile.Width < +mile.Width + newWidth)
      ) {
        let width = +mile.Width + newWidth;
        mile.Width = width;
        mile.embeddedWidthAdded = true;
      }
    });
    newData.DataObjects?.forEach((dataObj) => {
      if (
        +dataObj.LaneId === cell1.parent.id &&
        +dataObj.xLeftLoc > xLeftLocAct + widthForDefaultVertex &&
        (+dataObj.yTopLoc >= yTopLocAct ||
          +dataObj.yTopLoc + gridSize >= yTopLocAct) &&
        (+dataObj.yTopLoc <= yTopLocAct + heightForDefaultVertex ||
          +dataObj.yTopLoc + gridSize <= yTopLocAct + heightForDefaultVertex)
      ) {
        dataObj.xLeftLoc = +dataObj.xLeftLoc + newWidth;
      }
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        dataObj.LaneId === cell1.parent.id &&
        +dataObj.yTopLoc > yTopLocAct - milestoneTitleWidth &&
        ((+dataObj.xLeftLoc <= xLeftLocAct + expandedWidth &&
          +dataObj.xLeftLoc >= xLeftLocAct) ||
          (+dataObj.xLeftLoc + gridSize <= xLeftLocAct + expandedWidth &&
            +dataObj.xLeftLoc + gridSize >= xLeftLocAct))
      ) {
        dataObj.yTopLoc = +dataObj.yTopLoc + newHeight;
      }
      if (+dataObj.LaneId !== 0 && laneArr.includes(+dataObj.LaneId)) {
        dataObj.yTopLoc = +dataObj.yTopLoc + newHeight;
      }
    });
    newData.MSGAFS?.forEach((mxsgaf) => {
      if (
        +mxsgaf.LaneId === cell1.parent.id &&
        +mxsgaf.xLeftLoc > xLeftLocAct + widthForDefaultVertex &&
        (+mxsgaf.yTopLoc >= yTopLocAct ||
          +mxsgaf.yTopLoc + gridSize >= yTopLocAct) &&
        (+mxsgaf.yTopLoc <= yTopLocAct + heightForDefaultVertex ||
          +mxsgaf.yTopLoc + gridSize <= yTopLocAct + heightForDefaultVertex)
      ) {
        mxsgaf.xLeftLoc = +mxsgaf.xLeftLoc + newWidth;
      }
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        mxsgaf.LaneId === cell1.parent.id &&
        +mxsgaf.yTopLoc > yTopLocAct - milestoneTitleWidth &&
        ((+mxsgaf.xLeftLoc <= xLeftLocAct + expandedWidth &&
          +mxsgaf.xLeftLoc >= xLeftLocAct) ||
          (+mxsgaf.xLeftLoc + gridSize <= xLeftLocAct + expandedWidth &&
            +mxsgaf.xLeftLoc + gridSize >= xLeftLocAct))
      ) {
        mxsgaf.yTopLoc = +mxsgaf.yTopLoc + newHeight;
      }
      if (+mxsgaf.LaneId !== 0 && laneArr.includes(+mxsgaf.LaneId)) {
        mxsgaf.yTopLoc = +mxsgaf.yTopLoc + newHeight;
      }
    });
    newData.Annotations?.forEach((annotation) => {
      if (
        +annotation.LaneId === cell1.parent.id &&
        +annotation.xLeftLoc > xLeftLocAct + widthForDefaultVertex &&
        (+annotation.yTopLoc >= yTopLocAct ||
          +annotation.yTopLoc + gridSize >= yTopLocAct) &&
        (+annotation.yTopLoc <= yTopLocAct + heightForDefaultVertex ||
          +annotation.yTopLoc + gridSize <= yTopLocAct + heightForDefaultVertex)
      ) {
        annotation.xLeftLoc = +annotation.xLeftLoc + newWidth;
      }
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        annotation.LaneId === cell1.parent.id &&
        +annotation.yTopLoc > yTopLocAct - milestoneTitleWidth &&
        ((+annotation.xLeftLoc <= xLeftLocAct + expandedWidth &&
          +annotation.xLeftLoc >= xLeftLocAct) ||
          (+annotation.xLeftLoc + gridSize <= xLeftLocAct + expandedWidth &&
            +annotation.xLeftLoc + gridSize >= xLeftLocAct))
      ) {
        annotation.yTopLoc = +annotation.yTopLoc + newHeight;
      }
      if (+annotation.LaneId !== 0 && laneArr.includes(+annotation.LaneId)) {
        annotation.yTopLoc = +annotation.yTopLoc + newHeight;
      }
    });
    newData.GroupBoxes?.forEach((groupBox) => {
      if (
        +groupBox.LaneId === cell1.parent.id &&
        +groupBox.ILeft > xLeftLocAct + widthForDefaultVertex &&
        (+groupBox.ITop >= yTopLocAct ||
          +groupBox.ITop + +groupBox.GroupBoxHeight >= yTopLocAct) &&
        (+groupBox.ITop <= yTopLocAct + heightForDefaultVertex ||
          +groupBox.ITop + +groupBox.GroupBoxHeight <=
            yTopLocAct + heightForDefaultVertex)
      ) {
        groupBox.ILeft = +groupBox.ILeft + newWidth;
      }
      // code edited on 21 Feb 2023 for BugId 124051
      if (
        groupBox.LaneId === cell1.parent.id &&
        +groupBox.ITop > yTopLocAct - milestoneTitleWidth &&
        ((+groupBox.ILeft <= xLeftLocAct + expandedWidth &&
          +groupBox.ILeft >= xLeftLocAct) ||
          (+groupBox.ILeft + +groupBox.GroupBoxWidth <=
            xLeftLocAct + expandedWidth &&
            +groupBox.ILeft + +groupBox.GroupBoxWidth >= xLeftLocAct))
      ) {
        groupBox.ITop = +groupBox.ITop + newHeight;
      }
      if (+groupBox.LaneId !== 0 && laneArr.includes(+groupBox.LaneId)) {
        groupBox.ITop = +groupBox.ITop + newHeight;
      }
    });
    return newData;
  });
  graph.addCell(vertex);
  let btnDiv = document.createElement("div");
  btnDiv.setAttribute("id", `embeddedCollapseBtn_emb_${cell1.id}`);
  btnDiv.setAttribute(
    "style",
    // modified on 28/09/23 for BugId 135835
    // `position:absolute;display:flex;justify-content:end;z-index:10;width:${expandedWidth}px;`
    `position:absolute;display:flex;justify-content:end;z-index:1;width:${expandedWidth}px;`
    // till here BugId 135835
  );
  btnDiv.style.left = cell1.geometry.x + swimlaneTitleWidth + "px";
  btnDiv.style.top = cell1.geometry.y + cell1.parent.geometry.y + "px";
  let collapseBtn = document.createElement("button");
  collapseBtn.setAttribute("id", "collapseBtnId");
  collapseBtn.setAttribute(
    "style",
    "cursor:pointer;font: normal normal normal 10px/14px Open Sans !important;letter-spacing: 0px;color: #4A4A4A;background: transparent;border: none; margin: 0 !important;"
  );
  let collapseSpan = document.createElement("span");
  collapseSpan.innerHTML = t("toolbox.collapse");
  collapseBtn.appendChild(collapseSpan);
  btnDiv.appendChild(collapseBtn);
  collapseBtn.addEventListener("click", () => {
    let layers = graph.getChildVertices();
    layers?.forEach((layer) => {
      if (
        layer.getStyle() === style.expandedEmbeddedProcess &&
        layer.id === `emb_${cell1.id}`
      ) {
        graph.removeCells([layer]);
      }
    });
    graph.view.graph.container.removeChild(btnDiv);
    collapseExpandedProcess(setProcessData, graph, cell1);
  });
  graph.view.graph.container.appendChild(btnDiv);
}

export const textAnnotationModifyFunc = (
  cell,
  graph,
  setProcessData,
  t,
  dispatch
) => {
  const modifyAnnotationFunc = () => {
    let processDefId, processState, selectedAnnot, oldComment;
    let isValid = true;
    if (btnInput.value?.trim() === "") {
      isValid = false;
      dispatch(
        setToastDataFunc({
          message: t("EntityCantBeBlank", {
            entityName: t("AnnotationName"),
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
      const locale = getLocale();
      isValid = false;
      let message = "";
      if (isArabicLocaleSelected()) {
        message =
          t("AnnotationName") +
          SPACE +
          t("cannotContain") +
          SPACE +
          "& * | \\ : \" ' < > ? /" +
          SPACE +
          t("charactersInIt");
      } else {
        message =
          t("AllCharactersAreAllowedExcept") +
          SPACE +
          "& * | \\ : \" ' < > ? /" +
          SPACE +
          t("AndFirstCharacterShouldBeAlphabet") +
          SPACE +
          t("in") +
          SPACE +
          t("AnnotationName") +
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
          message: t("messages.minMaxChar", {
            maxChar: 255,
            entityName: t("AnnotationName"),
          }),
          severity: "error",
          open: true,
        })
      );
    }
    setProcessData((oldProcessData) => {
      let newProcessData = JSON.parse(JSON.stringify(oldProcessData));
      newProcessData.Annotations = JSON.parse(
        JSON.stringify(oldProcessData.Annotations)
      );
      processDefId = newProcessData.ProcessDefId;
      processState = newProcessData.ProcessType;
      newProcessData.Annotations = newProcessData.Annotations.map(
        (annotation) => {
          if (annotation.AnnotationId === cell.id) {
            oldComment = annotation.Comment;
            annotation.Comment =
              btnInput.value?.trim() !== "" && isValid
                ? btnInput.value
                : oldComment;
            selectedAnnot = annotation;
            delete annotation.hide;
          }
          return annotation;
        }
      );
      return newProcessData;
    });
    if (oldComment !== selectedAnnot.Comment && isValid) {
      ModifyAnnotation(
        processDefId,
        processState,
        selectedAnnot.Comment,
        selectedAnnot.AnnotationId,
        selectedAnnot.xLeftLoc,
        selectedAnnot.yTopLoc,
        selectedAnnot.Height,
        selectedAnnot.Width,
        selectedAnnot.LaneId,
        setProcessData,
        oldComment
      );
    }
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
  btnInput.setAttribute("value", cell.value);
  btnInput.setAttribute("style", `position:relative;width:100%;height:100%;`);
  let btnSubDiv = document.createElement("div");
  btnSubDiv.setAttribute(
    "style",
    `position:absolute;bottom: -4px;left: 75%;margin-left: -10px;content: "";display: block;border-left: 10px solid transparent;border-right: 10px solid transparent;border-top: 10px solid #d7d7d7;`
  );
  // code edited on 10 March 2023 for BugId 124727 - Text annotations -> when we rename then its shifted outside the embedded subprocess.
  btnDiv.style.left =
    cell.parent.style === style.expandedEmbeddedProcess
      ? Math.max(
          cell.geometry.x +
            cell.parent.geometry.x -
            swimlaneTitleWidth -
            commentWidth * 0.5,
          0
        ) + "px"
      : graph.isSwimlane(cell.parent)
      ? Math.max(cell.geometry.x - commentWidth * 0.5, 0) + "px"
      : Math.max(cell.geometry.x - swimlaneTitleWidth - commentWidth * 0.5, 0) +
        "px";
  btnDiv.style.top = graph.isSwimlane(cell.parent)
    ? Math.max(cell.geometry.y + cell.parent?.geometry.y - commentHeight, 0) +
      "px"
    : Math.max(cell.geometry.y - commentHeight, 0) + "px";
  btnDiv.appendChild(btnInput);
  btnDiv.appendChild(btnSubDiv);
  document.addEventListener("click", (e) => {
    if (
      e.target.id !== "commentInput" &&
      e.target.id !== "editIcon" &&
      e.target.id !== "renameOpt" &&
      graph.view.graph.container.contains(btnDiv)
    ) {
      graph.view.graph.container.removeChild(btnDiv);
      modifyAnnotationFunc();
    }
  });
  btnInput.addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
      graph.view.graph.container.removeChild(btnDiv);
      modifyAnnotationFunc();
    }
  });
  graph.view.graph.container.appendChild(btnDiv);
  btnInput.select();
  btnInput.focus();
};

function mxIconSet({
  evt,
  state,
  graph,
  setProcessData,
  t,
  dispatch,
  setShowQueueModal,
  setActionModal,
  menuRightsList,
  isReadOnly,
  showDrawer,
}) {
  this.images = [];
  milestonePresent = getMilestoneAt(evt.layerX - 2 * gridSize, evt.layerY);
  swimlanePresent = getSwimlaneAt(
    evt.layerX + 3 * graphGridSize,
    evt.layerY,
    MoveVertexType
  );
  if (doNotHoverForTheseCell(graph, state.cell, evt, milestonePresent)) {
    this.destroy();
    return;
  }
  let temp, processType;
  setProcessData((prev) => {
    temp = prev;
    processType = prev.ProcessType;
    return prev;
  });
  if (
    state.cell.style !== style.milestone &&
    !state.cell.style.includes(style.swimlane) &&
    state.cell.style !== style.expandedEmbeddedProcess
  ) {
    let parentLaneChecked =
      state.cell.parent.style === style.expandedEmbeddedProcess
        ? checkIfParentSwimlaneCheckedOut(temp, state.cell?.parent?.parent?.id)
            ?.length > 0
        : checkIfParentSwimlaneCheckedOut(temp, state.cell?.parent?.id)
            ?.length > 0;

    // code added on 21 Oct 2022 for BugId 111723
    // Boolean that decides whether user can rename/modify activity or not.
    const modifyActivityRightsFlag = getMenuNameFlag(
      menuRightsList,
      userRightsMenuNames.modifyActivity
    );
    if (
      !isReadOnly &&
      (processType === PROCESSTYPE_LOCAL ||
        processType === PROCESSTYPE_LOCAL_CHECKED ||
        (parentLaneChecked && checkActivityStatus(temp, state.cell.id))) &&
      state.cell?.style !== style.embStartEvent &&
      state.cell?.style !== style.embEndEvent &&
      modifyActivityRightsFlag // code edited on 7 March 2023 for BugId 124786 and BugId 120986
    ) {
      let img = mxUtils.createImage(editIcon);
      // img.setAttribute("title", `${t("edit")}`);
      img.setAttribute("id", `editIcon`);
      img.style.position = "absolute";
      img.style.cursor = "pointer";
      img.style.width = cellSize.w / 2 + "px";
      img.style.height = cellSize.h / 2 + "px";
      if (
        state.cell.style === style.subProcess ||
        state.cell.style === style.callActivity
      ) {
        img.style.left = DOMPurify.sanitize(
          `${
            state.text?.boundingBox.x +
            state.text?.boundingBox.width / 2 -
            cellSize.w / 4 +
            graphGridSize * 1.25
          }px`
        );
        img.style.top = DOMPurify.sanitize(
          `${
            state.text?.boundingBox.y +
            state.text?.boundingBox.height +
            graphGridSize * 0.25
          }px`
        );
      } else {
        img.style.left = DOMPurify.sanitize(
          `${
            state.text?.boundingBox.x +
            state.text?.boundingBox.width / 2 -
            cellSize.w / 4
          }px`
        );
        if (state?.cell?.style === style.textAnnotations) {
          img.style.top = DOMPurify.sanitize(
            `${
              state.text?.boundingBox.y +
              state.text?.boundingBox.height -
              cellSize.h / 4
            }px`
          );
        } else if (!checkStyle(defaultShapeVertex, state.cell.style)) {
          img.style.top = DOMPurify.sanitize(
            `${
              state.text?.boundingBox.y +
              state.text?.boundingBox.height -
              gridSize * 0.1
            }px`
          );
        } else {
          img.style.top = DOMPurify.sanitize(
            `${
              state.text?.boundingBox.y +
              state.text?.boundingBox.height +
              gridSize * 0.1
            }px`
          );
        }
      }

      // code added on 17 Nov 2022 for BugId 118886
      if (!checkStyle(defaultShapeVertex, state.cell.style)) {
        img.style.borderRadius = "100% 50% 100% 0";
        img.style.background = "rgba(255,255,255,0.7)";
      }
      // code edited on 28 Feb 2023 for BugId 124394
      img.style.zIndex = 9;
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function (evt) {
          // Disables dragging the image
          mxEvent.consume(evt);
        })
      );
      mxEvent.addListener(
        img,
        "click",
        mxUtils.bind(this, function (evt) {
          if (state?.cell?.style === style.textAnnotations) {
            this.destroy();
            removeContextMenu();
            hideIcons();
            setProcessData((oldProcessData) => {
              //code edited on 5 August 2022 for Bug 113802
              let newProcessData = JSON.parse(JSON.stringify(oldProcessData));
              newProcessData.Annotations = JSON.parse(
                JSON.stringify(oldProcessData.Annotations)
              );
              newProcessData.Annotations = newProcessData.Annotations?.map(
                (annot) => {
                  if (annot.AnnotationId === state?.cell?.id) {
                    annot = { ...annot, hide: true };
                  }
                  return annot;
                }
              );
              return newProcessData;
            });
            textAnnotationModifyFunc(
              state.cell,
              graph,
              setProcessData,
              t,
              dispatch
            );
          } else {
            removeContextMenu();
            removeToolDivCell();
            let id = state?.cell?.id;
            // code added on 16 Nov 2022 for BugId 119109
            if (
              state?.cell?.style === style.taskTemplate ||
              state?.cell?.style === style.newTask ||
              state?.cell?.style === style.processTask
            ) {
              let processDefId, taskName, processType;
              setProcessData((prevProcessData) => {
                prevProcessData.Tasks?.forEach((task) => {
                  if (task.TaskId === +id) {
                    taskName = task.TaskName;
                  }
                });
                processDefId = prevProcessData.ProcessDefId;
                processType = prevProcessData.ProcessType;
                return prevProcessData;
              });
              validateTaskObject({
                processDefId,
                processType,
                taskName,
                taskId: id,
                errorMsg: `${t("renameValidationErrorMsg")}`,
                onSuccess: (workitemValidationFlag) => {
                  if (!workitemValidationFlag) {
                    graph.startEditingAtCell(state.cell);
                    mxEvent.consume(evt);
                    this.destroy();
                  }
                },
                dispatch,
              });
            }
            // code edited on 18 Jan 2023 for BugId 122616
            else if (
              state?.cell?.style !== style.taskTemplate &&
              state?.cell?.style !== style.newTask &&
              state?.cell?.style !== style.processTask &&
              !artifacts.includes(state?.cell?.style)
            ) {
              let processDefId, activityName, processType;
              setProcessData((prevProcessData) => {
                prevProcessData.MileStones.forEach((milestone) => {
                  milestone.Activities.forEach((activity) => {
                    if (activity.ActivityId === Number(id)) {
                      activityName = activity.ActivityName;
                    }
                  });
                });
                processDefId = prevProcessData.ProcessDefId;
                processType = prevProcessData.ProcessType;
                return prevProcessData;
              });
              validateActivityObject({
                processDefId,
                processType,
                activityName,
                activityId: id,
                errorMsg: `${t("renameValidationErrorMsg")}`,
                onSuccess: (workitemValidationFlag) => {
                  if (!workitemValidationFlag) {
                    graph.startEditingAtCell(state.cell);
                    mxEvent.consume(evt);
                    this.destroy();
                  }
                },
                dispatch, // added on 04/10/23 for BugId 135993
              });
            }
            // code added on 18 Jan 2023 for BugId 122616
            else if (artifacts.includes(state?.cell?.style)) {
              graph.startEditingAtCell(state.cell);
              mxEvent.consume(evt);
              this.destroy();
            }
          }
        })
      );
      state.view.graph.container.appendChild(img);
      this.images.push(img);
    }

    if (state.cell.style === style.subProcess) {
      let img = mxUtils.createImage(hoverIcon);
      img.setAttribute("title", t("toolbox.expand"));
      img.style.opacity = 0;
      img.style.position = "absolute";
      img.style.cursor = "pointer";
      img.style.width = cellSize.w / 2 + "px";
      img.style.height = cellSize.h / 2 + "px";
      img.style.left = state.x + state.width / 2 - cellSize.w / 4 + "px";
      img.style.top =
        state.y + state.height - smallIconSize.h - cellSize.h / 4 + "px";
      img.style.zIndex = 100;
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function (evt) {
          // Disables dragging the image
          mxEvent.consume(evt);
        })
      );
      mxEvent.addListener(
        img,
        "click",
        mxUtils.bind(this, function (evt) {
          expandEmbeddedProcess(graph, state.cell, setProcessData, t);
          mxEvent.consume(evt);
          this.destroy();
        })
      );
      state.view.graph.container.appendChild(img);
      this.images.push(img);
    }
  }

  // Boolean that decides whether user can rename/modify milestone or not.
  const modifyMilestoneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.modifyMilestone
  );
  // Boolean that decides whether user can delete milestone or not.
  const deleteMilestoneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.deleteMilestone
  );
  if (
    !isReadOnly &&
    (state.cell.style === style.milestone ||
      (milestonePresent !== null && state.cell.style !== style.tasklane)) &&
    (modifyMilestoneRightsFlag || deleteMilestoneRightsFlag)
  ) {
    if (
      processType === PROCESSTYPE_LOCAL ||
      processType === PROCESSTYPE_LOCAL_CHECKED
    ) {
      let newState = graph.view.getState(state.cell);
      let img = mxUtils.createImage(moreIcon);
      // img.setAttribute("title", `${t("edit")}`);
      img.style.position = "absolute";
      img.style.cursor = "pointer";
      img.style.width = (cellSize.w / 5) * 2 + "px";
      img.style.height = (cellSize.h / 5) * 2 + "px";
      img.style.zIndex = 90;
      if (
        newState?.cell.style !== style.milestone &&
        milestonePresent !== null
      ) {
        newState = graph.view.getState(milestonePresent);
      }
      if (newState) {
        img.style.left = DOMPurify.sanitize(
          `${
            newState.text?.boundingBox.x +
            newState.text?.boundingBox.width +
            graphGridSize
          }px`
        );
        img.style.top = DOMPurify.sanitize(
          `${
            newState.text?.boundingBox.y +
            newState.text?.boundingBox.height / 2 -
            cellSize.h / 4.5
          }px`
        );
        mxEvent.addGestureListeners(
          img,
          mxUtils.bind(this, function (evt) {
            // Disables dragging the image
            mxEvent.consume(evt);
          })
        );
        mxEvent.addListener(
          img,
          "click",
          mxUtils.bind(this, function (evt) {
            /**
             * graph, setProcessData, cell, t, state, dispatch
             */
            getMileContextMenu({
              graph,
              setProcessData,
              cell: newState.cell,
              t,
              state: newState,
              dispatch,
              menuRightsList,
            });
          })
        );
        state.view.graph.container.appendChild(img);
        this.images.push(img);
      }
    }
  }

  // Boolean that decides whether user can rename/modify swimlane or not.
  const modifySwimlaneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.modifySwimlane
  );
  // Boolean that decides whether user can delete swimlane or not.
  const deleteSwimlaneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.deleteSwimlane
  );
  if (
    swimlanePresent !== null &&
    !isReadOnly &&
    (modifySwimlaneRightsFlag || deleteSwimlaneRightsFlag)
  ) {
    let newLaneState = graph.view.getState(swimlanePresent);
    if (newLaneState) {
      let img = mxUtils.createImage(moreIcon);
      img.style.position = "absolute";
      img.style.transform = "rotate(90deg)";
      img.style.cursor = "pointer";
      img.style.width = (cellSize.w / 5) * 2 + "px";
      img.style.height = gridSize + "px";
      img.style.zIndex = 90;
      img.style.left = DOMPurify.sanitize(
        `${
          newLaneState.text?.boundingBox.x +
          newLaneState.text?.boundingBox.width / 2 -
          cellSize.w / 5
        }px`
      );
      img.style.top = DOMPurify.sanitize(
        `${newLaneState.text?.boundingBox.y - graphGridSize * 1.75}px`
      );
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function (evt) {
          // Disables dragging the image
          mxEvent.consume(evt);
        })
      );
      mxEvent.addListener(
        img,
        "click",
        mxUtils.bind(this, function (evt) {
          getLaneContextMenu({
            graph,
            setProcessData,
            cell: newLaneState.cell,
            t,
            state: newLaneState,
            dispatch,
            setShowQueueModal,
            processType,
            setActionModal,
            menuRightsList,
            showDrawer,
          });
        })
      );
      state.view.graph.container.appendChild(img);
      this.images.push(img);
    }
  }
}

mxIconSet.prototype.destroy = function () {
  if (this.images != null) {
    for (var i = 0; i < this.images.length; i++) {
      var img = this.images[i];
      img.parentNode.removeChild(img);
    }
  }
  this.images = null;
};

export function cellOnMouseHover({
  graph,
  setProcessData,
  translation,
  dispatch,
  setShowQueueModal,
  setActionModal,
  menuRightsList,
  isReadOnly,
  showDrawer,
}) {
  // Defines the tolerance before removing the icons
  var iconTolerance = 20;
  // Shows icons if the mouse is over a cell
  graph.addMouseListener({
    currentState: null,
    currentIconSet: null,
    currentVertexToolbar: null,
    mouseDown: function (sender, me) {
      // Hides icons on mouse down
      if (this.currentState != null && this.dragLeave) {
        this.dragLeave(me.getEvent(), this.currentState);
        this.currentState = null;
      }
    },
    mouseMove: function (sender, me) {
      if (
        this.currentState != null &&
        (me.getState() === this.currentState || me.getState() == null)
      ) {
        var tol = iconTolerance;
        let tmp = new mxRectangle(
          me.getGraphX() - tol,
          me.getGraphY() - tol,
          2 * tol,
          2 * tol
        );
        if (mxUtils.intersects(tmp, this.currentState)) {
          return;
        }
      }
      let tmp = graph.view.getState(me.getCell());
      // Ignores everything but vertices
      if (
        graph.isMouseDown ||
        (tmp != null && !graph.getModel().isVertex(tmp.cell))
      ) {
        tmp = null;
      }
      if (tmp !== this.currentState) {
        if (this.currentState != null && this.dragLeave) {
          this.dragLeave(me.getEvent(), this.currentState);
        }
        this.currentState = tmp;
        if (this.currentState != null && this.dragEnter) {
          this.dragEnter(me.getEvent(), this.currentState);
        }
      }
    },
    mouseUp: function (sender, me) {},
    dragEnter: function (evt, state) {
      if (
        this.currentIconSet === null &&
        state &&
        state?.cell !== null &&
        state?.text !== null
      ) {
        this.currentIconSet = new mxIconSet({
          evt,
          state,
          graph,
          setProcessData,
          t: translation,
          dispatch,
          setShowQueueModal,
          setActionModal,
          menuRightsList,
          isReadOnly,
          showDrawer,
        });
      }
      // code added on 29 March 2023 for BugId 124045
      if (
        this.currentVertexToolbar === null &&
        state != null &&
        !checkStyle(endVertex, state?.cell?.style) &&
        state?.cell?.style !== style.taskTemplate &&
        state?.cell?.style !== style.newTask &&
        state?.cell?.style !== style.processTask &&
        state.cell?.style !== style.milestone &&
        !state.cell?.style?.includes(style.swimlane) &&
        state?.cell.getStyle() !== style.tasklane &&
        state?.cell.getStyle() !== style.tasklane_collapsed &&
        !state?.cell.getStyle().includes(style.swimlane_collapsed) &&
        !artifacts.includes(state?.cell.getStyle()) &&
        !graph.getModel().isEdge(state?.cell)
      ) {
        this.currentVertexToolbar = new mxVertexToolHandler(
          state,
          setProcessData,
          isReadOnly
        );
      }
    },
    dragLeave: function (evt, state) {
      if (this.currentIconSet != null) {
        this.currentIconSet.destroy();
        this.currentIconSet = null;
        removeMileContextMenu();
        removeLaneContextMenu();
      }
      // code added on 29 March 2023 for BugId 124045
      if (this.currentVertexToolbar != null) {
        this.currentVertexToolbar.destroy();
        this.currentVertexToolbar = null;
      }
    },
  });
  let container = document.getElementById("bpmnView");
  if (container) {
    mxEvent.addListener(
      container,
      "scroll",
      mxUtils.bind(this, function () {
        graph.tooltipHandler.hide();
        if (
          graph.connectionHandler != null &&
          graph.connectionHandler.constraintHandler != null
        ) {
          graph.connectionHandler.constraintHandler.reset();
        }
      })
    );
  }
}
