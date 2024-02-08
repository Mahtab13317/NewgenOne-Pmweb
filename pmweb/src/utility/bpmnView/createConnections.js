import axios from "axios";
import {
  ENDPOINT_ADD_CONNECTION,
  SERVER_URL,
} from "../../Constants/appConstants";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { validateConnections } from "./validateConnections";
import {
  checkIfParentSwimlaneCheckedOut,
  checkIfSwimlaneCheckedOut,
} from "../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { gridSize, style } from "../../Constants/bpmnView";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxEventObject = mxgraphobj.mxEventObject;
const mxEvent = mxgraphobj.mxEvent;
const mxUtils = mxgraphobj.mxUtils;

export const createConnections = (
  graph,
  setProcessData,
  setNewId,
  dispatch,
  translation
) => {
  //overwrite the addEdge function in mxGraph
  //this function is called when a new edge is added to the graph
  graph.addEdge = function (edge, parent, source, target, index) {
    let edgeId = edge.getId();
    let edges;
    if (edgeId) {
      //assumed that every edge already present have an Id
      //this means it is an edge that is being added during rendering
      return graph.addCell(edge, parent, index, source, target);
    } else {
      let processData = {};
      let processDefId, processMode;
      // code edited on 28 Nov 2022 for BugId 119605
      setProcessData((prevProcessData) => {
        processDefId = prevProcessData.ProcessDefId;
        processMode = prevProcessData.ProcessType;
        processData = prevProcessData;
        return prevProcessData;
      });
      //this means it is a new edge
      //validateConnections will validate the edge
      let { isValid, msg } = validateConnections(source, target, translation);

      //setProcessData will update state, to show new edge is added
      // code added on 10 Oct 2022 for BugId 116561
      if (isValid && target.getId()) {
        let newEdgeId = 0;
        setNewId((oldIds) => {
          newEdgeId = oldIds.connectionId + 1;
          return { ...oldIds, connectionId: newEdgeId };
        });

        // code edited on 27 Dec 2022 for BugId 120989
        if (checkIfSwimlaneCheckedOut(processData)?.length > 0) {
          let isSameLane = source?.parent?.getId() === target?.parent?.getId();
          if (
            isSameLane &&
            source?.parent?.getId() !== null &&
            checkIfParentSwimlaneCheckedOut(
              processData,
              source?.parent?.getId()
            )?.length > 0
          ) {
            edge.setId(Number(newEdgeId));
            setProcessData((prevProcessData) => {
              //do not do shallow copy process Data, else original state will get change
              let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
              newProcessData.SwimlaneCheckinChanges = true;
              newProcessData.Connections = JSON.parse(
                JSON.stringify(prevProcessData.Connections)
              );
              newProcessData.Connections.push({
                ConnectionId: Number(newEdgeId),
                Type: "D",
                SourceId: source.getId(),
                TargetId: target.getId(),
                xLeft: [],
                yTop: [],
              });
              return newProcessData;
            });
            return edges;
          }
        } else {
          let json = {
            processDefId: processDefId,
            processMode: processMode,
            connId: Number(newEdgeId),
            // modified on 06/02/2024 for BugId 143220
            /*sourceId: source.getId(),
            targetId: target.getId(), */
            sourceId:
              source.getStyle() === style.expandedEmbeddedProcess
                ? source.embeddedId
                : source.getId(),
            targetId:
              target.getStyle() === style.expandedEmbeddedProcess
                ? target.embeddedId
                : target.getId(),
            // till here BugId 143220
            connType: "D",
            sourcePosition: [],
            targetPosition: [],
          };
          edge.setId(Number(newEdgeId));
          edges = graph.addCell(edge, parent, index, source, target);
          setProcessData((prevProcessData) => {
            //do not do shallow copy process Data, else original state will get change
            let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
            newProcessData.Connections = JSON.parse(
              JSON.stringify(prevProcessData.Connections)
            );
            newProcessData.Connections.push({
              ConnectionId: Number(newEdgeId),
              Type: "D",
              // modified on 06/02/2024 for BugId 143220
              /*SourceId: source.getId(),
              TargetId: target.getId(), */
              SourceId:
                source.getStyle() === style.expandedEmbeddedProcess
                  ? source.embeddedId
                  : source.getId(),
              TargetId:
                target.getStyle() === style.expandedEmbeddedProcess
                  ? target.embeddedId
                  : target.getId(),
              // till here BugId 143220
              xLeft: [],
              yTop: [],
            });
            return newProcessData;
          });
          axios
            .post(SERVER_URL + ENDPOINT_ADD_CONNECTION, json)
            .then((response) => {
              if (response.data.Status === 0) {
                dispatch(
                  setToastDataFunc({
                    message: translation("ConnectionCreatedSuccessfully"),
                    severity: "success",
                    open: true,
                  })
                );
                return edges;
              }
            })
            .catch((err) => {
              console.log(err);
              setProcessData((prevProcessData) => {
                //do not do shallow copy process Data, else original state will get change
                let newProcessData = JSON.parse(
                  JSON.stringify(prevProcessData)
                );
                newProcessData.Connections = JSON.parse(
                  JSON.stringify(prevProcessData.Connections)
                );
                let index = null;
                newProcessData.Connections?.forEach((conn, idx) => {
                  if (+conn.ConnectionId === Number(newEdgeId)) {
                    index = idx;
                  }
                });
                if (index !== null) {
                  newProcessData.Connections.splice(index, 1);
                }
                return newProcessData;
              });
            });
        }
      }
      // code added on 10 Oct 2022 for BugId 116561
      else if (msg && target.getId()) {
        dispatch(
          setToastDataFunc({
            message: msg,
            severity: "error",
            open: true,
          })
        );
      }
      // code added on 10 Oct 2022 for BugId 116561
      else if (isValid) {
        edges = graph.addCell(edge, parent, index, source, target);
        return edges;
      }
    }
  };

  //overwrite the connectCell function defined in mxGraph
  //this is called when either source or target of an edge is changed
  graph.connectCell = function (edge, terminal, source, constraint) {
    graph.model.beginUpdate();
    try {
      var previous = graph.model.getTerminal(edge, source);
      graph.cellConnected(edge, terminal, source, constraint);
      graph.fireEvent(
        new mxEventObject(
          mxEvent.CONNECT_CELL,
          "edge",
          edge,
          "terminal",
          terminal,
          "source",
          source,
          "previous",
          previous
        )
      );

      let edgeId = edge.getId();

      //setProcessData will update state, to show new edge terminal is changed
      setProcessData((prevProcessData) => {
        //do not do shallow copy process Data, else original state will get change
        let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        newProcessData.Connections = JSON.parse(
          JSON.stringify(prevProcessData.Connections)
        );

        newProcessData.Connections.forEach((connection) => {
          if (connection.ConnectionId === Number(edgeId)) {
            if (source === true) {
              //source is changed of edge
              connection.SourceId = Number(terminal.getId());
            } else {
              //target is changed for edge
              connection.TargetId = Number(terminal.getId());
            }
          }
        });

        return newProcessData;
      });
    } finally {
      graph.model.endUpdate();
    }

    return edge;
  };

  // code added on 28 Nov 2022 for BugId 118643
  graph.connectionHandler.updateEdgeState = function (current, constraint) {
    if (this.edgeState) {
      this.edgeState.absolutePoints = [
        null,
        this.currentState != null ? null : current,
      ];
      this.graph.view.updateFixedTerminalPoint(
        this.edgeState,
        this.previous,
        true,
        this.sourceConstraint
      );

      if (this.currentState != null) {
        if (constraint == null) {
          constraint = this.graph.getConnectionConstraint(
            this.edgeState,
            this.previous,
            false
          );
        }

        this.edgeState.setAbsoluteTerminalPoint(null, false);
        this.graph.view.updateFixedTerminalPoint(
          this.edgeState,
          this.currentState,
          false,
          constraint
        );
      }
      // Scales and translates the waypoints to the model
      var realPoints = null;
      if (this.waypoints != null) {
        realPoints = [];

        for (var i = 0; i < this.waypoints.length; i++) {
          var pt = this.waypoints[i].clone();
          this.convertWaypoint(pt);
          realPoints[i] = pt;
        }
      }
      this.graph.view.updatePoints(
        this.edgeState,
        realPoints,
        this.previous,
        this.currentState
      );
      this.graph.view.updateFloatingTerminalPoints(
        this.edgeState,
        this.previous,
        this.currentState
      );
    }
  };

  // added on 17/10/23 for BugId 138903
  //overwrite the scrollPointToVisible function defined in mxGraph
  // this is used to scroll the graph to the given point, extending the graph container if specified.
  graph.scrollPointToVisible = function (x, y, extend, border) {
    if (
      !this.timerAutoScroll &&
      (this.ignoreScrollbars || mxUtils.hasScrollbars(this.container))
    ) {
      var c = this.container;
      border = border != null ? border : 1.5 * gridSize;
      if (
        x >= c.scrollLeft &&
        y >= c.scrollTop &&
        x <= c.scrollLeft + c.clientWidth &&
        y <= c.scrollTop + c.clientHeight
      ) {
        var dx = c.scrollLeft + c.clientWidth - x;
        if (dx < border) {
          c.scrollLeft += border - dx;
        } else {
          dx = x - c.scrollLeft;
          if (dx < border) {
            c.scrollLeft -= border - dx;
          }
        }

        var dy = c.scrollTop + c.clientHeight - y;
        if (dy < border) {
          c.scrollTop += border - dy;
        } else {
          dy = y - c.scrollTop;
          if (dy < border) {
            c.scrollTop -= border - dy;
          }
        }
      }
    } else if (this.allowAutoPanning && !this.panningHandler.isActive()) {
      if (this.panningManager == null) {
        this.panningManager = this.createPanningManager();
      }
      this.panningManager.panTo(x + this.panDx, y + this.panDy);
    }
  };
};
