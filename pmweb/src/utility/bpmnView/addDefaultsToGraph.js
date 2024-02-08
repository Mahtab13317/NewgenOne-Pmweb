import { toAddSwimlaneMilestone } from "./toAddSwimlaneMilestone";
import { cellSize, rootId, swimlaneTitleSize } from "../../Constants/bpmnView";
import { taskTemplate } from "./toolboxIcon";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
} from "../../Constants/appConstants";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxCell = mxgraphobj.mxCell;
const mxConstants = mxgraphobj.mxConstants;

export let addDefaultsToGraph = ({
  graph,
  setNewId,
  translation,
  setProcessData,
  showTasklane,
  processType,
  menuRightsList,
  isReadOnly,
}) => {
  let style = {};

  if (showTasklane) {
    //add styles for default tasklane
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = "middle";
    style[mxConstants.STYLE_FONTSIZE] = 11;
    style[mxConstants.STYLE_HORIZONTAL] = false;
    style[mxConstants.STYLE_FONTCOLOR] = "white";
    style[mxConstants.STYLE_STROKECOLOR] = "white";
    style[mxConstants.STYLE_FILLCOLOR] = "#367D63";
    style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = "#49AB870C";
    style[mxConstants.STYLE_STARTSIZE] = swimlaneTitleSize;
    style[mxConstants.STYLE_MOVABLE] = 0;
    // code added on 30 Jan 2023 for BugId 122170
    if (
      processType !== PROCESSTYPE_LOCAL &&
      processType !== PROCESSTYPE_LOCAL_CHECKED
    ) {
      style[mxConstants.STYLE_RESIZABLE] = 0;
    }
    graph.getStylesheet().putCellStyle("tasklane", style);
  }

  //layer to add layer of swimlane and milestone over each other
  style = {};
  style[mxConstants.STYLE_FILLCOLOR] = null;
  style[mxConstants.STYLE_FOLDABLE] = 0;
  style[mxConstants.STYLE_MOVABLE] = 0;
  style[mxConstants.STYLE_RESIZABLE] = 0;
  graph.getStylesheet().putCellStyle("layer", style);
  let rootLayer = new mxCell(null, null, "layer");
  rootLayer.setId(rootId);
  rootLayer.setVertex(true);
  rootLayer.setConnectable(false);
  let swimlaneLayer = rootLayer.insert(new mxCell());
  let milestoneLayer = rootLayer.insert(new mxCell());

  if (showTasklane) {
    //style for collapsed tasklane
    style = {};
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_NOLABEL] = true;
    style[mxConstants.STYLE_HORIZONTAL] = false;
    style[mxConstants.STYLE_STROKECOLOR] = "#367D63";
    style[mxConstants.STYLE_FILLCOLOR] = "#367D63";
    style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = "#fff";
    style[mxConstants.STYLE_STARTSIZE] = swimlaneTitleSize;
    style[mxConstants.STYLE_MOVABLE] = 0;
    // code added on 30 Jan 2023 for BugId 122170
    style[mxConstants.STYLE_RESIZABLE] = 0;
    graph.getStylesheet().putCellStyle("tasklane_collapsed", style);
  }

  //style for collapsed swimlane
  style = {};
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
  style[mxConstants.STYLE_NOLABEL] = true;
  style[mxConstants.STYLE_HORIZONTAL] = false;
  style[mxConstants.STYLE_STROKECOLOR] = "#34659D";
  style[mxConstants.STYLE_FILLCOLOR] = "#35669F";
  style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = "#fff";
  style[mxConstants.STYLE_STARTSIZE] = swimlaneTitleSize;
  style[mxConstants.STYLE_MOVABLE] = 0;
  // code added on 30 Jan 2023 for BugId 122170
  style[mxConstants.STYLE_RESIZABLE] = 0;
  graph.getStylesheet().putCellStyle("swimlane_collapsed", style);

  //add default swimlane
  style = {};
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
  style[mxConstants.STYLE_VERTICAL_ALIGN] = "middle";
  style[mxConstants.STYLE_FONTSIZE] = 11;
  style[mxConstants.STYLE_HORIZONTAL] = false;
  style[mxConstants.STYLE_FONTCOLOR] = "white";
  style[mxConstants.STYLE_STROKECOLOR] = "white";
  style[mxConstants.STYLE_FILLCOLOR] = "#35669F";
  style[mxConstants.STYLE_STARTSIZE] = swimlaneTitleSize;
  style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = "#35669F0D";
  style[mxConstants.STYLE_MOVABLE] = 0;
  // code added on 30 Jan 2023 for BugId 122170
  if (
    processType !== PROCESSTYPE_LOCAL &&
    processType !== PROCESSTYPE_LOCAL_CHECKED
  ) {
    style[mxConstants.STYLE_RESIZABLE] = 0;
  }
  graph.getStylesheet().putCellStyle("swimlane", style);

  //add default milestone
  style = {};
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
  style[mxConstants.STYLE_VERTICAL_ALIGN] = "middle";
  style[mxConstants.STYLE_FONTSIZE] = 11;
  style[mxConstants.STYLE_HORIZONTAL] = true;
  style[mxConstants.STYLE_FONTCOLOR] = "white";
  style[mxConstants.STYLE_STROKECOLOR] = "#60606049";
  style[mxConstants.STYLE_FILLCOLOR] = "#37474F";
  style[mxConstants.STYLE_FOLDABLE] = 0;
  style[mxConstants.STYLE_STARTSIZE] = swimlaneTitleSize;
  style[mxConstants.STYLE_MOVABLE] = 0;
  // code added on 30 Jan 2023 for BugId 122170
  if (
    processType !== PROCESSTYPE_LOCAL &&
    processType !== PROCESSTYPE_LOCAL_CHECKED
  ) {
    style[mxConstants.STYLE_RESIZABLE] = 0;
  }
  graph.getStylesheet().putCellStyle("milestone", style);

  //style for expanded embedded process
  style = {};
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
  style[mxConstants.STYLE_HORIZONTAL] = true;
  style[mxConstants.STYLE_STROKECOLOR] = "#C4C4C4";
  style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = "#FFFFFF79";
  style[mxConstants.STYLE_ROUNDED] = 1;
  style[mxConstants.STYLE_ARCSIZE] = 10;
  style[mxConstants.STYLE_NOLABEL] = true;
  style[mxConstants.STYLE_STARTSIZE] = "0";
  style[mxConstants.STYLE_DASHED] = 1;
  style[mxConstants.STYLE_SWIMLANE_LINE] = 0;
  style[mxConstants.STYLE_STROKEWIDTH] = 2;
  style[mxConstants.STYLE_FOLDABLE] = 0;
  style[mxConstants.STYLE_MOVABLE] = 0;
  // code added on 30 Jan 2023 for BugId 122170
  if (
    processType !== PROCESSTYPE_LOCAL &&
    processType !== PROCESSTYPE_LOCAL_CHECKED
  ) {
    style[mxConstants.STYLE_RESIZABLE] = 0;
  }
  graph.getStylesheet().putCellStyle("expandedEmbeddedProcess", style);

  //style for task dropped in tasklane
  style = {};
  style[mxConstants.STYLE_FONTCOLOR] = "#000000";
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
  style[mxConstants.STYLE_STROKEWIDTH] = 1.5;
  style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
  style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_CENTER;
  style[mxConstants.STYLE_IMAGE] = taskTemplate.icon;
  style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_LEFT;
  style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
  style[mxConstants.STYLE_STROKECOLOR] = "black";
  style[mxConstants.STYLE_FILLCOLOR] = "white";
  style[mxConstants.STYLE_SPACING_TOP] = "3";
  style[mxConstants.STYLE_IMAGE_HEIGHT] = cellSize.h / 2;
  style[mxConstants.STYLE_IMAGE_WIDTH] = cellSize.w / 2;
  style[mxConstants.STYLE_SPACING] = -2 + "";
  style[mxConstants.STYLE_ARCSIZE] = 10;
  style[mxConstants.STYLE_ROUNDED] = 1;
  style[mxConstants.STYLE_RESIZABLE] = 0;
  graph.getStylesheet().putCellStyle("taskTemplate", style);

  graph.addCell(rootLayer);

  //add buttons for adding more swimlane and milestone
  let buttons = toAddSwimlaneMilestone({
    graph,
    setNewId,
    translation,
    setProcessData,
    processType,
    menuRightsList,
    isReadOnly,
  });

  let layers = [rootLayer, swimlaneLayer, milestoneLayer];

  return [layers, buttons];
};
