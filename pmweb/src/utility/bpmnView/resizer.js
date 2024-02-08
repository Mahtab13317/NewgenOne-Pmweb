import { refreshLayout } from "./refreshLayout";
import {
  minSwimlaneWidth,
  minSwimlaneHeight,
  style,
  milestoneTitleWidth,
  swimlaneTitleWidth,
} from "../../Constants/bpmnView";

function getTotalHeight(cells) {
  let height = 0;
  cells
    ?.filter((cell) => {
      let styleName = cell.getStyle();
      return (
        styleName.includes(style.swimlane) ||
        styleName.includes(style.swimlane_collapsed)
      );
    })
    .forEach((eachCell) => {
      height += eachCell.geometry.height;
    });
  return height;
}

function getTotalWidth(cells) {
  let width = 0;
  cells
    ?.filter((cell) => {
      let styleName = cell.getStyle();
      return styleName === style.milestone;
    })
    .forEach((eachCell) => {
      width += eachCell.geometry.width;
    });
  return width;
}

//increase width of each swimlane
function handleWidth(graph, cells, width) {
  if (cells == null) {
    //undefined or null
    return;
  }
  cells
    ?.filter((cell) => {
      let styleName = cell.getStyle();
      return (
        styleName.includes(style.swimlane) ||
        styleName.includes(style.swimlane_collapsed) ||
        styleName === style.tasklane ||
        styleName === style.tasklane_collapsed
      );
    })
    .forEach((eachCell) => {
      if (graph.isSwimlane(eachCell)) {
        eachCell.geometry.width = width;
      }
    });
}

//increse height of each milestone
function handleHeight(graph, cells, height) {
  if (cells == null) {
    //undefined or null
    return;
  }
  cells
    ?.filter((cell) => {
      let styleName = cell.getStyle();
      return styleName === style.milestone;
    })
    .forEach((eachCell) => {
      if (graph.isSwimlane(eachCell)) {
        eachCell.geometry.height = height;
      }
    });
}

//called when swimlane/milestone are resized
export function resizer(
  graph,
  [swimlaneLayer, milestoneLayer, rootLayer],
  cell,
  horizontal,
  buttons,
  showTasklane,
  foldCell
) {
  let swimlanes, milestones, tasklane;
  let minHeight = minSwimlaneWidth,
    minWidth = minSwimlaneHeight;
  let cellWidth, cellHeight;

  //width of swimlane = sum of width of all milestone + swimlaneTitleWidth
  //height of milestone = sume of height of all milestone + milestoneTitleWidth

  swimlanes = swimlaneLayer.children;
  milestones = milestoneLayer.children;
  tasklane = rootLayer.children?.filter(
    (child) => child.style === style.tasklane
  );

  if (cell != null) {
    cellWidth = cell.geometry.width;
    cellHeight = cell.geometry.height;
  }
  let totalWidth = getTotalWidth(milestones);
  let totalHeight = getTotalHeight(swimlanes);

  let lastSwimlane = null;
  for (let i = swimlanes.length - 1; i >= 0; i--) {
    if (graph.isSwimlane(swimlanes[i])) {
      lastSwimlane = swimlanes[i];
      break;
    }
  }

  let lastMilestone = null;
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (graph.isSwimlane(milestones[i])) {
      lastMilestone = milestones[i];
      break;
    }
  }

  // if milestone is resized
  if (horizontal === true) {
    if (
      lastSwimlane?.geometry.height +
        (cellHeight - totalHeight - milestoneTitleWidth) <
      minHeight
    ) {
      cellHeight =
        totalHeight +
        milestoneTitleWidth -
        lastSwimlane.geometry.height +
        minHeight;
    }
    if (cellWidth < minWidth) {
      totalWidth = totalWidth - cellWidth + minWidth;
      if (cell !== null) {
        cell.geometry.width = minWidth;
      }
    }

    handleHeight(graph, milestones, cellHeight);
    handleHeight(
      graph,
      [lastSwimlane],
      lastSwimlane.geometry.height +
        (cellHeight - totalHeight - milestoneTitleWidth)
    );
    handleWidth(graph, swimlanes, totalWidth + swimlaneTitleWidth);
    handleWidth(graph, tasklane, totalWidth + swimlaneTitleWidth);
  }
  // if swimlane / tasklane is resized
  else if (horizontal === false) {
    if (
      lastMilestone &&
      lastMilestone.geometry.width +
        (cellWidth - totalWidth - swimlaneTitleWidth) <
        minWidth
    ) {
      cellWidth =
        totalWidth +
        swimlaneTitleWidth -
        lastMilestone.geometry.width +
        minWidth;
    }
    if (cellHeight < minHeight) {
      totalHeight = totalHeight - cellHeight + minHeight;
      cell.geometry.height = minHeight;
    }

    if (cell.getStyle() !== style.tasklane) {
      handleHeight(graph, milestones, totalHeight + milestoneTitleWidth);
    }
    handleWidth(graph, swimlanes, cellWidth);
    handleWidth(graph, tasklane, cellWidth);
    handleWidth(
      graph,
      [lastMilestone],
      lastMilestone.geometry.width +
        (cellWidth - totalWidth - swimlaneTitleWidth)
    );
  }
  //if horizontal is undefined
  // that is when swimlane or milestone are added/deleted
  else {
    handleWidth(graph, swimlanes, totalWidth + swimlaneTitleWidth);
    handleWidth(graph, tasklane, totalWidth + swimlaneTitleWidth);
    handleHeight(graph, milestones, totalHeight + milestoneTitleWidth);
  }

  //after resizing swimlane, milestone and button to add swimlane/milestone
  //are repositioned accordingly
  refreshLayout(
    graph,
    tasklane,
    swimlanes,
    milestones,
    buttons,
    showTasklane,
    foldCell
  );
}
