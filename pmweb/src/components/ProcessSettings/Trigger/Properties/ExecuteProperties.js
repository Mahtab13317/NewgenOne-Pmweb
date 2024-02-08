import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClickAwayListener } from "@material-ui/core";
import styles from "./properties.module.css";
import arabicStyles from "./propertiesArabicStyles.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import ButtonDropdown from "../../../../UI/ButtonDropdown/index";
import { store, useGlobalState } from "state-pool";
import { addConstantsToString } from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  RTL_DIRECTION,
  PROCESSTYPE_REGISTERED,
  COMPLEX_VARTYPE,
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

function ExecuteProperties(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const variableDefinition = localLoadedProcessData?.Variable;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [funcName, setFuncName] = useState("");
  const [serverExecutable, setServerExecutable] = useState("");
  const [argString, setArgString] = useState("");
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

  const funcNameRef = useRef();
  const executeServerRef = useRef();
  const executeArgRef = useRef();

  useEffect(() => {
    props.setExecuteProperties({});
    setErr({});
  }, []);

  useEffect(() => {
    if (props.reload) {
      props.setExecuteProperties({});
      setFuncName("");
      setServerExecutable("");
      setArgString("");
      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setReload(false);
      setErr({});
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      setFuncName(props.execute.funcName);
      setServerExecutable(props.execute.serverExecutable);
      setArgString(decode_utf8(props.execute.argString));
      setErr({});
      setExistingTrigger(true);
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    props.setExecuteProperties({ funcName, serverExecutable, argString });
  }, [funcName, serverExecutable, argString]);

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

  const setArgumentStringFunc = (value) => {
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    setShowDropdown(false);
    setArgString((prev) => {
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
    <div className={styles.propertiesMainView}>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.triggerNameTypeDiv
            : styles.triggerNameTypeDiv
        }
      >
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            htmlFor="trigger_execute_funcName"
          >
            {t("function")}{" "}
            <span className="relative">
              {t("name")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", width: "21vw" }}
          >
            <input
              id="trigger_execute_funcName"
              autofocus
              disabled={readOnlyProcess}
              value={funcName}
              onChange={(e) => {
                validateData(
                  e.target.value,
                  "functionName",
                  "Function_Name",
                  "~ ` ! @ # % ^ & * ( ) - + = { } | : \" \\ ; ' < > ? , /",
                  true
                );
                setFuncName(e.target.value);
                if (existingTrigger) {
                  props.setTriggerEdited(true);
                }
              }}
              style={{
                border: err["functionName"]
                  ? "1px solid #b52a2a"
                  : "1px solid #dadada",
              }}
              className={styles.propertiesFormInput}
              ref={funcNameRef}
              onKeyPress={(e) =>
                FieldValidations(e, 165, funcNameRef.current, 255)
              }
            />
            {err["functionName"] ? (
              <p
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  margin: "-10px 0px 5px 0px",
                }}
              >
                {err["functionName"]}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            htmlFor="trigger_execute_server"
          >
            {t("server")}{" "}
            <span className="relative">
              {t("executable")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", width: "21vw" }}
          >
            <input
              id="trigger_execute_server"
              autofocus
              disabled={readOnlyProcess}
              value={serverExecutable}
              onChange={(e) => {
                validateData(
                  e.target.value,
                  "ServerExecutable",
                  "Trigger_Name",
                  "& * | \\ : \" ' < > ? /",
                  true
                );
                setServerExecutable(e.target.value);
                if (existingTrigger) {
                  props.setTriggerEdited(true);
                }
              }}
              style={{
                border: err["ServerExecutable"]
                  ? "1px solid #b52a2a"
                  : "1px solid #dadada",
              }}
              className={styles.propertiesFormInput}
              ref={executeServerRef}
              onKeyPress={(e) =>
                FieldValidations(e, 180, executeServerRef.current, 255)
              }
            />
            {err["ServerExecutable"] ? (
              <p
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  margin: "-10px 0px 5px 0px",
                }}
              >
                {err["ServerExecutable"]}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex">
        <label
          className={styles.propertiesDescLabel}
          htmlFor="trigger_execute_argsString"
        >
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
                id="trigger_executeInsert_Btn"
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
                id="trigger_executeInsert_varList"
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
              id="trigger_execute_argsString"
              disabled={readOnlyProcess}
              autofocus
              value={argString}
              onChange={(e) => {
                validateData(
                  e.target.value,
                  "argumentsString",
                  null,
                  null,
                  false
                );
                setArgString(e.target.value);
                if (existingTrigger) {
                  props.setTriggerEdited(true);
                }
              }}
              style={{
                border: err["argumentsString"]
                  ? "1px solid #b52a2a"
                  : "1px solid #dadada",
              }}
              className={styles.mailBodyInput}
              ref={executeArgRef}
              onKeyPress={(e) =>
                FieldValidations(e, 142, executeArgRef.current, 255)
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
  );
}

const mapStateToProps = (state) => {
  return {
    execute: state.triggerReducer.Execute,
    initialValues: state.triggerReducer.setDefaultValues,
    reload: state.triggerReducer.trigger_reload,
    openProcessType: state.openProcessClick.selectedType,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setExecuteProperties: ({ funcName, serverExecutable, argString }) =>
      dispatch(
        actionCreators.execute_properties({
          funcName,
          serverExecutable,
          argString,
        })
      ),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExecuteProperties);
