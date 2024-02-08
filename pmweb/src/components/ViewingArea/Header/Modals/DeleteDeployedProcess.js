import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import styles from "../modal.module.css";
import {
  ENDPOINT_DELETE_PROCESS_DEPLOYED,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { FocusTrap } from "@mui/base";
import { CircularProgress } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";

function DeleteProcess(props) {
  let { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const arrProcessesData = store.getState("arrProcessesData");
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const openProcessesArr = store.getState("openProcessesArr"); //array of keys of processdata stored
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const dispatch = useDispatch();
  const history = useHistory();

  //code edited on 13 Mar 2023 for BugId 120319
  const deleteProcess = () => {
    setLoader(true);
    if (comment?.trim() === "" || comment === null) {
      dispatch(
        setToastDataFunc({
          message: t("enterComment"),
          severity: "error",
          open: true,
        })
      );
      setLoader(false);
    } else {
      const updatedArr = localArrProcessesData.filter(
        (d) => +d.ProcessDefId !== +props.processDefId
      );
      let postBody = {
        m_strProcessDefId: props.processDefId,
        comment: comment,
      };
      axios
        .post(SERVER_URL + ENDPOINT_DELETE_PROCESS_DEPLOYED, postBody)
        .then((response) => {
          if (response.status === 200) {
            // added on 31/01/24 for BugId 143102
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
            // till here BugId 143102
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
    }
  };

  return (
    <FocusTrap open>
      <div>
        <div className={styles.subHeader}>{t("beforeDeleteSurity")}</div>
        <p className={styles.deleteModalSubHeading}>
          <span className={styles.processHeading}>{t("processC")}</span>
          <span>
            <span className={styles.deleteProcessName}>
              {props.openProcessName}
            </span>
            <span className={styles.deleteVersion}>
              {t("Version")} {props.existingVersion}
            </span>
          </span>
        </p>
        <p className={styles.deleteComment}>
          {/* Added on 7/9/2023 for BUGID: 135862 */}
          <label
            className={styles.deleteCommentHeading}
            htmlFor="hdedp_comment"
          >
            {t("comment")}
            <span className={styles.starIcon}>*</span>
          </label>
          <textarea
            id="hdedp_comment"
            className={styles.commentArea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </p>
        <div className={styles.noteDiv}>
          <p>{t("deleteDeployedProcessNote")}</p>
        </div>
        <div className={styles.footer}>
          <Button
            className={styles.cancelCategoryButton}
            onClick={() => props.setModalClosed()}
            id="hdedp_cancel_btn"
          >
            {t("cancel")}
          </Button>
          <Button
            /*code edited on 13 Mar 2023 for BugId 120319*/
            className={
              comment?.trim() === "" || comment === null || loader
                ? styles.disabledCategoryButton
                : styles.addCategoryButton
            }
            id="hdedp_delete_btn"
            onClick={() => deleteProcess()}
            disabled={comment?.trim() === "" || comment === null || loader}
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
        </div>
      </div>
    </FocusTrap>
  );
}

export default DeleteProcess;
