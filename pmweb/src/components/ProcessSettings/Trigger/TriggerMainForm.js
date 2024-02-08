// Changes made to solve Bug 119487 - Trigger: modified trigger name is not saving
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { triggerTypeOptions } from "../../../utility/ProcessSettings/Triggers/triggerTypeOptions";
import { makeStyles, MenuItem, Select } from "@material-ui/core";
import styles from "./trigger.module.css";
import arabicStyles from "./triggerArabicStyles.module.css";
import propertyStyles from "./Properties/properties.module.css";
import { store, useGlobalState } from "state-pool";
import { LatestVersionOfProcess } from "../../../utility/abstarctView/checkLatestVersion";
import {
  RTL_DIRECTION,
  STATE_ADDED,
  STATE_EDITED,
  PROCESSTYPE_REGISTERED,
} from "../../../Constants/appConstants";
import "./commonTrigger.css";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import { useDispatch } from "react-redux";

const useStyles = makeStyles({
  select: {
    "&$select": {
      paddingRight: (props) =>
        props.direction === RTL_DIRECTION ? "0.5vw" : "1.75vw",
      paddingLeft: (props) =>
        props.direction === RTL_DIRECTION ? "1.75vw" : "0.5vw",
    },
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
  },
  icon: {
    left: (props) => (props.direction === RTL_DIRECTION ? "0px" : "unset"),
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0px"),
  },
});

function TriggerMainFormView(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let {
    nameInput,
    setNameInput,
    typeInput,
    setTypeInput,
    descInput,
    setDescInput,
    triggerTypeOptionList,
    selectedField,
    setSelectedField,
    isReadOnly,
    setErrorMsg,
    errorMsg,
  } = props;
  let readOnlyProcess =
    isReadOnly ||
    props.processType === PROCESSTYPE_REGISTERED ||
    props.processType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo;
  const triggerNameRef = useRef();
  const classes = useStyles({ direction });

  const handleTriggerDes = (e) => {
    //Modified on 10/08/2023, bug_id:131818
    let [errMsg] = props.validateData(
      e.target.value,
      "triggerDesc",
      false,
      255
    );
    setErrorMsg({
      ...errorMsg,
      triggerDesc: errMsg,
    });
    setDescInput(e.target.value);
    if (selectedField.status === STATE_ADDED) {
      setSelectedField((prev) => {
        return { ...prev, status: STATE_EDITED };
      });
    }
  };

  return (
    <div className={styles.triggerFormView}>
      <div className={propertyStyles.triggerNameTypeDiv}>
        <div className="flex">
          <label
            className={propertyStyles.triggerFormLabel}
            htmlFor="pmweb_triggerMainForm_triggerName"
          >
            {t("trigger")}{" "}
            <span className="relative">
              {t("name")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", width: "21vw" }}
          >
            <input
              id="pmweb_triggerMainForm_triggerName"
              autofocus
              disabled={props.disableNameAndType || readOnlyProcess}
              value={nameInput}
              onChange={(e) => {
                // Added on 28-06-2023 for BUGID: 130816
                let [errMsg] = props.validateData(
                  e.target.value,
                  "triggerName",
                  true,
                  50
                );
                setErrorMsg({
                  ...errorMsg,
                  triggerName: errMsg,
                });
                setNameInput(e.target.value);
                // Added on 28-06-2023 for BUGID: 130816
                if (selectedField.status === STATE_ADDED) {
                  setSelectedField((prev) => {
                    return { ...prev, status: STATE_EDITED };
                  });
                }
              }}
              style={{
                border:
                  errorMsg?.triggerName !== ""
                    ? "1px solid #b52a2a"
                    : "1px solid #dadada",
              }}
              className={`${styles.triggerFormInput} ${styles.nameFormInput}`}
              ref={triggerNameRef}
              // Added on 28-06-2023 for BUGID: 130816
              onKeyPress={(e) =>
                FieldValidations(e, 180, triggerNameRef.current, 50)
              }
            />
            {errorMsg?.triggerName !== "" ? (
              <p
                style={{
                  color: "#b52a2a",
                  fontSize: "11px",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  marginTop: "-0.75rem",
                }}
              >
                {errorMsg?.triggerName}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex">
          <label
            className={propertyStyles.triggerFormLabel}
            htmlFor="pmweb_triggerMainForm_trigger_type_list"
          >
            <span className="relative">
              {t("type")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <Select
            className={`${styles.triggerFormInput} triggerSelectInput`}
            disabled={props.disableNameAndType || readOnlyProcess}
            classes={{ icon: classes.icon, select: classes.select }}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              getContentAnchorEl: null,
            }}
            inputProps={{
              readOnly: readOnlyProcess,
              id: `pmweb_triggerMainForm_trigger_type_list`,
            }}
            value={typeInput}
            onChange={(e) => {
              setTypeInput(e.target.value);
              if (selectedField.status === STATE_ADDED) {
                setSelectedField((prev) => {
                  return { ...prev, status: STATE_EDITED };
                });
              }
            }}
            aria-description="Trigger Type"
          >
            {triggerTypeOptionList.map((option, index) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.triggerDropdownData
                      : styles.triggerDropdownData
                  }
                  value={option}
                  id={`pmweb_triggerMainForm_trigger_type_list_${index}`}
                >
                  {t(triggerTypeOptions(option)[0])}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </div>
      <div className="flex">
        <label
          className={`${propertyStyles.triggerFormLabel} ${styles.descriptionLabel}`}
          for="pmweb_triggerMainForm_trigger_description"
        >
          {t("Discription")}
          {/*code added on 26 April 2022 for BugId 108472*/}
          <span className={styles.starIcon}>*</span>
        </label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "auto",
            // width:"21vw"
          }}
        >
          <textarea
            id="pmweb_triggerMainForm_trigger_description"
            value={descInput}
            disabled={readOnlyProcess}
            onChange={(e) => {
              handleTriggerDes(e);
            }}
            style={{
              border:
                errorMsg?.triggerDesc !== ""
                  ? "1px solid #b52a2a"
                  : "1px solid #dadada",
            }}
            className={`${styles.triggerFormInput} ${styles.descriptionInput}`}
          />
          {errorMsg?.triggerDesc !== "" ? (
            <p
              style={{
                color: "#b52a2a",
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "1rem",
                marginTop: "-0.75rem",
              }}
            >
              {errorMsg?.triggerDesc}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TriggerMainFormView;
