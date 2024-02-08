import { getGraphLayers } from "../../components/ViewingArea/BPMNView/Graph";
import { graphGridSize } from "../../Constants/bpmnView";

export const getMilestoneAt = function (x, y) {
  let layers = getGraphLayers();
  if (layers) {
    let milestoneLayer = layers[1];
    // code edited on 28 Feb 2023 for BugId 112678 and BugId 124045
    x = Math.floor(x / graphGridSize) * graphGridSize;
    y = Math.floor(y / graphGridSize) * graphGridSize;

    let childCount = milestoneLayer?.children?.length;
    for (var i = 0; i < childCount; i++) {
      let mile = milestoneLayer?.children[i];
      if (mile) {
        // code edited on 28 Feb 2023 for BugId 112678 and BugId 124045
        if (
          mile.geometry.y + graphGridSize * 2 < y &&
          mile.geometry.x + mile.geometry.width + graphGridSize > x
        ) {
          return mile;
        }
      }
    }
  }
  return null;
};
