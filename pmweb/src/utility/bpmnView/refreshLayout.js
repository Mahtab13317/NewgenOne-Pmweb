import {
  gridStartPoint,
  style,
  milestoneTitleWidth,
  tasklaneTitleWidth,
  gridSize,
  swimlaneTitleWidth,
} from "../../Constants/bpmnView";

//reposition the swimlane, milestone and buttons used to
//add swimlane and milestone whenever a swimlane/milestone are resized/added/deleted
export function refreshLayout(
  graph,
  tasklaneArray,
  swimlanes,
  milestones,
  buttons,
  showTasklane,
  foldCell
) {
  let x = gridStartPoint.x,
    y = gridStartPoint.y;
  let tasklane, tasklaneHeight;
  if (showTasklane) {
    tasklaneArray.forEach((eachChild) => {
      if (
        graph.isSwimlane(eachChild) &&
        (eachChild.style === style.tasklane ||
          eachChild.style === style.tasklane_collapsed)
      ) {
        //there is only one tasklane
        tasklane = eachChild;
        eachChild.geometry.x = x;
        eachChild.geometry.y = y;
      }
    });
    tasklaneHeight = tasklane
      ? foldCell
        ? tasklaneTitleWidth
        : tasklane.geometry.height
      : 0;
    y = tasklaneHeight;
    y = y + gridSize + milestoneTitleWidth;
    //if tasklane has no tasks, then collapse the tasklane
    if (foldCell) {
      graph.foldCells(true, null, [tasklane], false, null);
    }
  }

  if (!showTasklane) {
    y = gridStartPoint.y;
    y = y + milestoneTitleWidth;
  }

  swimlanes.forEach((swimlane) => {
    if (graph.isSwimlane(swimlane)) {
      swimlane.geometry.x = x;
      swimlane.geometry.y = y;
      // add checkout icon, if the lane is checked-out
      let grpChild = graph.view.graph.container.children;
      // [...grpChild].map((child) => {
        [...grpChild]?.forEach((child) => {
        if (child.getAttribute("id") === `lane_${swimlane.id}`) {
          child.style.top = `${y - 4}px`;
        }
      });
      y = y + swimlane.geometry.height;
    }
  });
  if (buttons != null) {
    buttons.addSwimlane.style.top = y + gridSize / 10 + "px";
    buttons.addSwimlane.style.left = x + "px";
  }

  if (showTasklane) {
    y = tasklaneHeight;
    y = y + gridSize;
  } else {
    y = gridStartPoint.y;
  }

  x = x + swimlaneTitleWidth;

  milestones.forEach((milestone) => {
    if (graph.isSwimlane(milestone)) {
      milestone.geometry.x = x;
      milestone.geometry.y = y;
      x = x + milestone.geometry.width;
    }
  });
  if (buttons !== null) {
    buttons.addMilestone.style.top = y + "px";
    buttons.addMilestone.style.left = x + gridSize / 10 + "px";
  }

  graph.refresh();
}
