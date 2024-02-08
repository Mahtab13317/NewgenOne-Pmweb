// #BugID - 124888
// #BugDescription - Fixed the issue for activity/swimlane check in>> getting error while check in the changes for distribute workstep
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { connect, useDispatch } from "react-redux";
import CommonModalBody from "../Header/CommonModalBody";
import {
  ENDPOINT_CHECKIN_LANE,
  SERVER_URL,
} from "../../../Constants/appConstants";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { store, useGlobalState } from "state-pool";
import CheckInFailedModal from "./CheckInFailedModal";

function CheckinLane({ laneName, laneId, setprocessData, ...props }) {
  let { t } = useTranslation();
  const { setWarningVariables, setErrorVariables, toggleDrawer } = props;
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [showCheckInFailModal, setShowCheckInFailModal] = useState(false);
  const [loader, setLoader] = useState(false);

  let temp = global.structuredClone(localLoadedProcessData);

  const checkinLane = () => {
    setLoader(true);
    let checkedOutMilestones = [];
    temp.MileStones?.forEach((mile) => {
      mile.Activities?.forEach((act) => {
        if (+act.LaneId === +laneId) {
          checkedOutMilestones.push(mile);
        }
      });
    });
    checkedOutMilestones = [
      ...new Map(
        checkedOutMilestones.map((item) => [item["iMileStoneId"], item])
      ).values(),
    ];

    checkedOutMilestones = checkedOutMilestones?.map((mile) => {
      return {
        milestoneId: mile.iMileStoneId + "",
        activities: mile.Activities.map((act) => {
          return {
            ...{
              actId: act.ActivityId,
              status: act.status || "U",
              mileStoneId: mile.iMileStoneId,
              actType: act.ActivityType,
              actSubType: act.ActivitySubType,
              seqId: act.SequenceId,
              actName: act.ActivityName,
              // modified on 09/10/23 for BugId 138932
              // xLeftLoc: act.xLeftLoc,
              // yTopLoc: act.yTopLoc,
              xLeftLoc: act.newXLeft ? act.newXLeft : act.xLeftLoc,
              yTopLoc: act.newYTop ? act.newYTop : act.yTopLoc,
              laneId: act.LaneId,
              blockId: act.BlockId,
              queueId: act.QueueId,
              queueCategory: act.QueueCategory,
              color: act.Color,
              isMobileEnabled: false,
              propStatus: act.propStatus
                ? act.propStatus
                : act.hasOwnProperty("Properties")
                ? "I"
                : "N",
            },
            ...act.Properties?.ActivityProperty,
          };
        }),
      };
    });
    let actData = {},
      actList = {},
      connList = {};
    for (let i = 0; i < checkedOutMilestones.length; i++) {
      actData = {
        ...actData,
        ...checkedOutMilestones[i].activities.reduce(
          (a, v) => ({ ...a, [v.actId]: v }),
          {}
        ),
      };
    }
    for (let i = 0; i < checkedOutMilestones.length; i++) {
      actList = {
        ...actList,
        [checkedOutMilestones[i].milestoneId]: {
          actList: checkedOutMilestones[i].activities.map((act) => +act.actId),
        },
      };
    }

    for (let i = 0; i < temp.Connections.length; i++) {
      connList = {
        ...connList,
        ...temp.Connections.reduce(
          (a, v) => ({
            ...a,
            [v.ConnectionId]: {
              connId: v.ConnectionId,
              sourceId: v.SourceId,
              targetId: v.TargetId,
              connType: v.Type,
              /* code added on 2 Aug 2023 for BugId 126924 - regression>>swimlane check in>>connections 
              are merging/distorting after swimlane check in */
              sourcePosition: v.xLeft,
              targetPosition: v.yTop,
            },
          }),
          {}
        ),
      };
    }

    let json = {
      processDefId: props.openProcessID,
      type: 2,
      // comment: comment,
      swilaneId: laneId,
      // swimlaneName: props.laneName,
      milestones: { milestoneMap: actList },
      activities: { activityMap: actData },
      connections: { connMap: connList },
    };

    axios
      .post(SERVER_URL + ENDPOINT_CHECKIN_LANE, json)
      .then((response) => {
        if (response?.data?.Status === 0) {
          // code added on 30 March 2023 for BugId 125900
          let tempErrors = [],
            tempWarnings = [];
          response?.data?.Error?.forEach((e) => {
            if (e.ErrorLevel === "E") {
              tempErrors.push(e);
            } else if (e.ErrorLevel === "W") {
              tempWarnings.push(e);
            }
          });
          if (tempErrors?.length === 0) {
            temp.Lanes?.forEach((lane, idx) => {
              if (+lane.LaneId === +laneId) {
                lane.CheckedOut = "N";
              }
            });
            temp.MileStones.forEach((mile) => {
              mile.Activities.forEach((act) => {
                if (+act.LaneId === +laneId) {
                  act.CheckedOut = "N";
                  if (act.hasOwnProperty("status") && act.status === "I") {
                    act.status = "U";
                  }
                }
              });
            });
            const updatedCon = JSON.parse(
              JSON.stringify(response?.data?.Connection)
            );
            const newArr = updatedCon?.map((v) => ({
              ConnectionId: +v.ConnectionId,
              SourceId: +v.SourceId,
              TargetId: +v.TargetId,
              Type: v.Type,
              /* code edited on 2 Aug 2023 for BugId 126924 - regression>>swimlane check in>>connections 
            are merging/distorting after swimlane check in */
              xLeft: v.xLeft ? v.xLeft : [],
              yTop: v.yTop ? v.yTop : [],
            }));
            temp.Connections = [...newArr];
            setLocalLoadedProcessData(temp);
            dispatch(
              setToastDataFunc({
                message: `${laneName} ${t("hasBeenCheckedIn")}`,
                severity: "success",
                open: true,
              })
            );
            props.setModalClosed();
            setLoader(false);
          } else {
            setErrorVariables(tempErrors);
            setWarningVariables(tempWarnings);
            setShowCheckInFailModal(true);
            setLoader(false);
          }
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  // code edited on 30 March 2023 for BugId 125900
  return !showCheckInFailModal ? (
    <CommonModalBody
      buttonOne={t("ok")}
      modalType={props.modalType}
      modalHead={t("checkInSwimlane")}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      openProcessName={laneName}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={checkinLane}
      isBtnOneProcessing={loader}
      id="checkout_lane"
    />
  ) : (
    <div style={{ height: "28vh" }}>
      <CheckInFailedModal
        laneName={laneName}
        closeThisAndShowValidationPopUp={() => {
          toggleDrawer("bottom", true);
          setShowCheckInFailModal(false);
          props.setModalClosed();
        }}
        closeThisPopUp={() => {
          setShowCheckInFailModal(false);
          props.setModalClosed();
        }}
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(CheckinLane);
