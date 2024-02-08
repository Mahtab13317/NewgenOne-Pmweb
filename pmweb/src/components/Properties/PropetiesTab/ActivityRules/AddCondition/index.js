// #BugID - 112369
// #BugDescription - Added provision to add constants in list with constants already made.
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { MenuItem, Grid, IconButton } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import { store, useGlobalState } from "state-pool";
import {
  conditionalBooleanOperator,
  conditionalOperator,
  conditionalTextOperator,
  logicalOperatorOptions,
} from "../CommonFunctionCall";
import {
  STRING_VARIABLE_TYPE,
  BOOLEAN_VARIABLE_TYPE,
  RULES_ALWAYS_CONDITION,
  ADD_CONDITION_NO_LOGICALOP_VALUE,
  RULES_OTHERWISE_CONDITION,
  RTL_DIRECTION,
  hideComplexFromVariables,
  COMPLEX_VARTYPE,
} from "../../../../../Constants/appConstants";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { connect } from "react-redux";

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
  } = props;
  const direction = `${t("HTML_DIR")}`;
  const [loadedProcessData] = useGlobalState("loadedProcessData");
  const variableData = loadedProcessData.Variable;
  const constantsData = loadedProcessData.DynamicConstant;
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
  const param2ref = useRef(null);

  // added on 03/10/23 for BugId 135855
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

  // Function that runs when the component renders.
  useEffect(() => {
    if (variableData) {
      let variableWithConstants = [];
      constantsData?.forEach((element) => {
        let tempObj = {
          VariableName: element.ConstantName,
          VariableScope: "F",
        };
        variableWithConstants.push(tempObj);
      });
      variableData?.forEach((element) => {
        if (
          (hideComplexFromVariables &&
            element.VariableType !== COMPLEX_VARTYPE) ||
          !hideComplexFromVariables
        ) {
          // modified on 03/10/23 for BugId 135855
          // variableWithConstants.push(element);
          // added on 11/10/23 for BugId 139311
          if (
            (props.cellActivityType === 7 && props.cellActivitySubType === 1) ||
            props.cellActivityType === 5
          ) {
            variableWithConstants.push(element);
          } else {
            if (
              (element.VariableScope === "U" && checkForVarRights(element)) ||
              (element.VariableScope === "I" && checkForVarRights(element)) ||
              (element.VariableScope !== "U" && element.VariableScope !== "I")
            ) {
              variableWithConstants.push(element);
            }
          }
        }
      });

      //Removing the TATConsumed and TATRemaining for Rules due to user can only use for BAM reports, so no need of this as per requirement.
      variableWithConstants = variableWithConstants.filter(
        (d) =>
          d.VariableName !== "TATConsumed" && d.VariableName !== "TATRemaining"
      );

      setParam1DropdownOptions(variableWithConstants);
      setParam2DropdownOptions(variableWithConstants);
    }
  }, []);

  // Function that runs when the variableType state changes.
  useEffect(() => {
    param1DropdownOptions?.forEach((element) => {
      if (element.VariableName === localRuleData.ruleCondList[index].param1) {
        setVariableType(element.VariableType);
      }
    });
    fillOperatorValues();
    const filteredParam2Options = param1DropdownOptions?.filter((element) => {
      if (
        element.VariableType === variableType ||
        element.VariableScope === "F"
      ) {
        return element;
      }
    });
    setParam2DropdownOptions(filteredParam2Options);
  }, [variableType, localRuleData.ruleCondList, param1DropdownOptions]);

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

  // Function that handles the change when the user selects the param 1 dropdown.
  const handleParam1Value = (event) => {
    setParam1(event.target.value);
    setParam2("");
    setIsParam2Const(false);

    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
    let variableScope, extObjId, varFieldId, variableId, variableType;
    param1DropdownOptions?.map((value) => {
      if (value.VariableName === event.target.value) {
        extObjId = value.ExtObjectId;
        varFieldId = value.VarFieldId;
        variableId = value.VariableId;
        variableScope = value.VariableScope;
        variableType = value.VariableType;
        setVariableType(value.VariableType);
      }
    });

    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleCondList[index].param1 = event.target.value;
      temp.ruleCondList[index].extObjID1 = extObjId;
      temp.ruleCondList[index].varFieldId_1 = varFieldId;
      temp.ruleCondList[index].variableId_1 = variableId;
      temp.ruleCondList[index].type1 = variableScope;
      /*code added on 20 July 2023 for the issue, while saving date value in constant 
      field in value of condition, datatype1 key is added */
      temp.ruleCondList[index].datatype1 = variableType;
      /*code edited on 17 July 2023 for the issue - clear param2 values after selecting param1*/
      temp.ruleCondList[index].param2 = "";
      temp.ruleCondList[index].extObjID2 = "0";
      temp.ruleCondList[index].varFieldId_2 = "0";
      temp.ruleCondList[index].variableId_2 = "0";
      return temp;
    });
  };

  // Function that handles the change of the operator.
  const onSelectOperator = (event) => {
    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.ruleCondList[index].operator = event.target.value;
      return temp;
    });
    setSelectedOperator(event.target.value);
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change of the param 2 dropdown.
  const handleParam2Value = (event, isP2Const) => {
    let variableScope, extObjId, varFieldId, variableId;

    if (isP2Const) {
      variableScope = "C";
      varFieldId = "0";
      variableId = "0";
      extObjId = "0";
    } else {
      param2DropdownOptions.forEach((value) => {
        if (
          value.VariableName === event.target.value &&
          value.VariableScope !== "F"
        ) {
          extObjId = value.ExtObjectId;
          varFieldId = value.VarFieldId;
          variableId = value.VariableId;
          variableScope = value.VariableScope;
        } else if (
          value.VariableName === event.target.value &&
          value.VariableScope === "F"
        ) {
          extObjId = "0";
          varFieldId = "0";
          variableId = "0";
          variableScope = "F";
        }
      });
    }

    setLocalRuleData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
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
    setParam2(event.target.value);
    if (isRuleBeingCreated === false) {
      setIsRuleBeingModified(true);
    }
  };

  // Function that handles the change in the logical operator.
  const onSelectLogicalOperator = (event) => {
    // code edited on 23 Dec 2022 for BugId 120992
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
        if (element.VariableName === value && element.VariableScope === "C") {
          isConstantIncluded = true;
        }
      });
    }
    return isConstantIncluded;
  };

  // Function that runs when the Rule condition data changes.
  useEffect(() => {
    setParam1(localRuleData.ruleCondList[index].param1);
    /*code edited on 17 July 2023 for BugId 132521 - While adding the rule, when the variable is of 
    text type and we enter any value in constant field, that includes abbreviation of month name, then 
    it gets converted to date.*/
    // modified on 21/09/23 for BugId 136677
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

    if (localRuleData.ruleCondList[index].param2 !== "")
      setSelectedLogicalOperator(localRuleData.ruleCondList[index].logicalOp);
    if (
      localRuleData.ruleCondList[index].param1 === RULES_ALWAYS_CONDITION ||
      localRuleData.ruleCondList[index].param1 === RULES_OTHERWISE_CONDITION
    ) {
      setSelectedOperator("");
    } else {
      setSelectedOperator(localRuleData.ruleCondList[index].operator);
    }
  }, [localRuleData.ruleCondList]);

  return (
    <div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.addNewRule
            : styles.addNewRule
        }
      >
        <Grid container spacing={0.5} justifyContent="space-between" xs={12}>
          <Grid item xs={2}>
            <CustomizedDropdown
              id={`AR_Param1_Dropdown_${index}`}
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              value={param1}
              onChange={(event) => handleParam1Value(event)}
              validationBoolean={checkValidation}
              validationBooleanSetterFunc={setCheckValidation}
              showAllErrors={ruleConditionErrors}
              showAllErrorsSetterFunc={setRuleConditionErrors}
              isNotMandatory={!checkValidation}
              menuItemStyles={styles.menuItemStyles}
              ariaLabel="Select a Variable"
            >
              {param1DropdownOptions &&
                param1DropdownOptions
                  .filter((element) => element.VariableScope !== "F")
                  ?.map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element.VariableName}
                        value={element.VariableName}
                      >
                        {element.VariableName}
                      </MenuItem>
                    );
                  })}
            </CustomizedDropdown>
          </Grid>
          <Grid item xs={2}>
            <CustomizedDropdown
              id={`AR_Rule_Condition_Dropdown_${index}`}
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
              ariaLabel="Select an Operator"
            >
              {conditionalDropdown &&
                conditionalDropdown.map((element) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.menuItemStyles
                          : styles.menuItemStyles
                      }
                      key={element.value}
                      value={element.value}
                    >
                      {element.label}
                    </MenuItem>
                  );
                })}
            </CustomizedDropdown>
          </Grid>
          <Grid item xs={2}>
            {!(selectedOperator === "9" || selectedOperator === "10") ? (
              <CustomizedDropdown
                id={`AR_Param2_Dropdown_${index}`}
                disabled={isReadOnly || disabled}
                className={styles.dropdown}
                value={param2}
                onChange={(event, isConst) => handleParam2Value(event, isConst)}
                validationBoolean={checkValidation}
                validationBooleanSetterFunc={setCheckValidation}
                showAllErrors={ruleConditionErrors}
                showAllErrorsSetterFunc={setRuleConditionErrors}
                isNotMandatory={!checkValidation}
                isConstant={isParam2Const}
                setIsConstant={(val) => setIsParam2Const(val)}
                showConstValue={param2DropdownOptions?.length > 0}
                constType={variableType}
                isFloat={variableType === "6"}
                menuItemStyles={styles.menuItemStyles}
                reference={param2ref}
                ariaLabel="Select a Value"
              >
                {param2DropdownOptions &&
                  param2DropdownOptions.map((element) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={element.VariableName}
                        value={element.VariableName}
                      >
                        {element.VariableName}
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
            ) : null}
          </Grid>
          <Grid item xs={2}>
            <CustomizedDropdown
              id={`AR_Logical_Operator_Dropdown_${index}`}
              disabled={isReadOnly || disabled}
              className={styles.dropdown}
              value={selectedLogicalOperator}
              onChange={(event) => onSelectLogicalOperator(event)}
              isNotMandatory={true}
              ariaLabel="Select a Logical Operator"
              hideDefaultSelect={true}
            >
              {logicalOperator &&
                logicalOperator.map((element) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.menuItemStyles
                          : styles.menuItemStyles
                      }
                      key={element.value}
                      value={element.value}
                    >
                      {/* Modified on 20-09-23 for Bug 137016 */}
                      {element.label}
                      {/* Till here Bug 137016 */}
                    </MenuItem>
                  );
                })}
            </CustomizedDropdown>
          </Grid>
          <Grid item xs={2}>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.deleteIcon
                  : styles.deleteIcon
              }
            >
              {localRuleData &&
              localRuleData?.ruleCondList?.length > 1 &&
              !isReadOnly ? (
                <IconButton
                  id={`AR_Delete_ConditionRowBtn_${index}`}
                  onClick={() => deleteCondition(index)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && deleteCondition(index)}
                  className={styles.iconButton}
                  aria-label="Delete"
                  disableFocusRipple
                  disableTouchRipple
                  disableRipple
                >
                  <DeleteOutlinedIcon
                    style={{ height: "1.75rem", width: "1.75rem" }}
                  />
                </IconButton>
              ) : null}
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
  };
};

export default connect(mapStateToProps, null)(AddCondition);
