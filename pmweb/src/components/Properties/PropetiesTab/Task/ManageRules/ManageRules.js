import React, { useState, useRef, useEffect } from "react";
import TaskRules from "./TaskRules";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@material-ui/core";
import styles from "../Task.module.css";
import { store, useGlobalState } from "state-pool";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { SPACE, propertiesLabel } from "../../../../../Constants/appConstants";
import { useDispatch } from "react-redux";

import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import { isArabicLocaleSelected } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";

function ManageRules(props) {
  let { t } = useTranslation();
  let { taskInfo, isReadOnly } = props;
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(actProperty);
  const [checkTask, setCheckTask] = useState({
    m_bStateAsWait: false,
    m_bMandatory: false,
    m_bTaskReassign: false,
    m_bTaskApprove: false,
    m_bTaskDecline: false,
    m_bInitiateTask: false,
    m_bSeeVisualization: false,
  });
  const [waitStateText, setWaitStateText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const defaultRef = useRef();
  const mandatoryRef = useRef();
  const reassignRef = useRef();
  const declineRef = useRef();
  const approveRef = useRef();
  const initiateRef = useRef();
  const seeCaseProgressRef = useRef();
  const defaultWaitRef = useRef();
  useEffect(() => {
    let checkObj = { ...checkTask };
    Object.keys(checkTask)?.forEach((el) => {
      let newVal =
        localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
          ?.objPMWdeskTasks?.taskMap[taskInfo.taskTypeInfo.taskName] &&
        localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
          ?.objPMWdeskTasks?.taskMap[taskInfo.taskTypeInfo.taskName][el];
      checkObj = {
        ...checkObj,
        [el]: newVal ? newVal : false,
      };
    });
    setCheckTask(checkObj);
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTasks?.taskMap[taskInfo?.taskTypeInfo?.taskName] &&
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTasks?.taskMap[taskInfo?.taskTypeInfo?.taskName][
        "m_bMandatoryText"
      ]
    ) {
      setWaitStateText(
        localLoadedActivityPropertyData.ActivityProperty.wdeskInfo
          .objPMWdeskTasks.taskMap[taskInfo.taskTypeInfo.taskName][
          "m_bMandatoryText"
        ]
      );
    }
  }, [localLoadedActivityPropertyData]);

  const CheckTaskHandler = (e) => {
    let tempActJSON = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempActJSON.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
      taskInfo.taskTypeInfo.taskName
    ] = {
      ...tempActJSON.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
        taskInfo.taskTypeInfo.taskName
      ],
      [e.target.name]: e.target.checked,
    };
    if (e.target.name === "m_bStateAsWait" && !e.target.checked) {
      setWaitStateText("");
      delete tempActJSON.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
        taskInfo.taskTypeInfo.taskName
      ]["m_bMandatoryText"];
    }
    setlocalLoadedActivityPropertyData(tempActJSON);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };
  //added on 20-9-2023 for bug_id: 135812
  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      const regex = new RegExp(
        "^[^`~!@#$%^&*()\\-+=\\{\\}|\\\\\\]\\[:\"';?><,./]+$"
      );
      return regex.test(str);
    } else {
      const regex = new RegExp("^[a-zA-Z][\\w ]*$");
      return regex.test(str);
    }
  };
  const validateData = (e, val) => {
    if (e.target.value != "" && e.target.value.length > 150) {
      setErrorMsg(`${val}${SPACE}${t("lengthShouldNotExceed150Characters")}`);
    } else if (!containsSpecialChars(e.target.value) && e.target.value != "") {
      if (isArabicLocaleSelected()) {
        setErrorMsg(`${val}${SPACE}${t("onlySpaceAndUnderscoreareAllowed")}`);
      } else {
        setErrorMsg(
          `${val}${SPACE}${t("onlySpaceAndUnderscoreareAllowed")}${SPACE}${t(
            "AndFirstCharacterShouldBeAlphabet"
          )}
        `
        );
      }
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };
  // till here for bug_id: 135812
  const waitTextHandler = (e) => {
    validateData(e, t("DefaultStateWaiting")); //added on 20-9-2023 for bug_id: 135812
    let tempActJSON = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempActJSON.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
      taskInfo.taskTypeInfo.taskName
    ] = {
      ...tempActJSON.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
        taskInfo.taskTypeInfo.taskName
      ],
      ["m_bMandatoryText"]: e.target.value,
    };
    // provided fix for rejected case of bug_id: 135812
    // setWaitStateText(
    //   localLoadedActivityPropertyData.ActivityProperty.wdeskInfo.objPMWdeskTasks
    //     .taskMap[taskInfo.taskTypeInfo.taskName]["m_bMandatoryText"]
    // );
    setWaitStateText(e.target.value);

    setlocalLoadedActivityPropertyData(tempActJSON);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        fontFamily: "var(--font_family)",
        padding: "0.5rem 0",
        direction: direction,
      }}
    >
      <div
        style={{
          display: "flex",
          columnGap: "1.5vw",
          flexWrap: "wrap",
          alignItems: "center",
          padding: "0 1vw 0.5rem",
        }}
      >
        <div className={styles.checklist}>
          <label
            htmlFor="pmweb_ManageRules_DefaultStateWaiting_Checkbox"
            style={{ display: "none" }}
          >
            frve
          </label>
          <Checkbox
            checked={checkTask["m_bStateAsWait"]}
            onChange={(e) => CheckTaskHandler(e)}
            className={styles.mainCheckbox}
            data-testid="CheckTodo"
            type="checkbox"
            name="m_bStateAsWait"
            disabled={isReadOnly}
            id="pmweb_ManageRules_DefaultStateWaiting_Checkbox"
            inputRef={defaultRef}
            inputProps={{
              "aria-label": t("DefaultStateWaiting"),
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                defaultRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          {t("DefaultStateWaiting")}
        </div>
        <label
          style={{ display: "none" }}
          htmlFor="pmweb_ManageRules_ReasonForDefaultWaiting_textarea"
        >
          hgfw
        </label>
        <textarea
          placeholder={
            !checkTask["m_bStateAsWait"] ? t("ReasonForDefaultWaiting") : ""
          }
          className={styles.waitingTextArea}
          disabled={!checkTask["m_bStateAsWait"] || isReadOnly}
          value={waitStateText}
          onChange={(e) => waitTextHandler(e)}
          id="pmweb_ManageRules_ReasonForDefaultWaiting_textarea"
          ref={defaultWaitRef}
          onKeyPress={(e) =>
            FieldValidations(e, 164, defaultWaitRef.current, 150)
          }
        />
        {errorMsg != "" ? (
          <p
            style={{
              color: "red",
              fontSize: "12px",
              fontWeight: "500",
              marginInline: "10px",
            }}
          >
            {errorMsg}
          </p>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          columnGap: "3.5vw",
          flexWrap: "wrap",
          padding: "0 1vw 0.5rem",
        }}
      >
        <div className={styles.checklist}>
          <label
            htmlFor="pmweb_ManageRules_MakeMandatory_checkbox"
            style={{ display: "none" }}
          >
            frve
          </label>
          <Checkbox
            checked={checkTask["m_bMandatory"]}
            onChange={(e) => CheckTaskHandler(e)}
            className={styles.mainCheckbox}
            data-testid="CheckTodo"
            type="checkbox"
            name="m_bMandatory"
            disabled={isReadOnly}
            id="pmweb_ManageRules_MakeMandatory_checkbox"
            inputProps={{
              "aria-label": t("MakeMandatory"),
            }}
            inputRef={mandatoryRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                mandatoryRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          {t("MakeMandatory")}
        </div>
        <div className={styles.checklist}>
          <label
            htmlFor="pmweb_ManageRules_AllowReassignment_checkbox"
            style={{ display: "none" }}
          >
            frve
          </label>
          <Checkbox
            checked={checkTask["m_bTaskReassign"]}
            onChange={(e) => CheckTaskHandler(e)}
            className={styles.mainCheckbox}
            data-testid="CheckTodo"
            type="checkbox"
            name="m_bTaskReassign"
            inputProps={{
              "aria-label": t("AllowReassignment"),
            }}
            disabled={
              isReadOnly ||
              (taskInfo?.taskTypeInfo?.taskType === 2 &&
                (taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                  "S" ||
                  taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                    "A"))
            }
            id="pmweb_ManageRules_AllowReassignment_checkbox"
            inputRef={reassignRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                reassignRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          {t("AllowReassignment")}
        </div>
        <div className={styles.checklist}>
          <label
            htmlFor="pmweb_ManageRules_AllowDecline_checkbox"
            style={{ display: "none" }}
          >
            frve
          </label>
          <Checkbox
            checked={checkTask["m_bTaskDecline"]}
            onChange={(e) => CheckTaskHandler(e)}
            className={styles.mainCheckbox}
            data-testid="CheckTodo"
            type="checkbox"
            name="m_bTaskDecline"
            inputProps={{
              "aria-label": t("AllowDecline"),
            }}
            disabled={
              isReadOnly ||
              (taskInfo?.taskTypeInfo?.taskType === 2 &&
                (taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                  "S" ||
                  taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                    "A"))
            }
            id="pmweb_ManageRules_AllowDecline_checkbox"
            inputRef={declineRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                declineRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          {t("AllowDecline")}
        </div>
        <div className={styles.checklist}>
          <label
            htmlFor="pmweb_ManageRules_NeedsApproval_checkbox"
            style={{ display: "none" }}
          >
            frve
          </label>
          <Checkbox
            checked={checkTask["m_bTaskApprove"]}
            onChange={(e) => CheckTaskHandler(e)}
            className={styles.mainCheckbox}
            data-testid="CheckTodo"
            type="checkbox"
            name="m_bTaskApprove"
            inputProps={{
              "aria-label": t("NeedsApproval"),
            }}
            disabled={
              isReadOnly ||
              (taskInfo?.taskTypeInfo?.taskType === 2 &&
                (taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                  "S" ||
                  taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                    "A"))
            }
            id="pmweb_ManageRules_NeedsApproval_checkbox"
            inputRef={approveRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                approveRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          {t("NeedsApproval")}
        </div>
        <div className={styles.checklist}>
          <label
            htmlFor="pmweb_ManageRules_initiateTask_checkbox"
            style={{ display: "none" }}
          >
            frve
          </label>
          <Checkbox
            checked={checkTask["m_bInitiateTask"]}
            onChange={(e) => CheckTaskHandler(e)}
            className={styles.mainCheckbox}
            data-testid="CheckTodo"
            type="checkbox"
            name="m_bInitiateTask"
            inputProps={{
              "aria-label": t("initiateTask"),
            }}
            disabled={
              isReadOnly ||
              (taskInfo?.taskTypeInfo?.taskType === 2 &&
                (taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                  "S" ||
                  taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                    "A"))
            }
            id="pmweb_ManageRules_initiateTask_checkbox"
            inputRef={initiateRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                initiateRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          {t("initiateTask")}
        </div>
        <div className={styles.checklist}>
          <label
            htmlFor="pmweb_ManageRules_seeCaseProgress_checkbox"
            style={{ display: "none" }}
          >
            frve
          </label>
          <Checkbox
            checked={checkTask["m_bSeeVisualization"]}
            onChange={(e) => CheckTaskHandler(e)}
            className={styles.mainCheckbox}
            data-testid="CheckTodo"
            type="checkbox"
            name="m_bSeeVisualization"
            inputProps={{
              "aria-label": t("seeCaseProgress"),
            }}
            disabled={
              isReadOnly ||
              (taskInfo?.taskTypeInfo?.taskType === 2 &&
                (taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                  "S" ||
                  taskInfo?.taskTypeInfo?.taskGenPropInfo?.m_strSubPrcType ===
                    "A"))
            }
            id="pmweb_ManageRules_seeCaseProgress_checkbox"
            inputRef={seeCaseProgressRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                seeCaseProgressRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          {t("seeCaseProgress")}
        </div>
      </div>
      {/* Bug 122253 - Case Workdesk issues
      [30-03-2023] Provided a div-divider */}
      <div style={{ borderBottom: "1px solid  rgb(5,5,5,0.2)" }}></div>
      <TaskRules taskInfo={taskInfo} isReadOnly={isReadOnly} />
    </div>
  );
}

export default ManageRules;
