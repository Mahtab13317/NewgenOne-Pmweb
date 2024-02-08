import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CommonModalBody from "../CommonModalBody";
import axios from "axios";
import {
  ENDPOINT_CHECKOUT,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { store, useGlobalState } from "state-pool";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";

function CheckOutModal(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [isBtnOneProcessing, setIsBtnOneProcessing] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);

  /*****************************************************************************************
   * @author asloob_ali BUG ID: 116260 - Checkout: if checkout operation fails then appropriate message should appear on screen as it confusing to the user whether the check out operation is in progress or it is actually failed
   * Reason: message was not being shown in case failure/success.
   * Resolution : added messages as notifications.
   * Date : 30/09/2022
   ****************/
  const checkoutProcess = () => {
    setIsBtnOneProcessing(true);
    if (comment.length > 254) {
      dispatch(
        setToastDataFunc({
          message: t("characterMsg"),
          severity: "error",
          open: true,
        })
      );
      setIsBtnOneProcessing(false);
    } else {
      let json = {
        processDefId: +props.processDefId,
        projectName: props.projectName,
        type: 1,
        bNewVersion: true,
        saveAsLocal: "N",
        validateFlag: "N",
        // Added for Bug 127132 on 02-06-23
        comment: encode_utf8(comment),
        // Till here for Bug 127132
      };
      axios
        .post(SERVER_URL + ENDPOINT_CHECKOUT, json)
        .then((response) => {
          if (response.data.Status === 0) {
            props.setModalClosed();
            setIsBtnOneProcessing(false);
            props.checkOutFunc("Y");
            let tempProcessData = global.structuredClone(
              localLoadedProcessData
            );
            tempProcessData.CheckedOut = "Y";
            setlocalLoadedProcessData(tempProcessData);
            dispatch(
              setToastDataFunc({
                message: t("checkedOutSuccessMsg"),
                severity: "success",
                open: true,
              })
            );
            //history.push("/");
          } else {
            setIsBtnOneProcessing(false);
            let msg = "";
            if (response?.data?.message) {
              msg = response?.data?.message;
            } else if (response?.data?.Message) {
              msg = response?.data?.Message;
            } else {
              msg = t("checkedOutFailedMsg");
            }
            dispatch(
              setToastDataFunc({
                message: msg /*code updated on 10 Dec 2022 for BugId 117653*/,
                severity: "error",
                open: true,
              })
            );
          }
        })
        .catch((err) => {
          setIsBtnOneProcessing(false);
          console.log(err);
        });
    }
  };

  return (
    <CommonModalBody
      buttonOne={t("Checkout")}
      modalType={props.modalType}
      modalHead={t("checkOutProcess")}
      openProcessName={props.openProcessName}
      setModalClosed={props.setModalClosed}
      projectName={props.projectName}
      commentMandatory={true}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={checkoutProcess}
      isBtnOneProcessing={isBtnOneProcessing}
      id="checkout_process"
    />
  );
}

export default CheckOutModal;
