import DOMPurify from "dompurify";
import { userRightsMenuNames } from "../../Constants/appConstants";
import { cellSize, graphGridSize, gridSize } from "../../Constants/bpmnView";
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
  removeMileContextMenu();
};

const deleteMile = (graph, cell, setProcessData, t, dispatch) => {
  graph.setSelectionCell(cell);
  deleteCell(graph, setProcessData, null, null, dispatch, t);
  removeMileContextMenu();
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

export function getMileContextMenu({
  graph,
  setProcessData,
  cell,
  t,
  state,
  dispatch,
  menuRightsList,
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
      state.text.boundingBox.x + state.text.boundingBox.width + graphGridSize
    }px`
  );
  contextMenu.style.top = DOMPurify.sanitize(
    `${
      state.text.boundingBox.y +
      state.text.boundingBox.height / 2 +
      cellSize.h / 4
    }px`
  );
  contextMenu.style.width = 3 * gridSize + "px";
  // Boolean that decides whether user can rename/modify milestone or not.
  const modifyMilestoneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.modifyMilestone
  );
  // Boolean that decides whether user can delete milestone or not.
  const deleteMilestoneRightsFlag = getMenuNameFlag(
    menuRightsList,
    userRightsMenuNames.deleteMilestone
  );

  if (modifyMilestoneRightsFlag) {
    createElement(
      t("Rename"),
      `rename_${state.cell.id}`,
      contextMenu,
      section,
      () => rename(graph, cell)
    );
  }
  if (deleteMilestoneRightsFlag) {
    createElement(
      t("delete"), // modified on 12/09/2023 for BugId 136590
      `delete_${state.cell.id}`,
      contextMenu,
      section,
      () => deleteMile(graph, cell, setProcessData, t, dispatch)
    );
  }
  graph.view.graph.container.appendChild(contextMenu);
}

export function removeMileContextMenu() {
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
