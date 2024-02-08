import { getActivityProps } from "../../utility/abstarctView/getActivityProps";
import { startVertex } from "../../Constants/bpmnView";

export const noIncomingTypes = ({ ActivityType, ActivitySubType }, t) => {
    let activityTypeNameModified = t(
      getActivityProps(ActivityType, ActivitySubType)[4]
    )
      .replace(/ /g, "")
      .toLowerCase();
    let noIncomingEdgesTypes = startVertex.map((item) => item.toLowerCase());
    if (noIncomingEdgesTypes.includes(activityTypeNameModified)) return false;
    else return true;
  };