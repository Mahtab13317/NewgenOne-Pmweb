import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClickAwayListener } from "@material-ui/core";
import styles from "./properties.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import ButtonDropdown from "../../../../UI/ButtonDropdown/index";
import { store, useGlobalState } from "state-pool";
import { addConstantsToString } from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  COMPLEX_VARTYPE,
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
  SPACE,
} from "../../../../Constants/appConstants";
import { useRef } from "react";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { decode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import {
  checkRegex,
  getComplex,
  getIncorrectLenErrMsg,
  getIncorrectRegexErrMsg,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { PMWEB_ARB_REGEX, PMWEB_REGEX } from "../../../../validators/validator";

function LaunchApplicationProperties(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const variableDefinition = localLoadedProcessData?.Variable;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [appName, setAppName] = useState();
  const [argumentStrValue, setArgumentStrValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [existingTrigger, setExistingTrigger] = useState(false);
  const [allVariables, setAllVariables] = useState([]);
  const [err, setErr] = useState({});

  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for Bugid 136103;
  const launchAppRef = useRef();
  const launchAppArg = useRef();

  useEffect(() => {
    props.setLaunchAppProperties({});
    setErr({});
  }, []);

  useEffect(() => {
    if (props.reload) {
      props.setLaunchAppProperties({});
      setAppName("");
      setArgumentStrValue("");
      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setReload(false);
      setErr({});
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      setAppName(props.launchApp.appName);
      setArgumentStrValue(decode_utf8(props.launchApp.argumentStrValue));
      setExistingTrigger(true);
      setErr({});
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    let variableWithConstants = [];

    localLoadedProcessData?.DynamicConstant?.forEach((element) => {
      let tempObj = {
        VariableName: element.ConstantName,
        VariableScope: "C",
        ExtObjectId: "0",
        VarFieldId: "0",
        VariableId: "0",
      };
      variableWithConstants.push(tempObj);
    });

    variableDefinition?.forEach((element) => {
      variableWithConstants.push(element);
    });

    let tempVarList = [];

    variableWithConstants.forEach((_var) => {
      if (_var.VariableType === COMPLEX_VARTYPE) {
        let tempList = getComplex(_var);
        tempList?.forEach((el) => {
          tempVarList.push(el);
        });
      } else {
        tempVarList.push(_var);
      }
    });
    setAllVariables(tempVarList);
  }, []);

  useEffect(() => {
    props.setLaunchAppProperties({ appName, argumentStrValue });
  }, [appName, argumentStrValue]);

  const setArgumentStringFunc = (value) => {
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    setShowDropdown(false);
    setArgumentStrValue((prev) => {
      return addConstantsToString(prev, value.VariableName);
    });
  };

  const validateData = (
    tempDN,
    val,
    regexKey,
    charRestricted,
    restrictChar
  ) => {
    let dNErr = null;

    if (tempDN?.trim() === "") {
      dNErr = t("pleaseDefine") + SPACE + t(val);
    } else if (
      tempDN?.trim() !== "" &&
      restrictChar &&
      !checkRegex(tempDN, PMWEB_REGEX[regexKey], PMWEB_ARB_REGEX[regexKey])
    ) {
      dNErr = getIncorrectRegexErrMsg(val, t, charRestricted);
    } else if (tempDN?.trim() !== "" && tempDN?.length > 255) {
      dNErr = getIncorrectLenErrMsg(val, 255, t);
    }
    setErr({ ...err, [val]: dNErr });
  };

  return (
    <React.Fragment>
      <div className={styles.propertiesColumnView}>
        <div className={`${styles.mb025} flex`}>
          <label
            className={styles.triggerFormLabel}
            htmlFor="trigger_la_nameInput"
          >
            {t("application")}{" "}
            <span className="relative">
              {t("name")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "21vw",
            }}
          >
            <input
              id="trigger_la_nameInput"
              autofocus
              disabled={readOnlyProcess}
              value={appName}
              onChange={(e) => {
                validateData(
                  e.target.value,
                  "applicationName",
                  "Trigger_Name",
                  "& * | \\ : \" ' < > ? /",
                  true
                );
                setAppName(e.target.value);
                if (existingTrigger) {
                  props.setTriggerEdited(true);
                }
              }}
              style={{
                border: err["applicationName"]
                  ? "1px solid #b52a2a"
                  : "1px solid #dadada",
              }}
              className={styles.propertiesFormInput}
              ref={launchAppRef}
              onKeyPress={(e) =>
                FieldValidations(e, 180, launchAppRef.current, 255)
              }
            />
            {err["applicationName"] ? (
              <p
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  margin: "-10px 0px 5px 0px",
                }}
              >
                {err["applicationName"]}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex">
          <label className={styles.triggerFormLabel} htmlFor="trigger_la_desc">
            {t("arguments")}{" "}
            <span className="relative">
              {t("string")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div className={direction === RTL_DIRECTION ? `right` : null}>
            <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
              <div className="relative block">
                <button
                  className={styles.propertiesAddButton}
                  onClick={() => setShowDropdown(true)}
                  disabled={readOnlyProcess}
                  id="trigger_laInsert_Btn"
                  tabIndex={0}
                  aria-haspopup="menu"
                  aria-label={`${t("arguments")} ${t("string")} ${t(
                    "insertVariable"
                  )}`}
                >
                  {t("insertVariable")}
                </button>
                <ButtonDropdown
                  open={showDropdown}
                  dropdownOptions={allVariables}
                  onSelect={setArgumentStringFunc}
                  optionKey="VariableName"
                  style={{ top: "80%" }}
                  id="trigger_laInsert_varList"
                />
              </div>
            </ClickAwayListener>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "24.75vw",
              }}
            >
              <textarea
                id="trigger_la_desc"
                autofocus
                disabled={readOnlyProcess}
                value={argumentStrValue}
                onChange={(e) => {
                  validateData(
                    e.target.value,
                    "argumentsString",
                    null,
                    null,
                    false
                  );
                  setArgumentStrValue(e.target.value);
                  if (existingTrigger) {
                    props.setTriggerEdited(true);
                  }
                }}
                style={{
                  border: err["argumentsString"]
                    ? "1px solid #b52a2a"
                    : "1px solid #dadada",
                }}
                className={`${styles.mailBodyInput} ${styles.argStringBodyInput}`}
                ref={launchAppArg}
                onKeyPress={(e) =>
                  FieldValidations(e, 142, launchAppArg.current, 255)
                }
              />
              {err["argumentsString"] ? (
                <p
                  style={{
                    color: "#b52a2a",
                    font: "normal normal 600 11px/16px Open Sans",
                    margin: "-10px 0px 5px 0px",
                  }}
                >
                  {err["argumentsString"]}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    launchApp: state.triggerReducer.LaunchApp,
    initialValues: state.triggerReducer.setDefaultValues,
    reload: state.triggerReducer.trigger_reload,
    openProcessType: state.openProcessClick.selectedType,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setLaunchAppProperties: ({ appName, argumentStrValue }) =>
      dispatch(
        actionCreators.launch_application_properties({
          appName,
          argumentStrValue,
        })
      ),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LaunchApplicationProperties);
