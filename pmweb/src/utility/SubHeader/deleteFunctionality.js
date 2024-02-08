import { deleteMilestoneArray } from "../InputForAPICall/deleteMilestoneArray";
import { deleteMilestone } from "../CommonAPICall/DeleteMilestone";
import { deleteActivity } from "../CommonAPICall/DeleteActivity";
import { hideIcons } from "../bpmnView/cellOnMouseClick";
import { removeContextMenu } from "../bpmnView/getContextMenu";
import { removeToolDivCell } from "../bpmnView/getToolDivCell";
import { getSelectedCellType } from "../abstarctView/getSelectedCellType";
import { useDispatch } from "react-redux";

export const deleteFunctionality = (props) => {
  let {
    id,
    name,
    processDefId,
    type,
    setProcessData,
    processData,
    dispatch,
    translation,
    isPrimaryAct,
  } = props;

  hideIcons();
  removeContextMenu();
  removeToolDivCell();
  if (type === getSelectedCellType("MILE")) {
    if (processData.MileStones.length > 1) {
      let mileArray;
      mileArray = deleteMilestoneArray(processData, id);
      deleteMilestone(
        id,
        setProcessData,
        processDefId,
        mileArray.array,
        mileArray.index
      );
    } else {
      alert("last milestone cannot be deleted");
    }
  } else if (type === getSelectedCellType("ACTIVITY")) {
    deleteActivity(
      id,
      name,
      processDefId,
      setProcessData,
      processData?.CheckedOut,
      dispatch,
      translation,
      isPrimaryAct
    );
  }
};
