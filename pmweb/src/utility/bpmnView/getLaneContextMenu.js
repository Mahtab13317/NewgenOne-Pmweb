import DOMPurify from "dompurify";
import {
  MENUOPTION_CHECKIN_LANE,
  MENUOPTION_CHECKOUT_LANE,
  MENUOPTION_UNDO_CHECKOUT_LANE,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  userRightsMenuNames,
} from "../../Constants/appConstants";
import { graphGridSize, gridSize, style } from "../../Constants/bpmnView";
import { checkIfSwimlaneCheckedOut } from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { getMenuNameFlag } from "../UserRightsFunctions";
import { deleteCell } from "./deleteCell";

let contextMenu = document.createElement("div");
let section = [];
let visibility = false;
let dummy_graph;

const clearOldValues = () => {
  if (section != null) {
    for (var i of section) {
      var img = i;
      img.parentNode.removeChild(img);
    }
  }
  section = [];
};

const rename = (graph, cell) => {
  graph.startEditingAtCell(cell);
  removeLaneContextMenu();
};

const deleteLane = (graph, cell, setProcessData, t, dispatch) => {
  graph.setSelectionCell(cell);
  deleteCell(graph, setProcessData, null, null, dispatch, t);
  removeLaneContextMenu();
};

const queueManagementFunc = (
  cell,
  setProcessData,
  setShowQueueModal,
  showDrawer
) => {
  let queueId;
  setProcessData((prev) => {
    prev.Lanes.forEach((el) => {
      if (+el.LaneId === +cell?.id) {
        queueId = el.QueueId;
      }
    });
    return prev;
  });
  // added on 29/09/23 for BugId 135398
  showDrawer(false);
  setShowQueueModal({ show: true, queueId: queueId });
  removeLaneContextMenu();
};

const createElement = (
  name,
  id,
  elementContextMenu,
  elementSection,
  funcName
) => {
  let element = document.createElement("p");
  element.innerHTML = name;
  element.setAttribute(
    "style",
    "font-size: 11px;color: #000000;padding:0.125rem 0.5vw;"
  );
  element.setAttribute("id", id);
  //add background color on hover
  element.addEventListener("mouseenter", () => {
    element.style.background = "#f5f5f5";
  });
  element.addEventListener("mouseleave", () => {
    element.style.background = "white";
  });
  if (funcName) {
    element.addEventListener("click", funcName);
  }
  elementContextMenu.appendChild(element);
  elementSection.push(element);
};

export function getLaneContextMenu({
  graph,
  setProcessData,
  cell,
  t,
  state,
  dispatch,
  setShowQueueModal,
  processType,
  setActionModal,
  menuRightsList,
  showDrawer,
}) {
  clearOldValues();
  dummy_graph = graph;
  visibility = true;
  // code edited on 24 Feb 2023 for BugId 119137
  contextMenu.setAttribute(
    "style",
    "border: 1px solid #DADADA;box-shadow: 0px 3px 6px #DADADA; border-radius: 2px; background: white; position: absolute; flex-wrap: wrap; cursor: pointer; justify-content: center; z-index:10; padding:0.25rem 0"
  );
  contextMenu.style.left = DOMPurify.sanitize(
    `${
      state.text.boundingBox.x +
      state.text.boundingBox.width +
      graphGridSize * 0.25
    }px`
  );
  contextMenu.style.top = DOMPurify.sanitize(
    `${state.text.boundingBox.y - graphGridSize * 1.25}px`
  );
  contextMenu.style.width = 4.5 * gridSize + "px";

  if (
    processType === PROCESSTYPE_LOCAL ||
    processType === PROCESSTYPE_LOCAL_CHECKED
  ) {
    // Boolean that decides whether user can rename/modify swimlane or not.
    const modifySwimlaneRightsFlag = getMenuNameFlag(
      menuRightsList,
      userRightsMenuNames.modifySwimlane
    );
    // Boolean that decides whether user can delete swimlane or not.
    const deleteSwimlaneRightsFlag = getMenuNameFlag(
      menuRightsList,
      userRightsMenuNames.deleteSwimlane
    );

    if (modifySwimlaneRightsFlag) {
      createElement(
        t("Rename"),
        `rename_${state.cell.id}`,
        contextMenu,
        section,
        () => rename(graph, cell)
      );
    }
    if (deleteSwimlaneRightsFlag) {
      createElement(
        t("delete"), // modified on 12/09/2023 for BugId 136590
        `delete_${state.cell.id}`,
        contextMenu,
        section,
        () => deleteLane(graph, cell, setProcessData, t, dispatch)
      );
    }
  }
  // Boolean that decides whether user can delete swimlane or not.
  const qManagementRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.queueManagement
  );
  if (qManagementRightsFlag) {
    createElement(
      t("queueManagement"),
      `queueMngmt_${state.cell.id}`,
      contextMenu,
      section,
      () =>
        queueManagementFunc(cell, setProcessData, setShowQueueModal, showDrawer)
    );
  }

  if (
    (processType === PROCESSTYPE_DEPLOYED ||
      processType === PROCESSTYPE_REGISTERED) &&
    cell.style !== style.tasklane
  ) {
    let isProcessChecked = false,
      isActChecked = false,
      isLaneChecked = false,
      localLane,
      processData;

    setProcessData((prev) => {
      processData = prev;
      isProcessChecked = prev.CheckedOut === "Y";
      prev.Lanes?.forEach((lane) => {
        if (+lane.LaneId === +cell?.id) {
          isLaneChecked = lane.CheckedOut === "Y";
          localLane = lane;
        }
      });
      prev.MileStones?.forEach((mile) => {
        mile.Activities?.forEach((act) => {
          if (+act.LaneId === +cell?.id && !isLaneChecked) {
            isActChecked = act.CheckedOut === "Y";
          }
        });
      });
      return prev;
    });

    if (
      !isProcessChecked &&
      (isLaneChecked || (!isLaneChecked && !isActChecked))
    ) {
      if (isLaneChecked) {
        createElement(
          t("undoCheckout"),
          `undocheckout_${state.cell.id}`,
          contextMenu,
          section,
          () => {
            // added on 29/09/23 for BugId 135398
            showDrawer(false);
            setActionModal({
              type: MENUOPTION_UNDO_CHECKOUT_LANE,
              activity: localLane,
            });
            removeLaneContextMenu();
          }
        );
        createElement(
          t("checkIn"),
          `checkin_${state.cell.id}`,
          contextMenu,
          section,
          () => {
            // added on 29/09/23 for BugId 135398
            showDrawer(false);
            setActionModal({
              type: MENUOPTION_CHECKIN_LANE,
              activity: localLane,
            });
            removeLaneContextMenu();
          }
        );
      } else {
        if (!checkIfSwimlaneCheckedOut(processData)?.length > 0) {
          createElement(
            t("Checkout"),
            `checkout_${state.cell.id}`,
            contextMenu,
            section,
            () => {
              // added on 29/09/23 for BugId 135398
              showDrawer(false);
              setActionModal({
                type: MENUOPTION_CHECKOUT_LANE,
                activity: localLane,
              });
              removeLaneContextMenu();
            }
          );
        }
      }
    }
  }
  graph.view.graph.container.appendChild(contextMenu);
}

export function removeLaneContextMenu() {
  if (
    visibility &&
    dummy_graph &&
    contextMenu.parentNode === dummy_graph.view.graph.container
  ) {
    dummy_graph.view.graph.container.removeChild(contextMenu);
    clearOldValues();
    visibility = false;
  }
}
