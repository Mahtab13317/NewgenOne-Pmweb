import { integrationPoints } from "../../bpmnView/toolboxIcon";
// This function removes the activities that are not included from the activities object when process is not SAP enabled.
export const getSapEnabledActivities = (sapEnabled, removeActivities, sharePointEnabled, sharePointActivityArr) => {
  let filteredActivities;
  let filteredTools;
  let tempArray = {};
  tempArray = { ...integrationPoints };
  if (sapEnabled === false) {
    removeActivities.forEach((element) => {
      filteredTools = tempArray.tools?.filter((activity) => {
        return activity !== element;
      });
    });

    tempArray.tools = filteredTools;
  }
  if (sharePointEnabled === false) {
    sharePointActivityArr.forEach((element) => {
      filteredTools = tempArray.tools?.filter((activity) => {
        return activity !== element;
      });
    });

    tempArray.tools = filteredTools;
  }

  filteredActivities = tempArray;
  return filteredActivities;
};
