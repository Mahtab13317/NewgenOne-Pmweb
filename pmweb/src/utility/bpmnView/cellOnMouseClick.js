import { getToolDivCell, removeToolDivCell } from "./getToolDivCell";
import deleteIcon from "../../assets/bpmnView/workstepOnHover/Delete Workstep.png";
import settingsIcon from "../../assets/bpmnView/workstepOnHover/settings.svg";
import okRename from "../../assets/abstractView/okRename.svg";
import cancelRename from "../../assets/abstractView/cancelRename.svg";
import {
  smallIconSize,
  endVertex,
  gridSize,
  graphGridSize,
  style,
  artifacts,
  swimlaneTitleWidth,
  cellSize,
  defaultShapeVertex,
} from "../../Constants/bpmnView";
import { deleteCell } from "./deleteCell";
import { getContextMenu, removeContextMenu } from "./getContextMenu";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
} from "../../Constants/appConstants";
import {
  checkActivityStatus,
  checkIfParentSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import {
  selectedCell,
  selectedTask,
} from "../../redux-store/actions/selectedCellActions";
import {
  checkStyle,
  isSafariBrowser,
} from "../CommonFunctionCall/CommonFunctionCall";
import { cellSelectionOnTab } from "./cellSelectionOnTab";
import DOMPurify from "dompurify";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxUtils = mxgraphobj.mxUtils;
const mxEvent = mxgraphobj.mxEvent;
let images = [],
  cellImages = [];
let div = document.createElement("div");
let rename_div = document.createElement("div");
let dummy_graph;

export function hideIcons() {
  mxIconSet.prototype.destroy();
  if (dummy_graph && div.parentNode === dummy_graph.view.graph.container) {
    dummy_graph.view.graph.container.removeChild(div);
  }
}

export function hideRenameIcons() {
  renameIconSet.prototype.destroy();
  if (
    dummy_graph &&
    rename_div.parentNode === dummy_graph.view.graph.container
  ) {
    dummy_graph.view.graph.container.removeChild(rename_div);
  }
}

function doNotHoverForTheseCell(graph, cell) {
  if (graph.isSwimlane(cell)) {
    return true;
  } else if (cell.isEdge()) {
    return true;
  } else if (cell.id === "rootLayer") {
    return true;
  } else if (cell.style === style.expandedEmbeddedProcess) {
    return true;
  } else if (cell.style === style.embStartEvent) {
    return true;
  } else if (cell.style === style.embEndEvent) {
    return true;
  }
  return false;
}

function deleteCellOnClick(
  graph,
  setProcessData,
  setTaskAssociation,
  setShowDependencyModal,
  cell,
  dispatch,
  translation
) {
  graph.setSelectionCell(cell);
  deleteCell(
    graph,
    setProcessData,
    setTaskAssociation,
    setShowDependencyModal,
    dispatch,
    translation
  );
  removeToolDivCell();
  removeContextMenu();
  hideIcons();
}

function editCellOnClick(
  graph,
  setProcessData,
  cell,
  translation,
  showDrawer,
  caseEnabled,
  processType,
  setOpenDeployedProcess,
  setActionModal,
  dispatch,
  setNewId
) {
  graph.setSelectionCell(cell);
  if (
    processType === PROCESSTYPE_LOCAL ||
    processType === PROCESSTYPE_LOCAL_CHECKED
  ) {
    removeToolDivCell();
  }
  // code added on 31 March 2023 for BugId 122822
  graph.tooltipHandler.hide();
  getContextMenu(
    graph,
    setProcessData,
    cell,
    translation,
    showDrawer,
    caseEnabled,
    processType,
    setOpenDeployedProcess,
    setActionModal,
    dispatch,
    setNewId
  );
}

function mxIconSet(
  graph,
  cell,
  translation,
  setProcessData,
  showDrawer,
  setNewId,
  caseEnabled,
  isReadOnly,
  setOpenDeployedProcess,
  setTaskAssociation,
  setShowDependencyModal,
  setActionModal,
  dispatch
) {
  this.destroy();
  hideRenameIcons();
  removeContextMenu();
  removeToolDivCell();
  dummy_graph = graph;
  if (cell && cell !== null) {
    if (doNotHoverForTheseCell(graph, cell)) {
      return;
    }
    let processType;
    setProcessData((prev) => {
      // code added on 7 March 2023 for BugId 124772
      processType = prev.ProcessType;
      return prev;
    });
    // added on 02/11/23 for BugId 140514
    if (
      processType !== PROCESSTYPE_LOCAL &&
      processType !== PROCESSTYPE_LOCAL_CHECKED &&
      artifacts.includes(cell.style)
    ) {
      return;
    }
    div.setAttribute(
      "style",
      // modified on 25/09/2023 for BugId 130992
      //"position:absolute;cursor:pointer;display:flex;flex-direction:column;background:#ECEFF1;z-index:10"
      "position:absolute;cursor:pointer;display:flex;flex-direction:column;background:#FFF;border:1px solid #D3D3D3;z-index:10"
      // till here BugId 130992
    );
    // code edited on 3 Jan 2023 for BugId 121345 and BugId 121348
    if (cell.parent?.style === "expandedEmbeddedProcess") {
      div.style.left =
        cell.geometry.x + cell.parent.geometry.x - 1.5 * graphGridSize + "px";
    } else {
      if (
        artifacts.includes(cell.getStyle()) &&
        !graph.isSwimlane(cell.parent)
      ) {
        div.style.left =
          cell.geometry.x + gridSize * 0.3 - swimlaneTitleWidth + "px";
      } else {
        div.style.left = cell.geometry.x + gridSize * 0.3 + "px";
      }
    }
    if (artifacts.includes(cell.getStyle()) && !graph.isSwimlane(cell.parent)) {
      div.style.top = cell.geometry.y + "px";
    } else {
      div.style.top = cell.geometry.y + cell.parent.geometry.y + "px";
    }
    div.style.padding = gridSize * 0.1 + "px";

    if (cell.style !== style.groupBox && !isReadOnly) {
      if (
        (processType !== PROCESSTYPE_LOCAL &&
          processType !== PROCESSTYPE_LOCAL_CHECKED &&
          cell.style !== style.subProcess &&
          !artifacts.includes(cell.style)) ||
        processType === PROCESSTYPE_LOCAL ||
        processType === PROCESSTYPE_LOCAL_CHECKED
      ) {
        // code added on 29 March 2023 for BugId 124819
        if (
          (cell.parent.style === style.expandedEmbeddedProcess &&
            cell.style !== style.embStartEvent &&
            cell.style !== style.embEndEvent) ||
          cell.parent.style !== style.expandedEmbeddedProcess
        ) {
          var img1 = mxUtils.createImage(settingsIcon);
          img1.setAttribute("title", translation("settings")); // modified on 12/09/2023 for BugId 136589
          img1.setAttribute("id", `settings_${cell.id}`);
          img1.style.cursor = "pointer";
          img1.style.width = smallIconSize.w + "px";
          img1.style.height = smallIconSize.h + "px";
          img1.style.marginBottom = gridSize * 0.1 + "px";
          img1.addEventListener("click", () =>
            editCellOnClick(
              graph,
              setProcessData,
              cell,
              translation,
              showDrawer,
              caseEnabled,
              processType,
              setOpenDeployedProcess,
              setActionModal,
              dispatch,
              setNewId
            )
          );
          mxEvent.addGestureListeners(
            img1,
            mxUtils.bind(this, function (evt) {
              // Disables dragging the image
              mxEvent.consume(evt);
            })
          );
          images.push(img1);
          div.appendChild(img1);
        }
      }
    }

    let temp;
    setProcessData((prev) => {
      temp = prev;
      return prev;
    });
    // code added on 9 Feb 2023 for BugId 122856
    let parentLaneChecked =
      cell.parent.style === style.expandedEmbeddedProcess
        ? checkIfParentSwimlaneCheckedOut(temp, cell?.parent?.parent?.id)
            ?.length > 0
        : checkIfParentSwimlaneCheckedOut(temp, cell?.parent?.id)?.length > 0;
    // code edited on 14 July 2023 for BugId 130715 - swimlane checkout>>not able to delete activity
    // activities already present in swimlane, while check-out cannot be deleted and renamed
    if (
      (processType === PROCESSTYPE_LOCAL ||
        processType === PROCESSTYPE_LOCAL_CHECKED ||
        (parentLaneChecked && checkActivityStatus(temp, cell?.id))) &&
      !isReadOnly
    ) {
      if (
        (cell.parent.style === style.expandedEmbeddedProcess &&
          cell.style !== style.embStartEvent &&
          cell.style !== style.embEndEvent) ||
        cell.parent.style !== style.expandedEmbeddedProcess
      ) {
        var img = mxUtils.createImage(deleteIcon);
        img.setAttribute("title", translation("delete")); // modified on 12/09/2023 for BugId 136588
        img.setAttribute("id", `delete_${cell.id}`);
        img.addEventListener("click", () =>
          deleteCellOnClick(
            graph,
            setProcessData,
            setTaskAssociation,
            setShowDependencyModal,
            cell,
            dispatch,
            translation
          )
        );
        img.style.width = smallIconSize.w + "px";
        img.style.height = smallIconSize.h + "px";

        mxEvent.addGestureListeners(
          img,
          mxUtils.bind(this, function (evt) {
            // Disables dragging the image
            mxEvent.consume(evt);
          })
        );
        images.push(img);
        div.appendChild(img);
      }
    }
    graph.view.graph.container.appendChild(div);
    if (
      !checkStyle(endVertex, cell.style) &&
      !artifacts.includes(cell.getStyle()) &&
      (processType === PROCESSTYPE_LOCAL ||
        processType === PROCESSTYPE_LOCAL_CHECKED ||
        parentLaneChecked) &&
      !isReadOnly
    ) {
      getToolDivCell(
        graph,
        cell,
        translation,
        setProcessData,
        showDrawer,
        setNewId,
        caseEnabled,
        dispatch
      );
    }
  } else {
    graph.clearSelection();
    if (graph && div.parentNode === graph.view.graph.container) {
      graph.view.graph.container.removeChild(div);
    }
    removeToolDivCell();
    removeContextMenu();
  }
}

function renameIconSet(graph, cell) {
  this.destroy();
  dummy_graph = graph;
  if (cell && cell !== null) {
    let cellState = graph.view.getState(cell);
    if (cellState && cellState?.cell?.style !== "layer") {
      rename_div.setAttribute(
        "style",
        "position:absolute;display:flex;align-items:center;gap:0.75vw;background:#ECEFF1;z-index:10"
      );
      var img = mxUtils.createImage(okRename);
      img.style.position = "absolute";
      img.style.cursor = "pointer";
      img.style.width = cellSize.w / 2 + "px";
      img.style.height = cellSize.h / 2 + "px";
      img.style.marginLeft = cellSize.w * 0.7 + "px";
      rename_div.style.minWidth = cellSize.w + cellSize.w * 0.4 + "px";
      if (cellState?.cell?.style === style.milestone) {
        rename_div.style.height = gridSize * 0.7 + "px";
        rename_div.style.left =
          DOMPurify.sanitize(`${cellState.text.bounds.x + gridSize * 3.05}`) +
          "px";
        rename_div.style.top =
          DOMPurify.sanitize(`${cellState.text.bounds.y - gridSize * 0.375}`) +
          "px";
      } else if (cellState?.cell?.style.includes(style.swimlane)) {
        rename_div.style.height = gridSize * 0.8 + "px";
        rename_div.style.top =
          DOMPurify.sanitize(
            `${
              cellState.text.bounds.y +
              cellState.text.bounds.height / 3 -
              gridSize * 1.05
            }`
          ) + "px";
        rename_div.style.left =
          DOMPurify.sanitize(
            `${Math.round(cellState.text.bounds.x) + gridSize * 4.65}`
          ) + "px";
      } else {
        rename_div.style.height = gridSize * 0.8 + "px";
        rename_div.style.left = checkStyle(defaultShapeVertex, cell.style)
          ? DOMPurify.sanitize(
              `${Math.round(cellState.text.boundingBox.x) + gridSize * 3 + 11}`
            ) + "px"
          : DOMPurify.sanitize(
              `${Math.round(cellState.text.boundingBox.x) + gridSize * 3.5 - 2}`
            ) + "px";
        rename_div.style.top = checkStyle(defaultShapeVertex, cell.style)
          ? DOMPurify.sanitize(`${cellState.text.boundingBox.y - 5.5}`) + "px"
          : DOMPurify.sanitize(`${cellState.text.boundingBox.y + 1.5}`) + "px";
      }
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function (evt) {
          // Disables dragging the image
          mxEvent.consume(evt);
        })
      );
      mxEvent.addListener(
        img,
        "click",
        mxUtils.bind(this, function () {
          graph.stopEditing();
          this.destroy();
        })
      );

      var img1 = mxUtils.createImage(cancelRename);
      img1.style.position = "absolute";
      img1.style.cursor = "pointer";
      img1.style.width = cellSize.w / 2 + "px";
      img1.style.height = cellSize.h / 2 + "px";
      img1.style.marginLeft = cellSize.w * 0.1 + "px";
      mxEvent.addGestureListeners(
        img1,
        mxUtils.bind(this, function (evt) {
          // Disables dragging the image
          mxEvent.consume(evt);
        })
      );
      mxEvent.addListener(
        img1,
        "click",
        mxUtils.bind(this, function () {
          graph.cellEditor.stopEditing(false, true);
          this.destroy();
        })
      );
      cellImages.push(rename_div);
      cellImages.push(img1);
      cellImages.push(img);
      rename_div.appendChild(img1);
      rename_div.appendChild(img);
      graph.view.graph.container.appendChild(rename_div);
    }
  }
}

mxIconSet.prototype.destroy = function () {
  if (images != null) {
    for (var i of images) {
      var img = i;
      img.parentNode.removeChild(img);
    }
  }
  images = [];
};

renameIconSet.prototype.destroy = function () {
  if (cellImages != null) {
    for (var i of cellImages) {
      var img = i;
      img.parentNode.removeChild(img);
    }
  }
  cellImages = [];
};

export function cellOnMouseClick(
  graph,
  translation,
  setProcessData,
  showDrawer,
  setNewId,
  caseEnabled,
  isReadOnly,
  setOpenDeployedProcess,
  setTaskAssociation,
  setShowDependencyModal,
  setActionModal,
  dispatch
) {
  // code edited on 7 July 2022 for BugId 111719
  //Shows icons if the cell is clicked
  graph.addListener(mxEvent.CLICK, function (sender, evt) {
    let cell_click = evt.getProperty("cell"); // cell may be null
    let selectedCellGraph = graph.getSelectionCell();
    if (cell_click && selectedCellGraph) {
      hideIcons();
      let bpmnGrid = document.getElementById("bpmnGrid");
      // modified on 28/09/23 for BugId 138131 - responsiveness>>android>>enabled process>>home button and
      // process tabs are getting removed once clicked on any activity
      // if (bpmnGrid) {
      //   bpmnGrid?.focus();
      // }

      let event = evt.getProperty("event");
      let isMouseEvent = event?.pointerType === "mouse";
      console.log(
        "Hello",
        navigator.userAgentData,
        navigator.userAgent,
        isSafariBrowser()
      );
      if (bpmnGrid && isMouseEvent) {
        //code added for bug id 138339 on 17-10-23
        if (!isSafariBrowser()) {
          bpmnGrid?.focus();
        }
      }
      // till here BugId 138131
      new mxIconSet(
        graph,
        cell_click,
        translation,
        setProcessData,
        showDrawer,
        setNewId,
        caseEnabled,
        isReadOnly,
        setOpenDeployedProcess,
        setTaskAssociation,
        setShowDependencyModal,
        setActionModal,
        dispatch
      );
    } else {
      let bpmnGrid = document.getElementById("bpmnGrid");
      if (bpmnGrid) {
        bpmnGrid?.blur();
      }
      removeContextMenu();
      removeToolDivCell();
      hideRenameIcons();
      hideIcons();
      graph.removeSelectionCell(selectedCellGraph);
      // code added on 30 Jan 2023 for BugId 122774
      dispatch(
        selectedCell(null, null, null, null, null, null, null, null, null)
      );
      dispatch(selectedTask(null, null, null, null));
    }

    if (!cell_click) {
      //hide popup menu when clicked anywhere on the graph
      graph.popupMenuHandler?.hideMenu();
    }
    evt.consume();
  });
  // graph.addListener("cellsInserted", function (sender, evt) {
  //   if (
  //     processType !== PROCESSTYPE_LOCAL &&
  //     processType !== PROCESSTYPE_LOCAL_CHECKED
  //   ) {
  //     return;
  //   } else {
  //     let cell = evt.getProperty("cells"); // cell may be null
  //     // graph.startEditingAtCell(cellState.cell);
  //     new mxIconSet(
  //       graph,
  //       cell,
  //       translation,
  //       setProcessData,
  //       showDrawer,
  //       setNewId,
  //       caseEnabled,
  //       processType,
  //       setOpenDeployedProcess,
  //       setTaskAssociation,
  //       setShowDependencyModal,
  //       setActionModal,
  //       dispatch
  //     );
  //     evt.consume();
  //   }
  // });
  graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
    var cell_dbl = evt.getProperty("cell"); // cell may be null
    if (cell_dbl) {
      if (
        doNotHoverForTheseCell(graph, cell_dbl) ||
        artifacts.includes(cell_dbl.getStyle())
      ) {
        // code edited on 27 Jan 2023 for BugId 122823
        if (artifacts.includes(cell_dbl.getStyle())) {
          hideRenameIcons();
        }
        return;
      }
      if (
        graph.getModel().isVertex(cell_dbl) &&
        cell_dbl.getStyle() !== style.subProcess // added on 05/02/24 for BugId 143219
      ) {
        showDrawer(true);
        graph.tooltipHandler.hide();
      }
    }
  });

  if (!isReadOnly) {
    graph.addListener(mxEvent.EDITING_STARTED, function (sender, evt) {
      let renamedCell = evt.getProperty("cell"); // cell may be null
      // code edited on 27 Jan 2023 for BugId 122823
      let event = evt.getProperty("event");
      if (
        event &&
        event.type === "dblclick" &&
        (!graph.isSwimlane(renamedCell) ||
          renamedCell.getStyle() === style.tasklane ||
          renamedCell.getStyle() === style.tasklane_collapsed ||
          renamedCell.getStyle().includes(style.swimlane_collapsed) ||
          renamedCell.getStyle() === style.expandedEmbeddedProcess ||
          artifacts.includes(renamedCell.getStyle()) ||
          graph.getModel().isEdge(renamedCell))
      ) {
        return;
      }
      let state = graph.view.getState(renamedCell);
      if (state) {
        let isEdge = graph.getModel().isEdge(state.cell);
        // code edited on 27 Jan 2023 for BugId 122798
        if (
          !isEdge &&
          renamedCell.id !== "rootLayer" &&
          renamedCell.style !== style.expandedEmbeddedProcess
        ) {
          new renameIconSet(graph, renamedCell);
        }
      }
      evt.consume();
    });
  }

  // code added on 28 August 2023 for BugId 134182 - WCAG:Process Designer > create process >
  // Process flow focus is not goin on some object.
  mxEvent.addListener(
    graph.container,
    "keydown",
    mxUtils.bind(this, function (evt) {
      // Alt+tab for task switcher in Windows, ctrl+tab for tab control in Chrome
      // code for tab key
      if (
        evt.which === 9 &&
        graph.isEnabled() &&
        !mxEvent.isControlDown(evt) &&
        !graph.isEditing() &&
        !mxEvent.isAltDown(evt)
      ) {
        cellSelectionOnTab(
          graph,
          !mxEvent.isShiftDown(evt),
          mxEvent.isShiftDown(evt)
        );
        mxEvent.consume(evt);
      }
    })
  );
}
