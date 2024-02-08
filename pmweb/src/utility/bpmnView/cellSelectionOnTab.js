import { style } from "../../Constants/bpmnView";
import { getGraphLayers } from "../../components/ViewingArea/BPMNView/Graph";

// Function to get tasklane from rootlayer
const getTaskLane = (layers) => {
  let layer = layers[0];
  let childCount = layer?.children?.length;
  for (var i = 0; i < childCount; i++) {
    let lane = layer?.children[i];
    if (lane && lane.style === style.tasklane) {
      return lane;
    }
  }
};

// function to get the next child of the parent
const getChild = (parent, model, i, isNext) => {
  let childCount = model.getChildCount(parent);
  let child = model.getChildAt(parent, i);
  // if next child of parent is null, recursive calls added till the current index is less than the
  // total child count in parent.
  if (child === null || child?.style === undefined) {
    if (isNext) {
      i++;
      if (i < childCount) {
        child = getChild(parent, model, i, isNext);
      }
    } else {
      i--;
      if (i >= 0) {
        child = getChild(parent, model, i, isNext);
      }
    }
  }
  return child;
};

// function to get the next sibling of the parent
const getNextParent = (parent, model) => {
  let superParent = model.getParent(parent);
  let currentParentIdx = superParent.getIndex(parent);
  let siblingCount = model.getChildCount(superParent);
  let nextParent = null;
  if (currentParentIdx + 1 < siblingCount) {
    nextParent = getChild(superParent, model, currentParentIdx + 1, true);
  }
  return nextParent;
};

// function to get the previous sibling of the parent
const getPreviousParent = (parent, model) => {
  let superParent = model.getParent(parent);
  let currentParentIdx = superParent.getIndex(parent);
  let prevParent = null;
  if (currentParentIdx > 0) {
    prevParent = getChild(superParent, model, currentParentIdx - 1, false);
  }
  return prevParent;
};

// function to get layer index in layers array [rootlayer, milestonelayer, swimlanelayer]
const getLayerIdx = (cell, layers) => {
  let idx = null;
  for (let i = 0; i < 3; i++) {
    if (cell && cell?.mxObjectId === layers[i]?.mxObjectId) {
      idx = i;
    }
  }
  return idx;
};

// function to get parent of the selected cell
const checkParent = (cell, layers, model) => {
  let parent = model.getParent(cell);
  let isLayer = getLayerIdx(parent, layers);
  // check for style milestone, added because parent of milestone is not selectable
  if (isLayer !== null && cell.style !== style.milestone) {
    return cell;
  } else {
    return parent;
  }
};

// function to move to the next layer in layers array [rootlayer, milestonelayer, swimlanelayer]
const moveToNextLayer = (graph, parent, model, isNext, isPrevious, layers) => {
  let superParent = model.getParent(parent);
  let currentLayerIdx = getLayerIdx(superParent, layers);
  switch (currentLayerIdx) {
    case 0:
      // if current layer index is 0, move to milestoneLayer
      let milestoneLayer = layers[1];
      selectionFunc(
        graph,
        milestoneLayer,
        null,
        model,
        isNext,
        isPrevious,
        layers,
        true
      );
      break;
    case 1:
      // if current layer index is 1, move to swimlaneLayer
      let swimlaneLayer = layers[2];
      let firstLane = model.getChildAt(swimlaneLayer, 0);
      graph.setSelectionCell(firstLane);
      break;
    case 2:
      // if current layer index is 2, remove the focus from grid view and add focus to add swimlane
      // button, if present
      let sel = graph.selectionModel;
      sel.clear();
      let bpmnGrid = document.getElementById("bpmnGrid");
      if (bpmnGrid) {
        bpmnGrid?.blur();
      }
      let addSwimlaneBtn = document.getElementById("addSwimlane");
      if (addSwimlaneBtn) {
        addSwimlaneBtn?.focus();
      } else {
        let actPropertiesBtn = document.getElementById(
          "pmweb_actPropertiesBtn"
        );
        if (actPropertiesBtn) {
          actPropertiesBtn?.focus();
        }
      }
      break;
    default:
  }
};

// function to move to the previous layer in layers array [rootlayer, milestonelayer, swimlanelayer]
const moveToPreviousLayer = (
  graph,
  parent,
  model,
  isNext,
  isPrevious,
  layers
) => {
  let superParent = model.getParent(parent);
  let currentLayerIdx = getLayerIdx(superParent, layers);
  switch (currentLayerIdx) {
    case 0:
      // if current layer index is 0, remove the focus from grid view
      let sel = graph.selectionModel;
      sel.clear();
      let bpmnGrid = document.getElementById("bpmnGrid");
      if (bpmnGrid) {
        bpmnGrid?.blur();
      }
      break;
    case 1:
      // if current layer index is 1, move to tasklane layer, if tasks count is more than 0, else
      // remove the focus from grid view
      let tasklane = getTaskLane(layers);
      // check tasks count
      let taskCount = tasklane?.children?.length;
      if (taskCount > 0) {
        parent = tasklane;
        selectionFunc(
          graph,
          parent,
          null,
          model,
          isNext,
          isPrevious,
          layers,
          false
        );
      } else {
        let sel = graph.selectionModel;
        sel.clear();
        let bpmnGrid = document.getElementById("bpmnGrid");
        if (bpmnGrid) {
          bpmnGrid?.blur();
        }
      }
      break;
    case 2:
      // if current layer index is 2, move to milestoneLayer
      let milestoneLayer = layers[1];
      selectionFunc(
        graph,
        milestoneLayer,
        null,
        model,
        isNext,
        isPrevious,
        layers,
        true
      );
      break;
    default:
  }
};

// function to highlight the active cell
const selectionFunc = (
  graph,
  parent,
  cell,
  model,
  isNext,
  isPrevious,
  layers,
  isMile = false
) => {
  let childCount = model.getChildCount(parent);
  if (cell == null && childCount > 0) {
    if (isNext) {
      let child = getChild(parent, model, 0, isNext);
      graph.setSelectionCell(child);
    } else if (isPrevious) {
      let child = getChild(parent, model, childCount - 1, isNext);
      if (child === null || child?.style === undefined) {
        graph.setSelectionCell(parent);
      } else {
        graph.setSelectionCell(child);
      }
    }
  } else if (childCount > 0) {
    let i = parent.getIndex(cell);
    if (isNext) {
      i++;
      // if index is less than the child count of parent move to the next child, else move to the
      // next sibling of the parent
      if (i < childCount) {
        let child = getChild(parent, model, i, isNext);
        if (child === null || child?.style === undefined) {
          moveToNextLayer(
            graph,
            isMile ? cell : parent,
            model,
            isNext,
            isPrevious,
            layers
          );
        } else {
          graph.setSelectionCell(child);
        }
      } else {
        let nextParent = getNextParent(isMile ? cell : parent, model);
        // if next sibling of the parent is not null move to the next sibling, else move to the
        // next layer
        if (nextParent !== null) {
          graph.setSelectionCell(nextParent);
        } else {
          moveToNextLayer(
            graph,
            isMile ? cell : parent,
            model,
            isNext,
            isPrevious,
            layers
          );
        }
      }
    } else if (isPrevious) {
      i--;
      // if index is more than/ equal to 0 move to the previous child, else move to the previous sibling of
      // the parent
      if (i >= 0) {
        let child = getChild(parent, model, i, isNext);
        if (child === null || child?.style === undefined) {
          graph.setSelectionCell(parent);
        } else {
          graph.setSelectionCell(child);
        }
      } else {
        let prevParent = getPreviousParent(isMile ? cell : parent, model);
        // if previous sibling of the parent is not null move to the previous sibling, else move to
        // the previous layer
        if (prevParent !== null) {
          let prevChildCount = model.getChildCount(prevParent);
          let lastChild = getChild(
            prevParent,
            model,
            prevChildCount - 1,
            isNext
          );
          if (lastChild === null || lastChild?.style === undefined) {
            graph.setSelectionCell(prevParent);
          } else {
            graph.setSelectionCell(lastChild);
          }
        } else {
          moveToPreviousLayer(
            graph,
            isMile ? cell : parent,
            model,
            isNext,
            isPrevious,
            layers
          );
        }
      }
    }
  }
};

export function cellSelectionOnTab(graph, isNext, isPrevious) {
  // isNext - whether we are moving forward, clicking tab button
  // isPrevious - whether we are moving backward, clicking shift+tab button
  let addSwimlaneBtn = document.getElementById("addSwimlane");
  let addMilestoneBtn = document.getElementById("addMilestone");
  let bpmnGrid = document.getElementById("bpmnGrid");
  // only work when focus is on grid in bpmn view
  if (
    addSwimlaneBtn !== document.activeElement &&
    addMilestoneBtn !== document.activeElement &&
    bpmnGrid === document.activeElement &&
    !graph.enteredCell
  ) {
    let model = graph.getModel();
    let layers = getGraphLayers();

    let sel = graph.selectionModel;
    // check whether any cell is selected
    let cell = sel.cells.length > 0 ? sel.cells[0] : null;

    // clear selection, after getting previous selected cell
    if (sel.cells.length > 1) {
      sel.clear();
    }

    let parent = null;

    if (cell === null) {
      if (isNext) {
        // if cell selected is null, then check for tasks count in tasklane. If tasks count is more than 0,
        // then start selecting tasks first. Otherwise, selection should start from milestones.
        let tasklane = getTaskLane(layers);
        // check tasks count
        let taskCount = tasklane?.children?.length;
        if (taskCount > 0) {
          parent = tasklane;
        }
        // if tasks count is 0, select first milestone
        else {
          parent = layers[1];
        }
        selectionFunc(
          graph,
          parent,
          cell,
          model,
          isNext,
          isPrevious,
          layers,
          taskCount === 0
        );
      } else if (isPrevious) {
        // if cell selected is null, then selection should start from last swimlane.
        let swimlaneLayer = layers[2];
        let laneChildCount = model.getChildCount(swimlaneLayer);
        parent = model.getChildAt(swimlaneLayer, laneChildCount - 1);
        selectionFunc(
          graph,
          parent,
          cell,
          model,
          isNext,
          isPrevious,
          layers,
          false
        );
      }
    } else if (cell !== null) {
      let parent = checkParent(cell, layers, model);
      selectionFunc(
        graph,
        parent,
        cell,
        model,
        isNext,
        isPrevious,
        layers,
        cell.style === style.milestone
      );
    }
  }
}
