import { resizer } from "./resizer";
import {
  style,
  cellSize,
  defaultHeightSwimlane,
  defaultWidthSwimlane,
  gridStartPoint,
  gridSize,
  defaultShapeVertex,
  widthForDefaultVertex,
  heightForDefaultVertex,
  graphGridSize,
  milestoneTitleWidth,
  smallIconSize,
  swimlaneTitleWidth,
} from "../../Constants/bpmnView";
import { getActivityById } from "./getActivity";
import ActivityCheckedOutLogo from "../../assets/bpmnViewIcons/ActivityCheckedOut.svg";
import { listOfImages } from "../iconLibrary";
import { parallelEdge } from "./parallelEdge";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
} from "../../Constants/appConstants";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxCell = mxgraphobj.mxCell;
const mxGeometry = mxgraphobj.mxGeometry;
const mxPoint = mxgraphobj.mxPoint;
const mxUtils = mxgraphobj.mxUtils;
const mxEvent = mxgraphobj.mxEvent;

export function dimensionInMultipleOfGridSize(length) {
  return Math.ceil(length / graphGridSize) * graphGridSize;
}

export function cleanTheGraph(graph, swimlaneLayer, milestoneLayer, rootLayer) {
  let swimlanes = swimlaneLayer.children;
  let milestones = milestoneLayer.children;
  let layers = graph.getChildVertices(milestoneLayer.getParent().getParent());
  let tasklanes = [];
  layers?.forEach((layer) => {
    if (
      layer.getStyle() === style.tasklane ||
      layer.getStyle() === style.tasklane_collapsed
    ) {
      tasklanes.push(layer);
    }
  });
  graph.removeCells(tasklanes, true);
  graph.removeCells(swimlanes, true);
  graph.removeCells(milestones, true);
  let grpChild = graph.view.graph.container.children;
  [...grpChild].forEach((child) => {
    if (child.getAttribute("class") === "collapsed_view") {
      graph.view.graph.container.removeChild(child);
    }
    if (child.getAttribute("class")?.includes("checkIcon")) {
      graph.view.graph.container.removeChild(child);
    }
    if (child.getAttribute("class") === "lane_checkedIcon") {
      graph.view.graph.container.removeChild(child);
    }
  });
  let annotations = rootLayer.children.filter(
    (cell) => cell !== swimlaneLayer && cell !== milestoneLayer
  );
  graph.removeCells(annotations, true);
}

export function drawOnGraph(
  graph,
  [swimlaneLayer, milestoneLayer, rootLayer],
  buttons,
  jsonData,
  showTasklane,
  t
) {
  if (jsonData === null) {
    return;
  }

  //remove already items painted on graph
  cleanTheGraph(graph, swimlaneLayer, milestoneLayer, rootLayer);

  //map activities vertex to cell, used to draw edges later
  let cellById = new Map();
  let indexByLaneId = new Map();
  let laneIdxByHeight = new Map();
  let mileButton = 0,
    laneButton = 0;
  let lanes = new Map();
  let tasklane, tasklaneHeight;
  let milestoneWidth = 0;
  let foldCell = false;
  let embeddedConn = new Map();
  let embeddedVertex = new Map();
  let embeddedGroupBox = {};
  let edgeArr = [];

  let laneColorCodes = [
    { fillColor: "#35669F", laneFillColor: "#35669F12" },
    { fillColor: "#AF0043", laneFillColor: "#AF004312" },
    { fillColor: "#01818C", laneFillColor: "#01818C12" },
  ];

  //draw lanes
  jsonData.Lanes?.forEach((eachLane, index) => {
    let width = eachLane.Width
      ? parseInt(eachLane.Width)
      : defaultWidthSwimlane;
    let height = eachLane.Height
      ? parseInt(eachLane.Height)
      : defaultHeightSwimlane;
    width = dimensionInMultipleOfGridSize(width);
    height = dimensionInMultipleOfGridSize(height);
    laneIdxByHeight.set(index, height);
    if (eachLane.LaneId !== -99) {
      let colorIndex = (index - 1) % 3;
      mileButton = mileButton + height;
      let vertex = new mxCell(
        null,
        new mxGeometry(0, 0, width, height),
        `${style.swimlane};fillColor=${laneColorCodes[colorIndex]?.fillColor};swimlaneFillColor=${laneColorCodes[colorIndex]?.laneFillColor};`
      );
      //point added to vertex/lane to make it collapsable
      let point = new mxCell(null, new mxGeometry(0, 0, 0.1, 0.1));
      vertex.insert(point);
      vertex.setVertex(true);
      vertex.setConnectable(false);
      vertex.value = eachLane.LaneName;
      vertex.setId(eachLane.LaneId);
      indexByLaneId.set(eachLane.LaneId, index);
      //lanes saved to local array so that activities in json.milestone can be added to lanes vertex
      lanes.set(eachLane.LaneId, vertex);
      if (eachLane.CheckedOut === "Y") {
        let isIconPresent = false;
        lanes.get(eachLane.LaneId).isChecked = true;
        let grpChild = graph.view.graph.container.children;
        [...grpChild].forEach((child) => {
          if (child.getAttribute("id") === `lane_${eachLane.LaneId}`) {
            isIconPresent = true;
          }
        });
        if (!isIconPresent) {
          let div = document.createElement("div");
          div.setAttribute(
            "style",
            "position:absolute;cursor:pointer;display:flex;flex-direction:column;z-index:10"
          );
          div.setAttribute("class", `lane_checkedIcon`);
          div.setAttribute("id", `lane_${eachLane.LaneId}`);
          div.style.left = gridSize - 5 + "px";
          var img1 = mxUtils.createImage(ActivityCheckedOutLogo);
          img1.setAttribute("title", t("Checked"));
          img1.style.width = smallIconSize.w * 1.25 + "px";
          img1.style.height = smallIconSize.h * 1.25 + "px";
          mxEvent.addGestureListeners(
            img1,
            mxUtils.bind(this, function (evt) {
              // Disables dragging the image
              mxEvent.consume(evt);
            })
          );
          div.appendChild(img1);
          graph.view.graph.container.appendChild(div);
        }
      }
      swimlaneLayer.insert(vertex);
    } else if (showTasklane && eachLane.LaneId === -99) {
      let vertex = new mxCell(
        eachLane.LaneName,
        new mxGeometry(0, 0, width, height),
        style.tasklane
      );
      tasklaneHeight = height;
      let point = new mxCell(null, new mxGeometry(0, 0, 0.1, 0.1));
      vertex.insert(point);
      vertex.setVertex(true);
      vertex.setConnectable(false);
      vertex.setId(-99);
      tasklane = vertex;
      rootLayer.insert(vertex);
      //collapse tasklane if no tasks present/ tasklane collapsed manually
      // code edited on 16 Nov 2022 for BugId 119102
      if (jsonData.Tasks?.length > 0) {
        if (graph.isTasklaneExpanded === false) {
          foldCell = true;
        }
      }
      // code added on 17 June 2022 for BugId 110174
      else if (jsonData.Tasks?.length <= 0 && !graph.isTasklaneExpanded) {
        foldCell = true;
      }
    }
  });

  //draw GroupBox
  /*NOTE: It is important to paint groupboxes before activities, so that activities inside the groupbox 
    can be clicked and moved.*/
  jsonData.GroupBoxes?.forEach((groupBox) => {
    if (groupBox.ParentActivityId && groupBox.ParentActivityId !== 0) {
      if (embeddedGroupBox[groupBox.ParentActivityId]) {
        embeddedGroupBox = {
          ...embeddedGroupBox,
          [groupBox.ParentActivityId]: [
            ...embeddedGroupBox[groupBox.ParentActivityId],
            groupBox,
          ],
        };
      } else {
        embeddedGroupBox = {
          ...embeddedGroupBox,
          [groupBox.ParentActivityId]: [groupBox],
        };
      }
    } else {
      let width = groupBox.GroupBoxWidth
        ? parseInt(groupBox.GroupBoxWidth)
        : cellSize.w;
      let height = groupBox.GroupBoxHeight
        ? parseInt(groupBox.GroupBoxHeight)
        : cellSize.h;
      width = dimensionInMultipleOfGridSize(width);
      height = dimensionInMultipleOfGridSize(height);
      let extraHeight = showTasklane ? tasklaneHeight : 0;
      let laneIdx = indexByLaneId.get(groupBox.LaneId);
      for (let i = showTasklane ? 1 : 0; i < laneIdx; i++) {
        extraHeight = extraHeight + laneIdxByHeight.get(i);
      }
      let xLeftLoc = dimensionInMultipleOfGridSize(
        parseInt(groupBox.ILeft) + gridStartPoint.x
      );
      let yTopLoc = dimensionInMultipleOfGridSize(
        parseInt(groupBox.ITop) + gridStartPoint.y
      );

      var vertex = new mxCell(
        null,
        new mxGeometry(
          xLeftLoc - swimlaneTitleWidth,
          yTopLoc - extraHeight,
          width,
          height
        ),
        style.groupBox
      );
      vertex.setVertex(true);
      vertex.lod = 0;
      vertex.setConnectable(false);
      vertex.value = groupBox.BlockName;
      vertex.setId(groupBox.GroupBoxId);
      lanes.get(groupBox.LaneId)?.insert(vertex);
    }
  });

  //draw milestones
  jsonData.MileStones?.forEach((milestone) => {
    let width = milestone.Width
      ? parseInt(milestone.Width)
      : defaultWidthSwimlane;
    let height = milestone.Height
      ? parseInt(milestone.Height)
      : defaultHeightSwimlane;
    width = dimensionInMultipleOfGridSize(width);
    height = dimensionInMultipleOfGridSize(height);
    laneButton = laneButton + width;
    var parentVertex = new mxCell(
      null,
      new mxGeometry(0, 0, width, height),
      style.milestone
    );
    parentVertex.setVertex(true);
    parentVertex.setConnectable(false);
    parentVertex.value = milestone.MileStoneName;
    parentVertex.setId(milestone.iMileStoneId);
    milestoneLayer.insert(parentVertex);

    //draw activities
    milestone.Activities?.forEach((activity) => {
      let isDefault = !activity.ImageName || activity.ImageName?.trim() === "";
      let x = dimensionInMultipleOfGridSize(parseInt(activity.xLeftLoc));
      let y = dimensionInMultipleOfGridSize(
        parseInt(activity.yTopLoc) - milestoneTitleWidth
      );
      let activityObj = getActivityById(
        activity.ActivityType,
        activity.ActivitySubType
      );
      var vertex, iconSrc;
      let extraHeight = showTasklane ? tasklaneHeight : 0;
      let laneIdx = indexByLaneId.get(activity.LaneId);
      for (let i = showTasklane ? 1 : 0; i < laneIdx; i++) {
        extraHeight = extraHeight + laneIdxByHeight.get(i);
      }
      if (!isDefault) {
        listOfImages?.names?.forEach((el, index) => {
          if (el === activity.ImageName) {
            iconSrc = listOfImages?.images[index]?.default;
          }
        });
      }
      if (activityObj && defaultShapeVertex.includes(activityObj.styleName)) {
        vertex = new mxCell(
          activity.ActivityName,
          activity.hide === +activity.ActivityId &&
          activityObj.styleName === style.subProcess
            ? new mxGeometry(
                x + milestoneWidth,
                y - extraHeight,
                +activity.Width, // code edited on 17 Feb 2023 for BugId 124062
                +activity.Height // code edited on 17 Feb 2023 for BugId 124062
              )
            : new mxGeometry(
                x + milestoneWidth,
                y - extraHeight,
                widthForDefaultVertex,
                heightForDefaultVertex
              ),
          activity.hide === +activity.ActivityId &&
          activityObj.styleName === style.subProcess
            ? !isDefault
              ? `${activityObj.styleName};image=${iconSrc};opacity=0;noLabel=true`
              : `${activityObj.styleName};opacity=0;noLabel=true`
            : !isDefault
            ? `${activityObj.styleName};image=${iconSrc}`
            : activityObj.styleName
        );
      } else if (activityObj) {
        vertex = new mxCell(
          activity.ActivityName,
          new mxGeometry(
            x + milestoneWidth,
            y - extraHeight,
            cellSize.w,
            cellSize.h
          ),
          !isDefault
            ? `${activityObj.styleName};image=${iconSrc}`
            : activityObj.styleName
        );
      }
      if (vertex) {
        vertex.setVertex(true);
        vertex.lod = 2;
        vertex.setId(activity.ActivityId);
        //activities added as child of lanes
        lanes.get(activity.LaneId)?.insert(vertex);
        cellById.set(activity.ActivityId, vertex);
        if (activity.hide === +activity.ActivityId) {
          //if embedded subprocess which is expanded,
          //then delete the old layer and add new layer with updated values
          let layers = graph.getChildVertices();
          let expandEmbeddedAct = new mxCell(
            null,
            new mxGeometry(0, 0, 0, 0),
            style.expandedEmbeddedProcess
          );
          expandEmbeddedAct.setVertex(true);
          expandEmbeddedAct.setConnectable(false);
          layers?.forEach((layer) => {
            if (
              layer.getStyle() === style.expandedEmbeddedProcess &&
              layer.id === `emb_${activity.ActivityId}`
            ) {
              expandEmbeddedAct.id = layer.id;
              expandEmbeddedAct.embeddedId = layer.embeddedId;
              // added on 06/02/2024 for BugId 143220
              expandEmbeddedAct.embeddedCellEdges = [
                ...layer.embeddedCellEdges,
              ];
              // till here BugId 143220
              expandEmbeddedAct.geometry = layer.geometry;
              graph.removeCells([layer]);
            }
          });

          graph.addCell(expandEmbeddedAct);
          embeddedVertex.set(activity.ActivityId, expandEmbeddedAct);
          let embGB = embeddedGroupBox[activity.ActivityId];
          embGB?.forEach((groupBox) => {
            let width = groupBox.GroupBoxWidth
              ? parseInt(groupBox.GroupBoxWidth)
              : cellSize.w;
            let height = groupBox.GroupBoxHeight
              ? parseInt(groupBox.GroupBoxHeight)
              : cellSize.h;
            width = dimensionInMultipleOfGridSize(width);
            height = dimensionInMultipleOfGridSize(height);
            let xLeftLoc = dimensionInMultipleOfGridSize(
              parseInt(groupBox.ILeft)
            );
            let yTopLoc = dimensionInMultipleOfGridSize(
              parseInt(groupBox.ITop)
            );

            var vertex = new mxCell(
              null,
              new mxGeometry(xLeftLoc, yTopLoc, width, height),
              style.groupBox
            );
            vertex.setVertex(true);
            vertex.lod = 0;
            vertex.setConnectable(false);
            vertex.value = groupBox.BlockName;
            vertex.setId(groupBox.GroupBoxId);
            expandEmbeddedAct?.insert(vertex);
          });
          activity.EmbeddedActivity &&
            activity.EmbeddedActivity[0]?.forEach((act) => {
              let x1 = dimensionInMultipleOfGridSize(+act.xLeftLoc);
              let y1 = dimensionInMultipleOfGridSize(+act.yTopLoc);
              let activitySubObj = getActivityById(
                act.ActivityType,
                act.ActivitySubType
              );
              let vertex12;
              // code added on 29 March 2023 for BugId 124819
              if (+act.ActivityType === 1 && +act.ActivitySubType === 1) {
                vertex12 = new mxCell(
                  act.ActivityName,
                  new mxGeometry(x1, y1, cellSize.w, cellSize.h),
                  style.embStartEvent
                );
              } else if (
                +act.ActivityType === 2 &&
                +act.ActivitySubType === 1
              ) {
                vertex12 = new mxCell(
                  act.ActivityName,
                  new mxGeometry(x1, y1, cellSize.w, cellSize.h),
                  style.embEndEvent
                );
              } else if (
                activitySubObj &&
                defaultShapeVertex.includes(activitySubObj.styleName)
              ) {
                vertex12 = new mxCell(
                  act.ActivityName,
                  new mxGeometry(
                    x1,
                    y1,
                    widthForDefaultVertex,
                    heightForDefaultVertex
                  ),
                  activitySubObj.styleName
                );
              } else if (activitySubObj) {
                vertex12 = new mxCell(
                  act.ActivityName,
                  new mxGeometry(x1, y1, cellSize.w, cellSize.h),
                  activitySubObj.styleName
                );
              }
              vertex12.setVertex(true);
              vertex12.setId(act.ActivityId);
              expandEmbeddedAct.insert(vertex12);
              cellById.set(act.ActivityId, vertex12);
              embeddedConn.set(act.ActivityId, activity.ActivityId);
              // code added on 2 Feb 2023 for BugId 122866
              if (act.CheckedOut === "Y" && !lanes.get(act.LaneId).isChecked) {
                let isIconPresent = false;
                let grpChild = graph.view.graph.container.children;
                [...grpChild].forEach((child) => {
                  if (
                    child.getAttribute("id") ===
                    `act_${activity.ActivityId}_${act.ActivityId}`
                  ) {
                    isIconPresent = true;
                  }
                });
                if (!isIconPresent) {
                  let div1 = document.createElement("p");
                  div1.setAttribute(
                    "style",
                    `position:absolute;cursor:pointer;z-index:10;`
                  );
                  if (
                    activitySubObj &&
                    defaultShapeVertex.includes(activitySubObj.styleName)
                  ) {
                    div1.style.left =
                      x1 + expandEmbeddedAct.geometry.x - gridSize * 0.2 + "px";
                    div1.style.top =
                      y1 + expandEmbeddedAct.geometry.y - gridSize * 0.2 + "px";
                  } else if (activitySubObj) {
                    div1.style.left =
                      x1 + expandEmbeddedAct.geometry.x - gridSize * 0.1 + "px";
                    div1.style.top =
                      y1 + expandEmbeddedAct.geometry.y - gridSize * 0.1 + "px";
                  }
                  div1.setAttribute("class", `checkIcon`);
                  div1.setAttribute(
                    "id",
                    `act_${activity.ActivityId}_${act.ActivityId}`
                  );
                  let img2 = mxUtils.createImage(ActivityCheckedOutLogo);
                  img2.setAttribute("title", t("Checked"));
                  img2.style.width = smallIconSize.w * 1.25 + "px";
                  img2.style.height = smallIconSize.h * 1.25 + "px";
                  mxEvent.addGestureListeners(
                    img2,
                    mxUtils.bind(this, function (evt) {
                      // Disables dragging the image
                      mxEvent.consume(evt);
                    })
                  );
                  div1.appendChild(img2);
                  graph.view.graph.container.appendChild(div1);
                }
              }
            });
        }
        // code added on 28 Feb 2023 for BugId 122859
        else {
          let layers = graph.getChildVertices();
          layers?.forEach((layer) => {
            if (
              layer.getStyle() === style.expandedEmbeddedProcess &&
              layer.id === `emb_${activity.ActivityId}`
            ) {
              graph.removeCells([layer]);
            }
          });
          let collapseBtn = document.getElementById(
            `embeddedCollapseBtn_emb_${activity.ActivityId}`
          );
          if (collapseBtn) {
            graph.view.graph.container.removeChild(collapseBtn);
          }
        }

        if (
          activity.CheckedOut === "Y" &&
          !lanes.get(activity.LaneId).isChecked
        ) {
          let isIconPresent = false;
          let grpChild = graph.view.graph.container.children;
          [...grpChild].forEach((child) => {
            if (child.getAttribute("id") === `act_${activity.ActivityId}`) {
              isIconPresent = true;
            }
          });
          if (!isIconPresent) {
            let div = document.createElement("div");
            div.setAttribute(
              "style",
              "position:absolute;cursor:pointer;display:flex;flex-direction:column;z-index:10"
            );
            div.setAttribute("class", `lane_${activity.LaneId} checkIcon`);
            div.setAttribute("id", `act_${activity.ActivityId}`);

            if (
              activityObj &&
              defaultShapeVertex.includes(activityObj.styleName)
            ) {
              div.style.left = x + milestoneWidth + gridSize * 0.8 + "px";
              // code edited on 24 Nov 2022 for BugId 119493
              div.style.top = y - gridSize * 3.2 + +tasklaneHeight + "px";
            } else if (activityObj) {
              div.style.left = x + milestoneWidth + gridSize + "px";
              // code edited on 24 Nov 2022 for BugId 119493
              div.style.top = y - gridSize * 3 + +tasklaneHeight + "px";
            }
            var img1 = mxUtils.createImage(ActivityCheckedOutLogo);
            img1.setAttribute("title", t("Checked"));
            img1.style.width = smallIconSize.w * 1.25 + "px";
            img1.style.height = smallIconSize.h * 1.25 + "px";
            mxEvent.addGestureListeners(
              img1,
              mxUtils.bind(this, function (evt) {
                // Disables dragging the image
                mxEvent.consume(evt);
              })
            );
            div.appendChild(img1);
            graph.view.graph.container.appendChild(div);
          }
        }
      }
    });
    milestoneWidth = milestoneWidth + width;
  });

  //draw tasks
  if (showTasklane) {
    jsonData.Tasks?.forEach((task) => {
      var vertex = new mxCell(
        task.TaskName,
        new mxGeometry(
          dimensionInMultipleOfGridSize(+task.xLeftLoc),
          dimensionInMultipleOfGridSize(+task.yTopLoc),
          widthForDefaultVertex,
          heightForDefaultVertex
        ),
        style.taskTemplate
      );
      vertex.setVertex(true);
      vertex.setConnectable(false);
      vertex.setId(task.TaskId);
      //tasks added as child of tasklane
      tasklane.insert(vertex);
    });
  }

  //draw edges
  jsonData.Connections?.forEach((connection) => {
    let embeddedAct = embeddedConn.get(connection.SourceId);
    let embeddedParent = embeddedAct ? embeddedVertex.get(embeddedAct) : null;
    let parent = embeddedParent ? embeddedParent : null;
    let edge = graph.insertEdge(
      parent,
      `conn_${connection.ConnectionId}`,
      "",
      cellById.get(connection.SourceId),
      cellById.get(connection.TargetId),
      `edgeStyle=orthogonalEdgeStyle;shape=connector;labelBackgroundColor=default;fontSize=11;fontColor=#000;endArrow=classic;strokeColor=black;verticalAlign=bottom;dashed=${
        connection.Type === "X" ? "1" : "0"
      };`
    );
    if (edge) {
      // code added on 23 Jan 2023 for BugId 122792
      edge.id = `conn_${connection.ConnectionId}`;
      edge.connType = connection.Type;
      let edgePoints = [];
      connection.xLeft?.forEach((x, idx) => {
        // code edited on 31 Jan 2023 for BugId 122800 and BugId 122813
        // code edited on 11 March 2023 for BugId 124799
        let newYPt = embeddedParent
          ? +connection.yTop[idx]
          : +connection.yTop[idx] + tasklaneHeight - gridSize;
        let newXPt = +x;
        edgePoints.push(new mxPoint(newXPt, newYPt));
      });
      edge.geometry.points = edgePoints;
      edgeArr.push(edge);
    }
  });

  //draw text Annotations
  jsonData.Annotations?.forEach((annotation) => {
    if (!annotation.hide) {
      let width = annotation.Width ? parseInt(annotation.Width) : cellSize.w;
      let height = annotation.Height ? parseInt(annotation.Height) : cellSize.h;
      width = dimensionInMultipleOfGridSize(width);
      height = dimensionInMultipleOfGridSize(height);
      let extraHeight = showTasklane ? tasklaneHeight : 0;
      let laneIdx = indexByLaneId.get(+annotation.LaneId);
      if (+annotation.LaneId !== 0) {
        for (let i = showTasklane ? 1 : 0; i < laneIdx; i++) {
          extraHeight = extraHeight + laneIdxByHeight.get(i);
        }
      }

      let xLeftLoc = dimensionInMultipleOfGridSize(
        parseInt(annotation.xLeftLoc) + gridStartPoint.x
      );
      let yTopLoc = dimensionInMultipleOfGridSize(
        parseInt(annotation.yTopLoc) + gridStartPoint.y
      );

      var vertex = new mxCell(
        null,
        new mxGeometry(
          +annotation.LaneId !== 0 && +annotation.ParentActivityId === 0
            ? xLeftLoc - swimlaneTitleWidth
            : xLeftLoc,
          +annotation.LaneId !== 0 && +annotation.ParentActivityId === 0
            ? yTopLoc - extraHeight
            : yTopLoc,
          width,
          height
        ),
        style.textAnnotations
      );
      vertex.setVertex(true);
      vertex.setConnectable(false);
      vertex.value = annotation.Comment;
      vertex.setId(annotation.AnnotationId);
      if (+annotation.ParentActivityId !== 0) {
        let embeddedParent = embeddedVertex.get(+annotation.ParentActivityId);
        embeddedParent?.insert(vertex);
      } else if (+annotation.LaneId !== 0) {
        lanes.get(+annotation.LaneId)?.insert(vertex);
      } else {
        rootLayer.insert(vertex);
      }
    }
  });

  //draw Message
  jsonData.MSGAFS?.forEach((mxsgaf) => {
    let width = cellSize.w;
    let height = cellSize.h;
    width = dimensionInMultipleOfGridSize(width);
    height = dimensionInMultipleOfGridSize(height);
    let extraHeight = showTasklane ? tasklaneHeight : 0;
    let laneIdx = indexByLaneId.get(mxsgaf.LaneId);
    if (+mxsgaf.LaneId !== 0) {
      for (let i = showTasklane ? 1 : 0; i < laneIdx; i++) {
        extraHeight = extraHeight + laneIdxByHeight.get(i);
      }
    }

    let xLeftLoc = dimensionInMultipleOfGridSize(
      parseInt(mxsgaf.xLeftLoc) + gridStartPoint.x
    );
    let yTopLoc = dimensionInMultipleOfGridSize(
      parseInt(mxsgaf.yTopLoc) + gridStartPoint.y
    );

    var vertex = new mxCell(
      null,
      new mxGeometry(
        +mxsgaf.LaneId !== 0 && +mxsgaf.ParentActivityId === 0
          ? xLeftLoc - swimlaneTitleWidth
          : xLeftLoc,
        +mxsgaf.LaneId !== 0 && +mxsgaf.ParentActivityId === 0
          ? yTopLoc - extraHeight
          : yTopLoc,
        width,
        height
      ),
      style.message
    );
    vertex.setVertex(true);
    vertex.setConnectable(false);
    vertex.value = mxsgaf.MsgAFName;
    vertex.setId(mxsgaf.MsgAFId);
    if (+mxsgaf.ParentActivityId !== 0) {
      let embeddedParent = embeddedVertex.get(+mxsgaf.ParentActivityId);
      embeddedParent?.insert(vertex);
    } else if (+mxsgaf.LaneId !== 0) {
      lanes.get(+mxsgaf.LaneId)?.insert(vertex);
    } else {
      rootLayer.insert(vertex);
    }
  });

  //draw DataObjects
  jsonData.DataObjects?.forEach((dataObject) => {
    let width = cellSize.w;
    let height = cellSize.h;
    width = dimensionInMultipleOfGridSize(width);
    height = dimensionInMultipleOfGridSize(height);
    let extraHeight = showTasklane ? tasklaneHeight : 0;
    let laneIdx = indexByLaneId.get(dataObject.LaneId);
    if (+dataObject.LaneId !== 0) {
      for (let i = showTasklane ? 1 : 0; i < laneIdx; i++) {
        extraHeight = extraHeight + laneIdxByHeight.get(i);
      }
    }
    let xLeftLoc = dimensionInMultipleOfGridSize(
      parseInt(dataObject.xLeftLoc) + gridStartPoint.x
    );
    let yTopLoc = dimensionInMultipleOfGridSize(
      parseInt(dataObject.yTopLoc) + gridStartPoint.y
    );

    var vertex = new mxCell(
      null,
      new mxGeometry(
        +dataObject.LaneId !== 0 && +dataObject.ParentActivityId === 0
          ? xLeftLoc - swimlaneTitleWidth
          : xLeftLoc,
        +dataObject.LaneId !== 0 && +dataObject.ParentActivityId === 0
          ? yTopLoc - extraHeight
          : yTopLoc,
        width,
        height
      ),
      style.dataObject
    );
    vertex.setVertex(true);
    vertex.setConnectable(false);
    vertex.value = dataObject.Data;
    vertex.setId(dataObject.DataObjectId);
    if (+dataObject.ParentActivityId !== 0) {
      let embeddedParent = embeddedVertex.get(+dataObject.ParentActivityId);
      if (embeddedParent) {
        embeddedParent.insert(vertex);
      }
    } else if (+dataObject.LaneId !== 0) {
      lanes.get(+dataObject.LaneId)?.insert(vertex);
    } else {
      rootLayer.insert(vertex);
    }
  });

  buttons.addSwimlane.style.width = laneButton + gridSize + "px";
  buttons.addMilestone.style.height = mileButton + gridSize + "px";
  // code edited on 11 March 2023 for BugId 124899
  if (
    jsonData.ProcessType !== PROCESSTYPE_LOCAL &&
    jsonData.ProcessType !== PROCESSTYPE_LOCAL_CHECKED
  ) {
    buttons.addSwimlane.style.opacity = "0";
    buttons.addMilestone.style.opacity = "0";
  } else {
    buttons.addSwimlane.style.opacity = "1";
    buttons.addMilestone.style.opacity = "1";
  }

  resizer(
    graph,
    [swimlaneLayer, milestoneLayer, rootLayer],
    null,
    null,
    buttons,
    showTasklane,
    foldCell
  );
  // get graph children except root
  // let children = graph
  //   .getDefaultParent()
  //   .children.filter((cell) => cell.getId() !== rootId);
  
  // code edited on 7 April 2023 for BugId 120857 and BugId 112628
  parallelEdge(graph, edgeArr, swimlaneLayer);
  // Updates the display
  graph.refresh();
}
