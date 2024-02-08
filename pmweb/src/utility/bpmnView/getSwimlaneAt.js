import { getGraphLayers } from "../../components/ViewingArea/BPMNView/Graph";
import {
  graphGridSize,
  style,
  swimlaneTitleWidth,
} from "../../Constants/bpmnView";

export const getTasklaneAt = function (x, y) {
  let layers = getGraphLayers();
  if (layers) {
    let rootLayer = layers[0];
    // code edited on 28 Feb 2023 for BugId 112678 and BugId 124045
    x = Math.floor(x / graphGridSize) * graphGridSize;
    y = Math.floor(y / graphGridSize) * graphGridSize;
    let childCount = rootLayer?.children?.length;
    for (var i = 0; i < childCount; i++) {
      let lane = rootLayer?.children[i];
      if (lane && lane.geometry && lane.style === style.tasklane) {
        // code edited on 28 Feb 2023 for BugId 112678 and BugId 124045
        if (
          lane.geometry.x + swimlaneTitleWidth < x &&
          lane.geometry.x + lane.geometry.width > x &&
          lane.geometry.y < y &&
          lane.geometry.y + lane.geometry.height > y
        ) {
          return lane;
        }
      }
    }
  }
  return null;
};

export const getSwimlaneAt = function (x, y) {
  let layers = getGraphLayers();
  if (layers) {
    let swimlaneLayer = layers[2];
    // code edited on 28 Feb 2023 for BugId 112678 and BugId 124045
    x = Math.floor(x / graphGridSize) * graphGridSize;
    y = Math.floor(y / graphGridSize) * graphGridSize;
    let childCount = swimlaneLayer?.children?.length;
    for (var i = 0; i < childCount; i++) {
      let lane = swimlaneLayer?.children[i];
      if (lane) {
        // code edited on 28 Feb 2023 for BugId 112678 and BugId 124045
        if (
          lane.geometry.x + swimlaneTitleWidth < x &&
          lane.geometry.x + lane.geometry.width > x &&
          lane.geometry.y + lane.geometry.height > y
        ) {
          return lane;
        }
      }
    }
  }
  return null;
};
