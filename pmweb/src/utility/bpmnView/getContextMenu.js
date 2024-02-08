import { artifacts, gridSize, style } from "../../Constants/bpmnView";
import { hideIcons } from "./cellOnMouseClick";
import { removeToolDivCell } from "./getToolDivCell";
import { caseWorkdesk } from "./toolboxIcon";
import { ChangeActivityType } from "../../utility/CommonAPICall/ChangeActivityType";
import {
  MENUOPTION_CHECKIN_ACT,
  MENUOPTION_CHECKOUT_ACT,
  MENUOPTION_UNDO_CHECKOUT_ACT,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
} from "../../Constants/appConstants";
import { textAnnotationModifyFunc } from "./cellOnMouseHover";
import {
  validateActivityObject,
  validateTaskObject,
} from "../CommonAPICall/validateActivityObject";
import { saveQueueData } from "../CommonAPICall/SaveQueueData";
import { getActivityQueueObj } from "../abstarctView/getActivityQueueObj";

let contextMenu = document.createElement("div");
let section = [];
let visibility = false;
let dummy_graph;

const convertActivity = (
  cell,
  setProcessData,
  isParentLaneCheckedOut,
  setNewId,
  t,
  showDrawer
) => {
  cell.style = caseWorkdesk.styleName;
  let processDefId,
    processName,
    milestoneIndex,
    ActivityIndex,
    activityType,
    activitySubType,
    activityName,
    newProcessData,
    parentCellId;
  // added on 29/09/23 for BugId 135398
  showDrawer(false);
  setProcessData((prev) => {
    newProcessData = JSON.parse(JSON.stringify(prev));
    processDefId = prev.ProcessDefId;
    processName = prev.ProcessName;
    prev.MileStones.forEach((mile, index) => {
      mile.Activities.forEach((activity, subIndex) => {
        if (activity.ActivityId === cell.id) {
          milestoneIndex = index;
          ActivityIndex = subIndex;
          activityType = activity.ActivityType;
          activitySubType = activity.ActivitySubType;
          activityName = activity.ActivityName;
          parentCellId = activity.LaneId;
        }
      });
    });
    return prev;
  });
  /* code edited on 4 August 2023 for BugId 130480 - Jboss EAP+Oracle: If click on convert to Case 
  Workstep option for checked out process, getting error connect failed */
  const changeActFunc = (queueId) => {
    ChangeActivityType(
      processDefId,
      cell.value,
      caseWorkdesk.activityTypeId,
      caseWorkdesk.activitySubTypeId,
      setProcessData,
      milestoneIndex,
      ActivityIndex,
      cell.id,
      queueId
    );
  };
  if (isParentLaneCheckedOut) {
    let queueInfo = getActivityQueueObj(
      setNewId,
      caseWorkdesk.activityTypeId,
      caseWorkdesk.activitySubTypeId,
      activityName,
      newProcessData,
      parentCellId,
      t
    );
    saveQueueData(
      processDefId,
      processName,
      activityName,
      cell.id,
      activityType,
      activitySubType,
      queueInfo,
      queueInfo,
      (queueId) => {
        changeActFunc(queueId);
      },
      1
    );
  } else {
    changeActFunc(null);
  }

  removeContextMenu();
  removeToolDivCell();
  hideIcons();
};

const clearOldValues = () => {
  if (section != null) {
    for (var i of section) {
      var img = i;
      img.parentNode.removeChild(img);
    }
  }
  section = [];
};

const rename = (graph, cell, setProcessData, t, dispatch) => {
  if (cell && cell.style === style.textAnnotations) {
    removeContextMenu();
    hideIcons();
    setProcessData((oldProcessData) => {
      //code edited on 5 August 2022 for Bug 113802
      let newProcessData = JSON.parse(JSON.stringify(oldProcessData));
      newProcessData.Annotations = JSON.parse(
        JSON.stringify(oldProcessData.Annotations)
      );
      newProcessData.Annotations = newProcessData.Annotations?.map((annot) => {
        if (annot.AnnotationId === cell?.id) {
          annot = { ...annot, hide: true };
        }
        return annot;
      });
      return newProcessData;
    });
    textAnnotationModifyFunc(cell, graph, setProcessData, t, dispatch);
  } else {
    let id = cell?.id;
    // code added on 16 Nov 2022 for BugId 119109
    if (
      cell?.style === style.taskTemplate ||
      cell?.style === style.newTask ||
      cell?.style === style.processTask
    ) {
      let processDefId, taskName, processType;
      setProcessData((prevProcessData) => {
        prevProcessData.Tasks?.forEach((task) => {
          if (task.TaskId === +id) {
            taskName = task.TaskName;
          }
        });
        processDefId = prevProcessData.ProcessDefId;
        processType = prevProcessData.ProcessType;
        return prevProcessData;
      });
      validateTaskObject({
        processDefId,
        processType,
        taskName,
        taskId: id,
        errorMsg: `${t("renameValidationErrorMsg")}`,
        onSuccess: (workitemValidationFlag) => {
          if (!workitemValidationFlag) {
            graph.startEditingAtCell(cell);
            removeContextMenu();
          }
        },
        dispatch,
      });
    }
    // code edited on 18 Jan 2023 for BugId 122616
    else if (
      cell?.style !== style.taskTemplate &&
      cell?.style !== style.newTask &&
      cell?.style !== style.processTask &&
      !artifacts.includes(cell?.style)
    ) {
      let processDefId, activityName, processType;
      setProcessData((prevProcessData) => {
        prevProcessData.MileStones.forEach((milestone) => {
          milestone.Activities.forEach((activity) => {
            if (activity.ActivityId === Number(id)) {
              activityName = activity.ActivityName;
            }
          });
        });
        processDefId = prevProcessData.ProcessDefId;
        processType = prevProcessData.ProcessType;
        return prevProcessData;
      });
      validateActivityObject({
        processDefId,
        processType,
        activityName,
        activityId: id,
        errorMsg: `${t("renameValidationErrorMsg")}`,
        onSuccess: (workitemValidationFlag) => {
          if (!workitemValidationFlag) {
            graph.startEditingAtCell(cell);
            removeContextMenu();
          }
        },
        dispatch, // added on 04/10/23 for BugId 135993
      });
    }
    // code added on 18 Jan 2023 for BugId 122616
    else if (artifacts.includes(cell?.style)) {
      graph.startEditingAtCell(cell);
      removeContextMenu();
    }
  }
};

export const copy = (graph, cell) => {
  graph.copiedCell = cell ? cell : graph.getSelectionCell();
  removeContextMenu();
  hideIcons();
};

const propertiesActivity = (showDrawer) => {
  removeContextMenu();
  removeToolDivCell();
  hideIcons();
  showDrawer(true);
};

const createElement = (
  name,
  id,
  elementContextMenu,
  elementGraph,
  elementSection,
  funcName,
  isDisabled = false
) => {
  let element = document.createElement("p");
  element.innerHTML = name;
  element.setAttribute(
    "style",
    `font-size: 11px;color: ${
      isDisabled ? "grey" : "#000000"
    };padding:0.125rem 0.5vw;cursor:${isDisabled ? "default" : "pointer"}`
  );
  element.setAttribute("id", id);
  //add background color on hover
  element.addEventListener("mouseenter", () => {
    // code added on 31 March 2023 for BugId 122822
    elementGraph.tooltipHandler.hide();
    element.style.background = "#f5f5f5";
  });
  element.addEventListener("mouseleave", () => {
    element.style.background = "white";
  });
  if (funcName && !isDisabled) {
    element.addEventListener("click", funcName);
  }
  elementContextMenu.appendChild(element);
  elementSection.push(element);
};

const createBreak = (breakContextMenu, breakSection) => {
  let br = document.createElement("HR");
  br.setAttribute("style", "margin: 0.125rem 0;");
  breakSection.push(br);
  breakContextMenu.appendChild(br);
};

const openProcess = (cell, setProcessData, setOpenDeployedProcess) => {
  let localActivity;

  setProcessData((prev) => {
    prev.MileStones.forEach((mile) => {
      mile.Activities.forEach((act) => {
        if (+act.ActivityId === +cell.id) {
          localActivity = act;
        }
      });
    });
    return prev;
  });
  setOpenDeployedProcess(localActivity);
  removeContextMenu();
  removeToolDivCell();
  hideIcons();
};

export function getContextMenu(
  graph,
  setProcessData,
  cell,
  t,
  showDrawer,
  caseEnabled,
  processType,
  setOpenDeployedProcess,
  setActionModal,
  dispatch,
  setNewId
) {
  clearOldValues();
  dummy_graph = graph;
  visibility = true;
  // code edited on 7 June 2022 for BugId 110045 and on 24 Feb 2023 for BugId 119137
  contextMenu.setAttribute(
    "style",
    "border: 1px solid #DADADA;box-shadow: 0px 3px 6px #DADADA; border-radius: 2px; background: white; position: absolute; flex-wrap: wrap; cursor: pointer; justify-content: center; z-index:10; padding:0.25rem 0"
  );
  contextMenu.style.left =
    cell.parent && cell.parent?.geometry
      ? cell.geometry.x + cell.parent.geometry.x - gridSize * 0.15 + "px"
      : cell.geometry.x - gridSize * 0.15 + "px";
  contextMenu.style.top =
    cell.parent && cell.parent?.geometry
      ? cell.geometry.y +
        cell.parent.geometry.y +
        cell.geometry.height * 0.5 +
        "px"
      : cell.geometry.y + cell.geometry.height * 0.5 + "px";
  if (
    (cell.style.includes(style.workdesk) && caseEnabled === true) ||
    cell.style === style.subProcess
  ) {
    contextMenu.style.width = 5.5 * gridSize + "px";
  } else {
    contextMenu.style.width = 3.5 * gridSize + "px";
  }

  let localActivity,
    isChecked,
    isProcessChecked = false,
    isParentLaneCheckedOut,
    newAct = false;
  setProcessData((prev) => {
    //code edited on 17 Nov 2022 for BugId 117670
    isProcessChecked = prev.CheckedOut === "Y";
    prev.MileStones?.forEach((mile) => {
      mile.Activities.forEach((act) => {
        if (+act.ActivityId === +cell.id) {
          localActivity = act;
          isChecked = act.CheckedOut === "Y";
          // code edited on 7 March 2023 for BugId 124786 and BugId 120986
          if (act.status === "I") {
            newAct = true;
          }
        }
        // code added on 2 Feb 2023 for BugId 122866
        if (act.EmbeddedActivity) {
          act.EmbeddedActivity[0]?.forEach((embAct) => {
            if (+embAct.ActivityId === +cell.id) {
              localActivity = embAct;
              isChecked = embAct.CheckedOut === "Y";
            }
          });
        }
      });
    });
    // code added on 9 Feb 2023 for BugId 122856
    let parentLane =
      cell.parent.style === style.expandedEmbeddedProcess
        ? cell?.parent?.parent?.id
        : cell?.parent?.id;
    prev.Lanes?.forEach((lane) => {
      if (
        cell.parent &&
        +lane.LaneId === +parentLane &&
        lane.CheckedOut === "Y"
      ) {
        isParentLaneCheckedOut = true;
      }
    });
    return prev;
  });

  // code edited on 7 March 2023 for BugId 124786 and BugId 120986
  if (
    processType === PROCESSTYPE_LOCAL ||
    processType === PROCESSTYPE_LOCAL_CHECKED ||
    ((processType === PROCESSTYPE_DEPLOYED ||
      processType === PROCESSTYPE_REGISTERED) &&
      isParentLaneCheckedOut &&
      newAct &&
      !isProcessChecked)
  ) {
    createElement(t("Rename"), "renameOpt", contextMenu, graph, section, () =>
      rename(graph, cell, setProcessData, t, dispatch)
    );
  }

  if (
    processType === PROCESSTYPE_LOCAL ||
    processType === PROCESSTYPE_LOCAL_CHECKED ||
    ((processType === PROCESSTYPE_DEPLOYED ||
      processType === PROCESSTYPE_REGISTERED) &&
      isParentLaneCheckedOut &&
      newAct &&
      !isProcessChecked)
  ) {
    if (cell.style.includes(style.workdesk) && caseEnabled === true) {
      createElement(
        t("ConvertToCaseWorkdesk"),
        "ctcwOpt",
        contextMenu,
        graph,
        section,
        () =>
          /* code edited on 4 August 2023 for BugId 130480 - Jboss EAP+Oracle: If click on 
          convert to Case Workstep option for checked out process, getting error connect failed */
          convertActivity(
            cell,
            setProcessData,
            isParentLaneCheckedOut,
            setNewId,
            t,
            showDrawer
          )
      );
    }
  }

  if (
    processType === PROCESSTYPE_LOCAL ||
    processType === PROCESSTYPE_LOCAL_CHECKED
  ) {
    if (
      cell.style !== style.taskTemplate &&
      cell.style !== style.processTask &&
      cell.style !== style.newTask &&
      !artifacts.includes(cell.style) &&
      cell.style !== style.subProcess && // code added on 31 Jan 2023 for BugId 122911
      ((cell.parent.style === style.expandedEmbeddedProcess &&
        cell.style !== style.embStartEvent &&
        cell.style !== style.embEndEvent) ||
        cell.parent.style !== style.expandedEmbeddedProcess) // code added on 2 March 2023 for BugId 124586
    ) {
      createElement(t("Copy"), "copyOpt", contextMenu, graph, section, () =>
        copy(graph, cell)
      );
    }
    if (cell.style === style.subProcess) {
      // createElement(
      //   t("useTemplate"),
      //   "useTemplateOpt",
      //   contextMenu, graph,
      //   section,
      //   null
      // );
    } else if (
      cell.style !== style.taskTemplate &&
      cell.style !== style.processTask &&
      cell.style !== style.newTask &&
      !artifacts.includes(cell.style)
    ) {
      createBreak(contextMenu, section);
    }
  }
  if (!artifacts.includes(cell.style) && cell.style !== style.subProcess) {
    createElement(
      t("Properties"),
      "propertiesOpt",
      contextMenu,
      graph,
      section,
      () => propertiesActivity(showDrawer)
    );
  }
  if (
    cell.style.includes(style.callActivity) &&
    (processType === PROCESSTYPE_LOCAL ||
      processType === PROCESSTYPE_LOCAL_CHECKED)
  ) {
    // code edited on 2 Feb 2023 for BugId 123036
    let isDisabled = false;
    setProcessData((prev) => {
      prev.MileStones?.forEach((mile) => {
        mile.Activities.forEach((act) => {
          if (+act.ActivityId === +cell.id) {
            if (
              !act.AssociatedProcess ||
              act.AssociatedProcess === undefined ||
              act.AssociatedProcess?.Associated_ProcessDefId === ""
            ) {
              isDisabled = true;
            }
          }
        });
      });
      return prev;
    });
    createElement(
      t("openProcess"),
      "openProcessOpt",
      contextMenu,
      graph,
      section,
      () => openProcess(cell, setProcessData, setOpenDeployedProcess),
      isDisabled
    );
  }
  if (
    (processType === PROCESSTYPE_DEPLOYED ||
      processType === PROCESSTYPE_REGISTERED) &&
    !isParentLaneCheckedOut &&
    !isProcessChecked &&
    cell.style !== style.subProcess
  ) {
    if (isChecked) {
      createElement(
        t("undoCheckout"),
        "undoCheckOpt",
        contextMenu,
        graph,
        section,
        () => {
          // added on 29/09/23 for BugId 135398
          showDrawer(false);
          setActionModal({
            type: MENUOPTION_UNDO_CHECKOUT_ACT,
            activity: localActivity,
          });
          removeContextMenu();
          hideIcons();
        }
      );
      createElement(
        t("checkIn"),
        "checkinOpt",
        contextMenu,
        graph,
        section,
        () => {
          // added on 29/09/23 for BugId 135398
          showDrawer(false);
          setActionModal({
            type: MENUOPTION_CHECKIN_ACT,
            activity: localActivity,
          });
          removeContextMenu();
          hideIcons();
        }
      );
    } else {
      createElement(
        t("Checkout"),
        "checkoutOpt",
        contextMenu,
        graph,
        section,
        () => {
          // added on 29/09/23 for BugId 135398
          showDrawer(false);
          setActionModal({
            type: MENUOPTION_CHECKOUT_ACT,
            activity: localActivity,
          });
          removeContextMenu();
          hideIcons();
        }
      );
    }
  }
  graph.view.graph.container.appendChild(contextMenu);
}

export function removeContextMenu() {
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
