import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommonModalBody from "../CommonModalBody";
import axios from "axios";
import {
  ENDPOINT_CHECKIN,
  ENDPOINT_VALIDATEPROCESS,
  SERVER_URL,
  PROCESSTYPE_REGISTERED,
} from "../../../../Constants/appConstants";
import { store, useGlobalState } from "state-pool";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { openProcessAPICall } from "../../../../utility/OpenProcessAPICallFunc";
import { CircularProgress } from "@material-ui/core";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { openProcessClick } from "../../../../redux-store/actions/processView/actions";

function CheckInModal(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  // Changes made to solve Bug 131801
  const [disableCancel, setDisableCancel] = useState(false);
  const [loader, setLoader] = useState(true);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const arrProcessesData = store.getState("arrProcessesData");
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const openProcessesArr = store.getState("openProcessesArr"); //array of keys of processdata stored
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const [isBtnOneProcessing, setIsBtnOneProcessing] = useState(false);
  const [isBtnTwoProcessing, setIsBtnTwoProcessing] = useState(false);
  const [isActionsDisabled, setIsActionsDisabled] = useState(false);
  const [createNewVersionFlag, setCreateNewVersionFlag] = useState(false); // State that stores the flag to show the 'Create as New Version' button on the basis of flag sent in the Open process API call.

  // Function that runs when the value localArrProcessesData changes.
  useEffect(() => {
    if (localArrProcessesData && props.openProcessID !== undefined) {
      const updatedArr = localArrProcessesData.filter(
        (d) => +d.ProcessDefId === +props.openProcessID
      );
      const getBooleanFlag = (value) => value === "Y";
      setCreateNewVersionFlag(
        getBooleanFlag(updatedArr[0]?.RequiredNewVersion)
      );
    }
  }, [localArrProcessesData]);

  useEffect(() => {
    const obj = {
      processDefId: localLoadedProcessData?.ProcessDefId,
      action: localLoadedProcessData?.CheckedOut === "Y" ? "CI" : "RE",
      processVariantType: "S",
    };
    axios.post(SERVER_URL + ENDPOINT_VALIDATEPROCESS, obj).then((res) => {
      let tempErrors = [];
      res?.data?.Error?.forEach((e) => {
        if (e.ErrorLevel === "E") {
          tempErrors.push(e);
        }
      });
      if (tempErrors.length > 0) {
        setIsActionsDisabled(true);
      }
      setLoader(false);
    });
  }, []);

  /*****************************************************************************************
   * @author asloob_ali BUG ID: 116262 - Checkin: if Checkin operation fails then appropriate message should appear on screen as it is confusing to the user whether the Checkin operation is in progress or it is actually failed
   * Reason:validation call was not being made and message was not being shown in case failure/success.
   * Resolution : added validation call and messages as notifications.
   * Date : 30/09/2022
   ****************/

  /*code updated on 21 Nov 2022 for BugId 116261*/
  const checkinProcess = async (bNewVersion) => {
    setDisableCancel(true);
    if (bNewVersion) {
      setIsBtnOneProcessing(true);
    } else {
      setIsBtnTwoProcessing(true);
    }

    if (comment.length > 254) {
      dispatch(
        setToastDataFunc({
          message: t("characterMsg"),
          severity: "error",
          open: true,
        })
      );
      setIsBtnOneProcessing(false);
      setIsBtnTwoProcessing(false);
    } else {
      let json = {
        processDefId: props.processDefId,
        bNewVersion: bNewVersion,
        // Added for Bug 127132 on 02-06-23
        comment: encode_utf8(comment),
        // Till here for Bug 127132
        type: 1,
        processVariantType: localLoadedProcessData?.ProcessVariantType,
        action: "CI",
      };
      axios
        .post(SERVER_URL + ENDPOINT_CHECKIN, json)
        .then(async (response) => {
          if (response?.data?.Status === 0) {
            try {
              const res = await openProcessAPICall(
                response?.data?.RegisteredProcessDefId,
                props.openProcessName,
                PROCESSTYPE_REGISTERED
              );
              if (res?.status === 200) {
                const newProcessData = { ...res?.data?.OpenProcess };
                // added on 05/09/2023 for BugId 135539
                let localArrIdx;
                localArrProcessesData.forEach((d, idx) => {
                  if (+d.ProcessDefId === +props.processDefId) {
                    localArrIdx = idx;
                  }
                });
                const updatedArr = localArrProcessesData.filter(
                  (d) => +d.ProcessDefId !== +props.processDefId
                );
                updatedArr.splice(localArrIdx, 0, {
                  ProcessDefId: newProcessData.ProcessDefId,
                  ProcessType: newProcessData.ProcessType,
                  ProcessName: newProcessData.ProcessName,
                  ProjectName: newProcessData.ProjectName,
                  VersionNo: newProcessData.VersionNo,
                  ProcessVariantType: newProcessData.ProcessVariantType,
                  isProcessActive: true,
                });
                let temp = [...localOpenProcessesArr];
                let idx = localOpenProcessesArr.indexOf(
                  `${props.processDefId}#L`
                );
                temp.splice(idx, 1);
                temp.splice(idx, 0, `${newProcessData.ProcessDefId}#R`);
                setLocalOpenProcessesArr(temp);
                setLocalArrProcessesData(updatedArr);
                setLocalLoadedProcessData(newProcessData);
                // added on 05/09/2023 for BugId 135531, BugId 135880
                dispatch(
                  openProcessClick(
                    newProcessData?.ProcessDefId,
                    newProcessData.ProjectName,
                    newProcessData.ProcessType,
                    newProcessData.VersionNo,
                    newProcessData?.ProcessName
                  )
                );
              }
              props.setModalClosed();
              setIsBtnOneProcessing(false);
              setIsBtnTwoProcessing(false);
              dispatch(
                setToastDataFunc({
                  message: t("checkedInSuccessMsg"),
                  severity: "success",
                  open: true,
                })
              );
            } catch (error) {
              console.log(error);
            }
          } else {
            setIsBtnOneProcessing(false);
            setIsBtnTwoProcessing(false);
            let msg = "";
            if (response?.data?.message) {
              msg = response?.data?.message;
            } else if (response?.data?.Message) {
              msg = response?.data?.Message;
            } else {
              msg = t("checkedInFailedMsg");
            }
            dispatch(
              setToastDataFunc({
                message: msg /*code updated on 10 Dec 2022 for BugId 117664*/,
                severity: "error",
                open: true,
              })
            );
          }
        })
        .catch((err) => {
          setIsBtnOneProcessing(false);
          setIsBtnTwoProcessing(false);
          console.log(err);
        });
    }
  };

  return loader ? (
    <CircularProgress style={{ margin: "12.75vh 45%" }} />
  ) : (
    <CommonModalBody
      disableCancel={disableCancel}
      buttonOne={`${t("checkInAsNewProcess")} (${t("v")}${(
        +props.existingVersion + 1
      ).toFixed(1)})`}
      buttonTwo={t("OverwriteCurrentVersion")}
      modalType={props.modalType}
      modalHead={t("checkingInProcess")}
      openProcessName={props.openProcessName}
      setModalClosed={props.setModalClosed}
      commentMandatory={true}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={() => checkinProcess(true)}
      buttonTwoFunc={() => checkinProcess(false)}
      isBtnOneProcessing={isBtnOneProcessing}
      isBtnTwoProcessing={isBtnTwoProcessing}
      isActionsDisabled={isActionsDisabled}
      toggleDrawer={props.toggleDrawer}
      id="checkin_process"
      showBtnOne={createNewVersionFlag}
    />
  );
}

export default CheckInModal;
