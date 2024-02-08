import React from "react";
import { useTranslation } from "react-i18next";
import { Droppable } from "react-beautiful-dnd";
import { ClickAwayListener } from "@material-ui/core";
import "./Activities.css";
import Activities from "./Activities";
import {
  userRightsMenuNames,
  PROCESSTYPE_REGISTERED,
} from "../../../../../../Constants/appConstants";
import {
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragOver,
  milestoneWidthToIncrease,
} from "../../../../../../utility/abstarctView/addWorkstepAbstractView";
import { AddActivity } from "../../../../../../utility/CommonAPICall/AddActivity";
import {
  defaultShapeVertex,
  expandedViewHeight,
  expandedViewWidth,
  graphGridSize,
  gridSize,
  maxLabelCharacter,
  milestoneTitleWidth,
  minWidthSpace,
  widthForDefaultVertex,
} from "../../../../../../Constants/bpmnView";
import { getActivityQueueObj } from "../../../../../../utility/abstarctView/getActivityQueueObj";
import { AddEmbeddedActivity } from "../../../../../../utility/CommonAPICall/AddEmbeddedActivity";
import { getActivityProps } from "../../../../../../utility/abstarctView/getActivityProps";
import { UserRightsValue } from "../../../../../../redux-store/slices/UserRightsSlice";
import { useSelector } from "react-redux";
import { getMenuNameFlag } from "../../../../../../utility/UserRightsFunctions";
import { LatestVersionOfProcess } from "../../../../../../utility/abstarctView/checkLatestVersion";
import {
  isActNameAlreadyPresent,
  replaceNChars,
} from "../../../../../../utility/CommonFunctionCall/CommonFunctionCall";

function ActivityView(props) {
  let { t } = useTranslation();
  const userRightsValue = useSelector(UserRightsValue);
  const { embeddedActivities, setEmbeddedActivities, caseEnabled, isReadOnly } =
    props;
  let iActivityId = 10;
  let iSubActivityId = 3;
  // Boolean that decides whether add activity button will be visible or not.
  const addActivityRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.addActivity
  );

  // Function to generate a unique activity name
  const generateUniqueActivityName = (baseName, maxId, data) => {
    let index = 2;
    let newName = `${baseName}_${maxId + index}`;

    while (isActNameAlreadyPresent(newName, data)) {
      index++;
      newName = `${baseName}_${maxId + index}`;
    }

    return newName;
  };

  // Function to add a new activity in a milestone and
  // to add a new card with an activity type that has been dropped on the add workstep button.
  const addNewActivity = () => {
    let MaxseqId = 0,
      maxActivityId = 0,
      mileWidth = 0,
      maxXleftLoc = 0;
    let isPreviousActDefault = false;
    const mIndex = props.milestoneIndex;
    let lanes = props.processData.Lanes?.filter((lane) => +lane.LaneId !== -99);
    let LaneId = lanes && lanes[0].LaneId;
    let laneHeight = milestoneTitleWidth;
    laneHeight = laneHeight + +props.processData.Lanes[0].Height;
    props.processData.MileStones.forEach((mile, index) => {
      mile.Activities.forEach((activity) => {
        if (+activity.SequenceId > +MaxseqId && mIndex === index) {
          MaxseqId = +activity.SequenceId;
        }
        if (+maxXleftLoc < +activity.xLeftLoc && mIndex === index) {
          maxXleftLoc = +activity.xLeftLoc;
          isPreviousActDefault = defaultShapeVertex.includes(
            getActivityProps(activity.ActivityType, activity.ActivitySubType)[5]
          );
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
    let newActivityName =
      t(getActivityProps(iActivityId, iSubActivityId)[4]) +
      "_" +
      (maxActivityId + 1);

    // Added on 22-01-24 for Bug 141498
    if (
      isActNameAlreadyPresent(newActivityName, props.processData.MileStones)
    ) {
      newActivityName = generateUniqueActivityName(
        t(getActivityProps(iActivityId, iSubActivityId)[4]),
        maxActivityId,
        props.processData.MileStones
      );
    }
    // Till here for Bug 141498
    let queueInfo = getActivityQueueObj(
      props.setNewId,
      iActivityId,
      iSubActivityId,
      newActivityName,
      props.processData,
      LaneId,
      t
    );
    //for embeddedSubprocess
    if (+iActivityId === 35 && +iSubActivityId === 1) {
      // code added on 29 March 2023 for BugId 124819
      let startName =
        t(getActivityProps(1, 1, "embedded")[4]) +
        "_" +
        t(getActivityProps(iActivityId, iSubActivityId)[4]) +
        "_" +
        (maxActivityId + 2);
      if (startName.length >= maxLabelCharacter) {
        startName =
          t(getActivityProps(1, 1, "embedded")[4]) +
          "_" +
          replaceNChars(
            t(getActivityProps(iActivityId, iSubActivityId)[4]),
            `_${maxActivityId + 2}`,
            `_${maxActivityId + 2}`.length
          );
      }

      let endName =
        t(getActivityProps(2, 1, "embedded")[4]) +
        "_" +
        t(getActivityProps(iActivityId, iSubActivityId)[4]) +
        "_" +
        (maxActivityId + 3);
      if (endName.length >= maxLabelCharacter) {
        endName =
          t(getActivityProps(2, 1, "embedded")[4]) +
          "_" +
          replaceNChars(
            t(getActivityProps(iActivityId, iSubActivityId)[4]),
            `_${maxActivityId + 3}`,
            `_${maxActivityId + 3}`.length
          );
      }
      // code added on 1 March 2023 for BugId 124474
      AddEmbeddedActivity(
        props.processData.ProcessDefId,
        props.processData.ProcessName,
        {
          name: newActivityName,
          id: +maxActivityId + 1,
          actType: iActivityId,
          actSubType: iSubActivityId,
          actAssocId: 0,
          seqId: +MaxseqId + 1,
          laneId: LaneId,
          blockId: 0,
          queueInfo: queueInfo,
          xLeftLoc: isPreviousActDefault
            ? mileWidth + maxXleftLoc + widthForDefaultVertex + minWidthSpace
            : mileWidth + maxXleftLoc + gridSize + minWidthSpace,
          yTopLoc: +laneHeight + gridSize,
          view: null,
        },
        {
          mileId: props.MileId,
          mileIndex: mIndex,
        },
        props.setprocessData,
        isPreviousActDefault
          ? maxXleftLoc + widthForDefaultVertex + minWidthSpace
          : maxXleftLoc + gridSize + minWidthSpace,
        [
          {
            processDefId: props.processData.ProcessDefId,
            processName: props.processData.ProcessName,
            actName: startName,
            actId: +maxActivityId + 2,
            actType: 1,
            actSubType: 1,
            actAssocId: 0,
            seqId: +MaxseqId + 2,
            laneId: LaneId,
            blockId: 0,
            queueId: 0,
            queueInfo: { queueId: 0 },
            queueExist: false,
            xLeftLoc: 2 * graphGridSize,
            yTopLoc: 6 * graphGridSize,
            milestoneId: props.MileId,
            parentActivityId: +maxActivityId + 1,
            embeddedActivityType: "S", // code added on 1 March 2023 for BugId 124474
            height: expandedViewHeight,
            width: expandedViewWidth,
          },
          {
            processDefId: props.processData.ProcessDefId,
            processName: props.processData.ProcessName,
            actName: endName,
            actId: +maxActivityId + 3,
            actType: 2,
            actSubType: 1,
            actAssocId: 0,
            seqId: +MaxseqId + 3,
            laneId: LaneId,
            blockId: 0,
            queueId: 0,
            queueInfo: { queueId: 0 },
            queueExist: false,
            xLeftLoc: 28 * graphGridSize,
            yTopLoc: 6 * graphGridSize,
            milestoneId: props.MileId,
            parentActivityId: +maxActivityId + 1,
            embeddedActivityType: "E", // code added on 1 March 2023 for BugId 124474
            height: expandedViewHeight,
            width: expandedViewWidth,
          },
        ],
        milestoneWidthToIncrease(
          isPreviousActDefault
            ? maxXleftLoc + widthForDefaultVertex + minWidthSpace
            : maxXleftLoc + gridSize + minWidthSpace,
          props.processData,
          props.MileId,
          +maxActivityId + 1,
          defaultShapeVertex.includes(
            getActivityProps(iActivityId, iSubActivityId)[5]
          )
        )
      );
    } else {
      AddActivity(
        props.processData.ProcessDefId,
        props.processData.ProcessName,
        {
          name: newActivityName,
          id: +maxActivityId + 1,
          actType: iActivityId,
          actSubType: iSubActivityId,
          actAssocId: 0,
          seqId: +MaxseqId + 1,
          laneId: LaneId,
          blockId: 0,
          queueInfo: queueInfo,
          xLeftLoc: isPreviousActDefault
            ? mileWidth + maxXleftLoc + widthForDefaultVertex + minWidthSpace
            : mileWidth + maxXleftLoc + gridSize + minWidthSpace,
          yTopLoc: +laneHeight + gridSize,
          view: null,
        },
        {
          mileId: props.MileId,
          mileIndex: mIndex,
        },
        props.setprocessData,
        isPreviousActDefault
          ? maxXleftLoc + widthForDefaultVertex + minWidthSpace
          : maxXleftLoc + gridSize + minWidthSpace,
        milestoneWidthToIncrease(
          isPreviousActDefault
            ? maxXleftLoc + widthForDefaultVertex + minWidthSpace
            : maxXleftLoc + gridSize + minWidthSpace,
          props.processData,
          props.MileId,
          +maxActivityId + 1,
          defaultShapeVertex.includes(
            getActivityProps(iActivityId, iSubActivityId)[5]
          )
        )
      );
    }
  };

  const handleClickAway = (evt, mIndex) => {
    let processObject = JSON.parse(JSON.stringify(props.processData));
    processObject.MileStones = JSON.parse(
      JSON.stringify(props.processData.MileStones)
    );
    processObject.MileStones[mIndex].Activities = JSON.parse(
      JSON.stringify(props.processData.MileStones[mIndex].Activities)
    );
    processObject.MileStones[mIndex].Activities.forEach((activity) => {
      if (
        activity.ActivityName.trim() === "" ||
        activity.ActivityName === null ||
        activity.ActivityName === undefined
      ) {
        activity.ActivityName =
          t(getActivityProps(iActivityId, iSubActivityId)[4]) +
          "_" +
          props.activityId.activityId;
      }
      if (!activity.ActivityType && !activity.ActivitySubType) {
        activity.ActivityType = 10;
        activity.ActivitySubType = 3;
      }
    });
    props.setprocessData(processObject);
  };

  const onDropHandler = (e) => {
    iActivityId = +e.dataTransfer.getData("iActivityID");
    iSubActivityId = +e.dataTransfer.getData("iSubActivityID");
    onDrop(e, "newActivityDiv", addNewActivity);
  };

  return (
    <React.Fragment>
      <ClickAwayListener
        onClickAway={(evt) => handleClickAway(evt, props.milestoneIndex)}
      >
        <React.Fragment>
          <div
            className="activityMainDiv"
            onDragOver={(e) => onDragOver(e)}
            onDragEnter={(e) => onDragEnter(e, "newActivityDiv")}
            onDragLeave={(e) => onDragLeave(e, "newActivityDiv")}
          >
            <Droppable
              droppableId={`${props.milestoneIndex}`}
              type="process"
              key={props.milestoneIndex}
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ minHeight: "1vh" }}
                >
                  {/* The height of the div is set to 1vh so that when there are not activities in a milestone,the area is still droppable for another activity card. */}
                  <div>
                    <Activities
                      isReadOnly={isReadOnly}
                      caseEnabled={caseEnabled}
                      embeddedActivities={embeddedActivities}
                      setEmbeddedActivities={setEmbeddedActivities}
                      milestoneIndex={props.milestoneIndex}
                      ActivitiesData={props.ActivitiesData}
                      selectedActivity={props.selectedActivity}
                      selectActivityHandler={props.selectActivityHandler}
                      setprocessData={props.setprocessData}
                      processData={props.processData}
                      processType={props.processType}
                      setNewId={props.setNewId}
                      mileId={props.MileId}
                      processExpanded={props.processExpanded}
                      setProcessExpanded={props.setProcessExpanded}
                    />
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {isReadOnly
              ? null
              : addActivityRightsFlag && (
                  <div
                    className="newActivityDiv"
                    style={{
                      display:
                        props.processType === PROCESSTYPE_REGISTERED ||
                        props.processType === "RC" ||
                        LatestVersionOfProcess(props.processData?.Versions) !==
                          +props.processData?.VersionNo
                          ? "none"
                          : "",
                    }}
                    id={`pmweb_addWorkstepBtn_${props.milestoneIndex}`}
                    onClick={() => addNewActivity()}
                    onDrop={onDropHandler}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.code === "Enter") {
                        addNewActivity();
                      }
                    }}
                  >
                    {t("milestone.newStep")}
                  </div>
                )}
          </div>
        </React.Fragment>
      </ClickAwayListener>
    </React.Fragment>
  );
}

export default ActivityView;
