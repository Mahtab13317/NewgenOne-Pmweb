import axios from "axios";
import {
  ENDPOINT_MOVEACTIVITY,
  SERVER_URL,
} from "../../Constants/appConstants";
import {
  defaultShapeVertex,
  gridSize,
  minWidthSpace,
  widthForDefaultVertex,
} from "../../Constants/bpmnView";
import { getActivityProps } from "./getActivityProps";
import { milestoneWidthToIncrease } from "./addWorkstepAbstractView";

// Function that runs when an activity card is dragged and dropped in the same milestone or in a different milestone.
export const handleDragEnd = (result, processData, setProcessData) => {
  const { destination, source } = result;
  if (!destination) return;

  if (
    // This condition runs when the activity card is dragged and dropped in its original position in the same milestone.
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  } else {
    // modified on 27/10/23 for BugId 140242
    let activity,
      mile,
      prevMile,
      lastAct = null;
    let mileWidth = 0;
    let maxXleftLoc = 0,
      laneHeight = 0;
    let isPreviousActDefault = false;
    let mileStoneWidthIncreased = false;
    let processObjectData = JSON.parse(JSON.stringify(processData));
    if (
      // This condition runs when the activity card is dragged and dropped in a different position in the same milestone.
      source.droppableId === destination.droppableId &&
      source.index !== destination.index
    ) {
      const milestoneIndex = +source.droppableId;
      prevMile = processObjectData.MileStones[milestoneIndex];
      activity =
        processObjectData.MileStones[milestoneIndex].Activities[source.index];
      mile = processObjectData.MileStones[milestoneIndex];
      // modified on 24/01/24 for BugId 142649
      /*lastAct =
        destination.index >= 0 ? mile.Activities[destination.index - 1] : null;
      isPreviousActDefault = defaultShapeVertex.includes(
        getActivityProps(lastAct.ActivityType, lastAct.ActivitySubType)[5]
      ); */
      lastAct =
        destination.index > 0 ? mile.Activities[destination.index - 1] : null;
      isPreviousActDefault =
        lastAct && lastAct !== null
          ? defaultShapeVertex.includes(
              getActivityProps(lastAct.ActivityType, lastAct.ActivitySubType)[5]
            )
          : false;
      // till here BugId 142649
      for (let i = 0; i < milestoneIndex; i++) {
        mileWidth = mileWidth + +processObjectData.MileStones[i].Width;
      }
    } else if (
      // This condition runs when the activity card is dragged and dropped in a different position in a different milestone.
      source.droppableId !== destination.droppableId
    ) {
      const sourceMileStoneIndex = +source.droppableId;
      const destinationMileStoneIndex = +destination.droppableId;
      prevMile = processObjectData.MileStones[sourceMileStoneIndex];
      activity =
        processObjectData.MileStones[sourceMileStoneIndex].Activities[
          source.index
        ];
      mile = processObjectData.MileStones[destinationMileStoneIndex];
      mile.Activities?.forEach((act) => {
        if (+maxXleftLoc < +act.xLeftLoc && +act.LaneId === +activity.LaneId) {
          maxXleftLoc = +act.xLeftLoc;
          if (destination.index >= 0) {
            lastAct = act;
            isPreviousActDefault = defaultShapeVertex.includes(
              getActivityProps(act.ActivityType, act.ActivitySubType)[5]
            );
          }
        }
      });
      for (let i = 0; i < destinationMileStoneIndex; i++) {
        mileWidth = mileWidth + +processObjectData.MileStones[i].Width;
      }
      let tempProcessData = JSON.parse(JSON.stringify(processObjectData));
      const [reOrderedList] = tempProcessData.MileStones[
        sourceMileStoneIndex
      ].Activities.splice(source.index, 1);
      tempProcessData.MileStones[destinationMileStoneIndex].Activities.splice(
        destination.index,
        0,
        reOrderedList
      );
      let isLaneFound = false;
      processData?.Lanes?.forEach((lane) => {
        if (+lane.LaneId === +activity.LaneId) {
          isLaneFound = true;
        }
        if (!isLaneFound) {
          laneHeight = laneHeight + +lane.Height;
        }
      });
      tempProcessData.MileStones[destinationMileStoneIndex].Activities[
        destination.index
      ].xLeftLoc = lastAct
        ? isPreviousActDefault
          ? +lastAct.xLeftLoc + minWidthSpace + widthForDefaultVertex
          : +lastAct.xLeftLoc + gridSize + minWidthSpace
        : gridSize * 2;
      tempProcessData.MileStones[destinationMileStoneIndex].Activities[
        destination.index
      ].yTopLoc = lastAct ? +lastAct.yTopLoc : gridSize * 2 + laneHeight;

      mileStoneWidthIncreased = milestoneWidthToIncrease(
        lastAct
          ? isPreviousActDefault
            ? +lastAct.xLeftLoc + minWidthSpace + widthForDefaultVertex
            : +lastAct.xLeftLoc + gridSize + minWidthSpace
          : gridSize * 2,
        tempProcessData,
        mile.iMileStoneId,
        null,
        defaultShapeVertex.includes(
          getActivityProps(activity.ActivityType, activity.ActivitySubType)[5]
        )
      );
    }

    axios
      .post(SERVER_URL + ENDPOINT_MOVEACTIVITY, {
        processDefId: processObjectData.ProcessDefId,
        actName: activity.ActivityName,
        actId: activity.ActivityId,
        // modified on 24/01/24 for BugId 142649
        // seqId: lastAct ? +lastAct.SequenceId + 1 : 1,
        seqId: destination.index + 1,
        prevSeqId:
          mile.iMileStoneId === prevMile.iMileStoneId ? source.index + 1 : null,
        // till here BugId 142649
        milestoneId: mile.iMileStoneId,
        prevMilestoneId: prevMile.iMileStoneId,
        laneId: activity.LaneId,
        prevLaneId: activity.LaneId,
        xLeftLoc:
          mile.iMileStoneId === prevMile.iMileStoneId
            ? +activity.xLeftLoc
            : lastAct
            ? isPreviousActDefault
              ? +lastAct.xLeftLoc +
                minWidthSpace +
                widthForDefaultVertex +
                mileWidth
              : +lastAct.xLeftLoc + gridSize + minWidthSpace + mileWidth
            : gridSize * 2 + mileWidth,
        yTopLoc:
          mile.iMileStoneId === prevMile.iMileStoneId
            ? +activity.yTopLoc
            : lastAct
            ? +lastAct.yTopLoc
            : gridSize * 2 + laneHeight,
        arrMilestoneInfos: mileStoneWidthIncreased
          ? mileStoneWidthIncreased.arrMilestoneInfos
          : null,
      })
      .then((res) => {
        if (res.data.Status === 0) {
          if (
            // This condition runs when the activity card is dragged and dropped in a different position in the same milestone.
            source.droppableId === destination.droppableId &&
            source.index !== destination.index
          ) {
            const milestoneIndex = +source.droppableId;
            const [reOrderedList] = processObjectData.MileStones[
              milestoneIndex
            ].Activities.splice(source.index, 1);
            processObjectData.MileStones[milestoneIndex].Activities.splice(
              destination.index,
              0,
              reOrderedList
            );
            processObjectData.MileStones[milestoneIndex].Activities[
              destination.index
            ].xLeftLoc =
              mile.iMileStoneId === prevMile.iMileStoneId
                ? processObjectData.MileStones[milestoneIndex].Activities[
                    destination.index
                  ].xLeftLoc
                : lastAct
                ? isPreviousActDefault
                  ? +lastAct.xLeftLoc + minWidthSpace + widthForDefaultVertex
                  : +lastAct.xLeftLoc + gridSize + minWidthSpace
                : gridSize * 2;
            processObjectData.MileStones[milestoneIndex].Activities[
              destination.index
            ].yTopLoc =
              mile.iMileStoneId === prevMile.iMileStoneId
                ? processObjectData.MileStones[milestoneIndex].Activities[
                    destination.index
                  ].yTopLoc
                : lastAct
                ? +lastAct.yTopLoc
                : gridSize * 2 + laneHeight;
            setProcessData(processObjectData);
          } else if (
            // This condition runs when the activity card is dragged and dropped in a different position in a different milestone.
            source.droppableId !== destination.droppableId
          ) {
            const sourceMileStoneIndex = +source.droppableId;
            const destinationMileStoneIndex = +destination.droppableId;
            const [reOrderedList] = processObjectData.MileStones[
              sourceMileStoneIndex
            ].Activities.splice(source.index, 1);
            processObjectData.MileStones[
              destinationMileStoneIndex
            ].Activities.splice(destination.index, 0, reOrderedList);
            if (mileStoneWidthIncreased) {
              processObjectData.MileStones[destinationMileStoneIndex].Width =
                mileStoneWidthIncreased?.arrMilestoneInfos[
                  destinationMileStoneIndex
                ].width;
            }
            processObjectData.MileStones[destinationMileStoneIndex].Activities[
              destination.index
            ].xLeftLoc = lastAct
              ? isPreviousActDefault
                ? +lastAct.xLeftLoc + minWidthSpace + widthForDefaultVertex
                : +lastAct.xLeftLoc + gridSize + minWidthSpace
              : gridSize * 2;
            processObjectData.MileStones[destinationMileStoneIndex].Activities[
              destination.index
            ].yTopLoc = lastAct ? +lastAct.yTopLoc : gridSize * 2 + laneHeight;
            setProcessData(processObjectData);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
    // till here BugId 140242
  }
};
