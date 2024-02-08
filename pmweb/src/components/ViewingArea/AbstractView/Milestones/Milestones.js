import React from "react";
import { Draggable } from "react-beautiful-dnd";
import ActivityView from "./Milestone/ActivityView/ActivityView";
import Mile from "./Milestone/Milestone";
import { ClickAwayListener } from "@material-ui/core";
import "./Milestone/Milestone.css";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";

// Functional component to make milestones in abstract view. Draggable makes the individual milestones draggable.
const milestones = (props) => {
  const {
    embeddedActivities,
    setEmbeddedActivities,
    caseEnabled,
    processType,
    isReadOnly,
    direction,
  } = props;
  //when processData is null
  if (!props.processData) {
    return <React.Fragment></React.Fragment>;
  }

  var lengthMileStone = props.processData.MileStones?.length;

  return props.processData.MileStones?.map((mileObject, index) => {
    return (
      <React.Fragment>
        <Draggable
          draggableId={mileObject.MileStoneName}
          key={mileObject.MileStoneName}
          index={index}
        >
          {(provided) => (
            <ClickAwayListener
              onClickAway={() => {
                if (props.selectedMile === mileObject.iMileStoneId) {
                  props.selectMileHandler(null);
                }
              }}
            >
              {/*code edited on 15 Nov 2022 for BugId 115645 */}
              <div
                className={
                  props.selectedMile === mileObject.iMileStoneId
                    ? direction === RTL_DIRECTION
                      ? "mileDivSelectedArabic mileDivRef"
                      : "mileDivSelected mileDivRef"
                    : direction === RTL_DIRECTION
                    ? "mileDivArabic mileDivRef"
                    : "mileDiv mileDivRef"
                }
                {...provided.draggableProps}
                ref={provided.innerRef}
              >
                <Mile
                  index={index}
                  provided={provided}
                  length={lengthMileStone}
                  addNewMile={props.addNewMile}
                  processData={props.processData}
                  setprocessData={props.setprocessData}
                  selectMileHandler={props.selectMileHandler}
                  deleteMileHandler={props.deleteMileHandler}
                  MileName={mileObject.MileStoneName}
                  MileId={mileObject.iMileStoneId}
                  key={mileObject.MileId}
                  Mile={mileObject}
                  addInBetweenNewMile={props.addInBetweenNewMile}
                  processType={processType}
                  selectedMile={props.selectedMile}
                  isReadOnly={isReadOnly}
                >
                  {props.text}
                </Mile>

                <div
                  className={
                    props.selectedMile === mileObject.iMileStoneId
                      ? "mileActivityDiv mileActDivRef"
                      : "mileActDivRef"
                  }
                  style={{ height: "max-content", paddingBottom: "10px" }}
                >
                  <ActivityView
                    isReadOnly={isReadOnly}
                    caseEnabled={caseEnabled}
                    embeddedActivities={embeddedActivities}
                    setEmbeddedActivities={setEmbeddedActivities}
                    milestoneIndex={index}
                    setprocessData={props.setprocessData}
                    processData={props.processData}
                    selectedActivity={props.selectedActivity}
                    selectActivityHandler={props.selectActivityHandler}
                    ActivitiesData={mileObject.Activities}
                    activityId={props.activityId}
                    MileId={mileObject.iMileStoneId}
                    processType={processType}
                    setNewId={props.setNewId}
                    processExpanded={props.processExpanded}
                    setProcessExpanded={props.setProcessExpanded}
                  />
                </div>
              </div>
            </ClickAwayListener>
          )}
        </Draggable>
      </React.Fragment>
    );
  });
};

export default milestones;
