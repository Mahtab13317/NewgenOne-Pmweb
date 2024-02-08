// #BugID - 124888
// #BugDescription - Fixed the issue for activity/swimlane check in>> getting error while check in the changes for distribute workstep
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import CommonModalBody from "../../../../../Header/CommonModalBody";
import {
  ENDPOINT_CHECKIN_ACT,
  SERVER_URL,
} from "../../../../../../../Constants/appConstants";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  ActivityCheckoutValue,
  setCheckoutActEdited,
} from "../../../../../../../redux-store/slices/ActivityCheckoutSlice";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";
import { store, useGlobalState } from "state-pool";

function CheckInActivity(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const CheckedAct = useSelector(ActivityCheckoutValue);
  const dispatch = useDispatch();

  const checkInActivity = () => {
    setLoader(true);
    let mileId = null,
      mileWidth = 0;
    props.setprocessData((prev) => {
      let temp = JSON.parse(JSON.stringify(prev));
      temp.MileStones?.forEach((mile) => {
        mile.Activities?.forEach((act) => {
          if (+act.ActivityId === +props.actId) {
            mileId = mile.iMileStoneId;
          }
        });
        // added on 23/01/24 for BugId 140982
        if (mileId === null) {
          mileWidth = +mileWidth + +mile.Width;
        }
        // till here BugId 140982
      });
      return temp;
    });

    const getTargetActivityId = (id) => {
      let temp;
      localLoadedProcessData.Connections.forEach((conn) => {
        if (+conn.SourceId === +id) temp = +conn.TargetId;
      });
      return temp;
    };

    let actInfoJson = {
      actId: props.activity.ActivityId,
      status: "U",
      mileStoneId: mileId,
      actType: props.activity.ActivityType,
      actSubType: props.activity.ActivitySubType,
      seqId: props.activity.SequenceId,
      actName: props.activity.ActivityName,
      // modified on 23/01/24 for BugId 140982
      // xLeftLoc: props.activity.xLeftLoc,
      xLeftLoc: +props.activity.xLeftLoc + mileWidth,
      // till here BugId 140982
      yTopLoc: props.activity.yTopLoc,
      laneId: props.activity.LaneId,
      blockId: props.activity.BlockId,
      queueId: props.activity.QueueId,
      queueCategory: props.activity.QueueCategory,
      color: props.activity.Color,
      isMobileEnabled: false,
      // modified on 14/10/23 for BugId 139485
      // propStatus: "U",
      propStatus: "N",
      // till here BugId 139485
      targetId: +getTargetActivityId(+props.activity.ActivityId),
    };
    let tempProp = CheckedAct.checkedActProp?.ActivityProperty;
    let localActProperty = tempProp ? JSON.parse(JSON.stringify(tempProp)) : {};
    let json = {
      processDefId: props.openProcessID,
      type: 3,
      comment: comment,
      pMActInfo: {
        ...actInfoJson,
        ...localActProperty,
        // added on 14/10/23 for BugId 139485
        propStatus: tempProp ? "U" : "N",
        // till here BugId 139485
      },
    };

    axios
      .post(SERVER_URL + ENDPOINT_CHECKIN_ACT, json)
      .then((response) => {
        if (response.data.Status === 0) {
          props.setprocessData((prev) => {
            let newProcessData = JSON.parse(JSON.stringify(prev));
            newProcessData.MileStones?.forEach((mile, idx) => {
              mile.Activities?.forEach((act, index) => {
                if (+act.ActivityId === +props.actId) {
                  newProcessData.MileStones[idx].Activities[index].CheckedOut =
                    "N";
                }
                // added on 02/02/23 for BugId 122866
                if (act.EmbeddedActivity) {
                  act.EmbeddedActivity[0]?.forEach((embAct, embIdx) => {
                    if (+embAct.ActivityId === +props.actId) {
                      newProcessData.MileStones[idx].Activities[
                        index
                      ].EmbeddedActivity[0][embIdx].CheckedOut = "N";
                    }
                  });
                }
                // till here BugId 122866
              });
            });
            return newProcessData;
          });
          let tempProcessData = JSON.parse(
            JSON.stringify(localLoadedProcessData)
          );
          // code edited on 30 March 2023 for BugId 125991
          const updatedCon = JSON.parse(
            JSON.stringify(response?.data?.Connection)
          );
          const newArr = updatedCon?.map((v) => ({
            ConnectionId: +v.ConnectionId,
            SourceId: +v.SourceId,
            TargetId: +v.TargetId,
            Type: v.Type,
            xLeft: [],
            yTop: [],
          }));
          tempProcessData.Connections = [...newArr];
          setLocalLoadedProcessData(tempProcessData);

          dispatch(
            setToastDataFunc({
              message: `${t("Activity")} ${props.actName} ${t(
                "hasBeenCheckedIn"
              )}`,
              severity: "success",
              open: true,
            })
          );
          dispatch(
            setCheckoutActEdited({
              isCheckoutActEdited: false,
              checkedActProp: {},
              actCheckedId: null,
              actCheckedName: null,
            })
          );
          props.setModalClosed();
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  return (
    <CommonModalBody
      buttonOne={t("ok")}
      modalType={props.modalType}
      modalHead={t("checkInActivity")}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      openProcessName={props.actName}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={checkInActivity}
      isBtnOneProcessing={loader}
      id="checkin_act"
    />
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(CheckInActivity);
