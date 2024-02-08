import { numberedLabel } from "./numberedLabel";
import {
  gridSize,
  swimlaneName as swimlaneNameConst,
} from "../../Constants/bpmnView";
import { addMilestone } from "../CommonAPICall/AddMilestone";
import { addSwimLane } from "../CommonAPICall/AddSwimlane";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  userRightsMenuNames,
} from "../../Constants/appConstants";
import { hideIcons, hideRenameIcons } from "./cellOnMouseClick";
import { removeContextMenu } from "./getContextMenu";
import { removeToolDivCell } from "./getToolDivCell";
import { getMenuNameFlag } from "../UserRightsFunctions";

var addButton = ({
  graph,
  horizontal,
  x,
  y,
  t,
  processType,
  showCreateOption,
}) => {
  let button = document.createElement("div");
  if (!showCreateOption) return button;
  if (horizontal) {
    button.title = t("addMilestone");
    button.id = "addMilestone";
  } else {
    button.title = t("addSwimlane");
    button.id = "addSwimlane";
  }
  button.className = "swimlaneMilestoneAddBtn";
  // code added on 28 August 2023 for BugId 134182 - WCAG:Process Designer > create process >
  // Process flow focus is not goin on some object.
  button.setAttribute("tabIndex", "0");
  let span = document.createElement("span");
  span.innerHTML = "+";
  button.appendChild(span);

  //style button
  button.style.zIndex = 1;
  button.style.position = "absolute";
  button.style.top = y + "px";
  button.style.left = x + "px";
  button.style.height = gridSize + "px";
  button.style.width = gridSize + "px";
  button.style.opacity = "0";
  button.style.display = "flex";
  button.style.justifyContent = "center";
  button.style.alignItems = "center";
  button.style.background = "#FFFFFF33 0% 0% no-repeat padding-box";
  button.style.border = "2px dashed #C4C4C4";
  button.style.borderRadius = "1px";
  button.style.cursor = "pointer";
  button.style.outline = "0";
  span.style.fontSize = "1.5rem";
  span.style.color = "#767676";

  if (
    processType !== PROCESSTYPE_LOCAL &&
    processType !== PROCESSTYPE_LOCAL_CHECKED
  ) {
  } else {
    graph.container.appendChild(button);
  }

  return button;
};

var onButtonClick = (setNewId, horizontal, translation, setProcessData) => {
  add(horizontal, setNewId, translation, setProcessData);
  hideRenameIcons();
  removeContextMenu();
  removeToolDivCell();
  hideIcons();
};

var add = (horizontal, setNewId, translation, setProcessData) => {
  let prefix = translation(swimlaneNameConst);
  let swimlaneName, swimlaneId, lanes, lastLane, processName, processDefId;

  setProcessData((prevProcessData) => {
    lanes = prevProcessData.Lanes;
    lastLane =
      prevProcessData.Lanes &&
      prevProcessData.Lanes[prevProcessData.Lanes.length - 1];
    swimlaneId = lastLane.LaneId;
    swimlaneName = numberedLabel(null, prefix, swimlaneId + 1);
    processDefId = prevProcessData.ProcessDefId;
    processName = prevProcessData.ProcessName;
    return prevProcessData;
  });

  if (horizontal === true) {
    //milestone is being added
    addMilestone(translation, setNewId, processDefId, setProcessData);
  } else if (horizontal === false) {
    //swimlane is being added
    addSwimLane(
      translation,
      swimlaneId,
      swimlaneName,
      lanes,
      lastLane,
      processDefId,
      processName,
      setProcessData,
      setNewId
    );
  }
};

export function toAddSwimlaneMilestone({
  graph,
  setNewId,
  translation,
  setProcessData,
  processType,
  menuRightsList,
  isReadOnly,
}) {
  // Boolean that decides whether create milestone button will be visible or not.
  const createMilestoneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.createMilestone
  );
  // Boolean that decides whether create swimlane button will be visible or not.
  const createSwimlaneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.createSwimlane
  );

  var swimlaneButton = addButton({
    graph,
    horizontal: false,
    x: 0,
    y: 0,
    t: translation,
    processType,
    showCreateOption: !isReadOnly && createSwimlaneRightsFlag,
  });
  var milestoneButton = addButton({
    graph,
    horizontal: true,
    x: 0,
    y: 0,
    t: translation,
    processType,
    showCreateOption: !isReadOnly && createMilestoneRightsFlag,
  });

  let buttons = {
    addSwimlane: swimlaneButton,
    addMilestone: milestoneButton,
  };

  swimlaneButton.addEventListener("click", () =>
    onButtonClick(setNewId, false, translation, setProcessData)
  );
  // code added on 28 August 2023 for BugId 134182 - WCAG:Process Designer > create process >
  // Process flow focus is not goin on some object.
  swimlaneButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      onButtonClick(setNewId, false, translation, setProcessData);
    } else if (e.key === "Tab") {
      // if we press shift+tab, to move to previous state
      if (e.shiftKey) {
        let addSwimlaneBtn = document.getElementById("addSwimlane");
        if (addSwimlaneBtn) {
          addSwimlaneBtn?.blur();
        }
        let bpmnGrid = document.getElementById("bpmnGrid");
        if (bpmnGrid) {
          bpmnGrid?.focus();
        }
      }
      // if we press tab, to move to next state
      else {
        let addSwimlaneBtn = document.getElementById("addSwimlane");
        if (addSwimlaneBtn) {
          addSwimlaneBtn?.blur();
        }
        let addMilestoneBtn = document.getElementById("addMilestone");
        if (addMilestoneBtn) {
          addMilestoneBtn?.focus();
        }
      }
    }
  });
  milestoneButton.addEventListener("click", () =>
    onButtonClick(setNewId, true, translation, setProcessData)
  );
  // code added on 28 August 2023 for BugId 134182 - WCAG:Process Designer > create process >
  // Process flow focus is not goin on some object.
  milestoneButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      onButtonClick(setNewId, true, translation, setProcessData);
    } else if (e.key === "Tab") {
      // if we press shift+tab, to move to previous state
      if (e.shiftKey) {
        let addMilestoneBtn = document.getElementById("addMilestone");
        if (addMilestoneBtn) {
          addMilestoneBtn?.blur();
        }
        let addSwimlaneBtn = document.getElementById("addSwimlane");
        if (addSwimlaneBtn) {
          addSwimlaneBtn?.focus();
        }
      }
      // if we press tab, to move to next state
      else {
        let addMilestoneBtn = document.getElementById("addMilestone");
        if (addMilestoneBtn) {
          addMilestoneBtn?.blur();
        }
        let actPropertiesBtn = document.getElementById(
          "pmweb_actPropertiesBtn"
        );
        if (actPropertiesBtn) {
          actPropertiesBtn?.focus();
        }
      }
    }
  });
  return buttons;
}
