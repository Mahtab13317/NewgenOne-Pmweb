import {
  ENDPOINT_GET_QUEUE_ID,
  ENDPOINT_SAVE_QUEUE_DATA,
  SERVER_URL,
} from "../../Constants/appConstants";
import axios from "axios";

export const saveQueueData = (
  processDefId,
  processName,
  activityName,
  activityId,
  activityType,
  activitySubType,
  queueInfo,
  originalQueueInfo,
  onSuccess = () => {
    console.log("please provide onSuccess call fn");
  },
  nextVal
) => {
  let payload = {
    queueName: queueInfo.queueName,
    queueType: queueInfo.queueType,
    queueDesc: queueInfo.queueDesc,
    allowReassignment: queueInfo.allowReassignment,
    orderBy: queueInfo.orderBy,
    sortOrder: queueInfo.sortOrder,
    refreshInterval: queueInfo.refreshInterval,
    queueFilter: "",
    filterOption: "0",
    filterValue: "",
    pMStreamInfo: {
      streamId: 1,
      streamName: activityName,
      activityId: `${activityId}`,
      activityName: activityName,
      processName: processName,
      processDefId: processDefId,
    },
    swimlaneCheckout: true,
  };
  axios
    .post(SERVER_URL + ENDPOINT_SAVE_QUEUE_DATA, payload)
    .then((res) => {
      if (res.data.Status === 0) {
        onSuccess(res.data.QueueId);
      } else if (res.data.SubErrorCode === 812) {
        // for system queues
        //webservice, businessRule, dataExchange, dms adapter, email, sharepoint, sap adapter
        if (
          (+activityType === 22 && +activitySubType === 1) ||
          (+activityType === 31 && +activitySubType === 1) ||
          (+activityType === 34 && +activitySubType === 1) ||
          (+activityType === 10 && +activitySubType === 4) ||
          (+activityType === 10 && +activitySubType === 1) ||
          (+activityType === 30 && +activitySubType === 1) ||
          (+activityType === 29 && +activitySubType === 1)
        ) {
          axios
            .get(
              SERVER_URL +
                ENDPOINT_GET_QUEUE_ID +
                `/${originalQueueInfo.queueName}`
            )
            .then((res) => {
              if (res.status === 200) {
                onSuccess(res.data);
              }
            });
        } else {
          saveQueueData(
            processDefId,
            processName,
            activityName,
            activityId,
            activityType,
            activitySubType,
            {
              ...originalQueueInfo,
              queueName: `${originalQueueInfo.queueName}_${nextVal}`,
              queueDesc: `${originalQueueInfo.queueDesc}_${nextVal}`,
            },
            originalQueueInfo,
            onSuccess,
            nextVal + 1
          );
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
