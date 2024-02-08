import axios from "axios";
import {
  ENDPOINT_MOVE_CONNECTION,
  SERVER_URL,
} from "../../Constants/appConstants";
import { gridSize, style } from "../../Constants/bpmnView";
import {
  checkIfParentSwimlaneCheckedOut,
  checkIfSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxEvent = mxgraphobj.mxEvent;
const mxPoint = mxgraphobj.mxPoint;
const mxRectangle = mxgraphobj.mxRectangle;
const mxUtils = mxgraphobj.mxUtils;
const mxEdgeStyle = mxgraphobj.mxEdgeStyle;

export function edgeOnMouseHover(graph, setProcessData, rootLayer) {
  let start = {
    point: null,
    event: null,
    state: null,
    handle: null,
    selected: false,
  };
  let model = graph.getModel();

  graph.addMouseListener({
    mouseDown: function (sender, me) {
      let state = me.getState();
      if (!mxEvent.isAltDown(me.getEvent()) && state != null) {
        // Checks if state was removed in call to stopEditing above
        if (graph.model.isEdge(state.cell)) {
          start.point = new mxPoint(me.getGraphX(), me.getGraphY());
          start.selected = graph.isCellSelected(state.cell);
          start.state = state;
          start.event = me;

          if (
            state.text != null &&
            state.text.boundingBox != null &&
            mxUtils.contains(
              state.text.boundingBox,
              me.getGraphX(),
              me.getGraphY()
            )
          ) {
            start.handle = mxEvent.LABEL_HANDLE;
          } else {
            let handler = graph.selectionCellsHandler.getHandler(state.cell);

            if (
              handler != null &&
              handler.bends != null &&
              handler.bends.length > 0
            ) {
              start.handle = handler.getHandleForEvent(me);
            }
          }
        }
      }
    },
    mouseMove: mxUtils.bind(this, function (sender, me) {
      // Checks if any other handler is active
      let handlerMap = graph.selectionCellsHandler.handlers.map;
      for (let key in handlerMap) {
        if (handlerMap[key].index != null) {
          return;
        }
      }

      if (
        graph.isEnabled() &&
        !graph.panningHandler.isActive() &&
        !mxEvent.isAltDown(me.getEvent())
      ) {
        let tol = graph.tolerance;

        if (start.point != null && start.state != null && start.event != null) {
          let state = start.state;
          if (
            Math.abs(start.point.x - me.getGraphX()) > tol ||
            Math.abs(start.point.y - me.getGraphY()) > tol
          ) {
            let handler = graph.selectionCellsHandler.getHandler(state.cell);

            if (handler == null && graph.model.isEdge(state.cell)) {
              handler = graph.createHandler(state);
            }

            if (
              handler != null &&
              handler.bends != null &&
              handler.bends.length > 0
            ) {
              let handle = start.event
                ? handler.getHandleForEvent(start.event)
                : null;
              let edgeStyle = graph.view.getEdgeStyle(state);
              let entity = edgeStyle == mxEdgeStyle.EntityRelation;

              // Handles special case where label was clicked on unselected edge in which
              // case the label will be moved regardless of the handle that is returned
              if (!start.selected && start.handle == mxEvent.LABEL_HANDLE) {
                handle = start.handle;
              }

              if (
                !entity ||
                handle == 0 ||
                handle == handler.bends.length - 1 ||
                handle == mxEvent.LABEL_HANDLE
              ) {
                // Source or target handle or connected for direct handle access or orthogonal line
                // with just two points where the central handle is moved regardless of mouse position
                if (
                  handle == mxEvent.LABEL_HANDLE ||
                  handle == 0 ||
                  state.visibleSourceState != null ||
                  handle == handler.bends.length - 1 ||
                  state.visibleTargetState != null
                ) {
                  if (!entity && handle != mxEvent.LABEL_HANDLE) {
                    let pts = state.absolutePoints;
                    // Default case where handles are at corner points handles
                    // drag of corner as drag of existing point
                    if (
                      pts != null &&
                      ((edgeStyle == null && handle == null) ||
                        edgeStyle == mxEdgeStyle.OrthConnector)
                    ) {
                      // Does not use handles if they were not initially visible
                      handle = start.handle;
                      if (handle == null) {
                        let box = new mxRectangle(start.point.x, start.point.y);
                        box.grow(8);

                        if (mxUtils.contains(box, pts[0].x, pts[0].y)) {
                          // Moves source terminal handle
                          handle = 0;
                        } else if (
                          mxUtils.contains(
                            box,
                            pts[pts.length - 1].x,
                            pts[pts.length - 1].y
                          )
                        ) {
                          // Moves target terminal handle
                          handle = handler.bends.length - 1;
                        } else {
                          // Checks if edge has no bends
                          let nobends =
                            edgeStyle != null &&
                            (pts.length == 2 ||
                              (pts.length == 3 &&
                                ((Math.round(pts[0].x - pts[1].x) == 0 &&
                                  Math.round(pts[1].x - pts[2].x) == 0) ||
                                  (Math.round(pts[0].y - pts[1].y) == 0 &&
                                    Math.round(pts[1].y - pts[2].y) == 0))));

                          if (nobends) {
                            // Moves central handle for straight orthogonal edges
                            handle = 2;
                          } else {
                            // Finds and moves vertical or horizontal segment
                            handle = mxUtils.findNearestSegment(
                              state,
                              start.point.x,
                              start.point.y
                            );

                            // Converts segment to virtual handle index
                            if (edgeStyle == null) {
                              handle = mxEvent.VIRTUAL_HANDLE - handle;
                            }
                            // Maps segment to handle
                            else {
                              handle += 1;
                            }
                          }
                        }
                      }
                    }
                    if (
                      pts != null &&
                      edgeStyle != mxEdgeStyle.OrthConnector &&
                      handle == null
                    ) {
                      let idx = mxUtils.findNearestSegment(
                        state,
                        me.getGraphX(),
                        me.getGraphY()
                      );
                      handle = idx + 1;
                    }

                    // Creates a new waypoint and starts moving it
                    if (handle == null) {
                      handle = mxEvent.VIRTUAL_HANDLE;
                    }
                  }

                  handler.start(me.getGraphX(), me.getGraphX(), handle);
                  me.consume();

                  // Removes preview rectangle in graph handler
                  graph.graphHandler.reset();
                }
              } else if (
                entity &&
                (state.visibleSourceState != null ||
                  state.visibleTargetState != null)
              ) {
                // Disables moves on entity to make it consistent
                graph.graphHandler.reset();
                me.consume();
              }
            }

            if (handler != null) {
              // Lazy selection for edges inside groups
              if (graph.selectionCellsHandler.isHandlerActive(handler)) {
                if (!graph.isCellSelected(state.cell)) {
                  graph.selectionCellsHandler.handlers.put(state.cell, handler);
                  graph.selectCellForEvent(state.cell, me.getEvent());
                }
              } else if (!graph.isCellSelected(state.cell)) {
                // Destroy temporary handler
                handler.destroy();
              }
            }

            // Reset start state
            start.selected = false;
            start.handle = null;
            start.state = null;
            start.event = null;
            start.point = null;
          }
        } else {
          // Updates cursor for unselected edges under the mouse
          let state = me.getState();

          if (state != null && graph.isCellEditable(state.cell)) {
            let cursor = null;
            // Checks if state was removed in call to stopEditing above
            if (graph.model.isEdge(state.cell)) {
              let box = new mxRectangle(me.getGraphX(), me.getGraphY());
              box.grow(8);
              let pts = state.absolutePoints;
              if (pts != null) {
                if (
                  state.text != null &&
                  state.text.boundingBox != null &&
                  mxUtils.contains(
                    state.text.boundingBox,
                    me.getGraphX(),
                    me.getGraphY()
                  )
                ) {
                  cursor = "move";
                } else if (
                  mxUtils.contains(box, pts[0].x, pts[0].y) ||
                  mxUtils.contains(
                    box,
                    pts[pts.length - 1].x,
                    pts[pts.length - 1].y
                  )
                ) {
                  cursor = "pointer";
                } else if (
                  state.visibleSourceState != null ||
                  state.visibleTargetState != null
                ) {
                  // Moving is not allowed for entity relation but still indicate hover state
                  let tmp = graph.view.getEdgeStyle(state);
                  cursor = "crosshair";
                  if (
                    tmp != mxEdgeStyle.EntityRelation &&
                    graph.isOrthogonal(state)
                  ) {
                    let idx = mxUtils.findNearestSegment(
                      state,
                      me.getGraphX(),
                      me.getGraphY()
                    );

                    if (idx < pts.length - 1 && idx >= 0) {
                      cursor =
                        Math.round(pts[idx].x - pts[idx + 1].x) == 0
                          ? "col-resize"
                          : "row-resize";
                    }
                  }
                }
              }
            }

            if (cursor != null) {
              state.setCursor(cursor);
            }
          }
        }
      }
    }),
    mouseUp: mxUtils.bind(this, function (sender, me) {
      start.state = null;
      start.event = null;
      start.point = null;
      start.handle = null;
    }),
  });

  model.addListener(mxEvent.CHANGE, function (sender, evt) {
    var changes = evt.getProperty("edit").changes;
    for (var i = 0; i < changes.length; i++) {
      // if edge has been dragged and its geometry points have changed
      if (changes[i].constructor.name === "mxGeometryChange") {
        let cell = changes[i].cell;
        let state = graph.view.getState(cell);
        if (state?.cell && graph.model.isEdge(state.cell)) {
          let processDefId,
            processMode,
            sourceArr = [],
            targetArr = [],
            isTasklaneExpanded = false,
            tasklaneHeight;
          // code added on 31 Jan 2023 for BugId 122800
          let layers = rootLayer?.children;
          layers?.forEach((layer) => {
            if (layer.getStyle() === style.tasklane) {
              isTasklaneExpanded = true;
              tasklaneHeight = +layer.geometry.height;
            }
            if (layer.getStyle() === style.tasklane_collapsed) {
              isTasklaneExpanded = false;
            }
          });
          state?.absolutePoints?.forEach((pt) => {
            // code edited on 31 Jan 2023 for BugId 122813
            if (state.cell?.parent?.style === style.expandedEmbeddedProcess) {
              let newPtX = Math.floor(pt.x) - state.cell?.parent?.geometry?.x;
              sourceArr.push(newPtX);
              let newPtY = Math.floor(pt.y) - state.cell?.parent?.geometry?.y;
              targetArr.push(newPtY);
            } else {
              sourceArr.push(Math.floor(pt.x));
              // code edited on 31 Jan 2023 for BugId 122800
              if (isTasklaneExpanded) {
                let newPt = Math.floor(pt.y) - tasklaneHeight + gridSize;
                targetArr.push(newPt);
              } else {
                targetArr.push(Math.floor(pt.y));
              }
            }
          });
          let connectionId;
          setProcessData((prevProcessData) => {
            processDefId = prevProcessData.ProcessDefId;
            processMode = prevProcessData.ProcessType;
            prevProcessData.Connections?.forEach((connection) => {
              if (`conn_${connection.ConnectionId}` === cell.id) {
                connectionId = connection.ConnectionId;
              }
            });
            return prevProcessData;
          });
          let json = {
            processDefId: processDefId,
            processMode: processMode,
            connId: connectionId,
            connType: "D",
            sourcePosition: sourceArr,
            targetPosition: targetArr,
          };
          let temp;
          setProcessData((prev) => {
            temp = prev;
            return prev;
          });
          if (checkIfSwimlaneCheckedOut(temp)?.length > 0) {
            let isSameLane =
              cell?.source?.parent?.getId() === cell?.target?.parent?.getId();
            if (
              isSameLane &&
              cell?.source?.parent?.getId() !== null &&
              checkIfParentSwimlaneCheckedOut(
                temp,
                cell?.source?.parent?.getId()
              )?.length > 0
            ) {
              setProcessData((prev) => {
                //do not do shallow copy process Data, else original state will get change
                let newProcessData = JSON.parse(JSON.stringify(prev));
                newProcessData.SwimlaneCheckinChanges = true;
                newProcessData.Connections = JSON.parse(
                  JSON.stringify(prev.Connections)
                );
                newProcessData.Connections?.forEach((con, index) => {
                  if (cell.id === `conn_${con.ConnectionId}`) {
                    newProcessData.Connections[index].xLeft = sourceArr;
                    newProcessData.Connections[index].yTop = targetArr;
                  }
                });
                return newProcessData;
              });
            } else {
              setProcessData((prev) => {
                //do not do shallow copy process Data, else original state will get change
                let newProcessData = JSON.parse(JSON.stringify(prev));
                newProcessData.Connections = JSON.parse(
                  JSON.stringify(prev.Connections)
                );
                newProcessData.Connections?.forEach((con, index) => {
                  if (cell.id === `conn_${con.ConnectionId}`) {
                    newProcessData.Connections[index].xLeft = con.xLeft;
                    newProcessData.Connections[index].yTop = con.yTop;
                  }
                });
                return newProcessData;
              });
            }
          } else {
            axios
              .post(SERVER_URL + ENDPOINT_MOVE_CONNECTION, json)
              .then((res) => {
                if (res.data.Status === 0) {
                  setProcessData((prev) => {
                    let newProcessData = JSON.parse(JSON.stringify(prev));
                    newProcessData.Connections?.forEach((con, index) => {
                      if (cell.id === `conn_${con.ConnectionId}`) {
                        newProcessData.Connections[index].xLeft = sourceArr;
                        newProcessData.Connections[index].yTop = targetArr;
                      }
                    });
                    return newProcessData;
                  });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      }
    }
  });
}
