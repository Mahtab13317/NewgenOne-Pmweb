// #BugID - 113632
// #BugDescription - Success message added.
// #Date - 18 Nov 2022
import axios from "axios";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  DISABLED_STATE,
  ENDPOINT_DISABLE,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import CommonModalBody from "../CommonModalBody";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";

function DisableProcess(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);

  //code added on 26 July 2022 for BugId 110024
  const disableProcess = () => {
    setLoader(true);
    if (comment.length > 254) {
      dispatch(
        setToastDataFunc({
          message: t("characterMsg"),
          severity: "error",
          open: true,
        })
      );
      setLoader(false);
    } else {
      let json = {
        processDefId: +props.processDefId,
        // Added for Bug 127132 on 02-06-23
        comment: encode_utf8(comment),
        // Till here for Bug 127132
      };
      axios
        .post(SERVER_URL + ENDPOINT_DISABLE, json)
        .then((response) => {
          if (response.status === 200) {
            props.setModalClosed();
            setLoader(false);
            props.setProcessData((prev) => {
              let temp = { ...prev };
              temp.ProcessState = DISABLED_STATE;
              return temp;
            });

            dispatch(
              setToastDataFunc({
                message: t("disabledProcess"),
                severity: "success",
                open: true,
              })
            );
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log(err);
        });
    }
  };

  return (
    <CommonModalBody
      buttonOne={t("disable")}
      modalType={props.modalType}
      modalHead={t("disable") + " " + t("processC")}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      comment={comment}
      setComment={setComment}
      //code added on 26 July 2022 for BugId 110024
      buttonOneFunc={disableProcess}
      isBtnOneProcessing={loader}
      id="disable_process"
    />
  );
}

export default DisableProcess;
