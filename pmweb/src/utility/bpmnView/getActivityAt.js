import {
  graphGridSize,
  gridSize,
  style,
  widthForDefaultVertex,
} from "../../Constants/bpmnView";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";

// code edited on 1 April 2023 for BugId 118895
export const getActivityAt = function (
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

  if (parent != null) {
    let vertex_1 = graph.getCellAt(x, y, parent, true);
    if (vertex_1 !== null && vertex_1.style !== style.groupBox) {
      if (id && vertex_1.id === id) {
        return null;
      } else {
        return vertex_1;
      }
    }
    let vertex_2 = graph.getCellAt(x + width, y, parent, true);
    if (vertex_2 !== null && vertex_2.style !== style.groupBox) {
      if (id && vertex_2.id === id) {
        return null;
      } else {
        return vertex_2;
      }
    }
    let vertex_3 = graph.getCellAt(x, y + height, parent, true);
    if (vertex_3 !== null && vertex_3.style !== style.groupBox) {
      if (id && vertex_3.id === id) {
        return null;
      } else {
        return vertex_3;
      }
    }
    let vertex_4 = graph.getCellAt(x + width, y + height, parent, true);
    if (vertex_4 !== null && vertex_4.style !== style.groupBox) {
      if (id && vertex_4.id === id) {
        return null;
      } else {
        return vertex_4;
      }
    }
    // case: when workdesk is moved over start event.
    if (width === widthForDefaultVertex) {
      for (let j = x; j <= x + width; j = j + gridSize) {
        for (let k = y; k <= y + height; k = k + gridSize) {
          let vertex_5 = graph.getCellAt(j, k, parent, true);
          if (vertex_5 !== null && vertex_5.style !== style.groupBox) {
            if (id && vertex_5.id === id) {
              return null;
            } else {
              return vertex_5;
            }
          }
        }
      }
    }
  }

  return null;
};

// code edited on 1 April 2023 for BugId 118895
export const getTaskAt = function (
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
  x = Math.floor(x / graphGridSize) * graphGridSize;
  y = Math.floor(y / graphGridSize) * graphGridSize;
  if (parent != null) {
    let vertex_1 = graph.getCellAt(x, y, parent, true);
    if (vertex_1 !== null) {
      if (id && vertex_1.id === id) {
        return null;
      } else {
        return vertex_1;
      }
    }
    let vertex_2 = graph.getCellAt(x + width, y, parent, true);
    if (vertex_2 !== null) {
      if (id && vertex_2.id === id) {
        return null;
      } else {
        return vertex_2;
      }
    }
    let vertex_3 = graph.getCellAt(x, y + height, parent, true);
    if (vertex_3 !== null) {
      if (id && vertex_3.id === id) {
        return null;
      } else {
        return vertex_3;
      }
    }
    let vertex_4 = graph.getCellAt(x + width, y + height, parent, true);
    if (vertex_4 !== null) {
      if (id && vertex_4.id === id) {
        return null;
      } else {
        return vertex_4;
      }
    }
  }

  return null;
};

export const getSubActivityAt = function (
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
  x = Math.floor(x / graphGridSize) * graphGridSize;
  y = Math.floor(y / graphGridSize) * graphGridSize;
  if (parent != null) {
    let childCount = graph.model.getChildCount(parent);
    for (let i = 0; i < childCount; i++) {
      for (let j = x; j <= x + width; j++) {
        let vertex_1 = graph.getCellAt(j, y, parent, true, false);
        if (vertex_1 !== null && vertex_1.style !== style.groupBox) {
          if (id && vertex_1.id === id) {
            return null;
          } else {
            return vertex_1;
          }
        }
      }
      for (let k = y; k <= y + height; k++) {
        let vertex_2 = graph.getCellAt(
          x + graphGridSize,
          k,
          parent,
          true,
          false
        );
        if (vertex_2 !== null && vertex_2.style !== style.groupBox) {
          if (id && vertex_2.id === id) {
            return null;
          } else {
            return vertex_2;
          }
        }
      }
    }
  }

  return null;
};
