import { style } from "../../Constants/bpmnView";

//return true if that activity/tool is allowed to drop outside milestone
export const isAllowedOutsideMilestone = (activityStyleName) => {
  switch (activityStyleName) {
    case style.textAnnotations:
      return true;
    case style.message:
      return true;
    case style.dataObject:
      return true;
    default:
      return false;
  }
};

export const dropDirectltyToGraphGlobally = (activityStyleName) => {
  switch (activityStyleName) {
    case style.textAnnotations:
      return true;
    case style.message:
      return true;
    case style.dataObject:
      return true;
    case style.groupBox:
      return true;
    default:
      return false;
  }
};
