// modified on 27/10/23 for BugId 140242
export const deleteMilestoneArray = (processData, id) => {
  let indexVal = null;
  let mileWidth = 0;
  return {
    array:
      processData.MileStones &&
      processData.MileStones.map((item, index) => {
        let activitiesArray = item.Activities.map((activity) => {
          return {
            activityId: activity.ActivityId,
            xLeftLoc: +activity.xLeftLoc + +mileWidth + "", // code edited on 9 Dec 2022 for BugId 120278
          };
        });
        if (item.iMileStoneId === id) {
          indexVal = index;
          return {
            milestoneName: item.MileStoneName,
            milestoneId: item.iMileStoneId,
            seqId: item.SequenceId,
            action: "D",
            activities: activitiesArray,
          };
        } else {
          mileWidth = mileWidth + +item.Width;
          if (indexVal && indexVal < index) {
            return {
              milestoneName: item.MileStoneName,
              milestoneId: item.iMileStoneId,
              seqId: item.SequenceId - 1,
              action: "N",
              activities: activitiesArray,
            };
          } else {
            return {
              milestoneName: item.MileStoneName,
              milestoneId: item.iMileStoneId,
              seqId: item.SequenceId,
              action: "N",
              activities: activitiesArray,
            };
          }
        }
      }),
    index: indexVal,
  };
};
// till here BugId 140242

export const deleteMilestoneActivity = (processData, id) => {
  let activityIdList = [],
    activityNameList = [];
  processData.MileStones?.map((item, index) => {
    if (item.iMileStoneId === id) {
      item.Activities?.map((activity) => {
        activityIdList.push(activity.ActivityId);
        activityNameList.push(activity.ActivityName);
      });
    }
  });
  return {
    activityIdList: activityIdList.join(","),
    activityNameList: activityNameList.join(":"),
  };
};

export const deleteLaneActivity = (processData, id) => {
  let activityIdList = [],
    activityNameList = [];
  processData.MileStones?.map((item) => {
    item.Activities?.map((activity) => {
      if (+activity.LaneId === +id) {
        activityIdList.push(activity.ActivityId);
        activityNameList.push(activity.ActivityName);
      }
    });
  });
  return {
    activityIdList: activityIdList.join(","),
    activityNameList: activityNameList.join(":"),
  };
};
