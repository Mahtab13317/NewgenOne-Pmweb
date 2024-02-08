// #BugID - 113632
// #BugDescription - Success message added.
// #Date - 18 Nov 2022
import axios from "axios";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  ENABLED_STATE,
  ENDPOINT_ENABLE,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import CommonModalBody from "../CommonModalBody";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";

function EnableProcess(props) {
  let { t } = useTranslation();
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();
  const [spinner, setSpinner] = useState(false);

  //code added on 26 July 2022 for BugId 110024
  const enableProcess = () => {
    setSpinner(true);
    if (comment.length > 254) {
      dispatch(
        setToastDataFunc({
          message: t("characterMsg"),
          severity: "error",
          open: true,
        })
      );
      setSpinner(false);
    } else {
      let json = {
        processDefId: +props.processDefId,
        // Added for Bug 127132 on 02-06-23
        comment: encode_utf8(comment),
        // Till here for Bug 127132
      };
      axios
        .post(SERVER_URL + ENDPOINT_ENABLE, json)
        .then((response) => {
          if (response.status === 200) {
            props.setModalClosed();
            setSpinner(false);
            props.setProcessData((prev) => {
              let temp = { ...prev };
              temp.ProcessState = ENABLED_STATE;
              return temp;
            });
            dispatch(
              setToastDataFunc({
                message: t("enabledProcess"),
                severity: "success",
                open: true,
              })
            );
          }
        })
        .catch((err) => {
          setSpinner(false);
          console.log(err);
        });
    }
  };

  return (
    <CommonModalBody
      buttonOne={t("enable")}
      modalType={props.modalType}
      modalHead={t("enable") + " " + t("processC")}
      openProcessName={props.openProcessName}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      comment={comment}
      setComment={setComment}
      //code added on 26 July 2022 for BugId 110024
      buttonOneFunc={enableProcess}
      isBtnOneProcessing={spinner}
      id="enable_process"
    />
  );
}

export default EnableProcess;
