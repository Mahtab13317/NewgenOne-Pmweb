// #BugID - 115604
// #BugDescription - added constants functionality for email popup for reminder and handled multipe checks.
// #BugID - 120371
// #BugDescription - Shown alert message for validation.
// #BugID - 121070
// #BugDescription - Handled the issue for Low/Medium/High in priority list.
// #BugID - 126901
// #BugDescription - Handled the issue for enabling the modify button after saving mail definition.
// #BugID - 126842
// #BugDescription - Changes done for Edit Timer Event: Email Operation: Entered email id is not showing.
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { store, useGlobalState } from "state-pool";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { getComplex } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import CloseIcon from "@material-ui/icons/Close";
import {
  MenuItem,
  Button,
  Grid,
  Divider,
  useMediaQuery,
} from "@material-ui/core";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  COMPLEX_VARTYPE,
  RTL_DIRECTION,
  hideComplexFromVariables,
} from "../../../../../Constants/appConstants";
import { addConstantsToString } from "../../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  TRIGGER_PRIORITY_HIGH,
  TRIGGER_PRIORITY_LOW,
  TRIGGER_PRIORITY_MEDIUM,
} from "../../../../../Constants/triggerConstants";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import { getIncorrectLenErrMsg } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  PMWEB_REGEX,
  validateRegex,
} from "../../../../../validators/validator";

function EmailPopup({
  handleCloseEmailModal,
  passEmailData,
  parentEmailData,
  setIsRuleBeingModified,
}) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [emailData, setEmailData] = useState(parentEmailData);
  const [subjectVar, setSubjectVar] = useState("");
  const [bodyVar, setBodyVar] = useState("");
  const [priorityVal, setPriorityVal] = useState("");
  const [errorObj, setErrorObj] = useState({});
  const smallScreen = useMediaQuery("(max-width: 1299px)");
  const priority = [
    { label: t(TRIGGER_PRIORITY_LOW), value: 1 },
    { label: t(TRIGGER_PRIORITY_MEDIUM), value: 2 },
    { label: t(TRIGGER_PRIORITY_HIGH), value: 3 },
  ];

  useEffect(() => {
    // modified on 20/09/23 for BugId 137563
    // if (parentEmailData?.type1) {
    //   setIsFromConst(true);
    // } else {
    //   setIsFromConst(false);
    // }
    // if (parentEmailData?.type2) {
    //   setIsToConst(true);
    // } else {
    //   setIsToConst(false);
    // }
    // if (parentEmailData?.type3) {
    //   setIsCcConst(true);
    // } else {
    //   setIsCcConst(false);
    // }
    // if (parentEmailData?.type4) {
    //   setIsBccConst(true);
    // } else {
    //   setIsBccConst(false);
    // }
    // let priorityVal = "";
    // if (parentEmailData.priority === 1) {
    //   priorityVal = "Low";
    // } else if (parentEmailData.priority === 2) {
    //   priorityVal = "Medium";
    // } else if (parentEmailData.priority === 3) {
    //   priorityVal = "High";
    // } else {
    //   priorityVal = parentEmailData.priority;
    // }
    // setPriorityVal(priorityVal);
    let priority = "";
    if (+parentEmailData.priority === 1) {
      priority = t(TRIGGER_PRIORITY_LOW);
    } else if (+parentEmailData.priority === 2) {
      priority = t(TRIGGER_PRIORITY_MEDIUM);
    } else if (+parentEmailData.priority === 3) {
      priority = t(TRIGGER_PRIORITY_HIGH);
    } else {
      priority = parentEmailData.priority;
    }
    setPriorityVal(priority);
    // till here BugId 137563
    setEmailData(parentEmailData);
  }, [parentEmailData, passEmailData]);

  // Changes made to solve Bug 132215
  localLoadedProcessData?.Variable.forEach((_var) => {
    //Modified on 23/01/2024 for bug_id:142843
    /* if (_var.VariableType === COMPLEX_VARTYPE) {
      let tempList = getComplex(_var);
      tempList.filter((el) => el.VariableType == "3" || el.VariableType == "4")?.forEach((el) => {
        priority.push({ label: el.VariableName, value: "10" });
      });
    } */
    //till here for bug_id:142843
    if (
      (_var.VariableScope == "U" &&
        // (_var.VariableType == "3" || _var.VariableScope == "4")) ||
        _var.VariableType == "3") || //Modified on 23/01/2024 for bug_id:142843
      (_var.VariableScope == "I" &&
        //(_var.VariableType == "3" || _var.VariableScope == "4"))
        _var.VariableType == "3") //Modified on 23/01/2024 for bug_id:142843
    ) {
      priority.push({ label: _var.VariableName, value: "11" });
    }
  });
  // till here dated 26thOct
  const onChangeHandler = (e, key, constStatus) => {
    let tempEmail = { ...emailData };
    tempEmail[key] = e.target.value;
    if (key === "from") {
      tempEmail.type1 = constStatus;
    }
    if (key === "to") {
      tempEmail.type2 = constStatus;
    }
    if (key === "cc") {
      tempEmail.type3 = constStatus;
    }
    if (key === "bcc") {
      tempEmail.type4 = constStatus;
    }
    // added on 20/09/23 for BugId 137563
    let errorKey = { ...errorObj };
    if (constStatus) {
      // modified on 21/10/23 for BugId 139644
      if (!validateRegex(tempEmail[key], PMWEB_REGEX.EmailId)) {
        errorKey = { ...errorKey, [key]: true };
      } else {
        errorKey = { ...errorKey, [key]: false };
      }
    } else {
      const arr = ["from", "to", "subject"];
      if (arr.includes(key) && e.target.value?.trim() === "") {
        errorKey = { ...errorKey, [key]: true };
      } else {
        errorKey = { ...errorKey, [key]: false };
      }
    }
    setErrorObj(errorKey);
    setEmailData(tempEmail);
  };

  const addSubject = () => {
    if (!!subjectVar) {
      let str = addConstantsToString(emailData.subject, subjectVar);
      setEmailData({ ...emailData, subject: str });
      // added on 20/09/23 for BugId 137563
      let errorKey = { ...errorObj };
      errorKey = { ...errorKey, subject: false };
      setErrorObj(errorKey);
    }
  };

  const addMail = () => {
    if (!!bodyVar) {
      let str = addConstantsToString(emailData.body, bodyVar);
      setEmailData({ ...emailData, body: str });
    }
  };

  const saveEmailData = () => {
    let isValid = true;
    let errorKey = {};
    if (
      emailData["from"]?.trim() === "" ||
      emailData["to"]?.trim() === "" ||
      emailData["subject"]?.trim() === ""
    ) {
      isValid = false;
    }
    if (isValid === true) {
      // added on 20/09/23 for BugId 137563
      if (!errorObj.from && !errorObj.to && !errorObj.cc && !errorObj.bcc) {
        // added on 29/09/23 for bug_id:135974
        if (emailData["subject"].trim().length > 255) {
          errorKey = { ...errorKey, subject: true };
          setErrorObj(errorKey);
          const msg = getIncorrectLenErrMsg("Subject", 255, t);

          dispatch(
            setToastDataFunc({
              message: msg,
              severity: "error",
              open: true,
            })
          );
        } else {
          passEmailData(emailData);
          handleCloseEmailModal();
          setIsRuleBeingModified(true);
        }

        //till her for  bug_id:135974

        //passEmailData(emailData);
        // handleCloseEmailModal();
        // setIsRuleBeingModified(true);
      }
    } else {
      // added on 20/09/23 for BugId 137563

      if (emailData["from"]?.trim() === "") {
        errorKey = { ...errorKey, from: true };
      }
      if (emailData["to"]?.trim() === "") {
        errorKey = { ...errorKey, to: true };
      }
      if (emailData["subject"]?.trim() === "") {
        errorKey = { ...errorKey, subject: true };
      }
      setErrorObj(errorKey);
      //Modified on 05/10/2023, bug_id:136647
      dispatch(
        setToastDataFunc({
          message: t("mandatoryErrorStatement"),
          severity: "error",
          open: true,
        })
      );
      //till here for bug_id:136647
    }
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleModalKeyDown = (e) => {
    if (e.keyCode === 13) {
      saveEmailData();
    }
  };

  // Function that runs when the handleModalKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleModalKeyDown);
    return () => document.removeEventListener("keydown", handleModalKeyDown);
  }, [handleModalKeyDown]);

  return (
    <React.Fragment>
      <div className={styles.modalHeader}>
        <div className={styles.modalLabel}>{t("mailTrigger")}</div>
        <CloseIcon
          id="pmweb_EmailPopup_CloseEmailModalBtn"
          tabIndex={0}
          style={{
            cursor: "pointer",
            height: "1.5rem",
            width: "1.5rem",
            color: "#707070",
          }}
          onClick={handleCloseEmailModal}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCloseEmailModal();
              e.stopPropagation();
            }
          }}
        />
      </div>
      <Grid
        container
        xs={12}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div
          className={styles.modalBody}
          // added on 17-10-2023 for bug_id: 138077
          style={{ height: smallScreen ? "40vh" : "48vh" }}
        >
          <div className={styles.emailContainer}>
            {/* modified Grid items sizes on 28-9-2023 for bug_id: 138077  */}
            <div className={styles.fieldRow} style={{ alignItems: "start" }}>
              <Grid item xs={3}>
                <div className={styles.fldLabel}>
                  {t("from")}
                  <span className={styles.error}>*</span>
                </div>
              </Grid>
              <Grid item xs={9}>
                <div className={styles.fldElement}>
                  <CustomizedDropdown
                    id="AO_Escalate_To_Email_Dropdown_From"
                    className={styles.escalateToEmailDropdown}
                    style={{
                      // added on 20/09/23 for BugId 137563
                      border: errorObj.from
                        ? "1px solid #b52a2a"
                        : "1px solid #c4c4c4",
                    }}
                    isNotMandatory={true}
                    name="from"
                    onChange={(e, isConst) => {
                      onChangeHandler(e, "from", isConst);
                    }}
                    value={emailData.from}
                    // modified on 20/09/23 for BugId 137563
                    // isConstant={isFromConst}
                    isConstant={emailData.type1}
                    showConstValue={true}
                    constType={10}
                  >
                    {localLoadedProcessData?.Variable?.filter(
                      (d) =>
                        +d.VariableType === 10 &&
                        (d.VariableScope === "M" || d.VariableScope === "U") &&
                        ((hideComplexFromVariables &&
                          d.VariableType !== COMPLEX_VARTYPE) ||
                          !hideComplexFromVariables)
                    ).map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.VariableName}
                      >
                        {data.VariableName}
                      </MenuItem>
                    ))}
                  </CustomizedDropdown>
                </div>
                {/* added on 20/09/23 for BugId 137563 */}
                {errorObj.from && emailData["from"]?.trim() !== "" && (
                  <span
                    style={{
                      color: "#b52a2a",
                      font: "normal normal 600 11px/16px Open Sans",
                    }}
                  >
                    {t("pleaseEnterAValidEmail")}
                  </span>
                )}
              </Grid>
            </div>
            <div className={styles.fieldRow} style={{ alignItems: "start" }}>
              <Grid item xs={3}>
                <div className={styles.fldLabel}>
                  {t("to")}
                  <span className={styles.error}>*</span>
                </div>
              </Grid>
              <Grid item xs={9}>
                <div className={styles.fldElement}>
                  <CustomizedDropdown
                    id="AO_Escalate_To_Email_Dropdown_TO"
                    className={styles.escalateToEmailDropdown}
                    isNotMandatory={true}
                    name="to"
                    style={{
                      // added on 20/09/23 for BugId 137563
                      border: errorObj.to
                        ? "1px solid #b52a2a"
                        : "1px solid #c4c4c4",
                    }}
                    onChange={(e, isConst) => {
                      onChangeHandler(e, "to", isConst);
                    }}
                    value={emailData.to}
                    // modified on 20/09/23 for BugId 137563
                    // isConstant={isToConst}
                    isConstant={emailData.type2}
                    showConstValue={true}
                    constType={10}
                  >
                    {localLoadedProcessData?.Variable?.filter(
                      (d) =>
                        +d.VariableType === 10 &&
                        (d.VariableScope === "M" || d.VariableScope === "U") &&
                        ((hideComplexFromVariables &&
                          d.VariableType !== COMPLEX_VARTYPE) ||
                          !hideComplexFromVariables)
                    ).map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.VariableName}
                      >
                        {data.VariableName}
                      </MenuItem>
                    ))}
                  </CustomizedDropdown>
                </div>
                {/* added on 20/09/23 for BugId 137563 */}
                {errorObj.to && emailData["to"]?.trim() !== "" && (
                  <span
                    style={{
                      color: "#b52a2a",
                      font: "normal normal 600 11px/16px Open Sans",
                    }}
                  >
                    {t("pleaseEnterAValidEmail")}
                  </span>
                )}
              </Grid>
            </div>
            <div className={styles.fieldRow} style={{ alignItems: "start" }}>
              <Grid item xs={3}>
                <div className={styles.fldLabel}>{t("CC")}</div>
              </Grid>
              <Grid item xs={9}>
                <div className={styles.fldElement}>
                  <CustomizedDropdown
                    id="AO_Escalate_To_EmailCC_Dropdown"
                    className={styles.escalateToEmailDropdown}
                    isNotMandatory={true}
                    name="cc"
                    style={{
                      // added on 20/09/23 for BugId 137563
                      border: errorObj.cc
                        ? "1px solid #b52a2a"
                        : "1px solid #c4c4c4",
                    }}
                    onChange={(e, isConst) => {
                      onChangeHandler(e, "cc", isConst);
                    }}
                    value={emailData.cc}
                    // modified on 20/09/23 for BugId 137563
                    // isConstant={isCcConst}
                    isConstant={emailData.type3}
                    showConstValue={true}
                    constType={10}
                  >
                    {localLoadedProcessData?.Variable?.filter(
                      (d) =>
                        +d.VariableType === 10 &&
                        (d.VariableScope === "M" || d.VariableScope === "U") &&
                        ((hideComplexFromVariables &&
                          d.VariableType !== COMPLEX_VARTYPE) ||
                          !hideComplexFromVariables)
                    ).map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.VariableName}
                      >
                        {data.VariableName}
                      </MenuItem>
                    ))}
                  </CustomizedDropdown>
                </div>
                {/* added on 20/09/23 for BugId 137563 */}
                {errorObj.cc && (
                  <span
                    style={{
                      color: "#b52a2a",
                      font: "normal normal 600 11px/16px Open Sans",
                    }}
                  >
                    {t("pleaseEnterAValidEmail")}
                  </span>
                )}
              </Grid>
            </div>
            <div className={styles.fieldRow} style={{ alignItems: "start" }}>
              <Grid item xs={3}>
                <div className={styles.fldLabel}>{t("BCC")}</div>
              </Grid>
              <Grid item xs={9}>
                <div className={styles.fldElement}>
                  <CustomizedDropdown
                    id="AO_Escalate_To_EmailBCC_Dropdown"
                    className={styles.escalateToEmailDropdown}
                    isNotMandatory={true}
                    name="bcc"
                    style={{
                      // added on 20/09/23 for BugId 137563
                      border: errorObj.bcc
                        ? "1px solid #b52a2a"
                        : "1px solid #c4c4c4",
                    }}
                    onChange={(e, isConst) => {
                      onChangeHandler(e, "bcc", isConst);
                    }}
                    value={emailData.bcc}
                    // modified on 20/09/23 for BugId 137563
                    // isConstant={isBccConst}
                    isConstant={emailData.type4}
                    showConstValue={true}
                    constType={10}
                  >
                    {localLoadedProcessData?.Variable?.filter(
                      (d) =>
                        +d.VariableType === 10 &&
                        (d.VariableScope === "M" || d.VariableScope === "U") &&
                        ((hideComplexFromVariables &&
                          d.VariableType !== COMPLEX_VARTYPE) ||
                          !hideComplexFromVariables)
                    ).map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.VariableName}
                      >
                        {data.VariableName}
                      </MenuItem>
                    ))}
                  </CustomizedDropdown>
                </div>
                {/* added on 20/09/23 for BugId 137563 */}
                {errorObj.bcc && (
                  <span
                    style={{
                      color: "#b52a2a",
                      font: "normal normal 600 11px/16px Open Sans",
                    }}
                  >
                    {t("pleaseEnterAValidEmail")}
                  </span>
                )}
              </Grid>
            </div>
            <div className={styles.fieldRow} style={{ alignItems: "start" }}>
              <Grid item xs={3}>
                <div className={styles.fldLabel}>{t("Priority")}</div>
              </Grid>
              <Grid item xs={9}>
                <div className={styles.fldElement}>
                  <CustomizedDropdown
                    id="AO_Escalate_To_Priority_Dropdown"
                    className={styles.escalateToEmailDropdown}
                    isNotMandatory={true}
                    name="priority"
                    onChange={(e) => {
                      onChangeHandler(e, "priority");
                    }}
                    value={priorityVal}
                  >
                    {priority?.map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.label}
                      >
                        {data.label}
                      </MenuItem>
                    ))}
                    {/* 
                    //Modified on 23/01/2024 for bug_id:142843
                    {localLoadedProcessData?.Variable?.filter(
                      (d) =>
                        d.VariableScope === "U" &&
                        (+d.VariableType === 3 || +d.VariableType === 3)
                    ).map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.VariableName}
                      >
                        {data.VariableName}
                      </MenuItem>
                    ))}
                     //till here for bug_id:142843
                     */}
                  </CustomizedDropdown>
                </div>
              </Grid>
            </div>
            <Divider className={styles.definitionLine} />
            <div className={styles.fieldRow} style={{ alignItems: "start" }}>
              <Grid item xs={3}>
                <div className={styles.fldLabel}>
                  {t("Subject")}
                  <span className={styles.error}>*</span>
                </div>
              </Grid>
              <Grid item xs={7}>
                <div className={styles.fldElement}>
                  <CustomizedDropdown
                    id="AO_Escalate_To_Email_Dropdown_Subject"
                    className={styles.escalateToEmailDropdown}
                    isNotMandatory={true}
                    value={subjectVar}
                    onChange={(e) => {
                      setSubjectVar(e.target.value);
                    }}
                  >
                    {localLoadedProcessData?.Variable?.filter(
                      (d) =>
                        (d.VariableScope === "M" || d.VariableScope === "U") &&
                        ((hideComplexFromVariables &&
                          d.VariableType !== COMPLEX_VARTYPE) ||
                          !hideComplexFromVariables)
                    ).map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.VariableName}
                      >
                        {data.VariableName}
                      </MenuItem>
                    ))}
                  </CustomizedDropdown>
                </div>
              </Grid>
              <Grid item xs={2}>
                <div style={{ marginInlineStart: "1vw" }}>
                  <Button
                    id="pmweb_EmailPopup_AddSubjectBtn"
                    className={`secondary ${styles.addBtn}`}
                    onClick={addSubject}
                  >
                    {t("toolbox.sharePointArchive.add")}
                  </Button>
                </div>
              </Grid>
            </div>
            <div
              className={`${styles.fieldRow}`}
              style={{ justifyContent: "flex-end" }}
            >
              <Grid item xs={9}>
                <textarea
                  aria-label="Subject"
                  className={styles.txtAreaField}
                  style={{
                    // added on 20/09/23 for BugId 137563
                    border: errorObj.subject
                      ? "1px solid #b52a2a"
                      : "1px solid #c4c4c4",
                  }}
                  id="subject"
                  name="subject"
                  onChange={(e) => {
                    onChangeHandler(e, "subject");
                  }}
                  value={emailData.subject}
                  minRows={6}
                />
              </Grid>
            </div>
            <div
              className={styles.fieldRow}
              style={{ display: "flex", alignItems: "start" }}
            >
              <Grid item xs={3}>
                <div className={styles.fldLabel}>{t("MailBody")}</div>
              </Grid>
              <Grid item xs={7}>
                <div className={styles.fldElement}>
                  <CustomizedDropdown
                    id="AO_Escalate_To_Email_Dropdown_Body"
                    className={styles.escalateToEmailDropdown}
                    isNotMandatory={true}
                    value={bodyVar}
                    onChange={(e) => {
                      setBodyVar(e.target.value);
                    }}
                  >
                    {localLoadedProcessData?.Variable?.filter(
                      (d) =>
                        (d.VariableScope === "M" ||
                          d.VariableScope === "U" ||
                          d.VariableScope === "C") &&
                        ((hideComplexFromVariables &&
                          d.VariableType !== COMPLEX_VARTYPE) ||
                          !hideComplexFromVariables)
                    ).map((data, i) => (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        value={data.VariableName}
                      >
                        {data.VariableName}
                      </MenuItem>
                    ))}
                  </CustomizedDropdown>
                </div>
              </Grid>
              <Grid item xs={2}>
                <div style={{ marginInlineStart: "1vw" }}>
                  <Button
                    id="pmweb_EmailPopup_AddMailBtn"
                    className={`secondary ${styles.addBtn}`}
                    onClick={addMail}
                  >
                    {t("toolbox.sharePointArchive.add")}
                  </Button>
                </div>
              </Grid>
            </div>
            <div
              className={styles.fieldRow}
              style={{ alignItems: "start", justifyContent: "flex-end" }}
            >
              <Grid item xs={9}>
                <textarea
                  aria-label="Body"
                  aria-labelledby="body"
                  className={styles.txtAreaField}
                  id="body"
                  name="body"
                  onChange={(e) => {
                    onChangeHandler(e, "body");
                  }}
                  value={emailData.body}
                  minRows={6}
                />
              </Grid>
            </div>
          </div>
        </div>
      </Grid>
      {/* till here for bug_id: 138077 */}
      <div className={styles.modalFooter}>
        <div className={styles.modalFooterInner}>
          <Button
            id="pmweb_EmailPopup_cancelMapRes"
            className={`tertiary`}
            onClick={handleCloseEmailModal}
          >
            {t("cancel")}
          </Button>
          <Button
            id="pmweb_EmailPopup_mapDataModalRes"
            className={`primary`}
            onClick={saveEmailData}
          >
            {t("add")}
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default EmailPopup;
