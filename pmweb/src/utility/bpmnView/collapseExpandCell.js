import { graphGridSize, gridSize } from "../../Constants/bpmnView";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});
const mxEvent = mxgraphobj.mxEvent;
const mxPoint = mxgraphobj.mxPoint;

//function when swimlane is collapsed or expanded
export const collapseExpandCell = (
  graph,
  buttons,
  milestoneLayer,
  swimlaneLayer
) => {
  let swimlane_name;
  let tasklane_name;
  let name_array = {};
  let task_array = {};

  graph.foldCells = function (collapse, recurse, cells, checkFoldable, evt) {
    cells.forEach((cell) => {
      graph.getModel().beginUpdate();
      //first check the style of cell and whether it is collapsed or expanded
      try {
        if (cell) {
          if (
            cell.style.includes("swimlane") &&
            (!cell.collapsed || cell.collapsed === false)
          ) {
            cell.previousStyle = cell.style;
            cell.style = "swimlane_collapsed";
            cell.previousHeight = cell.geometry.height;
            cell.geometry.height = gridSize;
            cell.setCollapsed(true);
            cell.setConnectable(false);
            let indexVal;
            let grpChild = graph.view.graph.container.children;
            //handle top of sibling cells of selected cell
            cell.parent.children.forEach((child, index) => {
              if (child.id === cell.id) {
                indexVal = index;
                // [...grpChild].map((child1) => {
                  [...grpChild]?.forEach((child1) => {
                  if (
                    child1.getAttribute("class") === `lane_${cell.id} checkIcon`
                  ) {
                    child1.style.display = `none`;
                  }
                });
              }
              if (indexVal < index) {
                child.geometry.y =
                  child.geometry.y - cell.previousHeight + cell.geometry.height;
                //handle position of name span for sibling cells
                if (name_array[child.id]) {
                  name_array[child.id].style.top =
                    parseInt(name_array[child.id].style.top) -
                    cell.previousHeight +
                    cell.geometry.height +
                    "px";
                }
                // [...grpChild].map((child1) => {
                  [...grpChild]?.forEach((child1) => {
                  if (
                    child1.getAttribute("class") ===
                    `lane_${child.id} checkIcon`
                  ) {
                    let newTop =
                      parseInt(child1.style.top.replace("px", "")) -
                      cell.previousHeight +
                      cell.geometry.height;
                    child1.style.top = `${newTop}px`;
                  }
                  if (child1.getAttribute("id") === `lane_${child.id}`) {
                    child1.style.top = `${
                      parseInt(child1.style.top.replace("px", "")) -
                      cell.previousHeight +
                      cell.geometry.height
                    }px`;
                  }
                });
              }
            });

            //create name span to show on collapsed swimlane
            swimlane_name = document.createElement("span");
            swimlane_name.innerHTML = cell.value;
            swimlane_name.setAttribute(
              "style",
              "position:absolute;color:#35669F;z-index:10;font-size:12px;font-weight:600"
            );
            swimlane_name.setAttribute("class", "collapsed_view");
            swimlane_name.style.left =
              cell.geometry.x + cell.geometry.width * 0.45 + "px";
            swimlane_name.style.top = cell.geometry.y + gridSize * 0.25 + "px";
            graph.view.graph.container.appendChild(swimlane_name);
            // cell added to name_array - local array
            name_array = { ...name_array, [cell.id]: swimlane_name };
            graph.getDefaultParent().children?.forEach((el) => {
              if (graph.model.isEdge(el)) {
                if (!el.backupPoints || el.backupPoints?.length === 0) {
                  el.backupPoints = el.geometry.points;
                }
                if (el.geometry?.points?.length === 0) {
                  let edgeState = graph.view.getState(el);
                  let sourcePt = edgeState?.absolutePoints[0]?.y;
                  let targetPt =
                    edgeState?.absolutePoints[
                      edgeState?.absolutePoints?.length - 1
                    ]?.y;
                  if (
                    cell.geometry.y <= sourcePt &&
                    sourcePt <= cell.geometry.y + cell.previousHeight &&
                    cell.geometry.y <= targetPt &&
                    targetPt <= cell.geometry.y + cell.previousHeight
                  ) {
                    el.setOpacity = true;
                    el.style = el.style + "opacity=0;";
                  }
                } else {
                  // for edges placed in lanes below the lane collapsed
                  el.geometry.points = el.geometry.points?.map((pt) => {
                    if (
                      cell.geometry.y <= +pt.y &&
                      +pt.y <= cell.geometry.y + cell.previousHeight
                    ) {
                      el.setOpacity = true;
                      el.style = el.style + "opacity=0;";
                      return new mxPoint(pt.x, cell.geometry.y + graphGridSize);
                    } else if (+pt.y > cell.geometry.y + cell.previousHeight) {
                      return new mxPoint(
                        pt.x,
                        +pt.y - cell.previousHeight + gridSize
                      );
                    } else {
                      return new mxPoint(pt.x, pt.y);
                    }
                  });
                }
              }
            });
            milestoneLayer.children?.forEach((milestone) => {
              if (graph.isSwimlane(milestone)) {
                milestone.geometry.height =
                  milestone.geometry.height - cell.previousHeight + gridSize;
              }
            });
            let new_height = dimensionInMultipleOfGridSize(
              cell.previousHeight - cell.geometry.height
            );
            //change height and top of add buttons
            buttons.addMilestone.style.height =
              parseInt(buttons.addMilestone.style.height) - new_height + "px";
            buttons.addSwimlane.style.top =
              parseInt(buttons.addSwimlane.style.top) - new_height + "px";
          } else if (
            cell.style.includes("swimlane_collapsed") &&
            cell.collapsed === true
          ) {
            cell.style = cell.previousStyle;
            cell.geometry.height = cell.previousHeight;
            cell.setCollapsed(false);
            let indexVal;
            let grpChild = graph.view.graph.container.children;
            cell.parent.children.forEach((child, index) => {
              if (child.id === cell.id) {
                indexVal = index;
                // [...grpChild].map((child1) => {
                  [...grpChild]?.forEach((child1) => {
                  if (
                    child1.getAttribute("class") === `lane_${cell.id} checkIcon`
                  ) {
                    child1.style.display = `block`;
                  }
                });
              }
              if (indexVal < index) {
                child.geometry.y =
                  child.geometry.y + cell.previousHeight - gridSize;
                if (name_array[child.id]) {
                  name_array[child.id].style.top =
                    parseInt(name_array[child.id].style.top) +
                    cell.previousHeight -
                    gridSize +
                    "px";
                }
                // [...grpChild].map((child1) => {
                  [...grpChild]?.forEach((child1) => {
                  if (
                    child1.getAttribute("class") ===
                    `lane_${child.id} checkIcon`
                  ) {
                    let newTop =
                      parseInt(child1.style.top.replace("px", "")) +
                      cell.previousHeight -
                      gridSize;
                    child1.style.top = `${newTop}px`;
                  }
                  if (child1.getAttribute("id") === `lane_${child.id}`) {
                    child1.style.top = `${
                      parseInt(child1.style.top.replace("px", "")) +
                      cell.previousHeight -
                      gridSize
                    }px`;
                  }
                });
              }
            });
            //get name span and delete it from graph when cell is expanded
            let swimlane = name_array[cell.id];
            graph.view.graph.container.removeChild(swimlane);
            graph.getDefaultParent().children?.forEach((el) => {
              if (graph.model.isEdge(el)) {
                el.geometry.points = el.backupPoints;
                el.backupPoints = [];
                if (
                  el.setOpacity &&
                  (el.source.parent.id === cell.id ||
                    el.target.parent.id === cell.id)
                ) {
                  el.style =
                    "edgeStyle=orthogonalEdgeStyle;shape=connector;orthogonalLoop=1;jettySize=auto;labelBackgroundColor=default;fontSize=11;fontColor=#000;startFill=1;endArrow=classic;strokeColor=black;strokeWidth=1;movableLabel=0;verticalAlign=bottom;";
                  el.setOpacity = false;
                }
              }
            });
            milestoneLayer.children?.forEach((milestone) => {
              if (graph.isSwimlane(milestone)) {
                milestone.geometry.height =
                  milestone.geometry.height + cell.previousHeight - gridSize;
              }
            });
            let new_height = dimensionInMultipleOfGridSize(cell.previousHeight);
            buttons.addMilestone.style.height =
              parseInt(buttons.addMilestone.style.height) +
              new_height -
              gridSize +
              "px";
            buttons.addSwimlane.style.top =
              parseInt(buttons.addSwimlane.style.top) +
              new_height -
              gridSize +
              "px";
          } else if (
            cell.style === "tasklane" &&
            (!cell.collapsed || cell.collapsed === false)
          ) {
            cell.style = "tasklane_collapsed";
            // code added on 17 June 2022 for BugId 110174
            graph.isTasklaneExpanded = false;
            cell.previousHeight = cell.geometry.height;
            cell.geometry.height = gridSize;
            cell.setCollapsed(true);
            tasklane_name = document.createElement("span");
            tasklane_name.innerHTML = cell.value;
            tasklane_name.setAttribute(
              "style",
              "position:absolute;color:#367D63;z-index:10;font-size:12px;font-weight:600"
            );
            tasklane_name.setAttribute("class", "collapsed_view");
            tasklane_name.style.left =
              cell.geometry.x + cell.geometry.width * 0.45 + "px";
            tasklane_name.style.top = cell.geometry.y + gridSize * 0.25 + "px";
            graph.view.graph.container.appendChild(tasklane_name);
            task_array = { ...task_array, [cell.id]: tasklane_name };
            //set the position of children of milestone layer as well as swimlane layer
            milestoneLayer.children?.forEach((milestone) => {
              if (graph.isSwimlane(milestone)) {
                milestone.geometry.y =
                  milestone.geometry.y - cell.previousHeight + gridSize;
              }
            });
            let grpChild = graph.view.graph.container.children;
            swimlaneLayer.children?.forEach((swimlane) => {
              if (graph.isSwimlane(swimlane)) {
                swimlane.geometry.y =
                  swimlane.geometry.y - cell.previousHeight + gridSize;
                // [...grpChild].map((child) => {
                  [...grpChild]?.forEach((child) => {
                  if (
                    child.getAttribute("class") ===
                    `lane_${swimlane.id} checkIcon`
                  ) {
                    let newTop =
                      parseInt(child.style.top.replace("px", "")) -
                      cell.previousHeight +
                      gridSize;
                    if (newTop >= swimlane.geometry.y && newTop >= 0) {
                      child.style.top = `${newTop}px`;
                    }
                  }
                  if (child.getAttribute("id") === `lane_${swimlane.id}`) {
                    child.style.top = `${
                      parseInt(child.style.top.replace("px", "")) -
                      cell.previousHeight +
                      gridSize
                    }px`;
                  }
                });
              }
            });
            graph.getDefaultParent().children?.forEach((el) => {
              if (graph.model.isEdge(el)) {
                el.geometry.points = el.geometry.points?.map((pt) => {
                  return new mxPoint(
                    pt.x,
                    +pt.y - cell.previousHeight + gridSize
                  );
                });
              }
            });
            let new_height = dimensionInMultipleOfGridSize(cell.previousHeight);
            buttons.addMilestone.style.top =
              parseInt(buttons.addMilestone.style.top) -
              new_height +
              gridSize +
              "px";
            buttons.addSwimlane.style.top =
              parseInt(buttons.addSwimlane.style.top) -
              new_height +
              gridSize +
              "px";
          } else if (
            cell.style === "tasklane_collapsed" &&
            cell.collapsed === true
          ) {
            cell.style = "tasklane";
            // code added on 17 June 2022 for BugId 110174
            graph.isTasklaneExpanded = true;
            cell.geometry.height = cell.previousHeight;
            cell.setCollapsed(false);
            let tasklane = task_array[cell.id];
            graph.view.graph.container.removeChild(tasklane);
            milestoneLayer.children?.forEach((milestone) => {
              if (graph.isSwimlane(milestone)) {
                milestone.geometry.y =
                  milestone.geometry.y + cell.previousHeight - gridSize;
              }
            });
            let grpChild = graph.view.graph.container.children;
            swimlaneLayer.children?.forEach((swimlane) => {
              if (graph.isSwimlane(swimlane)) {
                swimlane.geometry.y =
                  swimlane.geometry.y + cell.previousHeight - gridSize;
                [...grpChild].forEach((child) => {
                  if (
                    child.getAttribute("class") ===
                    `lane_${swimlane.id} checkIcon`
                  ) {
                    child.style.top = `${
                      parseInt(child.style.top.replace("px", "")) +
                      cell.previousHeight -
                      gridSize
                    }px`;
                  }
                  if (child.getAttribute("id") === `lane_${swimlane.id}`) {
                    child.style.top = `${
                      parseInt(child.style.top.replace("px", "")) +
                      cell.previousHeight -
                      gridSize
                    }px`;
                  }
                });
              }
            });
            graph.getDefaultParent().children?.forEach((el) => {
              if (graph.model.isEdge(el)) {
                el.geometry.points = el.geometry.points?.map((pt) => {
                  return new mxPoint(
                    pt.x,
                    +pt.y + cell.previousHeight - gridSize
                  );
                });
              }
            });

            let new_height = dimensionInMultipleOfGridSize(cell.previousHeight);
            buttons.addMilestone.style.top =
              parseInt(buttons.addMilestone.style.top) +
              new_height -
              gridSize +
              "px";
            buttons.addSwimlane.style.top =
              parseInt(buttons.addSwimlane.style.top) +
              new_height -
              gridSize +
              "px";
          }
        }
      } finally {
        // Updates the display
        graph.refresh();
        graph.getModel().endUpdate();
      }
    });
  };

  graph.addListener(mxEvent.FOLD_CELLS, (sender, evt) => {
    var cells = evt.getProperty("cells");
    for (var i = 0; i < cells.length; i++) {
      var geo = graph.model.getGeometry(cells[i]);
      if (geo.alternateBounds != null) {
        geo.width = geo.alternateBounds.width;
      }
    }
  });
};
