import React from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import styles from "../modal.module.css";
import {
  ENDPOINT_DELETE_PROCESS,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { store, useGlobalState } from "state-pool";
//import FocusTrap from "focus-trap-react";
import { FocusTrap } from "@mui/base";
import { useState } from "react";
import { CircularProgress } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";

function DeleteDraftProcess(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const arrProcessesData = store.getState("arrProcessesData");
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const openProcessesArr = store.getState("openProcessesArr"); //array of keys of processdata stored
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const [loader, setLoader] = useState(false);
  const history = useHistory();

  // code update on 26 Dec 2022 for  BugId 112955
  const deleteProcess = () => {
    setLoader(true);
    const updatedArr = localArrProcessesData.filter(
      (d) => +d.ProcessDefId !== +props.processDefId
    );

    let postBody = {
      m_strProjectId: props.projectId,
      m_strProcessDefId: props.processDefId,
      allVersion: "N",
      m_strProcessType: localLoadedProcessData.ProcessType,
    };

    axios
      .post(SERVER_URL + ENDPOINT_DELETE_PROCESS, postBody)
      .then((response) => {
        if (response.data.Status === 0) {
          let temp = [...localOpenProcessesArr];
          temp.splice(
            localOpenProcessesArr.indexOf(
              `${localLoadedProcessData.ProcessDefId}#${localLoadedProcessData.ProcessType}`
            ),
            1
          );
          setLocalOpenProcessesArr(temp);
          setLocalArrProcessesData(updatedArr);
          setlocalLoadedProcessData(null);
          dispatch(
            setToastDataFunc({
              message: t("processDeleteSuccessMsg"),
              severity: "success",
              open: true,
            })
          );
          history.push("/");
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  // code update on 26 Dec 2022 for  BugId 112955
  const deleteAllProcess = () => {
    setLoader(true);
    let versionArr = [];
    localArrProcessesData
      .filter((d) => d.ProcessName === props.openProcessName)
      .forEach((data, i) => {
        versionArr.push(`${data.ProcessDefId}#${data.ProcessType}`);
      });

    const updatedArr = localArrProcessesData.filter(
      (d) => d.ProcessName !== props.openProcessName
    );
    let temp = [...localOpenProcessesArr];

    const array3 = temp.filter(function (obj) {
      return versionArr.indexOf(obj) == -1;
    });

    let postBody = {
      m_strProjectId: props.projectId,
      m_strProcessDefId: props.processDefId,
      allVersion: "Y",
    };
    axios
      .post(SERVER_URL + ENDPOINT_DELETE_PROCESS, postBody)
      .then((response) => {
        if (response.data.Status === 0) {
          setLocalOpenProcessesArr(array3);
          setLocalArrProcessesData(updatedArr);
          setlocalLoadedProcessData(null);
          dispatch(
            setToastDataFunc({
              message: t("processDeleteSuccessMsg"),
              severity: "success",
              open: true,
            })
          );
          history.push("/");
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  return (
    <FocusTrap open>
      <div>
        <div className={styles.subHeader}>{t("beforeDeleteSurity")}</div>
        <p className={styles.deleteModalSubHeading}>
          {t("processC")} :
          <span>
            <span className={styles.deleteProcessName}>
              {props.openProcessName}
            </span>
            <span className={styles.deleteVersion}>
              {t("Version")} {props.existingVersion}
            </span>
          </span>
        </p>
        <div className={styles.noteDiv}>
          <p>
            {props.versionList.length > 1
              ? t("noRecoveryNote")
              : t("noRecoveryPermanent")}
          </p>
        </div>
        <div className={styles.footer}>
          <Button
            className={styles.cancelCategoryButton}
            onClick={() => props.setModalClosed()}
            id="hddp_cancel_btn"
          >
            {t("cancel")}
          </Button>
          {props.versionList.length > 1 ? (
            <React.Fragment>
              <Button
                className={styles.outlinedButton}
                id="hddp_deleteAllV_btn"
                onClick={() => deleteAllProcess()}
                disabled={loader}
              >
                {loader ? (
                  <CircularProgress
                    color="#FFFFFF"
                    style={{
                      height: "1rem",
                      width: "1rem",
                    }}
                  />
                ) : null}
                {t("deleteAllVersions")}
              </Button>
              <Button
                className={styles.addCategoryButton}
                id="hddp_deleteThisV_btn"
                onClick={() => deleteProcess()}
                disabled={loader}
              >
                {loader ? (
                  <CircularProgress
                    color="#FFFFFF"
                    style={{
                      height: "1rem",
                      width: "1rem",
                    }}
                  />
                ) : null}
                {t("deleteThisVersion")} ({t("v")} {props.existingVersion})
              </Button>
            </React.Fragment>
          ) : (
            <Button
              className={styles.addCategoryButton}
              id="hddp_delete_btn"
              onClick={() => deleteProcess()}
              disabled={loader}
            >
              {loader ? (
                <CircularProgress
                  color="#FFFFFF"
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                />
              ) : null}
              {t("delete")}
            </Button>
          )}
        </div>
      </div>
    </FocusTrap>
  );
}

export default DeleteDraftProcess;
