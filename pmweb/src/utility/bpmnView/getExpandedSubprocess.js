import { style } from "../../Constants/bpmnView";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";

export const getExpandedSubprocess = function (x, y, parent, graph) {
  x = dimensionInMultipleOfGridSize(x);
  y = dimensionInMultipleOfGridSize(y);

  let cells = graph.getChildCells();
  // code edited on 1 April 2023 for BugId 118895
  let embeddedProcesses = cells?.filter(
    (el) => el.style === style.expandedEmbeddedProcess
  );
  for (let i of embeddedProcesses) {
    if (
      x > i.geometry.x &&
      x < i.geometry.width + i.geometry.x &&
      y > i.geometry.y &&
      y < i.geometry.y + i.geometry.height
    ) {
      return i;
    }
  }

  return null;
};

//function to check whether any of the embedded subprocess is expanded or not
export const isSubprocessExpanded = function (graph) {
  let cells = graph.getChildCells();
  let embeddedProcesses = cells?.filter(
    (el) => el.style === style.expandedEmbeddedProcess
  );
  if (embeddedProcesses?.length > 0) {
    return true;
  }
  return false;
};
