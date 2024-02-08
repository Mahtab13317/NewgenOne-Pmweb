import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { connect, useDispatch } from "react-redux";
import CommonModalBody from "../Header/CommonModalBody";
import {
  ENDPOINT_CHECKOUT_LANE,
  SERVER_URL,
} from "../../../Constants/appConstants";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";

function CheckOutLaneModal(props) {
  let { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();

  const checkoutLane = () => {
    setLoader(true);
    let json = {
      processDefId: props.openProcessID,
      type: 2,
      comment: comment,
      swilaneId: props.laneId,
      swimlaneName: props.laneName,
    };

    axios
      .post(SERVER_URL + ENDPOINT_CHECKOUT_LANE, json)
      .then((response) => {
        if (response.data.Status === 0) {
          props.setprocessData((prev) => {
            let newProcessData = JSON.parse(JSON.stringify(prev));
            newProcessData.Lanes?.forEach((lane, idx) => {
              if (+lane.LaneId === +props.laneId) {
                newProcessData.Lanes[idx].CheckedOut = "Y";
              }
            });
            return newProcessData;
          });
          dispatch(
            setToastDataFunc({
              message: `${props.laneName} ${t("hasBeenCheckedOut")}`,
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
      modalHead={t("checkOutSwimlane")}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      openProcessName={props.laneName}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={checkoutLane}
      isBtnOneProcessing={loader}
      id="checkout_lane"
    />
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(CheckOutLaneModal);
