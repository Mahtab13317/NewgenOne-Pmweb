import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import classes from "./CellToolDiv.module.css";
import { getNextCell } from "../../../utility/bpmnView/getNextCell";
import { onToolClick } from "../../../utility/bpmnView/onToolClick";
import { toDropOnGraph } from "../../../utility/bpmnView/addVertexFromToolbox";
import {
  defaultSpaceBetweenCell,
  gridSize,
  cellSize,
} from "../../../Constants/bpmnView";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxCell = mxgraphobj.mxCell;
const mxGeometry = mxgraphobj.mxGeometry;
const mxRectangle = mxgraphobj.mxRectangle;

function CellToolDiv(props) {
  //t is our translation function
  let { t } = useTranslation();

  var cellToolDiv = useRef();

  let tolerance = 15;

  let wrapperDivStyle = {
    zIndex: "40",
    position: "absolute",
    top: props.evt.pageY - 4 * tolerance,
    left: props.evt.pageX - tolerance,
    padding: tolerance + "px",
  };

  let styleToolDiv = {
    minHeight: "50px",
    padding: "1px",
    background: "white",
    border: "1px solid #64b5f6",
  };

  let styleTool = {
    padding: "1px",
    margin: "0px",
  };

  let styleContent = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "50px",
  };

  let nextCells = getNextCell(props.cell);

  let onFocusLost = (event) => {
    props.setCellOnFocus(null);
  };

  let getThisCellOnGraph = (event, fromCell, toCell, graph) => {
    let initialX = fromCell.geometry.x + defaultSpaceBetweenCell;
    let initialY = fromCell.geometry.y;

    let parentCell = graph.getSwimlaneAt(initialX, initialY);

    let cellAtXY = null;

    while (true) {
      cellAtXY = graph.getCellAt(
        initialX + gridSize,
        initialY + gridSize,
        null,
        true,
        false,
        (cellState, x, y) => {
          if (graph.isSwimlane(cellState.cell)) {
            return true;
          }
          return false;
        }
      );

      if (cellAtXY == null) {
        //drop the cell on graph
        let vertex = new mxCell(
          t(toCell.title),
          new mxGeometry(0, 0, cellSize.w, cellSize.h),
          toCell.styleName
        );
        vertex.setVertex(true);
        vertex.geometry.x = initialX;
        vertex.geometry.y = initialY;
        parentCell.insert(vertex);

        //connect through edge
        graph.insertEdge(parentCell, null, "", fromCell, vertex);

        let bottomY = initialY + vertex.geometry.height;
        let rightX = initialX + vertex.geometry.width;

        console.log(
          parentCell.geometry.y,
          parentCell.geometry.height,
          initialY,
          bottomY
        );

        // check if it is still inside parentCell
        let stateOfParent = graph.view.getState(parentCell);
        if (graph.intersects(stateOfParent, rightX, bottomY) === false) {
          let newHeight = parentCell.geometry.height;
          let newWidth = parentCell.geometry.width;

          let anyChanges = false;

          if (newHeight < bottomY) {
            //and extra space of single grid is also added
            newHeight = bottomY + gridSize;
            anyChanges = true;
          }
          if (newWidth < rightX) {
            //and extra space of single grid is also added
            newWidth = rightX + gridSize;
            anyChanges = true;
          }
          if (anyChanges) {
            graph.resizeCells(
              [parentCell],
              [
                new mxRectangle(
                  parentCell.geometry.x,
                  parentCell.geometry.y,
                  newWidth,
                  newHeight
                ),
              ],
              null
            );
          }
          graph.refresh();
        }
        break;
      } else {
        initialY = initialY + (cellAtXY.geometry.height + gridSize);
      }
    }
  };

  let content =
    nextCells &&
    nextCells.map((cell, index) => (
      <div
        key={index}
        //onClick = {(evt) => onToolClick(evt, props.graph , cell.prototype, null, null , props.toolboxEventList, props.handleToolboxEvents , toDropOnGraph) }
        onClick={(event) =>
          getThisCellOnGraph(event, props.cell, cell, props.graph)
        }
        style={styleTool}
      >
        <img
          src={cell.icon}
          alt={t(cell.title)}
          title={t(cell.title)}
          width="20px"
          height="20px"
        />
      </div>
    ));

  content = <div style={styleContent}>{content}</div>;

  let buttomContent = (
    <div style={styleContent}>
      <div
        style={styleTool}
        onClick={(evt) =>
          onToolClick(
            evt,
            props.graph,
            nextCells[0].prototype,
            props.toolboxEventList,
            props.handleToolboxEvents,
            toDropOnGraph
          )
        }
      >
        <img
          src={nextCells[0].icon}
          alt={t(nextCells[0].title)}
          title={t(nextCells[0].title)}
          width="20px"
          height="20px"
        />
      </div>
      <div
        style={styleTool}
        onClick={(evt) =>
          onToolClick(
            evt,
            props.graph,
            nextCells[1].prototype,
            props.toolboxEventList,
            props.handleToolboxEvents,
            toDropOnGraph
          )
        }
      >
        <img
          src={nextCells[1].icon}
          alt={t(nextCells[1].title)}
          title={t(nextCells[1].title)}
          width="20px"
          height="20px"
        />
      </div>
    </div>
  );

  return (
    <div style={wrapperDivStyle} onMouseLeave={onFocusLost}>
      <div style={styleToolDiv} className="CellToolDiv" ref={cellToolDiv}>
        {content}
        <div className={classes.bar}></div>
        {buttomContent}
        <div>...</div>
      </div>
    </div>
  );
}

export default CellToolDiv;
