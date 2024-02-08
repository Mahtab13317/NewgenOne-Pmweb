import React from "react";
import Activity from "./Activity/Activity";
import { Draggable } from "react-beautiful-dnd";

const Activities = (props) => {
  const { embeddedActivities, setEmbeddedActivities, caseEnabled, isReadOnly } =
    props;

  // Draggable makes a single activity card draggable.
  return props.ActivitiesData.map((activity, index) => {
    return (
      <div>
        <Draggable
          key={activity.ActivityName || ""}
          draggableId={activity.ActivityName || ""}
          index={index}
        >
          {(provided) => (
            <div {...provided.draggableProps} ref={provided.innerRef}>
              <Activity
                isReadOnly={isReadOnly}
                caseEnabled={caseEnabled}
                embeddedActivities={embeddedActivities}
                setEmbeddedActivities={setEmbeddedActivities}
                provided={provided}
                milestoneIndex={props.milestoneIndex}
                activityindex={index}
                selectedActivity={props.selectedActivity}
                activityName={activity.ActivityName}
                activityId={activity.ActivityId}
                selectActivityHandler={props.selectActivityHandler}
                activityType={activity.ActivityType}
                activitySubType={activity.ActivitySubType}
                Assignee={activity.Assignee}
                key={index}
                setprocessData={props.setprocessData}
                processData={props.processData}
                processType={props.processType}
                setNewId={props.setNewId}
                mileId={props.mileId}
                processExpanded={props.processExpanded}
                setProcessExpanded={props.setProcessExpanded}
              />
            </div>
          )}
        </Draggable>
      </div>
    );
  });
};

export default Activities;
