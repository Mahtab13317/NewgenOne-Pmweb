import { nameValidity } from "./nameValidity";
import { renameMilestone } from "../CommonAPICall/RenameMilestone";
import { renameSwimlane } from "../CommonAPICall/RenameSwimlane";
import { renameActivity } from "../CommonAPICall/RenameActivity";
import {
  artifacts,
  gridSize,
  maxLabelCharacter,
  style,
} from "../../Constants/bpmnView";
import { renameTask } from "../CommonAPICall/RenameTask";
import { getRenameActivityQueueObj } from "../abstarctView/getRenameActQueueObj";
import {
  setQueueRenameModalOpen,
  setRenameActivityData,
} from "../../redux-store/actions/Properties/activityAction";
import {
  checkIfParentSwimlaneCheckedOut,
  checkIfSwimlaneCheckedOut,
} from "../SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { ModifyDataObject } from "../CommonAPICall/ModifyDataObject";
import { ModifyMsgAF } from "../CommonAPICall/ModifyMSGAFs";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { FieldValidations } from "../FieldValidations/fieldValidations";
import { hideIcons, hideRenameIcons } from "./cellOnMouseClick";
import { removeToolDivCell } from "./getToolDivCell";
import { removeContextMenu } from "./getContextMenu";
import { removeLaneContextMenu } from "./getLaneContextMenu";
import { removeMileContextMenu } from "./getMileContextMenu";
import { checkIfActHasSystemQueue } from "../abstarctView/addWorkstepAbstractView";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxConstants = mxgraphobj.mxConstants;
const mxRectangle = mxgraphobj.mxRectangle;
const mxUtils = mxgraphobj.mxUtils;
const mxClient = mxgraphobj.mxClient;
const mxText = mxgraphobj.mxText;
const mxEvent = mxgraphobj.mxEvent;
const mxCell = mxgraphobj.mxCell;

function enableInplaceEditing(graph, cellEditor, bds) {
  // enable inplace editting for swimlane
  if (graph.isSwimlane(cellEditor.editingCell)) {
    let horizontal = graph
      .getStylesheet()
      .getCellStyle(cellEditor.editingCell.getStyle())[
      mxConstants.STYLE_HORIZONTAL
    ];
    if (horizontal === false) {
      var tmp = bds.height;
      bds.height = cellEditor.editingCell.geometry.height;
      bds.width = tmp;
      cellEditor.textarea.style.writingMode = "vertical-lr";
      //cellEditor.textarea.style.transform = 'rotate(45deg)';
    }
  }
}

// added on 14/10/23 for BugId 139370
function getNameWithoutBreak(name) {
  var tmp = name.replace(/(<([^>]+)>)/gi, "");
  return tmp.replace(/\n/g, " ");
}

export function cellEditor(graph, setProcessData, translation, dispatch) {
  //overwrites resize function to enable inplace editting for swimlane
  graph.cellEditor.resize = function () {
    var state = this.graph.getView().getState(this.editingCell);
    if (state == null) {
      this.stopEditing(true);
    } else if (this.textarea != null) {
      //overwrite getLabelBounds of mxShape
      //state.shape.getLabelBounds = getLabelBounds;

      var isEdge = this.graph.getModel().isEdge(state.cell);
      var scale = this.graph.getView().scale;
      var m = null;

      // to stop editing of name on double click on activity
      if (
        this.trigger &&
        this.trigger.type === "dblclick" &&
        (!graph.isSwimlane(state.cell) ||
          state.cell.style === style.tasklane ||
          state.cell.style === style.tasklane_collapsed ||
          state.cell.style.includes(style.swimlane_collapsed) ||
          state.cell.style === style.expandedEmbeddedProcess ||
          artifacts.includes(state.cell.style) || // code edited on 27 Jan 2023 for BugId 122823
          isEdge)
      ) {
        this.stopEditing();
      } else {
        if (
          !this.autoSize ||
          state.style[mxConstants.STYLE_OVERFLOW] == "fill"
        ) {
          // Specifies the bounds of the editor box
          this.bounds = this.getEditorBounds(state);
          this.textarea.style.width =
            Math.round(this.bounds.width / scale) + "px";
          this.textarea.style.height =
            Math.round(this.bounds.height / scale) + "px";

          // FIXME: Offset when scaled
          if (document.documentMode == 8 || mxClient.IS_QUIRKS) {
            this.textarea.style.left = Math.round(this.bounds.x) + "px";
            this.textarea.style.top = Math.round(this.bounds.y) + "px";
          } else {
            this.textarea.style.left =
              Math.max(0, Math.round(this.bounds.x + 1)) + "px";
            this.textarea.style.top =
              Math.max(0, Math.round(this.bounds.y + 1)) + "px";
          }

          // Installs native word wrapping and avoids word wrap for empty label placeholder
          if (
            this.graph.isWrapping(state.cell) &&
            (this.bounds.width >= 2 || this.bounds.height >= 2) &&
            this.textarea.innerHTML != this.getEmptyLabelText()
          ) {
            this.textarea.style.wordWrap = mxConstants.WORD_WRAP;
            this.textarea.style.whiteSpace = "normal";

            if (state.style[mxConstants.STYLE_OVERFLOW] != "fill") {
              this.textarea.style.width =
                Math.round(this.bounds.width / scale) +
                this.wordWrapPadding +
                "px";
            }
          } else {
            this.textarea.style.whiteSpace = "nowrap";

            if (state.style[mxConstants.STYLE_OVERFLOW] != "fill") {
              this.textarea.style.width = "";
            }
          }
        } else {
          var lw = mxUtils.getValue(
            state.style,
            mxConstants.STYLE_LABEL_WIDTH,
            null
          );
          m =
            state.text != null && this.align == null ? state.text.margin : null;

          if (m == null) {
            m = mxUtils.getAlignmentAsPoint(
              this.align ||
                mxUtils.getValue(
                  state.style,
                  mxConstants.STYLE_ALIGN,
                  mxConstants.ALIGN_CENTER
                ),
              mxUtils.getValue(
                state.style,
                mxConstants.STYLE_VERTICAL_ALIGN,
                mxConstants.ALIGN_MIDDLE
              )
            );
          }

          if (isEdge) {
            this.bounds = new mxRectangle(
              state.absoluteOffset.x,
              state.absoluteOffset.y,
              0,
              0
            );

            if (lw != null) {
              var tmp = (parseFloat(lw) + 2) * scale;
              this.bounds.width = tmp;
              this.bounds.x += m.x * tmp;
            }
          } else {
            var bds = mxRectangle.fromRectangle(state);
            var hpos = mxUtils.getValue(
              state.style,
              mxConstants.STYLE_LABEL_POSITION,
              mxConstants.ALIGN_CENTER
            );
            var vpos = mxUtils.getValue(
              state.style,
              mxConstants.STYLE_VERTICAL_LABEL_POSITION,
              mxConstants.ALIGN_MIDDLE
            );

            bds =
              state.shape != null &&
              hpos == mxConstants.ALIGN_CENTER &&
              vpos == mxConstants.ALIGN_MIDDLE
                ? state.shape.getLabelBounds(bds)
                : bds;

            // code commented to stop swimlane vertical renaming.
            // enableInplaceEditing(graph, this, bds);

            if (lw != null) {
              bds.width = parseFloat(lw) * scale;
            }

            if (
              !state.view.graph.cellRenderer.legacySpacing ||
              state.style[mxConstants.STYLE_OVERFLOW] != "width"
            ) {
              var spacing =
                parseInt(state.style[mxConstants.STYLE_SPACING] || 2) * scale;
              var spacingTop =
                (parseInt(state.style[mxConstants.STYLE_SPACING_TOP] || 0) +
                  mxText.prototype.baseSpacingTop) *
                  scale +
                spacing;
              var spacingRight =
                (parseInt(state.style[mxConstants.STYLE_SPACING_RIGHT] || 0) +
                  mxText.prototype.baseSpacingRight) *
                  scale +
                spacing;
              var spacingBottom =
                (parseInt(state.style[mxConstants.STYLE_SPACING_BOTTOM] || 0) +
                  mxText.prototype.baseSpacingBottom) *
                  scale +
                spacing;
              var spacingLeft =
                (parseInt(state.style[mxConstants.STYLE_SPACING_LEFT] || 0) +
                  mxText.prototype.baseSpacingLeft) *
                  scale +
                spacing;

              var hpos = mxUtils.getValue(
                state.style,
                mxConstants.STYLE_LABEL_POSITION,
                mxConstants.ALIGN_CENTER
              );
              var vpos = mxUtils.getValue(
                state.style,
                mxConstants.STYLE_VERTICAL_LABEL_POSITION,
                mxConstants.ALIGN_MIDDLE
              );

              bds = new mxRectangle(
                bds.x + spacingLeft,
                bds.y + spacingTop,
                bds.width -
                  (hpos == mxConstants.ALIGN_CENTER && lw == null
                    ? spacingLeft + spacingRight
                    : 0),
                bds.height -
                  (vpos == mxConstants.ALIGN_MIDDLE
                    ? spacingTop + spacingBottom
                    : 0)
              );
            }

            this.bounds = new mxRectangle(
              bds.x + state.absoluteOffset.x,
              bds.y + state.absoluteOffset.y,
              bds.width,
              bds.height
            );
          }
          this.textarea.style.backgroundColor = "white";
          this.textarea.style.color = "black";
          this.textarea.style.border = "1px solid #0072c6";
          this.textarea.style.boxShadow = "0 0 5px rgb(0 114 198 / 50%)";
          this.textarea.style.padding = "0.5rem";
          this.textarea.style.borderRadius = "2px";
          this.textarea.style.zIndex = "200";
          this.textarea.style.overflow = "hidden";
          this.textarea.style.whiteSpace = "nowrap";
          // Needed for word wrap inside text blocks with oversize lines to match the final result where
          // the width of the longest line is used as the reference for text alignment in the cell
          // TODO: Fix word wrapping preview for edge labels in helloworld.html
          if (
            this.graph.isWrapping(state.cell) &&
            this.textarea &&
            this.textarea.innerHTML != this.getEmptyLabelText() &&
            this.textarea.innerText.length <= maxLabelCharacter &&
            this.bounds &&
            (this.bounds.width >= 2 || this.bounds.height >= 2)
          ) {
            this.textarea.style.wordWrap = mxConstants.WORD_WRAP;
            // this.textarea.style.whiteSpace = "normal";

            // Forces automatic reflow if text is removed from an oversize label and normal word wrap
            var tmp =
              Math.round(
                this.bounds.width / (document.documentMode == 8 ? scale : scale)
              ) + this.wordWrapPadding;

            if (this.textarea.style.position != "relative") {
              this.textarea.style.width = tmp + "px";

              if (this.textarea.scrollWidth > tmp) {
                this.textarea.style.width = this.textarea.scrollWidth + "px";
              }
            } else {
              if (state.cell.style === style.milestone) {
                this.textarea.style.maxWidth = gridSize * 6 + "px";
                this.textarea.style.height = gridSize * 0.8 + "px";
              } else if (state.cell.style.includes(style.swimlane)) {
                this.textarea.style.maxWidth = gridSize * 6 + "px";
                this.textarea.style.height = gridSize * 0.8 + "px";
              } else if (this.graph.getModel().isVertex(state.cell)) {
                this.textarea.style.maxWidth = gridSize * 4 + "px";
                this.textarea.style.height = gridSize * 0.8 + "px";
              } else {
                this.textarea.style.maxWidth = tmp + "px";
              }
            }
          } else {
            // KNOWN: Trailing cursor in IE9 quirks mode is not visible
            this.textarea.style.whiteSpace = "nowrap";
            this.textarea.style.width = "";
          }

          // LATER: Keep in visible area, add fine tuning for pixel precision
          // Workaround for wrong measuring in IE8 standards
          if (document.documentMode == 8) {
            this.textarea.style.zoom = "1";
            this.textarea.style.height = "auto";
          }

          var ow = this.textarea.scrollWidth;
          var oh = this.textarea.scrollHeight;

          // TODO: Update CSS width and height if smaller than minResize or remove minResize
          //if (this.minResize != null)
          //{
          //	ow = Math.max(ow, this.minResize.width);
          //	oh = Math.max(oh, this.minResize.height);
          //}

          // LATER: Keep in visible area, add fine tuning for pixel precision
          if (document.documentMode == 8) {
            // LATER: Scaled wrapping and position is wrong in IE8
            this.textarea.style.left =
              Math.max(
                0,
                Math.ceil(
                  (this.bounds.x -
                    m.x * (this.bounds.width - (ow + 1) * scale) +
                    ow * (scale - 1) * 0 +
                    (m.x + 0.5) * 2) /
                    scale
                )
              ) + "px";
            this.textarea.style.top =
              Math.max(
                0,
                Math.ceil(
                  (this.bounds.y -
                    m.y * (this.bounds.height - (oh + 0.5) * scale) +
                    oh * (scale - 1) * 0 +
                    Math.abs(m.y + 0.5) * 1) /
                    scale
                )
              ) + "px";
            // Workaround for wrong event handling width and height
            this.textarea.style.width = Math.round(ow * scale) + "px";
            this.textarea.style.height = Math.round(oh * scale) + "px";
          } else if (mxClient.IS_QUIRKS) {
            this.textarea.style.left =
              Math.max(
                0,
                Math.ceil(
                  this.bounds.x -
                    m.x * (this.bounds.width - (ow + 1) * scale) +
                    ow * (scale - 1) * 0 +
                    (m.x + 0.5) * 2
                )
              ) + "px";
            this.textarea.style.top =
              Math.max(
                0,
                Math.ceil(
                  this.bounds.y -
                    m.y * (this.bounds.height - (oh + 0.5) * scale) +
                    oh * (scale - 1) * 0 +
                    Math.abs(m.y + 0.5) * 1
                )
              ) + "px";
          } else {
            if (state.cell.style.includes(style.swimlane)) {
              this.textarea.style.left =
                Math.max(0, Math.round(this.bounds.x)) + "px";
              this.textarea.style.top =
                Math.max(
                  0,
                  Math.round(
                    this.bounds.y + state.cell.geometry.height / 2 - gridSize
                  )
                ) + "px";
            } else {
              this.textarea.style.left =
                Math.max(
                  0,
                  Math.round(this.bounds.x - m.x * (this.bounds.width - 2)) + 1
                ) + "px";
              this.textarea.style.top =
                Math.max(
                  0,
                  Math.round(
                    this.bounds.y -
                      m.y * (this.bounds.height - 4) +
                      (m.y == -1 ? 3 : 0)
                  ) + 1
                ) + "px";
            }
          }
        }

        if (mxClient.IS_VML) {
          this.textarea.style.zoom = scale;
        } else {
          mxUtils.setPrefixedStyle(
            this.textarea.style,
            "transformOrigin",
            "0px 0px"
          );
          if (!state.cell.style.includes(style.swimlane)) {
            mxUtils.setPrefixedStyle(
              this.textarea.style,
              "transform",
              "scale(" +
                scale +
                "," +
                scale +
                ")" +
                (m == null
                  ? ""
                  : " translate(" + m.x * 100 + "%," + m.y * 100 + "%)")
            );
          } else {
            mxUtils.setPrefixedStyle(
              this.textarea.style,
              "transform",
              "scale(" +
                scale +
                "," +
                scale +
                ")" +
                (m == null ? "" : " translate(" + -15 + "%," + 15 + "%)")
            );
          }
        }

        let text = this.textarea;
        if (text) {
          mxEvent.addListener(text, "keypress", function (evt) {
            // code edited on 7 Jan 2022 for BugId 121450
            let newCell = new mxCell(
              text.innerText,
              state.cell.geometry,
              state.cell.style
            );
            if (!FieldValidations(evt, 180, newCell, 30, true)) {
              mxEvent.consume(evt);
            }
          });
        }
      }
    }
  };

  /**
   * Function: stopEditing
   *
   * Stops the editor and applies the value if cancel is false.
   */
  graph.cellEditor.stopEditing = function (cancel, revert) {
    cancel = cancel || false;
    revert = revert || false;
    hideRenameIcons();
    hideIcons();
    removeToolDivCell();
    removeLaneContextMenu();
    removeMileContextMenu();
    removeContextMenu();

    if (this.editingCell != null) {
      if (this.textNode != null) {
        this.textNode.style.visibility = "visible";
        this.textNode = null;
      }

      var state = !cancel ? this.graph.view.getState(this.editingCell) : null;

      var initial = this.initialValue;
      this.initialValue = null;
      this.editingCell = null;
      this.trigger = null;
      this.bounds = null;
      this.textarea.blur();
      this.clearSelection();

      if (this.textarea.parentNode != null) {
        this.textarea.parentNode.removeChild(this.textarea);
      }

      if (
        this.clearOnChange &&
        this.textarea.innerHTML == this.getEmptyLabelText()
      ) {
        this.textarea.innerHTML = "";
        this.clearOnChange = false;
      }

      if (
        state != null &&
        (this.textarea.innerHTML != initial || this.align != null) &&
        !revert
      ) {
        this.prepareTextarea();
        let value = this.getCurrentValue(state);
        // added on 14/10/23 for BugId 139370
        value = getNameWithoutBreak(value);
        var [isValid, message] = nameValidity(
          graph,
          value,
          state.cell,
          translation
        );

        if (value != null && isValid === true) {
          //this.applyValue(state, value);
          let id = state.cell.getId();
          if (graph.isSwimlane(state.cell)) {
            let horizontal = graph
              .getStylesheet()
              .getCellStyle(state.cell.getStyle())[
              mxConstants.STYLE_HORIZONTAL
            ];

            if (horizontal) {
              //cell edited is milestone
              let oldMilestoneName,
                processDefId,
                mileNameExists = false,
                errorMsg = "";
              setProcessData((prevProcessData) => {
                prevProcessData.MileStones?.forEach((milestone) => {
                  if (
                    milestone.MileStoneName?.toLowerCase() ===
                      value?.toLowerCase() &&
                    !mileNameExists
                  ) {
                    mileNameExists = true;
                    errorMsg = translation("entitySameNameError", {
                      entityName: translation("milestoneName"),
                    });
                  } else if (!mileNameExists) {
                    milestone?.Activities?.forEach((act) => {
                      if (
                        act.ActivityName?.toLowerCase() ===
                          value?.toLowerCase() &&
                        !mileNameExists
                      ) {
                        mileNameExists = true;
                        errorMsg = translation("entity1_SameEntity2NameError", {
                          Entity1: translation("SegmentName"),
                          Entity2: translation("Activity"),
                        });
                      }
                    });
                  }
                });
                if (!mileNameExists) {
                  prevProcessData.Lanes?.forEach((swimlane) => {
                    if (
                      swimlane.LaneName?.toLowerCase() ===
                        value?.toLowerCase() &&
                      !mileNameExists
                    ) {
                      mileNameExists = true;
                      errorMsg = translation("entity1_SameEntity2NameError", {
                        Entity1: translation("SegmentName"),
                        Entity2: translation("swimlaneName"),
                      });
                    }
                  });
                }
                return prevProcessData;
              });
              // code edited on 6 Dec 2022 for BugId 119955
              if (!mileNameExists) {
                setProcessData((prevProcessData) => {
                  let newProcessData = JSON.parse(
                    JSON.stringify(prevProcessData)
                  );
                  newProcessData.MileStones.forEach((milestone, idx) => {
                    if (milestone.iMileStoneId === id) {
                      oldMilestoneName = milestone.MileStoneName;
                      newProcessData.MileStones[idx].MileStoneName = value;
                    }
                  });
                  processDefId = newProcessData.ProcessDefId;
                  return newProcessData;
                });
                renameMilestone(
                  id,
                  oldMilestoneName,
                  value,
                  setProcessData,
                  processDefId,
                  true
                );
              } else {
                dispatch(
                  setToastDataFunc({
                    message: errorMsg,
                    severity: "error",
                    open: true,
                  })
                );
              }
            } else {
              //cell edited is swimlane
              let oldLaneName,
                queueId,
                processDefId,
                processName,
                laneNameExists = false,
                errorMsg = "";
              setProcessData((prevProcessData) => {
                prevProcessData.MileStones?.forEach((milestone) => {
                  if (
                    milestone.MileStoneName?.toLowerCase() ===
                      value?.toLowerCase() &&
                    !laneNameExists
                  ) {
                    laneNameExists = true;
                    errorMsg = translation("entity1_SameEntity2NameError", {
                      Entity1: translation("LaneName"),
                      Entity2: translation("milestoneName"),
                    });
                  } else if (!laneNameExists) {
                    milestone?.Activities?.forEach((act) => {
                      if (
                        act.ActivityName?.toLowerCase() ===
                          value?.toLowerCase() &&
                        !laneNameExists
                      ) {
                        laneNameExists = true;
                        errorMsg = translation("entity1_SameEntity2NameError", {
                          Entity1: translation("LaneName"),
                          Entity2: translation("Activity"),
                        });
                      }
                    });
                  }
                });
                //code added on 30 JAN 2023 for BugId 122088
                if (!laneNameExists) {
                  prevProcessData.Lanes?.forEach((swimlane) => {
                    if (
                      swimlane.LaneName?.toLowerCase().trim() ===
                        value?.toLowerCase().trim() &&
                      !laneNameExists
                    ) {
                      laneNameExists = true;
                      errorMsg = translation("entitySameNameError", {
                        entityName: translation("swimlaneName"),
                      });
                    }
                  });
                }
                return prevProcessData;
              });
              if (!laneNameExists) {
                setProcessData((prevProcessData) => {
                  let newProcessData = JSON.parse(
                    JSON.stringify(prevProcessData)
                  );
                  newProcessData.Lanes.forEach((swimlane, idx) => {
                    if (swimlane.LaneId === id) {
                      oldLaneName = swimlane.LaneName;
                      queueId = swimlane.QueueId;
                      newProcessData.Lanes[idx].LaneName = value;
                    }
                  });
                  processDefId = newProcessData.ProcessDefId;
                  processName = newProcessData.ProcessName;
                  return newProcessData;
                });
                renameSwimlane(
                  id,
                  oldLaneName,
                  value,
                  queueId,
                  setProcessData,
                  processDefId,
                  processName,
                  translation,
                  true
                );
              } else {
                dispatch(
                  setToastDataFunc({
                    message: errorMsg,
                    severity: "error",
                    open: true,
                  })
                );
              }
            }
          } else {
            if (
              state.cell.getStyle() === style.taskTemplate ||
              state.cell.getStyle() === style.newTask ||
              state.cell.getStyle() === style.processTask
            ) {
              //cell edited is task
              let oldTaskName,
                processDefId,
                taskNameExists = false,
                errorMsg = "";
              setProcessData((prevProcessData) => {
                prevProcessData.Tasks.forEach((task) => {
                  if (
                    task.TaskName?.toLowerCase() === value?.toLowerCase() &&
                    !taskNameExists
                  ) {
                    taskNameExists = true;
                    errorMsg = translation("entitySameNameError", {
                      entityName: translation("task"),
                    });
                  }
                });
                return prevProcessData;
              });
              if (!taskNameExists) {
                setProcessData((prevProcessData) => {
                  let newProcessData = JSON.parse(
                    JSON.stringify(prevProcessData)
                  );
                  newProcessData.Tasks.forEach((task, idx) => {
                    if (task.TaskId === id) {
                      oldTaskName = task.TaskName;
                      newProcessData.Tasks[idx].TaskName = value;
                    }
                  });
                  processDefId = prevProcessData.ProcessDefId;
                  return newProcessData;
                });
                renameTask(id, oldTaskName, value, processDefId);
              } else {
                dispatch(
                  setToastDataFunc({
                    message: errorMsg,
                    severity: "error",
                    open: true,
                  })
                );
              }
            } else if (
              state.cell.getStyle() !== style.taskTemplate &&
              state.cell.getStyle() !== style.newTask &&
              state.cell.getStyle() !== style.processTask &&
              !artifacts.includes(state.cell.getStyle())
            ) {
              //cell edited is activity
              let oldActName,
                queueId,
                processDefId,
                processName,
                isSwimlaneQueue,
                actNameExists = false,
                errorMsg = "",
                actType,
                actSubType,
                newProcessData = {};
              let queueInfo = {};

              setProcessData((prevProcessData) => {
                prevProcessData.MileStones?.forEach((milestone) => {
                  if (
                    milestone.MileStoneName?.toLowerCase() ===
                      value?.toLowerCase() &&
                    !actNameExists
                  ) {
                    actNameExists = true;
                    errorMsg = translation("entity1_SameEntity2NameError", {
                      Entity1: translation("ActivityName"),
                      Entity2: translation("milestoneName"),
                    });
                  } else if (!actNameExists) {
                    milestone?.Activities?.forEach((act) => {
                      if (
                        act.ActivityName?.toLowerCase() ===
                          value?.toLowerCase() &&
                        !actNameExists
                      ) {
                        actNameExists = true;
                        errorMsg = translation("entitySameNameError", {
                          entityName: translation("Activity"),
                        });
                      }
                      if (
                        act.EmbeddedActivity &&
                        act.EmbeddedActivity?.length > 0
                      ) {
                        act.EmbeddedActivity[0]?.forEach((embAct) => {
                          if (
                            embAct.ActivityName?.toLowerCase() ===
                              value?.toLowerCase() &&
                            !actNameExists
                          ) {
                            actNameExists = true;
                            errorMsg = translation("entitySameNameError", {
                              entityName: translation("Activity"),
                            });
                          }
                        });
                      }
                    });
                  }
                });
                if (!actNameExists) {
                  prevProcessData.Lanes?.forEach((swimlane) => {
                    if (
                      swimlane.LaneName?.toLowerCase() ===
                        value?.toLowerCase() &&
                      !actNameExists
                    ) {
                      actNameExists = true;
                      errorMsg = translation("entity1_SameEntity2NameError", {
                        Entity1: translation("ActivityName"),
                        Entity2: translation("swimlaneName"),
                      });
                    }
                  });
                }
                return prevProcessData;
              });
              if (!actNameExists) {
                // code added on 22 July 2022 for BugId 113305
                setProcessData((prevProcessData) => {
                  newProcessData = JSON.parse(JSON.stringify(prevProcessData));
                  newProcessData.MileStones.forEach((milestone, idx) => {
                    milestone.Activities.forEach((activity, actidx) => {
                      if (activity.ActivityId === id) {
                        queueInfo = getRenameActivityQueueObj(
                          activity.ActivityType,
                          activity.ActivitySubType,
                          value,
                          newProcessData,
                          activity.QueueId,
                          translation
                        );
                        oldActName = activity.ActivityName;
                        actType = activity.ActivityType; // added on 28/09/23 for BugId 136079
                        actSubType = activity.ActivitySubType; // added on 28/09/23 for BugId 136079
                        queueId = activity.QueueId;
                        newProcessData.MileStones[idx].Activities[
                          actidx
                        ].ActivityName = value;
                        if (
                          checkIfParentSwimlaneCheckedOut(
                            newProcessData,
                            activity.LaneId
                          )?.length > 0
                        ) {
                          if (
                            newProcessData.MileStones[idx].Activities[actidx]
                              .status !== "I"
                          ) {
                            newProcessData.MileStones[idx].Activities[
                              actidx
                            ].status = "U";
                          }
                          newProcessData.SwimlaneCheckinChanges = true;
                        }
                      } else if (
                        +activity.ActivityType === 35 &&
                        +activity.ActivitySubType === 1 &&
                        activity.EmbeddedActivity &&
                        activity.EmbeddedActivity?.length > 0
                      ) {
                        activity.EmbeddedActivity[0]?.forEach(
                          (embAct, embIdx) => {
                            if (+embAct.ActivityId === +id) {
                              queueInfo = getRenameActivityQueueObj(
                                embAct.ActivityType,
                                embAct.ActivitySubType,
                                value,
                                newProcessData,
                                embAct.QueueId,
                                translation
                              );
                              oldActName = embAct.ActivityName;
                              actType = embAct.ActivityType; // added on 28/09/23 for BugId 136079
                              actSubType = embAct.ActivitySubType; // added on 28/09/23 for BugId 136079
                              queueId = embAct.QueueId;
                              newProcessData.MileStones[idx].Activities[
                                actidx
                              ].EmbeddedActivity[0][embIdx].ActivityName =
                                value;
                              if (
                                checkIfParentSwimlaneCheckedOut(
                                  newProcessData,
                                  activity.LaneId
                                )?.length > 0
                              ) {
                                if (
                                  newProcessData.MileStones[idx].Activities[
                                    actidx
                                  ].EmbeddedActivity[0][embIdx].status !== "I"
                                ) {
                                  newProcessData.MileStones[idx].Activities[
                                    actidx
                                  ].EmbeddedActivity[0][embIdx].status = "U";
                                }
                                newProcessData.SwimlaneCheckinChanges = true;
                              }
                            }
                          }
                        );
                      }
                    });
                  });
                  if (!queueInfo.queueExist) {
                    newProcessData.Queue?.forEach((el, index) => {
                      if (+queueId === +el.QueueId) {
                        newProcessData.Queue[index].QueueName =
                          queueInfo?.queueName;
                        newProcessData.Queue[index].QueueDescription =
                          queueInfo?.QueueDescription;
                      }
                    });
                  }
                  const index = newProcessData.Lanes?.findIndex(
                    (swimlane) => +swimlane.QueueId === +queueId
                  );
                  isSwimlaneQueue = index !== -1;
                  processDefId = prevProcessData.ProcessDefId;
                  processName = prevProcessData.ProcessName;
                  return newProcessData;
                });
                if (checkIfSwimlaneCheckedOut(newProcessData)?.length === 0) {
                  if (queueId && queueId < 0) {
                    if (
                      isSwimlaneQueue ||
                      checkIfActHasSystemQueue(actType, actSubType) // added on 28/09/23 for BugId 136079
                    ) {
                      renameActivity(
                        id,
                        oldActName,
                        value,
                        setProcessData,
                        processDefId,
                        processName,
                        queueId,
                        queueInfo,
                        true,
                        false, //queue rename will be false because it is swimlane queue
                        dispatch,
                        translation
                      );
                    } else if (
                      !isSwimlaneQueue &&
                      !checkIfActHasSystemQueue(actType, actSubType) // added on 28/09/23 for BugId 136079
                    ) {
                      dispatch(
                        setRenameActivityData({
                          actId: id,
                          oldActName,
                          newActivityName: value,
                          setProcessData,
                          processDefId,
                          processName,
                          queueId,
                          queueInfo,
                          isBpmn: true,
                        })
                      );
                      dispatch(setQueueRenameModalOpen(true));
                    }
                  } else {
                    renameActivity(
                      id,
                      oldActName,
                      value,
                      setProcessData,
                      processDefId,
                      processName,
                      queueId,
                      queueInfo,
                      true,
                      false, //queue rename will be false because it is swimlane queue
                      dispatch,
                      translation
                    );
                  }
                }
              } else {
                dispatch(
                  setToastDataFunc({
                    message: errorMsg,
                    severity: "error",
                    open: true,
                  })
                );
              }
            } else if (artifacts.includes(state.cell.getStyle())) {
              if (state.cell.getStyle() === style.dataObject) {
                let oldDO, processDefId, processState;
                setProcessData((oldProcessData) => {
                  let newProcessData = JSON.parse(
                    JSON.stringify(oldProcessData)
                  );
                  newProcessData.DataObjects = JSON.parse(
                    JSON.stringify(oldProcessData.DataObjects)
                  );
                  processDefId = newProcessData.ProcessDefId;
                  processState = newProcessData.ProcessType;
                  newProcessData.DataObjects = newProcessData.DataObjects.map(
                    (dataObj) => {
                      if (dataObj.DataObjectId === id) {
                        oldDO = dataObj;
                        dataObj.Data = value;
                      }
                      return dataObj;
                    }
                  );
                  return newProcessData;
                });
                ModifyDataObject(
                  processDefId,
                  processState,
                  value,
                  oldDO.DataObjectId,
                  oldDO.xLeftLoc,
                  oldDO.yTopLoc,
                  oldDO.LaneId,
                  setProcessData,
                  oldDO.Data
                );
              } else if (state.cell.getStyle() === style.message) {
                let oldMsg, processDefId, processState;
                setProcessData((oldProcessData) => {
                  let newProcessData = JSON.parse(
                    JSON.stringify(oldProcessData)
                  );
                  newProcessData.MSGAFS = JSON.parse(
                    JSON.stringify(oldProcessData.MSGAFS)
                  );
                  processDefId = newProcessData.ProcessDefId;
                  processState = newProcessData.ProcessType;
                  newProcessData.MSGAFS = newProcessData.MSGAFS.map((msg) => {
                    if (msg.MsgAFId === id) {
                      oldMsg = msg;
                      msg.MsgAFName = value;
                    }
                    return msg;
                  });
                  return newProcessData;
                });
                ModifyMsgAF(
                  processDefId,
                  processState,
                  value,
                  oldMsg.MsgAFId,
                  oldMsg.xLeftLoc,
                  oldMsg.yTopLoc,
                  oldMsg.LaneId,
                  setProcessData,
                  oldMsg.MsgAFName
                );
              }
            }
          }
        }
        // code edited on 3 Nov 2022 for BugId 118320
        if (isValid === false && message !== null) {
          dispatch(
            setToastDataFunc({
              message: message,
              severity: "error",
              open: true,
            })
          );
        }
      }

      // Forces new instance on next edit for undo history reset
      mxEvent.release(this.textarea);
      this.textarea = null;
      this.align = null;
    }
  };
}
