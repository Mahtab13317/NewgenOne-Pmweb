// code edited on 7 April 2023 for BugId 120857 and BugId 112628
import {
  defaultShapeVertex,
  graphGridSize,
  style,
} from "../../Constants/bpmnView";
import { checkStyle } from "../CommonFunctionCall/CommonFunctionCall";
import { dimensionInMultipleOfGridSize } from "./drawOnGraph";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});
const mxPoint = mxgraphobj.mxPoint;

const solveParallels = (parallels, graph, model, children, key, obj) => {
  let view = graph.getView();
  let [ptX, ptY] = key.split("_");

  let parallelLen = parallels.length;
  for (let i = 0; i < parallelLen; i++) {
    let source = view.getVisibleTerminal(parallels[i], true);
    let target = view.getVisibleTerminal(parallels[i], false);

    let src = model.getGeometry(source);
    let trg = model.getGeometry(target);

    let srcx = src.x,
      srcy = src.y,
      trgx = trg.x,
      trgy = trg.y;

    if (parallels[i].getParent() !== source.getParent()) {
      let pGeo = model.getGeometry(source.getParent());
      srcx = src.x + pGeo.x;
      srcy = src.y + pGeo.y;
    }

    if (parallels[i].getParent() !== target.getParent()) {
      let pGeo = model.getGeometry(target.getParent());
      trgx = trg.x + pGeo.x;
      trgy = trg.y + pGeo.y;
    }

    let isHorizontal, isActDefault;
    if (obj.source.includes(parallels[i].id)) {
      isActDefault = checkStyle(defaultShapeVertex, source.style);
      if (+srcx === +ptX || srcx + src.width === +ptX) {
        isHorizontal = true;
      } else if (+srcy === +ptY || srcy + src.height === +ptY) {
        isHorizontal = false;
      }
    } else {
      isActDefault = checkStyle(defaultShapeVertex, target.style);
      if (+trgx === +ptX || trgx + trg.width === +ptX) {
        isHorizontal = true;
      } else if (+trgy === +ptY || trgy + trg.height === +ptY) {
        isHorizontal = false;
      }
    }

    if (isHorizontal) {
      // horizontals
      children = children?.map((child) => {
        if (child.id === parallels[i].id) {
          let childState = graph.view.getState(child);
          let childPoints =
            child.geometry.points && child.geometry.points?.length > 0
              ? [...child.geometry.points]
              : [...childState?.absolutePoints];
          let allPtsOnSameLine = childPoints
            ?.map((pt) => dimensionInMultipleOfGridSize(Math.floor(pt.y)))
            ?.every((el) => +el === +ptY);
          child.geometry.points = childPoints?.map((pt, idx) => {
            let yPoint = dimensionInMultipleOfGridSize(Math.floor(pt.y));
            if (
              ((yPoint === +ptY &&
                allPtsOnSameLine &&
                (obj.target.includes(parallels[i].id)
                  ? idx !== 0
                  : idx !== childPoints.length - 1)) ||
                (yPoint === +ptY && !allPtsOnSameLine)) &&
              (isActDefault ? i < 13 : i < 5)
            ) {
              let newPtX, newPtY;
              if (
                childState.cell?.parent?.style === style.expandedEmbeddedProcess
              ) {
                newPtX =
                  Math.floor(pt.x) - childState.cell?.parent?.geometry?.x;
                newPtY =
                  Math.floor(pt.y) - childState.cell?.parent?.geometry?.y;
              } else {
                newPtX = dimensionInMultipleOfGridSize(Math.floor(pt.x));
                newPtY = yPoint;
              }
              let diffValue = graphGridSize / 2;
              let newXCord = i % 2 === 0 ? newPtX + i + 1 : newPtX - (i + 1);
              let newYCord =
                i === 0
                  ? newPtY
                  : i % 2 === 0
                  ? newPtY - diffValue * Math.ceil((i - 1) / 2)
                  : newPtY + diffValue * Math.ceil(i / 2);
              return new mxPoint(newXCord, newYCord);
            } else {
              return new mxPoint(pt.x, pt.y);
            }
          });
          childPoints = [...child.geometry.points];
          if (allPtsOnSameLine && childPoints?.length === 2) {
            let xCord =
              childPoints[0].x + (childPoints[1].x - childPoints[0].x) / 2;
            child.geometry.points.splice(
              1,
              0,
              new mxPoint(xCord, childPoints[0].y)
            );
            child.geometry.points.splice(
              2,
              0,
              new mxPoint(xCord, childPoints[1].y)
            );
          }
          child.parallelEdge = true;
        }
        return child;
      });
    } else {
      // vertical
      children = children?.map((child) => {
        if (child.id === parallels[i].id) {
          let childState = graph.view.getState(child);
          let childPoints =
            child.geometry.points && child.geometry.points?.length > 0
              ? [...child.geometry.points]
              : [...childState?.absolutePoints];
          let allPtsOnSameLine = childPoints
            ?.map((pt) => dimensionInMultipleOfGridSize(Math.floor(pt.x)))
            ?.every((el) => +el === +ptX);
          child.geometry.points = childPoints?.map((pt, idx) => {
            let xPoint = dimensionInMultipleOfGridSize(Math.floor(pt.x));
            if (
              ((xPoint === +ptX &&
                allPtsOnSameLine &&
                (obj.target.includes(parallels[i].id)
                  ? idx !== 0
                  : idx !== childPoints.length - 1)) ||
                (xPoint === +ptX && !allPtsOnSameLine)) &&
              (isActDefault ? i < 7 : i < 5)
            ) {
              let newPtX, newPtY;
              if (
                childState.cell?.parent?.style === style.expandedEmbeddedProcess
              ) {
                newPtX =
                  Math.floor(pt.x) - childState.cell?.parent?.geometry?.x;
                newPtY =
                  Math.floor(pt.y) - childState.cell?.parent?.geometry?.y;
              } else {
                newPtX = xPoint;
                newPtY = dimensionInMultipleOfGridSize(Math.floor(pt.y));
              }
              let diffValue = graphGridSize / 2;
              let newXCord =
                i === 0
                  ? newPtX
                  : i % 2 === 0
                  ? newPtX - diffValue * Math.ceil((i - 1) / 2)
                  : newPtX + diffValue * Math.ceil(i / 2);
              let newYCord = i % 2 === 0 ? newPtY + i + 1 : newPtY - (i + 1);
              return new mxPoint(newXCord, newYCord);
            } else {
              return new mxPoint(pt.x, pt.y);
            }
          });
          childPoints = [...child.geometry.points];
          if (allPtsOnSameLine && childPoints?.length === 2) {
            let yCord =
              childPoints[0].y + (childPoints[1].y - childPoints[0].y) / 2;
            child.geometry.points.splice(
              1,
              0,
              new mxPoint(childPoints[0].x, yCord)
            );
            child.geometry.points.splice(
              2,
              0,
              new mxPoint(childPoints[1].x, yCord)
            );
          }
          child.parallelEdge = true;
        }
        return child;
      });
    }
  }
};

// const is_point_on_segment = (startPoint, checkPoint, endPoint) => {
//   return (
//     ((endPoint.y - startPoint.y) * (checkPoint.x - startPoint.x)).toFixed(0) ===
//       ((checkPoint.y - startPoint.y) * (endPoint.x - startPoint.x)).toFixed(
//         0
//       ) &&
//     ((startPoint.x > checkPoint.x && checkPoint.x > endPoint.x) ||
//       (startPoint.x < checkPoint.x && checkPoint.x < endPoint.x)) &&
//     ((startPoint.y >= checkPoint.y && checkPoint.y >= endPoint.y) ||
//       (startPoint.y <= checkPoint.y && checkPoint.y <= endPoint.y))
//   );
// };

// code for this function is incomplete - instead of intersection, is_point_on_segment function will be used for all checkpoints
// const solveOverlappingEdges = (children, graph) => {
//   let childCount = children.length;
//   children = children?.map((child) => {
//     let childState = graph.view.getState(child);
//     let childPoints =
//       child.geometry.points && child.geometry.points?.length > 0
//         ? [...child.geometry.points]
//         : [...childState?.absolutePoints];

//     childPoints?.forEach((pt) => {
//       let newXCord = pt.x;
//       let newYCord = pt.y;
//       for (let j = 0; j < childCount; j++) {
//         let edge = children[j];
//         let newEdgeState = graph.view.getState(edge);
//         let newEdgePoints =
//           edge.geometry.points && edge.geometry.points?.length > 0
//             ? [...edge.geometry.points]
//             : [...newEdgeState?.absolutePoints];
//         let intersectionPt = mxUtils.intersection(
//           newXCord,
//           newYCord,
//           newXCord,
//           newYCord,
//           newEdgePoints[0].x,
//           newEdgePoints[0].y,
//           newEdgePoints[newEdgePoints.length - 1].x,
//           newEdgePoints[newEdgePoints.length - 1].y
//         );
//         if (intersectionPt !== null) {
//           break;
//         }
//       }
//       // let vertex_5 = graph.getCellAt(
//       //   newXCord,
//       //   newYCord,
//       //   child.parent,
//       //   false,
//       //   true
//       // );
//       // let i = 0;
//       // if (vertex_5 !== null && vertex_5.id !== child.id) {
//       //   let newEdgeState = graph.view.getState(vertex_5);
//       //   let newEdgePoints =
//       //     vertex_5.geometry.points && vertex_5.geometry.points?.length > 0
//       //       ? [...vertex_5.geometry.points]
//       //       : [...newEdgeState?.absolutePoints];
//       //   let intersectionPt = mxUtils.intersection(
//       //     childPoints[0].x,
//       //     childPoints[0].y,
//       //     childPoints[childPoints.length - 1].x,
//       //     childPoints[childPoints.length - 1].y,
//       //     newEdgePoints[0].x,
//       //     newEdgePoints[0].y,
//       //     newEdgePoints[newEdgePoints.length - 1].x,
//       //     newEdgePoints[newEdgePoints.length - 1].y
//       //   );
//       //   let diffValue = graphGridSize / 2;
//       //   if (intersectionPt !== null) {
//       //     child.geometry.points = childPoints?.map((subPt) => {
//       //       if (
//       //         +subPt.x >= +intersectionPt.x &&
//       //         +subPt.y >= +intersectionPt.y
//       //       ) {
//       //         while (intersectionPt !== null && i < 4) {
//       //           subPt.x =
//       //             i % 2 === 0
//       //               ? +subPt.x - diffValue * Math.ceil((i - 1) / 2)
//       //               : +subPt.x + diffValue * Math.ceil(i / 2);
//       //           subPt.y =
//       //             i % 2 === 0
//       //               ? subPt.y - diffValue * Math.ceil((i - 1) / 2)
//       //               : subPt.y + diffValue * Math.ceil(i / 2);
//       //           vertex_5 = graph.getCellAt(
//       //             subPt.x,
//       //             subPt.y,
//       //             child.parent,
//       //             false,
//       //             true
//       //           );
//       //           if (vertex_5 !== null && vertex_5.id !== child.id) {
//       //             newEdgeState = graph.view.getState(vertex_5);
//       //             newEdgePoints =
//       //               vertex_5.geometry.points &&
//       //               vertex_5.geometry.points?.length > 0
//       //                 ? [...vertex_5.geometry.points]
//       //                 : [...newEdgeState?.absolutePoints];
//       //             intersectionPt = mxUtils.intersection(
//       //               childPoints[0].x,
//       //               childPoints[0].y,
//       //               childPoints[childPoints.length - 1].x,
//       //               childPoints[childPoints.length - 1].y,
//       //               newEdgePoints[0].x,
//       //               newEdgePoints[0].y,
//       //               newEdgePoints[newEdgePoints.length - 1].x,
//       //               newEdgePoints[newEdgePoints.length - 1].y
//       //             );
//       //             i++;
//       //           } else {
//       //             break;
//       //           }
//       //         }
//       //       }
//       //       return new mxPoint(+subPt.x, +subPt.y);
//       //     });
//       //   }
//       // }
//     });
//     return child;
//   });
// };

export function parallelEdge(graph, children, swimlaneLayer) {
  let model = graph.getModel();
  let swimlaneChildren = [...swimlaneLayer?.children];
  swimlaneChildren = swimlaneChildren?.filter((el) => el.children?.length > 0);
  let childCount = swimlaneChildren?.length;
  for (let i = 0; i < childCount; i++) {
    let lane = swimlaneChildren[i];
    if (lane) {
      let newLaneChildren = lane.children?.filter((el) => el.edges?.length > 1);
      let laneChildCount = newLaneChildren?.length;
      for (let j = 0; j < laneChildCount; j++) {
        let child = newLaneChildren[j];
        let edges = child.edges;
        let obj = { source: [], target: [] };
        edges?.forEach((ed) => {
          if (ed.source?.id === child.id) {
            obj = { ...obj, source: [...obj.source, ed.id] };
          } else if (ed.target?.id === child.id) {
            obj = { ...obj, target: [...obj.target, ed.id] };
          }
        });
        let parallels = {};
        edges?.forEach((ed) => {
          // code added on 15 April 2023 for BugId 126847 - BPMN view>>screen is crashing when clicked on BPMN view after opening the process(process specific)
          if (ed && ed?.source !== null && ed?.target !== null) {
            let state = graph.view.getState(ed);
            if (state) {
              let id;
              let childPoints =
                ed.geometry.points && ed.geometry.points?.length > 0
                  ? [...ed.geometry.points]
                  : state?.absolutePoints && state?.absolutePoints?.length > 0
                  ? [...state?.absolutePoints]
                  : [];

              if (obj.target?.includes(ed.id)) {
                id = `${dimensionInMultipleOfGridSize(
                  Math.floor(childPoints[childPoints?.length - 1].x)
                )}_${dimensionInMultipleOfGridSize(
                  Math.floor(childPoints[childPoints?.length - 1].y)
                )}`;
              } else {
                id = `${dimensionInMultipleOfGridSize(
                  Math.floor(childPoints[0].x)
                )}_${dimensionInMultipleOfGridSize(
                  Math.floor(childPoints[0].y)
                )}`;
              }

              if (parallels[id] == null) {
                parallels[id] = [];
              }
              parallels[id].push(ed);
            }
          }
        });

        for (let key in parallels) {
          if (parallels[key].length > 1) {
            solveParallels(parallels[key], graph, model, children, key, obj);
          }
        }
      }
    }
  }
}
