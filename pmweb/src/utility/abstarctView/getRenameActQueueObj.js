export function getRenameActivityQueueObj(
  activityType,
  activitySubType,
  activityName,
  processData,
  queueId,
  t
) {
  let queueObj = {};
  processData?.Queue?.forEach((el) => {
    if (+el.QueueId === +queueId) {
      queueObj = {
        queueId: el.QueueId,
        queueName: el.QueueName,
        queueDesc: el.QueueDescription,
        oldQueueName: el.QueueName,
        oldQueueDesc: el.QueueDescription,
        sortOrder: el.SortOrder,
        orderBy: el.OrderBy,
        refreshInterval: el.RefreshInterval,
        allowReassignment: el.AllowReassignment,
        queueType: el.QueueType,
      };
    }
  });

  if (
    (+activityType === 1 && +activitySubType === 1) ||
    (+activityType === 1 && +activitySubType === 2) ||
    (+activityType === 1 && +activitySubType === 3) ||
    (+activityType === 1 && +activitySubType === 7) ||
    (+activityType === 32 && +activitySubType === 1) ||
    (+activityType === 11 && +activitySubType === 1) ||
    (+activityType === 33 && +activitySubType === 1) ||
    (+activityType === 27 && +activitySubType === 1) ||
    (+activityType === 19 && +activitySubType === 1) ||
    (+activityType === 21 && +activitySubType === 1) ||
    (+activityType === 4 && +activitySubType === 1)
  ) {
    /*start event, conditional start, receive, message start, case workdesk, query, oms adapter, event, jms producer, jms consumer, timer event*/
    queueObj = {
      ...queueObj,
      queueName: `${processData.ProcessName}_${activityName}`,
      queueDesc: `${t("DefaultQueueComment")} ${activityName}`,
      queueExist: false,
    };
  } else if (
    (+activityType === 1 && +activitySubType === 6) ||
    (+activityType === 18 && +activitySubType === 1) ||
    (+activityType === 20 && +activitySubType === 1) ||
    (+activityType === 5 && +activitySubType === 1) ||
    (+activityType === 5 && +activitySubType === 2) ||
    (+activityType === 6 && +activitySubType === 1) ||
    (+activityType === 6 && +activitySubType === 2) ||
    (+activityType === 7 && +activitySubType === 1) ||
    (+activityType === 2 && +activitySubType === 1) ||
    (+activityType === 3 && +activitySubType === 1) ||
    (+activityType === 2 && +activitySubType === 2) ||
    (+activityType === 35 && +activitySubType === 1)
  ) {
    /*timer start, call activity, export, inclusive distribute, parallel distribute, inclusive collect, 
    parallel collect, data based exclusive, end event, terminate event, message end, embedded subprocess*/
    // code added on 3 August 2022 for BugId 113803
    return { queueId: 0, queueExist: false };
  } else if (
    (+activityType === 22 && +activitySubType === 1) ||
    (+activityType === 31 && +activitySubType === 1) ||
    (+activityType === 34 && +activitySubType === 1) ||
    (+activityType === 10 && +activitySubType === 4) ||
    (+activityType === 10 && +activitySubType === 1) ||
    (+activityType === 30 && +activitySubType === 1) ||
    (+activityType === 29 && +activitySubType === 1)
  ) {
    //webservice, businessRule, dataExchange, dms adapter, email, sharepoint, sap adapter
    // code added on 3 August 2022 for BugId 113803
    queueObj = { queueId: queueId, queueExist: true };
  } else {
    // code added on 3 August 2022 for BugId 113803
    let isLaneQueueSame = false;
    processData?.Lanes?.forEach((lane) => {
      if (+lane.QueueId === +queueId) {
        isLaneQueueSame = true;
      }
    });

    if (isLaneQueueSame) {
      queueObj = {
        queueId: queueId,
        queueExist: true,
      };
    } else {
      queueObj = {
        ...queueObj,
        queueName: `${processData.ProcessName}_${activityName}`,
        queueDesc: `${t("DefaultQueueComment")} ${activityName}`,
        queueExist: false,
      };
    }
  }
  return queueObj;
}
