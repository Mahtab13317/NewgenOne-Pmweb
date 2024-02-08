import React, { useState } from "react";
import CommonModalBody from "../CommonModalBody";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  ENDPOINT_UNDO_CHECKOUT,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { store, useGlobalState } from "state-pool";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";

function UndoCheckoutModal(props) {
  let { t } = useTranslation();
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [loader, setLoader] = useState(false);

  /*code added on 17 Nov 2022 for BugId 117899*/

  const undoCheckoutProcess = () => {
    setLoader(true);
    let json = {
      processDefId: +localLoadedProcessData?.ProcessDefId,
      // Added for Bug 127132 on 02-06-23
      comment: encode_utf8(comment),
      // Till here for Bug 127132
      projectName: props.projectName,
      type: 1,
    };
    axios
      .post(SERVER_URL + ENDPOINT_UNDO_CHECKOUT, json)
      .then((response) => {
        if (response.data.Status === 0) {
          props.setModalClosed();
          setLoader(false);
          props.checkOutFunc("N");
          let tempProcessData = global.structuredClone(localLoadedProcessData);
          tempProcessData.CheckedOut = "N";
          setlocalLoadedProcessData(tempProcessData);
          dispatch(
            setToastDataFunc({
              message: t("undoCheckedOutProcess"),
              severity: "success",
              open: true,
            })
          );
          // history.push("/");
        } else {
          let msg = "";
          if (response?.data?.message) {
            msg = response?.data?.message;
          } else {
            msg = t("undoCheckedOutFailedMsg");
          }
          dispatch(
            setToastDataFunc({
              message: response?.data?.message,
              severity: "error",
              open: true,
            })
          );
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
      buttonOne={t("undoCheckout")}
      modalType={props.modalType}
      modalHead={t("undoCheckingOutProcess")}
      openProcessName={props.openProcessName}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={undoCheckoutProcess}
      isBtnOneProcessing={loader}
      id="undo_checkout"
    />
  );
}

export default UndoCheckoutModal;
