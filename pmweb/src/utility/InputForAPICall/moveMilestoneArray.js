// modified on 27/10/23 for BugId 140242
export const moveMilestoneArray = (processData, source, destination) => {
  return (
    processData.MileStones &&
    processData.MileStones.map((mile, index) => {
      let activitiesArray = JSON.parse(JSON.stringify(mile.Activities));
      if (source.index < destination.index) {
        if (index < source.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: mile.SequenceId,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        } else if (source.index < index && index <= destination.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: mile.SequenceId - 1,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        } else if (index > destination.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: mile.SequenceId + 1,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        } else if (index === source.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: destination.index + 1,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        }
      } else if (source.index > destination.index) {
        if (index > source.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: mile.SequenceId,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        } else if (source.index > index && index >= destination.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: mile.SequenceId + 1,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        } else if (index < destination.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: mile.SequenceId,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        } else if (index === source.index) {
          return {
            milestoneName: mile.MileStoneName,
            milestoneId: mile.iMileStoneId,
            seqId: destination.index + 1,
            oldMilestoneSeqId: mile.SequenceId,
            activities: activitiesArray,
            width: mile.Width,
          };
        }
      }
    })
  );
};
// till here BugId 140242

// added on 27/10/23 for BugId 140242
export const moveMilestoneActWidthFixArray = (mileArr) => {
  let mileWidth = 0;
  return (
    mileArr?.map((mile) => {
      let activitiesArray = mile.activities.map((elem) => {
        return {
          activityId: `${elem.ActivityId}`,
          xLeftLoc: +elem.xLeftLoc + +mileWidth + "",
        };
      });
      mileWidth = mileWidth + +mile.width;
      return {
        milestoneName: mile.milestoneName,
        milestoneId: mile.milestoneId,
        seqId: mile.seqId,
        oldMilestoneSeqId: mile.oldMilestoneSeqId,
        activities: activitiesArray,
      };
    })
  );
};
