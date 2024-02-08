import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import { Select, MenuItem } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import { store, useGlobalState } from "state-pool";
import {
  conditionalBooleanOperator,
  conditionalOperator,
  conditionalTextOperator,
  logicalOperatorOptions,
} from "../../../../ActivityRules/CommonFunctionCall";
import clsx from "clsx";
import {
  STRING_VARIABLE_TYPE,
  BOOLEAN_VARIABLE_TYPE,
  RULES_ALWAYS_CONDITION,
  ADD_CONDITION_NO_LOGICALOP_VALUE,
  RULES_OTHERWISE_CONDITION,
  DATA_TYPE_RULE_COND,
  TASK_TYPE_RULE_COND,
  DOC_TYPE_RULE_COND,
  hideComplexFromVariables,
  COMPLEX_VARTYPE,
  SPACE,
} from "../../../../../../../Constants/appConstants";
import CustomizedDropdown from "../../../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";

function AddCondition(props) {
  let { t } = useTranslation();
  const {
    index,
    addNewCondition,
    deleteCondition,
    disabled,
    localRuleData,
    setLocalRuleData,
    isRuleBeingCreated,
    setIsRuleBeingModified,
    isReadOnly,
    checkValidation,
    setCheckValidation,
    ruleConditionErrors,
    setRuleConditionErrors,
    isAlwaysRule,
    taskInfo,
    associatedTasks,
  } = props;

  const [loadedProcessData] = useGlobalState("loadedProcessData");
  const [variableType, setVariableType] = useState("");
  const [param1, setParam1] = useState(""); // State to store value for param 1 dropdown.
  const [param2, setParam2] = useState(""); // State to store value for param 2 dropdown.
  const [selectedOperator, setSelectedOperator] = useState("0"); // State to store value for operator dropdown.
  const [selectedLogicalOperator, setSelectedLogicalOperator] = useState(
    ADD_CONDITION_NO_LOGICALOP_VALUE
  ); // State to store value for logical operator dropdown.
  const [conditionalDropdown, setConditionalDropdown] =
    useState(conditionalOperator); // State to store the dropdown operators for conditional operator.
  const [param1DropdownOptions, setParam1DropdownOptions] = useState([]); // State to store the dropdown options for parameter 1.
  const [logicalOperator] = useState(logicalOperatorOptions); // State to store the dropdown options for logical operator.
  const [param2DropdownOptions, setParam2DropdownOptions] = useState([]); // State to store the dropdown options for parameter 2.
  const [isParam2Const, setIsParam2Const] = useState(false); // State that tells whether constant option is selected in param2.
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const [allDocType, setAllDocType] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const constantsData = loadedProcessData.DynamicConstant;
  const param2ref = useRef(null);
  const dispatch = useDispatch();

  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
    PaperProps: {
      style: {
        maxHeight: "10rem",
      },
    },
  };

  const taskStatusFields = {
    "is initiated": "2",
    "is complete": "3",
  };

  const checkForVarRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item) => {
        if (+item?.processVarInfo?.variableId === +data.VariableId) {
          if (
            item?.m_strFetchedRights === "O" ||
            item?.m_strFetchedRights === "R" ||
            item?.m_strFetchedRights === "A"
          ) {
            temp = true;
          }
        }
      }
    );
    return temp;
  };

  // Function that runs when the variableType state changes.
  useEffect(() => {
    if (
      localRuleData.ruleCondList[index].m_strRuleType === DATA_TYPE_RULE_COND
    ) {
      let varType = null;
      param1DropdownOptions?.forEach((element) => {
        if (element.VariableName === localRuleData.ruleCondList[index].param1) {
          setVariableType(element.VariableType);
          varType = element.VariableType;
        }
      });
      let filteredParam2Options = [];
      constantsData?.forEach((element) => {
        let tempObj = {
          VariableName: element.ConstantName,
          VariableScope: "F",
        };
        filteredParam2Options.push(tempObj);
      });

      loadedProcessData?.Variable?.forEach((element) => {
        if (
          (hideComplexFromVariables &&
            element.VariableType !== COMPLEX_VARTYPE) ||
          !hideComplexFromVariables
        ) {
          if (
            ((element.VariableScope === "U" && checkForVarRights(element)) ||
              (element.VariableScope === "I" && checkForVarRights(element)) ||
              (element.VariableScope !== "U" &&
                element.VariableScope !== "I")) &&
            element.VariableType === varType
          ) {
            filteredParam2Options.push(element);
          }
        }
      });

      //Removing the TATConsumed and TATRemaining for Rules due to user can only use for BAM reports, so no need of this as per requirement.
      filteredParam2Options = filteredParam2Options.filter(
        (d) =>
          d.VariableName !== "TATConsumed" && d.VariableName !== "TATRemaining"
      );
      setParam2DropdownOptions(filteredParam2Options);
      fillOperatorValues();
    }
    // code edited on 20 April 2023 for BugId 127342 - case workdesk rule>>value is not appearing for variables while defining the rule
  }, [variableType, localRuleData.ruleCondList, param1DropdownOptions, param1]);

  // Function to fill operator values based on the selected param1.
  const fillOperatorValues = () => {
    if (+variableType === STRING_VARIABLE_TYPE) {
      setConditionalDropdown(conditionalTextOperator);
    } else if (+variableType === BOOLEAN_VARIABLE_TYPE) {
      setConditionalDropdown(conditionalBooleanOperator);
    } else {
      setConditionalDropdown(conditionalOperator);
    }
  };
  const containsSpecialChars = (str) => {
    var regex = new RegExp("^[^<>]+$");
    return regex.test(str);
  };

  // Function that handles the change when the user selects the param 1 dropdown.
  const handleParam1Value = (event) => {
    setParam1(event.target.value);
    setParam2("");
    setIsParam2Const(false);

    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
    if (
      localRuleData.ruleCondList[index].m_strRuleType === DATA_TYPE_RULE_COND
    ) {
      let variableScope, extObjId, varFieldId, variableId, varType;
      param1DropdownOptions?.map((value) => {
        if (value.VariableName === event.target.value) {
          extObjId = value.ExtObjectId;
          varFieldId = value.VarFieldId;
          variableId = value.VariableId;
          variableScope = value.VariableScope;
          varType = value.VariableType;
          setVariableType(value.VariableType);
        }
      });
      setLocalRuleData((prevData) => {
        let temp = { ...prevData };
        temp.ruleCondList[index].param1 = event.target.value;
        temp.ruleCondList[index].extObjID1 = extObjId;
        temp.ruleCondList[index].varFieldId_1 = varFieldId;
        temp.ruleCondList[index].variableId_1 = variableId;
        temp.ruleCondList[index].type1 = variableScope;
        /*code added on 20 July 2023 for the issue, while saving date value in constant 
        field in value of condition, datatype1 key is added */
        temp.ruleCondList[index].datatype1 = varType;
        /*code edited on 17 July 2023 for the issue - clear param2 values after selecting param1*/
        temp.ruleCondList[index].param2 = "";
        temp.ruleCondList[index].extObjID2 = "0";
        temp.ruleCondList[index].varFieldId_2 = "0";
        temp.ruleCondList[index].variableId_2 = "0";
        return temp;
      });
    } else if (
      localRuleData.ruleCondList[index].m_strRuleType === DOC_TYPE_RULE_COND
    ) {
      let docId;
      allDocType?.map((value) => {
        if (value.docName === event.target.value) {
          docId = value.docId;
        }
      });
      setLocalRuleData((prevData) => {
        let temp = { ...prevData };
        temp.ruleCondList[index].param1 = event.target.value;
        temp.ruleCondList[index].variableId_1 = +docId;
        temp.ruleCondList[index].type1 = "D";
        return temp;
      });
    } else if (
      localRuleData.ruleCondList[index].m_strRuleType === TASK_TYPE_RULE_COND
    ) {
      let taskId;
      allTasks?.map((value) => {
        if (value.taskName === event.target.value) {
          taskId = value.taskId;
        }
      });
      setLocalRuleData((prevData) => {
        let temp = { ...prevData };
        temp.ruleCondList[index].param1 = event.target.value;
        temp.ruleCondList[index].variableId_1 = +taskId;
        temp.ruleCondList[index].type1 = "T";
        return temp;
      });
    }
  };

  // Function that handles the change of the operator.
  const onSelectOperator = (event) => {
    setLocalRuleData((prevData) => {
      let temp = { ...prevData };
      temp.ruleCondList[index].operator = event.target.value;
      return temp;
    });
    setSelectedOperator(event.target.value);
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change of the param 2 dropdown.
  const handleParam2Value = (event) => {
    if (
      localRuleData.ruleCondList[index].m_strRuleType === DATA_TYPE_RULE_COND
    ) {
      let variableScope, extObjId, varFieldId, variableId;
      param2DropdownOptions.map((value) => {
        if (value.VariableName === event.target.value) {
          extObjId = value.ExtObjectId;
          varFieldId = value.VarFieldId;
          variableId = value.VariableId;
          variableScope = value.VariableScope;
        }
        if (value.VariableScope === "F") {
          extObjId = "0";
          varFieldId = "0";
          variableId = "0";
        }
      });

      if (isParam2Const) {
        variableScope = "C";
        varFieldId = "0";
        variableId = "0";
        extObjId = "0";
      }
      setLocalRuleData((prevData) => {
        let temp = { ...prevData };
        temp.ruleCondList[index].param2 = event.target.value;
        temp.ruleCondList[index].extObjID2 =
          extObjId === undefined ? "0" : extObjId;
        temp.ruleCondList[index].varFieldId_2 =
          varFieldId === undefined ? "0" : varFieldId;
        temp.ruleCondList[index].variableId_2 =
          variableId === undefined ? "0" : variableId;
        temp.ruleCondList[index].type2 =
          variableScope === undefined ? "C" : variableScope;
        return temp;
      });
    } else if (
      localRuleData.ruleCondList[index].m_strRuleType === TASK_TYPE_RULE_COND
    ) {
      setLocalRuleData((prevData) => {
        let temp = { ...prevData };
        temp.ruleCondList[index].param2 = taskStatusFields[event.target.value];
        temp.ruleCondList[index].type2 = 0;
        return temp;
      });
    }
    setParam2(event.target.value);
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in the logical operator.
  const onSelectLogicalOperator = (event) => {
    setSelectedLogicalOperator(event.target.value);
    addNewCondition(
      event.target.value,
      index,
      localRuleData.ruleCondList.length
    );
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that checks if value is a part of existing dropdown options or is it from a constant newly added.
  const isConstIncluded = (value) => {
    let isConstantIncluded = false;
    if (value !== "") {
      param1DropdownOptions?.forEach((element) => {
        if (element.VariableName === value && element.VariableScope === "F") {
          isConstantIncluded = true;
        }
      });
    }
    return isConstantIncluded;
  };

  useEffect(() => {
    if (
      localRuleData.ruleCondList[index].m_strRuleType === DATA_TYPE_RULE_COND
    ) {
      let varList = [];
      loadedProcessData?.Variable?.forEach((item, i) => {
        if (
          (item.VariableScope === "U" && checkForVarRights(item)) ||
          (item.VariableScope === "I" && checkForVarRights(item))
        ) {
          varList.push(item);
        }
      });

      //Removing the TATConsumed and TATRemaining for Rules due to user can only use for BAM reports, so no need of this as per requirement.
      varList = varList.filter(
        (d) =>
          d.VariableName !== "TATConsumed" &&
          d.VariableName !== "TATRemaining" &&
          ((hideComplexFromVariables && d.VariableType !== COMPLEX_VARTYPE) ||
            !hideComplexFromVariables)
      );
      setParam1DropdownOptions(varList);
    } else if (
      localRuleData.ruleCondList[index].m_strRuleType === DOC_TYPE_RULE_COND
    ) {
      let tempList = {
        ...localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
          ?.objPMWdeskDocuments?.documentMap,
      };
      let docList = [];
      Object.keys(tempList)?.forEach((doc) => {
        docList.push({
          docName: doc,
          docId: tempList[doc]?.documentType.docTypeId,
        });
      });
      setAllDocType(docList);
    } else if (
      localRuleData.ruleCondList[index].m_strRuleType === TASK_TYPE_RULE_COND
    ) {
      let taskList = [];
      Object.values(associatedTasks)?.forEach((task) => {
        if (task.taskTypeInfo?.taskId !== taskInfo?.taskTypeInfo?.taskId)
          taskList.push({
            taskName: task.taskTypeInfo?.taskName,
            taskId: task.taskTypeInfo?.taskId,
          });
      });
      setAllTasks(taskList);
    }
  }, [localRuleData.ruleCondList[index]?.m_strRuleType]);

  // Function that runs when the Rule condition data changes.
  useEffect(() => {
    setParam1(localRuleData.ruleCondList[index].param1);
    if (
      localRuleData.ruleCondList[index].m_strRuleType === DATA_TYPE_RULE_COND
    ) {
      /*code edited on 17 July 2023 for BugId 132521 - While adding the rule, when the variable is of 
    text type and we enter any value in constant field, that includes abbreviation of month name, then 
    it gets converted to date.*/
      // modified on 22/09/23 for BugId 136677
      // if (
      //   variableType === "8" &&
      //   isValueDateType(localRuleData.ruleCondList[index].param2).isValDateType
      // ) {
      //   if (localRuleData.ruleCondList[index].type2 === "C") {
      //     setParam2(
      //       isValueDateType(localRuleData.ruleCondList[index].param2)
      //         .convertedDate
      //     );
      //   }
      // } else {
      //   setParam2(localRuleData.ruleCondList[index].param2);
      // }
      setParam2(localRuleData.ruleCondList[index].param2);
      // till here BugId 136677
    } else {
      let taskStats = null;
      // Object.keys(taskStatusFields)?.map((el) => {
      Object.keys(taskStatusFields)?.forEach((el) => {
        if (taskStatusFields[el] === localRuleData.ruleCondList[index].param2) {
          taskStats = el;
        }
      });
      setParam2(taskStats);
    }
    if (
      isConstIncluded(localRuleData.ruleCondList[index].param2) &&
      param2DropdownOptions?.length > 0
    ) {
      setIsParam2Const(true);
    } else {
      setIsParam2Const(false);
      if (localRuleData.ruleCondList[index].type2 === "C") {
        setIsParam2Const(true);
      }
    }
    let parsedDate = Date.parse(localRuleData.ruleCondList[index].param2);
    if (isNaN(localRuleData.ruleCondList[index].param2) && !isNaN(parsedDate)) {
      setIsParam2Const(true);
    } else {
      if (localRuleData.ruleCondList[index].type2 !== "C") {
        setIsParam2Const(false);
      }
    }

    //Modified on 08/09/2023, bug_id:135683
    setSelectedLogicalOperator(localRuleData.ruleCondList[index].logicalOp);
    // till here for bug_id:135683

    /*  if (localRuleData.ruleCondList[index].param2 !== "")
      setSelectedLogicalOperator(localRuleData.ruleCondList[index].logicalOp); */
    if (
      localRuleData.ruleCondList[index].param1 === RULES_ALWAYS_CONDITION ||
      localRuleData.ruleCondList[index].param1 === RULES_OTHERWISE_CONDITION
    ) {
      setSelectedOperator("");
    } else {
      setSelectedOperator(localRuleData.ruleCondList[index].operator);
    }
  }, [localRuleData.ruleCondList, props]);

  return (
    <div>
      {(localRuleData.ruleCondList[index].m_strRuleType ===
        DATA_TYPE_RULE_COND ||
        localRuleData.ruleCondList[index].m_strRuleType === "") && (
        <React.Fragment>
          <div className={clsx(styles.flexRow, styles.ruleConditionLabelsDiv)}>
            <p className={clsx(styles.operationsLabel)}>{t("variable")}</p>
            <p className={clsx(styles.operationsLabel)}>{t("operator")}</p>
            <p className={clsx(styles.operationsLabel)}>{t("value")}</p>
          </div>
          <div className={styles.addNewRule}>
            <CustomizedDropdown
              id="AR_Param1_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              value={param1}
              onChange={(event) => handleParam1Value(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrors={ruleConditionErrors}
              showAllErrorsSetterFunc={setRuleConditionErrors}
              isNotMandatory={isAlwaysRule}
              menuItemStyles={styles.menuItemStyles}
            >
              {param1DropdownOptions
                ?.filter(
                  (element) =>
                    element.VariableScope !== "F" ||
                    element.VariableType !== "11"
                )
                ?.map((element) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      key={element.VariableName}
                      value={element.VariableName}
                    >
                      {element.VariableName}
                    </MenuItem>
                  );
                })}
            </CustomizedDropdown>

            <CustomizedDropdown
              id="AR_Rule_Condition_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              value={selectedOperator}
              onChange={(event) => onSelectOperator(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrors={ruleConditionErrors}
              showAllErrorsSetterFunc={setRuleConditionErrors}
              isNotMandatory={isAlwaysRule}
              menuItemStyles={styles.menuItemStyles}
            >
              {conditionalDropdown?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    key={element.value}
                    value={element.value}
                  >
                    {element.label}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>

            {!(selectedOperator === "9" || selectedOperator === "10") ? (
              <CustomizedDropdown
                id="AR_Param2_Dropdown"
                disabled={isReadOnly || disabled}
                className={styles.dropdown}
                value={param2}
                onChange={(event) => handleParam2Value(event)}
                validationBoolean={checkValidation}
                validationBooleanSetterFunc={setCheckValidation}
                showAllErrors={ruleConditionErrors}
                showAllErrorsSetterFunc={setRuleConditionErrors}
                isNotMandatory={isAlwaysRule}
                isConstant={isParam2Const}
                setIsConstant={(val) => setIsParam2Const(val)}
                showConstValue={param2DropdownOptions?.length > 0}
                constType={variableType}
                menuItemStyles={styles.menuItemStyles}
                isFloat={variableType === "6"} // modified on 22/09/23 for  BugId 135861
                // added on 6-10-2023 for bug_id: 135699
                inputType="valuedropdown"
                reference={param2ref}
                validateConstField={(e) => {
                  if (e.target.value !== "" && e.target.value?.length > 255) {
                    dispatch(
                      setToastDataFunc({
                        message: `${t("value")}${SPACE}${t(
                          "lengthShouldNotExceed255Characters"
                        )}`,
                        severity: "error",
                        open: true,
                      })
                    );
                    return false;
                  } else if (
                    e.target.value !== "" &&
                    !containsSpecialChars(e.target.value)
                  ) {
                    dispatch(
                      setToastDataFunc({
                        message: `${t("value")}${SPACE}${t(
                          "cannotContain"
                        )}${SPACE}<>${SPACE}${t("charactersInIt")}`,
                        severity: "error",
                        open: true,
                      })
                    );
                    return false;
                  } else return true;
                }}
                // till here for bug_id: 135699
              >
                {param2DropdownOptions &&
                  param2DropdownOptions.map((element) => {
                    return (
                      <MenuItem
                        className={styles.menuItemStyles}
                        key={element.VariableName}
                        value={element.VariableName}
                      >
                        {element.VariableName}
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
            ) : null}

            <Select
              id="AR_Logical_Operator_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              MenuProps={menuProps}
              value={selectedLogicalOperator}
              onChange={(event) => onSelectLogicalOperator(event)}
            >
              {logicalOperator?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    key={element.value}
                    value={element.value}
                  >
                    {t(element.label)}
                  </MenuItem>
                );
              })}
            </Select>

            <div className={styles.deleteIcon}>
              {localRuleData &&
              localRuleData?.ruleCondList?.length > 1 &&
              !isReadOnly ? (
                <DeleteOutlinedIcon
                  id="AR_Delete_Row_Button"
                  onClick={() => deleteCondition(index)}
                />
              ) : null}
            </div>
          </div>
        </React.Fragment>
      )}
      {localRuleData.ruleCondList[index].m_strRuleType ===
        DOC_TYPE_RULE_COND && (
        <React.Fragment>
          <div className={clsx(styles.flexRow, styles.ruleConditionLabelsDiv)}>
            <p className={clsx(styles.operationsLabel)}>{t("documentType")}</p>
          </div>
          <div className={styles.addNewRule}>
            <CustomizedDropdown
              id="AR_Param1_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              value={param1}
              onChange={(event) => handleParam1Value(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrors={ruleConditionErrors}
              showAllErrorsSetterFunc={setRuleConditionErrors}
              isNotMandatory={isAlwaysRule}
              menuItemStyles={styles.menuItemStyles}
            >
              {allDocType?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    key={element.docName}
                    value={element.docName}
                  >
                    {element.docName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>

            <span style={{ margin: "5px 1vw 0 0" }}>{t("isPresent")}</span>
            <Select
              id="AR_Logical_Operator_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              MenuProps={menuProps}
              value={selectedLogicalOperator}
              onChange={(event) => onSelectLogicalOperator(event)}
            >
              {logicalOperator &&
                logicalOperator.map((element) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      key={element.value}
                      value={element.value}
                    >
                      {t(element.label)}
                    </MenuItem>
                  );
                })}
            </Select>

            <div className={styles.deleteIcon}>
              {localRuleData &&
              localRuleData?.ruleCondList?.length > 1 &&
              !isReadOnly ? (
                <DeleteOutlinedIcon
                  id="AR_Delete_Row_Button"
                  onClick={() => deleteCondition(index)}
                />
              ) : null}
            </div>
          </div>
        </React.Fragment>
      )}
      {localRuleData.ruleCondList[index].m_strRuleType ===
        TASK_TYPE_RULE_COND && (
        <React.Fragment>
          <div className={clsx(styles.flexRow, styles.ruleConditionLabelsDiv)}>
            <p className={clsx(styles.operationsLabel)}>
              {t("AssociatedTasks")}
            </p>
            <p className={clsx(styles.operationsLabel)}>{t("taskStatus")}</p>
          </div>
          <div className={styles.addNewRule}>
            <CustomizedDropdown
              id="AR_Param1_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              value={param1}
              onChange={(event) => handleParam1Value(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrors={ruleConditionErrors}
              showAllErrorsSetterFunc={setRuleConditionErrors}
              isNotMandatory={isAlwaysRule}
              menuItemStyles={styles.menuItemStyles}
            >
              {allTasks?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    key={element.taskName}
                    value={element.taskName}
                  >
                    {element.taskName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>

            <CustomizedDropdown
              id="AR_Param2_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              value={param2}
              onChange={(event) => handleParam2Value(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrors={ruleConditionErrors}
              showAllErrorsSetterFunc={setRuleConditionErrors}
              isNotMandatory={isAlwaysRule}
              menuItemStyles={styles.menuItemStyles}
            >
              {Object.keys(taskStatusFields)?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    key={element}
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>

            <Select
              id="AR_Logical_Operator_Dropdown"
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              MenuProps={menuProps}
              value={selectedLogicalOperator}
              onChange={(event) => onSelectLogicalOperator(event)}
            >
              {logicalOperator &&
                logicalOperator.map((element) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      key={element.value}
                      value={element.value}
                    >
                      {t(element.label)}
                    </MenuItem>
                  );
                })}
            </Select>

            <div className={styles.deleteIcon}>
              {localRuleData &&
              localRuleData?.ruleCondList?.length > 1 &&
              !isReadOnly ? (
                <DeleteOutlinedIcon
                  id="AR_Delete_Row_Button"
                  onClick={() => deleteCondition(index)}
                />
              ) : null}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default AddCondition;
