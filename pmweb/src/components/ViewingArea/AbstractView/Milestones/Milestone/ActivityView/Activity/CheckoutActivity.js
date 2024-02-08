import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import CommonModalBody from "../../../../../Header/CommonModalBody";
import {
  ENDPOINT_CHECKOUT_ACT,
  SERVER_URL,
} from "../../../../../../../Constants/appConstants";
import { connect, useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";

function CheckOutActModal(props) {
  let { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();

  const checkoutActivity = () => {
    setLoader(true);
    let json = {
      processDefId: props.openProcessID,
      type: 3,
      comment: comment,
      activityId: props.actId,
      swilaneId: props.laneId,
      activityName: props.actName,
    };

    axios
      .post(SERVER_URL + ENDPOINT_CHECKOUT_ACT, json)
      .then((response) => {
        if (response.data.Status === 0) {
          props.setprocessData((prev) => {
            let newProcessData = JSON.parse(JSON.stringify(prev));
            newProcessData.MileStones?.forEach((mile, idx) => {
              mile.Activities?.forEach((act, index) => {
                if (+act.ActivityId === +props.actId) {
                  newProcessData.MileStones[idx].Activities[index].CheckedOut =
                    "Y";
                }
                // code added on 2 Feb 2023 for BugId 122866
                if (act.EmbeddedActivity) {
                  act.EmbeddedActivity[0]?.forEach((embAct, embIdx) => {
                    if (+embAct.ActivityId === +props.actId) {
                      newProcessData.MileStones[idx].Activities[
                        index
                      ].EmbeddedActivity[0][embIdx].CheckedOut = "Y";
                    }
                  });
                }
              });
            });
            return newProcessData;
          });
          dispatch(
            setToastDataFunc({
              message: `${t("Activity")} ${props.actName} ${t(
                "hasBeenCheckedOut"
              )}`,
              severity: "success",
              open: true,
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
      modalHead={t("checkOutActivity")}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      openProcessName={props.actName}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={checkoutActivity}
      isBtnOneProcessing={loader}
      id="checkout_act"
    />
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(CheckOutActModal);
