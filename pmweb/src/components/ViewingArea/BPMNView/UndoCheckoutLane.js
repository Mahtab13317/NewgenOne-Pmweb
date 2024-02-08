import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { connect, useDispatch } from "react-redux";
import CommonModalBody from "../Header/CommonModalBody";
import {
  ENDPOINT_OPENPROCESS,
  ENDPOINT_UNDOCHECKOUT_LANE,
  SERVER_URL,
} from "../../../Constants/appConstants";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { store, useGlobalState } from "state-pool";

function UndoCheckoutLane({ laneName, laneId, setprocessData, ...props }) {
  let { t } = useTranslation();
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [loader, setLoader] = useState(false);

  const undoCheckoutLane = async () => {
    setLoader(true);
    let payload = {
      processDefId: localLoadedProcessData.ProcessDefId,
      type: 2,
      comment: comment,
      swilaneId: laneId + "",
      swimlaneName: laneName,
    };
    const undoCheckoutRes = await axios.post(
      SERVER_URL + ENDPOINT_UNDOCHECKOUT_LANE,
      payload
    );
    try {
      if (undoCheckoutRes?.data?.Status === 0) {
        const openProcessRes = await axios.get(
          SERVER_URL +
            ENDPOINT_OPENPROCESS +
            props.openProcessID +
            "/" +
            props.openProcessName +
            "/" +
            props.openProcessType
        );
        if (openProcessRes?.data?.Status === 0) {
          setLocalLoadedProcessData(openProcessRes?.data?.OpenProcess);
          dispatch(
            setToastDataFunc({
              message: `${laneName} ${t("hasBeenReverted")}`,
              severity: "success",
              open: true,
            })
          );
          props.setModalClosed();
          setLoader(false);
        }
      }
    } catch (err) {
      setLoader(false);
      console.log(err);
    }
  };

  return (
    <CommonModalBody
      buttonOne={t("ok")}
      modalType={props.modalType}
      modalHead={t("undoCheckout") + " " + t("swimlaneName")} //modified on 14/09/2023 for BugId 136853
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      openProcessName={laneName}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={undoCheckoutLane}
      isBtnOneProcessing={loader}
      id="undocheckout_lane"
    />
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(UndoCheckoutLane);
