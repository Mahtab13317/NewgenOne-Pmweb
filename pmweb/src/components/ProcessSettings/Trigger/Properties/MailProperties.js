import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ClickAwayListener } from "@material-ui/core";
import styles from "./properties.module.css";
import arabicStyles from "./propertiesArabicStyles.module.css";
import { connect, useDispatch } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import ButtonDropdown from "../../../../UI/ButtonDropdown/index";
import { store, useGlobalState } from "state-pool";
import SelectWithInput from "../../../../UI/SelectWithInput";
import {
  TRIGGER_PRIORITY_HIGH,
  TRIGGER_PRIORITY_LOW,
  TRIGGER_PRIORITY_MEDIUM,
} from "../../../../Constants/triggerConstants";
import { addConstantsToString } from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  RTL_DIRECTION,
  PROCESSTYPE_REGISTERED,
  COMPLEX_VARTYPE,
  hideComplexFromVariables,
} from "../../../../Constants/appConstants";

import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { decode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { getComplex } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { PMWEB_REGEX, validateRegex } from "../../../../validators/validator";

function MailProperties(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  let tempVarListComplex = [
    t(TRIGGER_PRIORITY_LOW),
    t(TRIGGER_PRIORITY_MEDIUM),
    t(TRIGGER_PRIORITY_HIGH),
  ];
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const variableDefinition = localLoadedProcessData?.Variable;
  const [mailVariables, setMailVariables] = useState(
    hideComplexFromVariables
      ? variableDefinition?.filter((el) => el.VariableType !== COMPLEX_VARTYPE)
      : variableDefinition
  );
  const [allVariables, setAllVariables] = useState([]);

  const direction = `${t("HTML_DIR")}`;
  const [data, setData] = useState({
    subjectValInput: "",
    mailValue: "",
    isFromConstant: false,
    isToConstant: false,
    isCcConstant: false,
    isBccConstant: false,
  });
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [fromError, setFromError] = useState(false);
  const [toError, setToError] = useState(false);
  const [ccError, setCcError] = useState(false);
  const [bccError, setBccError] = useState(false);
  const [existingTrigger, setExistingTrigger] = useState(false);
  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;
  const triggerSubRef = useRef();
  useEffect(() => {
    props.setMailProperties({});
    // code edited on 14 Jan 2023 for BugId 121951
    setFromError(false);
    setToError(false);
    setCcError(false);
    setBccError(false);
  }, []);

  useEffect(() => {
    let variableWithConstants = [];
    let variableWithConstants1 = [];

    localLoadedProcessData?.DynamicConstant?.forEach((element) => {
      let tempObj = {
        VariableName: element.ConstantName,
        VariableScope: "C",
        ExtObjectId: "0",
        VarFieldId: "0",
        VariableId: "0",
      };
      variableWithConstants.push(tempObj);
      variableWithConstants1.push(tempObj);
    });

    //Modified on 30/05/2023, bug_id:129469
    variableDefinition?.forEach((element) => {
      if (
        (hideComplexFromVariables &&
          element.VariableType !== COMPLEX_VARTYPE) ||
        !hideComplexFromVariables
      ) {
        if (
          element.VariableScope === "M" ||
          element.VariableScope === "U" ||
          element.VariableScope === "I"
        ) {
          variableWithConstants.push(element);
        }
        variableWithConstants1.push(element);
      }
    });

    let tempVarList = [];
    let tempVarList1 = [];

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

    variableWithConstants1.forEach((_var) => {
      if (_var.VariableType === COMPLEX_VARTYPE) {
        let tempList = getComplex(_var);
        tempList?.forEach((el) => {
          tempVarList1.push(el);
        });
      } else {
        tempVarList1.push(_var);
      }
    });

    tempVarList = tempVarList.filter((d) => +d.VariableType === 10);
    setMailVariables(tempVarList);
    setAllVariables(tempVarList1);
  }, []);

  useEffect(() => {
    if (props.reload) {
      props.setMailProperties({});
      setData({
        subjectValInput: "",
        mailValue: "",
        isFromConstant: false,
        isToConstant: false,
        isCcConstant: false,
        isBccConstant: false,
      });
      setFromError(false);
      setToError(false);
      setCcError(false);
      setBccError(false);

      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setReload(false);
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      setExistingTrigger(true);
      setFromError(false);
      setToError(false);
      setCcError(false);
      setBccError(false);

      let priorityVal = null;

      //Modified on 22/09/2023, bug_id:137378
      if (+props.Mail.priority === 1) {
        priorityVal = t(TRIGGER_PRIORITY_LOW);
      } else if (+props.Mail.priority === 2) {
        priorityVal = t(TRIGGER_PRIORITY_MEDIUM);
      } else if (+props.Mail.priority === 3) {
        priorityVal = t(TRIGGER_PRIORITY_HIGH);
      } else {
        priorityVal = props.Mail.priority;
      }
      //till here for bug id 137378

      /* if (+props.Mail.priority === 1) {
         priorityVal = "Low";
      } else if (+props.Mail.priority === 2) {
        priorityVal = "Medium";
      } else if (+props.Mail.priority === 3) {
        priorityVal = "High";
      }
       else {
        priorityVal = props.Mail.priority;
      } */
      setData({
        subjectValInput: decode_utf8(props.Mail.subjectValue),
        mailValue: decode_utf8(props.Mail.mailBodyValue),
        isFromConstant: props.Mail.isFromConst,
        isToConstant: props.Mail.isToConst,
        isCcConstant: props.Mail.isCConst,
        isBccConstant: props.Mail.isBccConst,
        priorityInput: priorityVal,
        fromInput: props.Mail.from,
        toInput: props.Mail.to,
        ccInput: props.Mail.cc,
        bccInput: props.Mail.bcc,
      });
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    props.setMailProperties({
      from: data.fromInput,
      isFromConst: data.isFromConstant,
      to: data.toInput,
      isToConst: data.isToConstant,
      cc: data.ccInput,
      isCConst: data.isCcConstant,
      bcc: data.bccInput,
      isBccConst: data.isBccConstant,
      priority: data.priorityInput,
      subjectValue: data.subjectValInput,
      mailBodyValue: data.mailValue,
    });
  }, [data]);

  const setSubjectFunc = (value) => {
    setShowDropdown1(false);
    onChange(
      "subjectValInput",
      addConstantsToString(data.subjectValInput, value.VariableName)
    );
  };

  const setMailFunc = (value) => {
    setShowDropdown2(false);
    onChange(
      "mailValue",
      addConstantsToString(data.mailValue, value.VariableName)
    );
  };

  const onChange = (name, value) => {
    if (name == "isFromConstant") {
      setFromError(false);
    } else if (name == "isToConstant") {
      setToError(false);
    } else if (name == "isCcConstant") {
      setCcError(false);
    } else if (name == "isBccConstant") {
      setBccError(false);
    }

    //Modified on 10/08/2023, bug_id:131818
    /*  setData((prev) => {
      let newData = { ...prev };
      newData[name] = value;
      return newData;
    }); */
    if (name === "subjectValInput") {
      if (value.length > 250) {
        dispatch(
          setToastDataFunc({
            message: t("subjectLength"),
            severity: "error",
            open: true,
          })
        );
      } else {
        setData((prev) => {
          let newData = { ...prev };
          newData[name] = value;
          return newData;
        });
      }
    } else {
      setData((prev) => {
        let newData = { ...prev };
        newData[name] = value;
        return newData;
      });
    }

    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
  };
  // Changes made to solve Bug 132215
  localLoadedProcessData?.Variable?.forEach((_var) => {
    //Modified on 23/01/2024 for bug_id:142843
    /*  if (_var.VariableType === COMPLEX_VARTYPE) {
      let tempList = getComplex(_var);
      console.log("partTime", tempList);
      tempList
        .filter((el) => el.VariableType == "3" || el.VariableType == "4")
        .forEach((el) => {
          tempVarListComplex.push(el.VariableName);
        });
    } */

    //till here for bug_id:142843
    if (
      (_var.VariableScope == "U" &&
        //  (_var.VariableType == "3" || _var.VariableType == "4")) ||
        _var.VariableType == "3") || //Modified on 23/01/2024 for bug_id:142843
      (_var.VariableScope == "I" &&
        // (_var.VariableType == "3" || _var.VariableType == "4"))
        _var.VariableType == "3") //Modified on 23/01/2024 for bug_id:142843
    ) {
      tempVarListComplex.push(_var.VariableName);
    }
  });
  return (
    <div className={styles.propertiesMainView} id="mail_trigger">
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
            // for="from_select_input"
          >
            <span className="relative">
              {t("from")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", width: "21vw" }}
          >
            <SelectWithInput
              onBlur={() => {
                if (data["isFromConstant"]) {
                  // modified on 21/10/23 for BugId 139644
                  if (!validateRegex(data["fromInput"], PMWEB_REGEX.EmailId)) {
                    setFromError(true);
                  } else {
                    setFromError(false);
                  }
                }
              }}
              dropdownOptions={mailVariables}
              optionKey="VariableName"
              setIsConstant={(val) => {
                onChange("isFromConstant", val);
              }}
              setValue={(val) => {
                onChange("fromInput", val);
              }}
              value={data.fromInput}
              isConstant={data.isFromConstant}
              showEmptyString={false}
              showConstValue={true}
              disabled={readOnlyProcess}
              id="from_select_input"
              ariaLabel={`${t("from")}`}
            />
            {fromError ? (
              <span
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  margin: "-10px 0px 5px 0px",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            //modified on 26-9-2023 for bug_id: 136424
            // for="to_select_input
          >
            <span className="relative">
              {t("to")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", width: "21vw" }}
          >
            <SelectWithInput
              onBlur={() => {
                if (data["isToConstant"]) {
                  // modified on 21/10/23 for BugId 139644
                  if (!validateRegex(data["toInput"], PMWEB_REGEX.EmailId)) {
                    setToError(true);
                  } else {
                    setToError(false);
                  }
                }
              }}
              dropdownOptions={mailVariables}
              optionKey="VariableName"
              setIsConstant={(val) => {
                onChange("isToConstant", val);
              }}
              setValue={(val) => {
                onChange("toInput", val);
              }}
              value={data.toInput}
              isConstant={data.isToConstant}
              showEmptyString={false}
              showConstValue={true}
              disabled={readOnlyProcess}
              id="to_select_input"
              ariaLabel={`${t("to")}`}
            />
            {toError ? (
              <span
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  margin: "-10px 0px 5px 0px",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            //modified on 26-9-2023 for bug_id: 136424
            // for="cc_select_input"
          >
            {t("CC")}
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", width: "21vw" }}
          >
            <SelectWithInput
              onBlur={() => {
                // code edited on 14 Jan 2023 for BugId 121951
                if (data["isCcConstant"]) {
                  // modified on 21/10/23 for BugId 139644
                  if (!validateRegex(data["ccInput"], PMWEB_REGEX.EmailId)) {
                    setCcError(true);
                  } else {
                    setCcError(false);
                  }
                }
              }}
              dropdownOptions={mailVariables}
              optionKey="VariableName"
              setIsConstant={(val) => {
                onChange("isCcConstant", val);
              }}
              setValue={(val) => {
                onChange("ccInput", val);
              }}
              value={data.ccInput}
              isConstant={data.isCcConstant}
              showEmptyString={true}
              disabled={readOnlyProcess}
              showConstValue={true}
              id="cc_select_input"
              ariaLabel={`${t("CC")}`}
            />
            {ccError ? (
              <span
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  margin: "-10px 0px 5px 0px",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            //modified on 26-9-2023 for bug_id: 136424
            // for="bcc_select_input"
          >
            {t("BCC")}
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", width: "21vw" }}
          >
            <SelectWithInput
              onBlur={() => {
                // code edited on 14 Jan 2023 for BugId 121951
                if (data["isBccConstant"]) {
                  // modified on 21/10/23 for BugId 139644
                  if (!validateRegex(data["bccInput"], PMWEB_REGEX.EmailId)) {
                    setBccError(true);
                  } else {
                    setBccError(false);
                  }
                }
              }}
              dropdownOptions={mailVariables}
              optionKey="VariableName"
              setIsConstant={(val) => {
                onChange("isBccConstant", val);
              }}
              setValue={(val) => {
                onChange("bccInput", val);
              }}
              value={data.bccInput}
              isConstant={data.isBccConstant}
              showEmptyString={true}
              disabled={readOnlyProcess}
              showConstValue={true}
              id="bcc_select_input"
              ariaLabel={`${t("BCC")}`}
            />
            {bccError ? (
              <span
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  margin: "-10px 0px 5px 0px",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            //modified on 26-9-2023 for bug_id: 136424
            // for="priority_select_input"
          >
            {t("Priority")}
          </label>
          <SelectWithInput
            width={"21vw"}
            dropdownOptions={tempVarListComplex}
            setValue={(val) => {
              onChange("priorityInput", val);
            }}
            value={data.priorityInput}
            showEmptyString={true}
            showConstValue={false}
            disabled={readOnlyProcess}
            id="priority_select_input"
            ariaLabel={`${t("Priority")}`}
          />
        </div>
      </div>
      <div>
        <div className="flex">
          <label
            className={`${styles.propertiesDescLabel} relative`}
            for="subjectValInput"
          >
            {t("Subject")}
            <span className={styles.starIcon}>*</span>
          </label>
          <div className={direction === RTL_DIRECTION ? `right` : null}>
            <ClickAwayListener onClickAway={() => setShowDropdown1(false)}>
              <div className="relative block">
                <button
                  className={styles.propertiesAddButton}
                  onClick={() => setShowDropdown1(true)}
                  disabled={readOnlyProcess}
                  id="trigger_mailSubject_btn"
                  aria-label={`${t("Subject")} ${t("insertVariable")}`}
                >
                  {t("insertVariable")}
                </button>
                <ButtonDropdown
                  open={showDropdown1}
                  dropdownOptions={allVariables}
                  onSelect={setSubjectFunc}
                  optionKey="VariableName"
                  style={{ top: "80%" }}
                  id="trigger_mailSubject_varList"
                  enableSearch={true} //Modified on 02/08/2023, bug_id:131808
                />
              </div>
            </ClickAwayListener>
            <textarea
              id="subjectValInput"
              value={data.subjectValInput}
              onChange={(e) => {
                onChange("subjectValInput", e.target.value);
              }}
              disabled={readOnlyProcess}
              className={styles.subjectMailInput}
              ref={triggerSubRef}
              onKeyPress={(e) =>
                FieldValidations(e, 250, triggerSubRef.current, 250)
              }
            />
          </div>
        </div>
        <div className="flex">
          <label className={styles.propertiesDescLabel} for="trigger_mailBody">
            {t("MailBody")}
          </label>
          <div className={direction === RTL_DIRECTION ? `right` : null}>
            <ClickAwayListener onClickAway={() => setShowDropdown2(false)}>
              <div className="relative block">
                <button
                  className={styles.propertiesAddButton}
                  onClick={() => setShowDropdown2(true)}
                  disabled={readOnlyProcess}
                  id="trigger_mailBody_btn"
                  aria-label={`${t("MailBody")} ${t("insertVariable")}`}
                >
                  {t("insertVariable")}
                </button>
                <ButtonDropdown
                  open={showDropdown2}
                  dropdownOptions={allVariables}
                  onSelect={setMailFunc}
                  optionKey="VariableName"
                  style={{ top: "80%" }}
                  id="trigger_mailBody_varList"
                  enableSearch={true} //Added on 02/08/2023, bug_id:131808
                />
              </div>
            </ClickAwayListener>
            <textarea
              id="trigger_mailBody"
              value={data.mailValue}
              disabled={readOnlyProcess}
              onChange={(e) => {
                onChange("mailValue", e.target.value);
              }}
              className={styles.mailBodyInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
// till here dated 26thOct

const mapStateToProps = (state) => {
  return {
    Mail: state.triggerReducer.Mail,
    initialValues: state.triggerReducer.setDefaultValues,
    reload: state.triggerReducer.trigger_reload,
    openProcessType: state.openProcessClick.selectedType,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setMailProperties: ({
      from,
      isFromConst,
      to,
      isToConst,
      cc,
      isCConst,
      bcc,
      isBccConst,
      priority,
      subjectValue,
      mailBodyValue,
    }) =>
      dispatch(
        actionCreators.mail_properties({
          from,
          isFromConst,
          to,
          isToConst,
          cc,
          isCConst,
          bcc,
          isBccConst,
          priority,
          subjectValue,
          mailBodyValue,
        })
      ),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MailProperties);
