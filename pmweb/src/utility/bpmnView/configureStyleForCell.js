import { cellSize, defaultShapeVertex, style } from "../../Constants/bpmnView";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxConstants = mxgraphobj.mxConstants;

export function configureStyleForCell(graph, icon, styleGraph) {
  let elemStyle = {};
  if (defaultShapeVertex.includes(styleGraph)) {
    if (styleGraph === style.workdesk || styleGraph === style.caseWorkdesk) {
      elemStyle[mxConstants.STYLE_STROKECOLOR] = "#7642A7";
      elemStyle[mxConstants.STYLE_FILLCOLOR] = "#F5F1F9";
    } else {
      elemStyle[mxConstants.STYLE_STROKECOLOR] = "black";
      elemStyle[mxConstants.STYLE_FILLCOLOR] = "white";
    }

    if (styleGraph === style.subProcess || styleGraph === style.callActivity) {
      elemStyle[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
      elemStyle[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] =
        mxConstants.ALIGN_BOTTOM;
    } else {
      elemStyle[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_LEFT;
      elemStyle[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    }
    elemStyle[mxConstants.STYLE_FONTCOLOR] = "#000000";
    elemStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
    elemStyle[mxConstants.STYLE_STROKEWIDTH] = 1.5;
    elemStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    elemStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_CENTER;
    elemStyle[mxConstants.STYLE_IMAGE] = icon;
    elemStyle[mxConstants.STYLE_SPACING_TOP] = "3";
    elemStyle[mxConstants.STYLE_IMAGE_HEIGHT] = cellSize.h / 2;
    elemStyle[mxConstants.STYLE_IMAGE_WIDTH] = cellSize.w / 2;
    elemStyle[mxConstants.STYLE_SPACING] = -2 + "";
    elemStyle[mxConstants.STYLE_ARCSIZE] = 10;
    elemStyle[mxConstants.STYLE_ROUNDED] = 1;
    elemStyle[mxConstants.STYLE_RESIZABLE] = 0;
  } else if (styleGraph === style.groupBox) {
    elemStyle[mxConstants.STYLE_FONTCOLOR] = "#000000";
    elemStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    elemStyle[mxConstants.STYLE_STROKECOLOR] = "#606060";
    elemStyle[mxConstants.STYLE_DASHED] = 1;
    elemStyle[mxConstants.STYLE_STROKEWIDTH] = 1.5;
    elemStyle[mxConstants.STYLE_NOLABEL] = true;
    elemStyle[mxConstants.STYLE_FILLCOLOR] = "transparent";
    elemStyle[mxConstants.STYLE_RESIZABLE] = 1;
  } else {
    elemStyle[mxConstants.STYLE_FONTCOLOR] = "#000000";
    elemStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
    elemStyle[mxConstants.STYLE_STROKECOLOR] = "none";
    elemStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    elemStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    elemStyle[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
    elemStyle[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] =
      mxConstants.ALIGN_CENTER;
    elemStyle[mxConstants.STYLE_IMAGE] = icon;
    elemStyle[mxConstants.STYLE_IMAGE_HEIGHT] = cellSize.w * 0.5;
    elemStyle[mxConstants.STYLE_IMAGE_WIDTH] = cellSize.h * 0.5;
    elemStyle[mxConstants.STYLE_SPACING_TOP] = cellSize.h + "";
    elemStyle[mxConstants.STYLE_FILLCOLOR] = "transparent";
    elemStyle[mxConstants.STYLE_RESIZABLE] = 0;
    if (styleGraph === style.textAnnotations) {
      elemStyle[mxConstants.STYLE_NOLABEL] = true;
    }
  }
  if (!styleGraph.includes("swimlane") && styleGraph !== "milestone") {
    //swimlane amd milestone styles are already defined in Graph.js
    graph.getStylesheet().putCellStyle(styleGraph, elemStyle);
  }
}
