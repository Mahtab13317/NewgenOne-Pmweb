// modified on 27/10/23 for BugId 140242
export const addMileInBetweenArray = (processData, indexVal) => {
  let SequenceId;
  return {
    array:
      processData.MileStones &&
      processData.MileStones.map((item, index) => {
        let activitiesArray = JSON.parse(JSON.stringify(item.Activities));
        if (indexVal === index) {
          SequenceId = item.SequenceId + 1;
          return {
            milestoneName: item.MileStoneName,
            milestoneId: item.iMileStoneId,
            seqId: item.SequenceId,
            action: "N",
            activities: activitiesArray,
            width: item.Width,
          };
        } else if (indexVal < index) {
          item.SequenceId = item.SequenceId + 1;
          return {
            milestoneName: item.MileStoneName,
            milestoneId: item.iMileStoneId,
            seqId: item.SequenceId,
            action: "N",
            activities: activitiesArray,
            width: item.Width,
          };
        } else if (indexVal > index) {
          return {
            milestoneName: item.MileStoneName,
            milestoneId: item.iMileStoneId,
            seqId: item.SequenceId,
            action: "N",
            activities: activitiesArray,
            width: item.Width,
          };
        }
      }),
    SequenceId: SequenceId,
  };
};
// till here BugId 140242

// added on 27/10/23 for BugId 140242
export const addMileInBetweenActWidthFixArray = (mileArr) => {
  let mileWidth = 0;
  return {
    array: mileArr?.array?.map((mile) => {
      let activitiesArray = mile.activities.map((elem) => {
        return {
          activityId: `${elem.ActivityId}`,
          xLeftLoc: +elem.xLeftLoc + +mileWidth + "",
        };
      });
      mileWidth = mileWidth + +mile.width;
      if (mile.action === "N") {
        return {
          milestoneName: mile.milestoneName,
          milestoneId: mile.milestoneId,
          seqId: mile.seqId,
          action: mile.action,
          activities: activitiesArray,
        };
      }
      return {
        milestoneName: mile.milestoneName,
        milestoneId: mile.milestoneId,
        seqId: mile.seqId,
        action: mile.action,
        activities: activitiesArray,
        width: mile.width,
      };
    }),
    SequenceId: mileArr.SequenceId,
  };
};
