import { activities, startEvents } from "../../bpmnView/toolboxIcon";
// This function removes the activities that are not included from the activities object when process is not case enabled.
export const getCaseEnabledActivities = (
  caseEnabled,
  removeActivities,
  activityList
) => {
  let filteredActivities;
  let tempArray = {};
  tempArray = { ...activityList };
  let filteredTools = [...tempArray.tools];
  if (caseEnabled === false) {
    removeActivities.forEach((element) => {
      filteredTools = filteredTools?.filter((activity) => {
        return activity !== element;
      });
    });

    tempArray.tools = filteredTools;
  }
  filteredActivities = tempArray;
  return filteredActivities;
};

export const getStartEvents = (conditionalFlag, removeActivities) => {
  let filteredActivities;
  let filteredTools;
  let tempArray = {};
  tempArray = { ...startEvents };
  if (conditionalFlag === false) {
    removeActivities.forEach((element) => {
      filteredTools = tempArray.tools?.filter((activity) => {
        return activity !== element;
      });
    });

    tempArray.tools = filteredTools;
  }
  filteredActivities = tempArray;
  return filteredActivities;
};

// This function removes the activities that are not included from the activities object, in case of embedded subprocess
export const getEmbeddedActivities = (removeActivities) => {
  let filteredActivities;
  let filteredTools;
  let tempArray = {};
  tempArray = { ...activities };
  removeActivities.forEach((element) => {
    filteredTools = tempArray.tools?.filter((activity) => {
      return activity !== element;
    });
  });
  tempArray.tools = filteredTools;
  filteredActivities = tempArray;
  return filteredActivities;
};
