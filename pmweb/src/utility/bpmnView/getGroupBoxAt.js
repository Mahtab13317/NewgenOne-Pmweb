import { gridSize, style } from "../../Constants/bpmnView";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";

export const getGroupBoxAt = function (
  x,
  y,
  parent,
  graph,
  widthArg,
  heightArg,
  id
) {
  let width = parseInt(widthArg);
  let height = parseInt(heightArg);
  x = dimensionInMultipleOfGridSize(x);
  y = dimensionInMultipleOfGridSize(y);
  // code edited on 1 April 2023 for BugId 118895
  if (parent != null) {
    for (let j = x; j <= x + width; j = j + gridSize) {
      for (let k = y; k <= y + height; k = k + gridSize) {
        let vertex_5 = graph.getCellAt(j, k, parent, true);
        if (vertex_5 !== null && vertex_5.style === style.groupBox) {
          if (id && vertex_5.id === id) {
            return null;
          } else {
            return vertex_5;
          }
        }
      }
    }
  }

  return null;
};
