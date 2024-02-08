import { artifacts, style } from "../../Constants/bpmnView";
import { getSelectedCellType } from "../abstarctView/getSelectedCellType";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxConstants = mxgraphobj.mxConstants;

export function getSelectedCell(graph, processData) {
  let selectedCells = graph.getSelectionCells();
  let selectedCellValue = null;
  if (selectedCells?.length > 0) {
    selectedCells.forEach((cell) => {
      if (graph.isSwimlane(cell) === false) {
        //don't select swimlane /milestone add button
        let id = cell.getId();
        if (cell.isVertex()) {
          if (
            cell.getStyle() === style.taskTemplate ||
            cell.getStyle() === style.newTask ||
            cell.getStyle() === style.processTask
          ) {
            let selectedTask = null;
            processData.Tasks?.forEach((task) => {
              if (task.TaskId === id) {
                selectedTask = task;
              }
            });

            if (selectedTask !== null) {
              selectedCellValue = {
                id: selectedTask.TaskId,
                name: selectedTask.TaskName,
                taskType: selectedTask.StrTaskType, // code edited on 3 Oct 2022 for BugId 116511
                type: getSelectedCellType("TASK"),
              };
            }
          } else if (
            cell.getStyle() !== style.taskTemplate &&
            cell.getStyle() !== style.newTask &&
            cell.getStyle() !== style.processTask &&
            !artifacts.includes(cell.getStyle())
          ) {
            let selectedActivity = null;
            processData.MileStones?.forEach((mile) => {
              mile.Activities?.forEach((activity) => {
                if (activity.ActivityId === id) {
                  selectedActivity = activity;
                } else if (
                  +activity.ActivityType === 35 &&
                  +activity.ActivitySubType === 1
                ) {
                  activity.EmbeddedActivity[0]?.forEach((act) => {
                    if (act.ActivityId === id) {
                      selectedActivity = act;
                    }
                  });
                }
              });
            });

            if (selectedActivity !== null) {
              selectedCellValue = {
                id: selectedActivity.ActivityId,
                name: selectedActivity.ActivityName,
                activityType: selectedActivity.ActivityType,
                activitySubType: selectedActivity.ActivitySubType,
                seqId: null,
                queueId: selectedActivity.QueueId,
                type: getSelectedCellType("ACTIVITY"),
                checkedOut: selectedActivity.CheckedOut,
                laneId: selectedActivity.LaneId,
              };
            }
          } else if (artifacts.includes(cell.getStyle())) {
            selectedCellValue = {
              id: null,
              name: null,
              activityType: null,
              activitySubType: null,
              seqId: null,
              queueId: null,
              type: getSelectedCellType("ARTIFACTS"),
              checkedOut: null,
              laneId: null,
            };
          }
        } else if (cell.isEdge()) {
          selectedCellValue = {
            id: null,
            name: null,
            activityType: null,
            activitySubType: null,
            seqId: null,
            queueId: null,
            type: getSelectedCellType("EDGE"),
            checkedOut: null,
            laneId: null,
          };
        }
      } else {
        [cell].forEach((cellItem) => {
          let id = cellItem.getId();
          let horizontal = graph
            .getStylesheet()
            .getCellStyle(cellItem.getStyle())[mxConstants.STYLE_HORIZONTAL];
          if (horizontal) {
            //cell to be selected is milestone
            let selectedMile = processData.MileStones?.filter(
              (mile) => +mile.iMileStoneId === +id
            );
            if (selectedMile[0]) {
              selectedCellValue = {
                id: selectedMile[0].iMileStoneId,
                name: selectedMile[0].MileStoneName,
                activityType: null,
                activitySubType: null,
                seqId: selectedMile[0].SequenceId,
                queueId: null,
                type: getSelectedCellType("MILE"),
                checkedOut: false,
                laneId: null,
              };
            }
          } else {
            //cell to be selected is swimlane
            console.log("i am swimlane")
          }
        });
      }
    });
  }
  return selectedCellValue;
}
