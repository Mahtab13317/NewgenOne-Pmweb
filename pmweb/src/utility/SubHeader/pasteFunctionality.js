import { defaultShapeVertex, graphGridSize } from "../../Constants/bpmnView";
import { milestoneWidthToIncrease } from "../abstarctView/addWorkstepAbstractView";
import { getActivityProps } from "../abstarctView/getActivityProps";
import { getActivityQueueObj } from "../abstarctView/getActivityQueueObj";
import { PasteActivity } from "../CommonAPICall/PasteActivity";
import { PasteEmbeddedActivity } from "../CommonAPICall/PasteEmbeddedActivity";

export const pasteFunctionality = (props) => {
  let {
    id,
    name,
    activityType,
    activitySubType,
    setProcessData,
    processData,
    setNewId,
    t,
  } = props;

  let MaxseqId = 0,
    maxActivityId = 0,
    mileWidth = 0,
    mileId = null,
    prevXLeftLoc = 0,
    prevYTop = 0;
  let mIndex = null;
  let LaneId = null;
  let embeddedObj = [];
  processData.MileStones.forEach((mile, idx) => {
    mile.Activities.forEach((act) => {
      if (act.ActivityId === id) {
        mIndex = idx;
        mileId = mile.iMileStoneId;
        LaneId = act.LaneId;
        prevYTop = act.yTopLoc;
        prevXLeftLoc = act.xLeftLoc;
      }
    });
  });
  processData.MileStones.forEach((mile, index) => {
    mile.Activities.forEach((activity) => {
      if (+activity.SequenceId > +MaxseqId && mIndex === index) {
        MaxseqId = +activity.SequenceId;
      }
      if (+maxActivityId < +activity.ActivityId) {
        maxActivityId = +activity.ActivityId;
      }
      if (activity.EmbeddedActivity) {
        activity.EmbeddedActivity[0].forEach((embAct) => {
          if (+embAct.SequenceId > +MaxseqId && mIndex === index) {
            MaxseqId = +embAct.SequenceId;
          }
          if (+maxActivityId < +embAct.ActivityId) {
            maxActivityId = +embAct.ActivityId;
          }
        });
      }
    });
    if (index < mIndex) {
      mileWidth = mileWidth + +mile.Width;
    }
  });
  let newActivityName = name + "_" + (maxActivityId + 1);
  let queueInfo = getActivityQueueObj(
    setNewId,
    activityType,
    activitySubType,
    newActivityName,
    processData,
    LaneId,
    t
  );
  //for embeddedSubprocess
  if (+activityType === 35 && +activitySubType === 1) {
    processData.MileStones?.forEach((milestone) => {
      if (milestone.iMileStoneId === mileId) {
        milestone?.Activities?.forEach((activity) => {
          if (activity.ActivityId === id) {
            activity.EmbeddedActivity[0]?.forEach((embAct, index) => {
              let queueInfo = getActivityQueueObj(
                setNewId,
                embAct.ActivityType,
                embAct.ActivitySubType,
                embAct.ActivityName + "_" + (+maxActivityId + index + 2),
                processData,
                LaneId,
                t
              );
              embeddedObj.push({
                processDefId: processData.ProcessDefId,
                processName: processData.ProcessName,
                actName:
                  embAct.ActivityName + "_" + (+maxActivityId + index + 2),
                actId: +maxActivityId + index + 2,
                actType: embAct.ActivityType,
                actSubType: embAct.ActivitySubType,
                actAssocId: 0,
                seqId: +MaxseqId + index + 2,
                laneId: LaneId,
                blockId: 0,
                queueId: queueInfo.queueId,
                queueInfo: queueInfo,
                queueExist: queueInfo.queueExist,
                xLeftLoc: 6 * graphGridSize,
                yTopLoc: 6 * graphGridSize,
                milestoneId: mileId,
                parentActivityId: +maxActivityId + 1,
              });
            });
          }
        });
      }
    });

    PasteEmbeddedActivity(
      processData.ProcessDefId,
      processData.ProcessName,
      {
        name: newActivityName,
        id: +maxActivityId + 1,
        actType: activityType,
        actSubType: activitySubType,
        actAssocId: 0,
        seqId: +MaxseqId + 1,
        laneId: LaneId,
        blockId: 0,
        queueInfo: queueInfo,
        xLeftLoc: mileWidth + +prevXLeftLoc + graphGridSize,
        yTopLoc: +prevYTop + graphGridSize,
        view: null,
      },
      {
        mileId: mileId,
        mileIndex: mIndex,
      },
      setProcessData,
      +prevXLeftLoc + graphGridSize,
      embeddedObj,
      name,
      id,
      milestoneWidthToIncrease(
        +prevXLeftLoc + graphGridSize,
        processData,
        mileId,
        +maxActivityId + 1,
        defaultShapeVertex.includes(
          getActivityProps(activityType, activitySubType)[5]
        )
      )
    );
  } else {
    PasteActivity(
      processData.ProcessDefId,
      processData.ProcessName,
      {
        name: newActivityName,
        id: +maxActivityId + 1,
        actType: activityType,
        actSubType: activitySubType,
        actAssocId: 0,
        seqId: +MaxseqId + 1,
        laneId: LaneId,
        blockId: 0,
        queueInfo: queueInfo,
        xLeftLoc: mileWidth + +prevXLeftLoc + graphGridSize,
        yTopLoc: +prevYTop + graphGridSize,
        view: null,
      },
      {
        mileId: mileId,
        mileIndex: mIndex,
      },
      setProcessData,
      +prevXLeftLoc + graphGridSize,
      name,
      id,
      milestoneWidthToIncrease(
        +prevXLeftLoc + graphGridSize,
        processData,
        mileId,
        +maxActivityId + 1,
        defaultShapeVertex.includes(
          getActivityProps(activityType, activitySubType)[5]
        )
      )
    );
  }
};
