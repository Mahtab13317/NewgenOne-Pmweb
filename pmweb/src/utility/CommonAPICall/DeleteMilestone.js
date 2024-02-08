import {
  SERVER_URL,
  ENDPOINT_REMOVEMILE,
  ENDPOINT_PROCESS_ASSOCIATION,
} from "../../Constants/appConstants";
import axios from "axios";
import {
  setActivityDependencies,
  setShowDependencyModal,
} from "../../redux-store/actions/Properties/activityAction";

export const deleteMilestone = (
  milestoneId,
  setProcessData,
  processDefId,
  milestonesArray,
  indexValue,
  processType,
  activityNameList,
  activityIdList,
  dispatch
) => {
  // code edited on 17 Oct 2022 for BugId 117093
  if (activityNameList.length > 0 && activityIdList.length > 0) {
    // code edited on 24 Jan 2023 for BugId 122659
    let payload = {
      processId: processDefId,
      processType: processType,
      objectName: activityNameList,
      objectId: activityIdList,
      wsType: "AC",
      deviceType: "D",
    };
    axios
      .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
      .then((res) => {
        if (res.data.Status === 0) {
          if (res.data.Validations?.length > 0) {
            dispatch(setShowDependencyModal(true));
            dispatch(setActivityDependencies(res.data.Validations));
          } else {
            deleteMileFunc(
              milestoneId,
              setProcessData,
              processDefId,
              milestonesArray,
              indexValue
            );
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    deleteMileFunc(
      milestoneId,
      setProcessData,
      processDefId,
      milestonesArray,
      indexValue
    );
  }
};

const deleteMileFunc = (
  milestoneId,
  setProcessData,
  processDefId,
  milestonesArray,
  indexValue
) => {
  var obj = {
    processDefId: processDefId,
    milestones: milestonesArray,
  };
  axios
    .post(SERVER_URL + ENDPOINT_REMOVEMILE, obj)
    .then((response) => {
      if (response.data.Status == 0) {
        setProcessData((prevProcessData) => {
          let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
          let newArray =
            newProcessData.MileStones &&
            newProcessData.MileStones.map((item, index) => {
              if (indexValue && indexValue < index) {
                let a = item.SequenceId - 1;
                return { ...item, SequenceId: a };
              } else {
                return { ...item };
              }
            });
          newArray.forEach((milestone, index) => {
            if (milestone.iMileStoneId === milestoneId) {
              milestone.Activities &&
                milestone.Activities.forEach((activity, activityIndex) => {
                  //removes activity from Activities array
                  milestone.Activities.splice(activityIndex, 1);
                  newArray.Connections &&
                    newArray.Connections.forEach(
                      (connection, connectionIndex) => {
                        //delete all connecting edges to this activity
                        if (
                          connection.SourceId === activity.ActivityId ||
                          connection.TargetId === activity.ActivityId
                        ) {
                          newArray.Connections.splice(connectionIndex, 1);
                        }
                      }
                    );
                });
              newArray.splice(index, 1);
            }
          });

          newProcessData.MileStones = [...newArray];
          return newProcessData;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
