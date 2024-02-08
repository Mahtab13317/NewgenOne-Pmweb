import {
  startEvents,
  activities,
  intermediateEvents,
  gateway,
  endEvents,
  integrationPoints,
  artefacts,
  responseConsumerJMS,
  responseConsumerSOAP,
  requestConsumerSOAP,
  restful,
} from "../../utility/bpmnView/toolboxIcon";

//get activity by activityTypeId and activitySubTypeId
export function getActivityById(activityTypeId, activityTypeSubId) {
  if (activityTypeId === null || activityTypeSubId === null) {
    return null;
  }

  let allActivities = [
    startEvents,
    activities,
    intermediateEvents,
    gateway,
    integrationPoints,
    endEvents,
  ];

  for (let itr of allActivities) {
    let subActivities = itr.tools;
    for (let itr2 of subActivities) {
      if (
        activityTypeId === itr2.activityTypeId &&
        activityTypeSubId === itr2.activitySubTypeId
      ) {
        return itr2;
      }
    }
  }

  let webServiceArray = [
    responseConsumerJMS,
    responseConsumerSOAP,
    requestConsumerSOAP,
    restful,
  ];

  for (let itr2 of webServiceArray) {
    if (
      activityTypeId === itr2.activityTypeId &&
      activityTypeSubId === itr2.activitySubTypeId
    ) {
      return itr2;
    }
  }

  return null;
}

//get activity by activityType string value
export function getActivityByActivityTypeString(activityType) {
  if (activityType === null) {
    return null;
  }

  let allActivities = [
    startEvents,
    activities,
    intermediateEvents,
    gateway,
    endEvents,
    integrationPoints,
    artefacts,
  ];

  for (let itr of allActivities) {
    let subActivities = itr.tools;
    for (let itr2 of subActivities) {
      if (activityType === itr2.activitySubType) {
        return itr2;
      }
    }
  }

  return null;
}

export function getActivityByStyleName(activityStyleName) {
  if (activityStyleName === null) {
    return null;
  }

  let allActivities = [
    startEvents,
    activities,
    intermediateEvents,
    gateway,
    integrationPoints,
    endEvents,
  ];

  for (let itr of allActivities) {
    let subActivities = itr.tools;
    for (let itr2 of subActivities) {
      if (activityStyleName === itr2.styleName) {
        return itr2;
      }
    }
  }

  return null;
}
