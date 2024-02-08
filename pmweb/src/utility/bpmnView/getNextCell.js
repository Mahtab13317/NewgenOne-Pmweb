import {
  startEvents,
  activities,
  intermediateEvents,
  gateway,
  endEvents,
  integrationPoints,
  artefacts,
  jmsProducer,
  workdesk,
  dataExchange,
  endEvent,
  inclusiveDistribute,
  extras,
} from "./toolboxIcon";

function excludeSubsetFromActivityTypes(activityTypeObj, activitiesArray) {
  let newActivityType = { ...activityTypeObj };
  let activitiesSet = new Set();
  activitiesArray.forEach((tool, index) =>
    activitiesSet.add(tool.activitySubType)
  );

  let filterFunction = (tool) => {
    //return 'true' if tool is not part of activitiesArray, else return 'false'
    return !activitiesSet.has(tool.activitySubType);
  };

  let filteredActivities = newActivityType.tools.filter((tool) => {
    return filterFunction(tool);
  });

  return { ...activityTypeObj, tools: filteredActivities };
}

export function getNextCell(cell) {
  let cellObj = null;
  let cellStyle = cell.getStyle();

  let allActivities = [
    startEvents,
    activities,
    intermediateEvents,
    gateway,
    endEvents,
    integrationPoints,
    artefacts,
    extras
  ];

  for (let itr of allActivities) {
    let subActivities = itr.tools;
    for (let itr2 of subActivities) {
      if (cellStyle === itr2.styleName) {
        cellObj = itr2;
      }
    }
  }

  if (cellObj === null) {
    return null;
  }

  let nextCells = [];

  switch (cellObj.activitySubType) {
    default:
      nextCells.push(workdesk);
      nextCells.push(jmsProducer);
      nextCells.push(inclusiveDistribute);
      nextCells.push(endEvent);
      nextCells.push(dataExchange);
  }

  return nextCells;
}
