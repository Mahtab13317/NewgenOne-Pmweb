// #BugID - 110759
// #BugDescription - payload changed for save the process
// #BugID - 117439
// #BugDescription - Success message changed
// #Date- 18 Nov 2022

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ENDPOINT_SAVE_MAJOR,
  ENDPOINT_SAVE_MINOR,
  VERSION_TYPE_MAJOR,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import CommonModalBody from "../CommonModalBody";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { openProcessAPICall } from "../../../../utility/OpenProcessAPICallFunc";
import { openProcessClick } from "../../../../redux-store/actions/processView/actions";

function SaveAsNewVersion(props) {
  let { t } = useTranslation();
  const poolProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(poolProcessData);
  const arrProcessesData = store.getState("arrProcessesData");
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const openProcessesArr = store.getState("openProcessesArr"); //array of keys of processdata stored
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const [selectedType, setSelectedType] = useState(VERSION_TYPE_MAJOR);
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();

  // commented on 04/09/2023 for Bug 134948
  // Function that is called when Enter key or Esc key is pressed.
  // const handleModalKeyDown = (e) => {
  //   if (e.keyCode === 13 && comment === "") {
  //     saveFunction();
  //   }
  // };
  // // Function that runs when the handleModalKeyDown value changes.
  // useEffect(() => {
  //   document.addEventListener("keydown", handleModalKeyDown);
  //   return () => document.removeEventListener("keydown", handleModalKeyDown);
  // }, [handleModalKeyDown]);

  /*code updated on 21 October 2022 for BugId 117362*/
  const saveFunction = () => {
    setLoader(true);
    if (selectedType === VERSION_TYPE_MAJOR) {
      let json = {
        processDefId: props.processDefId.toString(),
        version: props.existingVersion.toString(),
        processName: localLoadedProcessData.ProcessName,
      };
      axios
        .post(SERVER_URL + ENDPOINT_SAVE_MAJOR, json)
        .then(async (response) => {
          if (response?.data?.Status === 0) {
            // Changing versions in OpenProcessCall to solve #Bug 116336
            try {
              const res = await openProcessAPICall(
                response?.data?.ProcessDefId,
                localLoadedProcessData?.ProcessName,
                localLoadedProcessData?.ProcessType
              );
              if (res?.status === 200) {
                const newProcessData = res?.data?.OpenProcess;
                // added on 05/09/2023 for BugId 135574, BugId 135564, BugId 135560, BugId 135584,
                // BugId 134957, BugId 135576, BugId 135218
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
                temp.splice(idx, 0, `${newProcessData.ProcessDefId}#L`);
                setLocalOpenProcessesArr(temp);
                setLocalArrProcessesData(updatedArr);
                setlocalLoadedProcessData(newProcessData);
                // added on 05/09/2023 for BugId 135574, BugId 135564, BugId 135560, BugId 135584,
                // BugId 134957, BugId 135576, BugId 135218
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
            } catch (error) {
              console.log(error);
            }
            dispatch(
              setToastDataFunc({
                message: t("saveAsMajorVersion"),
                severity: "success",
                open: true,
              })
            );
            props.setModalClosed();
            setLoader(false);
          } else {
            dispatch(
              setToastDataFunc({
                message: response.data.Message,
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
    } else {
      let json = {
        processDefId: props.processDefId.toString(),
        version: props.existingVersion.toString(),
        processName: localLoadedProcessData.ProcessName,
      };
      axios
        .post(SERVER_URL + ENDPOINT_SAVE_MINOR, json)
        .then(async (response) => {
          if (response.data.Status === 0) {
            try {
              const res = await openProcessAPICall(
                response?.data?.ProcessDefId,
                localLoadedProcessData?.ProcessName,
                localLoadedProcessData?.ProcessType
              );
              if (res?.status === 200) {
                const newProcessData = res?.data?.OpenProcess;
                // added on 05/09/2023 for BugId 135574, BugId 135564, BugId 135560, BugId 135584,
                // BugId 134957, BugId 135576, BugId 135218
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
                temp.splice(idx, 0, `${newProcessData.ProcessDefId}#L`);
                setLocalOpenProcessesArr(temp);
                setLocalArrProcessesData(updatedArr);
                setlocalLoadedProcessData(newProcessData);
                // added on 05/09/2023 for BugId 135574, BugId 135564, BugId 135560, BugId 135584,
                // BugId 134957, BugId 135576, BugId 135218
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
            } catch (error) {
              console.log(error);
            }
            dispatch(
              setToastDataFunc({
                message: t(`saveAsMinorVersion`), //code updated on 29 Nov 2022 for BugId 117614
                severity: "success",
                open: true,
              })
            );
            props.setModalClosed();
            setLoader(false);
          } else {
            dispatch(
              setToastDataFunc({
                message: response.data.Message,
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
    }
  };

  return (
    <CommonModalBody
      buttonOne={t("save")}
      modalType={props.modalType}
      modalHead={t("saveAsNewVersion")}
      setModalClosed={props.setModalClosed}
      commentMandatory={false}
      existingVersion={localLoadedProcessData?.VersionNo}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      comment={comment}
      setComment={setComment}
      buttonOneFunc={saveFunction}
      isBtnOneProcessing={loader}
      id="saveAsNewVersion"
    />
  );
}

export default SaveAsNewVersion;
