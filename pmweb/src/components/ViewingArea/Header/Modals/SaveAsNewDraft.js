// #BugID - 110938
// #BugDescription - payload changed for save the process

import React, { useState, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import styles from "../modal.module.css";
import SelectWithInput from "../../../../UI/SelectWithInput";
import axios from "axios";
import {
  ENDPOINT_GETPROJECTLIST,
  ENDPOINT_SAVE_LOCAL,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { store, useGlobalState } from "state-pool";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";
import { CircularProgress, Grid } from "@material-ui/core";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import {
  isArabicLocaleSelected,
  isEnglishLocaleSelected,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function SaveAsNewDraft(props) {
  let { t } = useTranslation();
  const poolProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(poolProcessData);
  const [comment, setComment] = useState("");
  const [projectList, setProjectList] = useState([]);
  const [projectName, setProjectName] = useState(
    localLoadedProcessData.ProjectName
  );
  const [isProjectNameConstant, setProjectNameConstant] = useState(false);
  const [process, setProcess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const processNameRef = useRef();

  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(SERVER_URL + ENDPOINT_GETPROJECTLIST)
      .then((res) => {
        if (res.status === 200) {
          setProjectList(res.data.Projects);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const saveAsNewDraft = () => {
    setLoader(true);
    let json = {
      processDefId: localLoadedProcessData.ProcessDefId,
      comment: comment,
      /*  projectName: projectName.ProjectName, */
      projectName: projectName,
      saveAsLocal: "Y",
      validateFlag: "N",
      bNewVersion: false,

      newProcessName: process,
      type: "1",
    };
    let regex = new RegExp(/^[A-Za-z][A-Za-z0-9_\_\s]*$/gm);

    if (comment.trim() !== "" && process.trim() !== "" && !!projectName) {
      /* code change for bug id 136880 */
      if (isEnglishLocaleSelected() && !regex.test(process)) {
        dispatch(
          setToastDataFunc({
            message: t("onlyAlphaNumAndSpaceUnderscoreAllowedMsg"),
            severity: "error",
            open: true,
          })
        );
        setLoader(false);
      } else if (process.length > 22) {
        dispatch(
          setToastDataFunc({
            message: t("processNameLengthErrorMsg"),
            severity: "error",
            open: true,
          })
        );
        setLoader(false);
      } else {
        axios
          .post(SERVER_URL + ENDPOINT_SAVE_LOCAL, json)
          .then((response) => {
            if (response.data.Status === 0) {
              dispatch(
                setToastDataFunc({
                  message: t("operationSuccessful"),
                  severity: "success",
                  open: true,
                })
              );
              setLoader(false);
              props.setModalClosed();
            }
          })
          .catch((err) => {
            setLoader(false);
            console.log(err);
          });
      }
      /**till here for bug id 136880 */
    } else {
      dispatch(
        setToastDataFunc({
          message: t("mandatoryErr"),
          severity: "error",
          open: true,
        })
      );
      setLoader(false);
    }
  };
  /* code change for bug id 136880 */

  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      const regex = new RegExp("[~`!@#$%^&*()+\\-={}\\[\\]|\\\\:\";'<>?,.//]+");
      return !regex.test(str);
    } else {
      const regex = new RegExp(
        /^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&\@\#\!\$\%\(\)\<\>\;\-]*$/gm
      );
      return regex.test(str);
    }
  };

  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value)) {
      setErrorMsg(t("ProcessErrorMsg"));
    } else if (e.target.value.length > 22) {
      setErrorMsg(t("processNameMsg"));
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg("");
    }
  };

  const changeProcessName = (e) => {
    validateData(e, t("NameofProcess"));
    setProcess(e.target.value);
  };
  /**till here for bug id 136880 */

  return (
    <React.Fragment>
      <div className={styles.subHeader}>
        {`${t("saveAsLocal")}`} : {props.openProcessName}
      </div>
      <div className={styles.subForm}>
        <p className="flex">
          <span className={styles.saveDraftLabel}>{t("project")}</span>
          <SelectWithInput
            inputClass={styles.projectNameTextField}
            constantInputClass={styles.projectConstInput}
            selectWithInput={styles.projectNameField}
            dropdownOptions={projectList}
            value={projectName}
            setValue={(val) => {
              setProjectName(val?.ProjectName ? val?.ProjectName : val);
            }} //Modified on 31/08/2023  for bug_id:135299
            /*setValue={(val) => {
              setProjectName(val);
            }}*/
            showEmptyString={false}
            showConstValue={true}
            setIsConstant={setProjectNameConstant}
            isConstant={isProjectNameConstant}
            constantStatement="project"
            constantOptionStatement="+addProject"
            optionStyles={{ color: "darkBlue" }}
            isConstantIcon={true}
            optionKey="ProjectName"
            id="saveAsLocal_project"
          />
        </p>
        {/*****************************************************************************************
         * @author asloob_ali BUG ID: 115854  More options: process name field should be marked as mandatory as validatrion appearing for it
         * Reason:new process name was not marked mandatory.
         * Resolution : added asterist to show its mandatory.
         * Date : 20/09/2022
         ****************/}
        <p className="flex">
          {/* Added on 7/9/2023 for BUGID: 135862 */}
          <label
            className={styles.saveDraftLabel}
            htmlFor="saveAsLocal_process"
          >
            {t("New")} {t("processC")} {t("name")}
            <span className={styles.starIcon}>*</span>
          </label>
          <div>
            <Grid container direction="column">
              <Grid item>
                <input
                  id="saveAsLocal_process"
                  value={process}
                  onChange={changeProcessName}
                  className={styles.saveDraftNameInput}
                  ref={processNameRef}
                  onKeyPress={(e) => {
                    FieldValidations(e, 169, processNameRef.current, 23);
                  }}
                />
              </Grid>
              <Grid item>
                {errorMsg != "" ? (
                  <p
                    style={{
                      color: "red",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {errorMsg}
                  </p>
                ) : null}
              </Grid>
            </Grid>
          </div>
        </p>
        <p className="flex">
          <span className={styles.saveDraftLabel}>{t("Version")}</span>
          <span className={styles.saveDraftVersion}>
            {props.existingVersion}
          </span>
        </p>
        <p className="flex">
          {/* Added on 7/9/2023 for BUGID: 135862 */}
          <label
            className={styles.saveDraftLabel}
            htmlFor="saveAsLocal_comment"
          >
            {t("comment")}
            {props.commentMandatory ? (
              <span className={styles.starIcon}>*</span>
            ) : null}
          </label>
          <textarea
            id="saveAsLocal_comment"
            className={styles.saveDraftTextArea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </p>
      </div>
      <div className={styles.footer}>
        <Button
          className={styles.cancelCategoryButton}
          onClick={() => props.setModalClosed()}
          id="saveAsLocal_cancelBtn"
        >
          {t("cancel")}
        </Button>
        <Button
          className={
            (comment.trim() === "" ||
              !comment ||
              (errorMsg && errorMsg.trim().length > 0)) &&
            props.commentMandatory
              ? styles.disabledCategoryButton
              : styles.addCategoryButton
          }
          onClick={saveAsNewDraft}
          id="saveAsLocal_saveBtn"
          disabled={
            ((comment.trim() === "" ||
              !comment ||
              (errorMsg && errorMsg.trim().length > 0)) &&
              props.commentMandatory) ||
            loader
          }
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
          {t("save")}
        </Button>
      </div>
    </React.Fragment>
  );
}

export default SaveAsNewDraft;
