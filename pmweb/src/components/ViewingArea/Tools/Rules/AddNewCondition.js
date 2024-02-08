// #BugID - 112810
// #BugDescription - Added provision to add constants in dropdownlist.
// #BugID - 120119
// #BugDescription - Added validation for date format.
// #BugID - 121009
// #BugDescription - Fixed issue for Logical Operator.
// #BugID - 121019
// #BugDescription - Fixed issue for Logical Operator(converted the button into select box).
// #BugID - 117902
// #BugDescription - Handled fucntion for NULL and NOT NUll to disable the other fields.
import React, { useState, useEffect } from "react";
import styles from "./rule.module.css";
import { IconButton, MenuItem } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import { store, useGlobalState } from "state-pool";
import {
  ConditionalOperator,
  getLogicalOperator,
  getLogicalOperatorReverse,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  COMPLEX_VARTYPE,
  VARIABLE_RULES_ALWAYS_CONDITION,
  hideComplexFromVariables,
} from "../../../../Constants/appConstants";

function AddNewCondition(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [variableType, setvariableType] = useState(null);
  const [param1, setParam1] = useState("");
  const [param2, setParam2] = useState("");
  const [selectedOperator, setselectedOperator] = useState("");
  const [isParam2Const, setIsParam2Const] = useState(false);
  const [conditionalDropdown, setconditionalDropdown] =
    useState(ConditionalOperator);
  const [logicalOperator, setLogicalOperator] = useState("");

  const {
    index,
    setrowData,
    allRowData,
    newRow,
    parentIndex,
    disabled,
    showDelIcon,
    checkValidation,
    setCheckValidation,
    ruleConditionErrors,
    setRuleConditionErrors,
    isAlwaysRule,
    calledFrom,
  } = props;

  /*****************************************************************************************
   * @author asloob_ali BUG ID : 115319 Rules: activity name is not modifiable and should not be allowed in Rules like in IBPS 5 sp2
   *  Resolution : removed ActivityName variable from dropdown.
   *  Date : 13/09/2022             ****************/
  //Bug id 115319 Rules: activity name is not modifiable and should not be allowed in Rules like in IBPS 5 sp2

  //Removing the TATConsumed and TATRemaining for Rules due to user can only use for BAM reports, so no need of this as per requirement.

  const parameter1dropdown = localLoadedProcessData?.Variable?.filter(
    (variable) =>
      variable.VariableId !== "49" &&
      variable.VariableName !== "TATConsumed" &&
      variable.VariableName !== "TATRemaining" &&
      ((hideComplexFromVariables &&
        variable.VariableType !== COMPLEX_VARTYPE) ||
        !hideComplexFromVariables)
  );
  const [param2Dropdown, setparam2Dropdown] = useState(
    localLoadedProcessData?.Variable?.filter(
      (variable) =>
        (hideComplexFromVariables &&
          variable.VariableType !== COMPLEX_VARTYPE) ||
        !hideComplexFromVariables
    )
  );

  useEffect(() => {
    if (
      +variableType === 10 ||
      +variableType === 12 ||
      +variableType === 3 ||
      +variableType === 4 ||
      +variableType === 6 ||
      +variableType === 8
    ) {
      let localArr = ConditionalOperator?.filter((val) =>
        val.type?.includes(+variableType)
      );
      setconditionalDropdown(localArr);
    }

    let parameter2 = [];
    let paramLen = parameter1dropdown?.length;
    for (let i = 0; i < paramLen; i++) {
      if (+parameter1dropdown[i].VariableType === +variableType) {
        parameter2.push(parameter1dropdown[i]);
      }
    }

    //Removing the TATConsumed and TATRemaining for Rules due to user can only use for BAM reports, so no need of this as per requirement.
    parameter2 = parameter2.filter(
      (d) =>
        d.VariableName !== "TATConsumed" &&
        d.VariableName !== "TATRemaining" &&
        ((hideComplexFromVariables && d.VariableType !== COMPLEX_VARTYPE) ||
          !hideComplexFromVariables)
    );

    setparam2Dropdown(parameter2);
  }, [variableType]);

  const onSelectParam1 = (elmValue) => {
    let varType = null;
    parameter1dropdown?.forEach((value) => {
      if (value.VariableName === elmValue) {
        varType = value.VariableType;
      }
    });
    setvariableType(varType);
    setrowData((prevData) => {
      let temp = [...prevData];
      temp[parentIndex].ruleCondList[index].param1 = elmValue;
      parameter1dropdown?.forEach((value) => {
        if (value.VariableName === elmValue) {
          temp[parentIndex].ruleCondList[index].varFieldId_1 = value.VarFieldId;
          temp[parentIndex].ruleCondList[index].variableId_1 = value.VariableId;
          temp[parentIndex].ruleCondList[index].type1 = value.VariableScope;
          temp[parentIndex].ruleCondList[index].extObjID1 = value.ExtObjectId;
          // added on 27/09/2023 for BugId 136677
          temp[parentIndex].ruleCondList[index].datatype1 = value.VariableType;
        }
      });
      return temp;
    });
    setParam1(elmValue);
  };

  const onSelectOperator = (e) => {
    setrowData((prevData) => {
      let temp = [...prevData];
      temp[parentIndex].ruleCondList[index].operator = e.target.value;
      return temp;
    });
    setselectedOperator(e.target.value);
    if (+e.target.value === 9 || +e.target.value === 10) {
      setparam2Dropdown([]);
    }
  };

  const onSelectCondition = (e, constStatus) => {
    // code edited on 25 Aug 2023 for BugId 134448 - regression>>document rules>> not able to add
    // document rules with date variable, showing invalid date format
    setrowData((prevData) => {
      let temp = [...prevData];
      temp[parentIndex].ruleCondList[index].param2 = e.target.value;
      if (constStatus) {
        temp[parentIndex].ruleCondList[index].type2 = "C";
        temp[parentIndex].ruleCondList[index].varFieldId_2 = "0";
        temp[parentIndex].ruleCondList[index].variableId_2 = "0";
        temp[parentIndex].ruleCondList[index].extObjID2 = "0";
      } else {
        parameter1dropdown?.forEach((value) => {
          if (value.VariableName === e.target.value) {
            temp[parentIndex].ruleCondList[index].varFieldId_2 =
              value.VarFieldId;
            temp[parentIndex].ruleCondList[index].variableId_2 =
              value.VariableId;
            temp[parentIndex].ruleCondList[index].extObjID2 = value.ExtObjectId;
            temp[parentIndex].ruleCondList[index].type2 = value.VariableScope;
          }
        });
      }
      return temp;
    });
    setParam2(e.target.value);
  };

  const onSelectLogicalOperator = (e) => {
    let txt = e.target.value;
    setLogicalOperator(txt);
    setrowData((prevData) => {
      let temp = [...prevData];
      temp[parentIndex].ruleCondList[index].logicalOp = getLogicalOperator(txt);
      return temp;
    });
    newRow("+", index, parentIndex);
  };

  const deleteRow = () => {
    setrowData((prevData) => {
      let temp = [...prevData];
      temp[parentIndex].ruleCondList.splice(index, 1);
      return temp;
    });
  };

  useEffect(() => {
    if (allRowData.type2 === "C") {
      setIsParam2Const(true);
    } else {
      setIsParam2Const(false);
    }
    if (
      (!disabled &&
        calledFrom !== "variable" &&
        allRowData.param1 !== "Always") ||
      (calledFrom === "variable" &&
        allRowData.param1?.toUpperCase() !== VARIABLE_RULES_ALWAYS_CONDITION)
    ) {
      setParam1(allRowData.param1);
      onSelectParam1(allRowData.param1);
      setParam2(allRowData.param2);
      setLogicalOperator(getLogicalOperatorReverse(allRowData.logicalOp));
      setselectedOperator(allRowData.operator);
    }
  }, [allRowData, disabled]);

  useEffect(() => {
    if (showDelIcon === false) {
      setLogicalOperator("+");
    }
  }, [showDelIcon]);

  return (
    <div
      style={{
        marginInlineStart: "15px",
        display: "flex",
        alignItems: "center",
      }}
      className={styles.addNewRule}
    >
      <div style={{ display: "flex" }}>
        <CustomizedDropdown
          id="pmweb_addNewCondition_ruleParam1Dropdown"
          disabled={disabled}
          className={styles.dataDropdown}
          value={param1}
          style={{
            /*Bug 116705: [14-02-2023] Increased the width so that whole dropdown falls within the InputBorder */
            width: "15vw",
            border: "1px solid #c4c4c4",
          }}
          onChange={(e) => onSelectParam1(e.target.value)}
          validationBoolean={checkValidation}
          validationBooleanSetterFunc={setCheckValidation}
          showAllErrors={ruleConditionErrors}
          showAllErrorsSetterFunc={setRuleConditionErrors}
          isNotMandatory={!checkValidation}
          menuItemStyles={styles.menuItemStyles}
        >
          {parameter1dropdown
            ?.filter((element) => element.VariableScope !== "C")
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
          id="pmweb_addNewCondition_ruleConditionalDropdown"
          disabled={disabled}
          className={styles.dataDropdown}
          style={{
            width: "9vw",
            border: "1px solid #c4c4c4",
            marginInline: "1vw",
          }}
          value={selectedOperator}
          onChange={(e) => onSelectOperator(e)}
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
                {element.label.toLocaleUpperCase()}
              </MenuItem>
            );
          })}
        </CustomizedDropdown>
        {!(selectedOperator === "9" || selectedOperator === "10") ? (
          <CustomizedDropdown
            id={`pmweb_addNewCondition_ruleParam2Dropdown_${param2}`}
            className={styles.dataDropdown}
            isNotMandatory={!checkValidation}
            name="selected_operator"
            style={{
              /*Bug 116705: [14-02-2023] Increased the width so that whole dropdown falls within the InputBorder */
              width: "15vw",
              border: "1px solid #c4c4c4",
              marginInlineEnd: "1vw",
            }}
            value={param2}
            // code edited on 25 Aug 2023 for BugId 134448
            onChange={(e, isConstant) => {
              onSelectCondition(e, isConstant);
            }}
            disabled={disabled}
            validationBoolean={checkValidation}
            validationBooleanSetterFunc={setCheckValidation}
            showAllErrors={ruleConditionErrors}
            showAllErrorsSetterFunc={setRuleConditionErrors}
            isConstant={isParam2Const}
            constType={variableType}
            menuItemStyles={styles.menuItemStyles}
            // code edited on 25 Aug 2023 for BugId 134448
            setIsConstant={(val) => {
              setIsParam2Const(val);
            }}
            showConstValue={true}
          >
            {param2Dropdown?.map((element) => {
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
        <CustomizedDropdown
          id="pmweb_addNewCondition_logicalOperator"
          className={styles.dataDropdown}
          style={{
            width: "9vw",
            border: "1px solid #c4c4c4",
            marginInlineEnd: "1vw",
          }}
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
          isNotMandatory={true}
          onChange={(e) => onSelectLogicalOperator(e)}
          value={logicalOperator}
          disabled={
            // disabled || +selectedOperator === 9 || +selectedOperator === 10
            disabled
          }
        >
          <MenuItem className={styles.menuItemStyles} value="OR">
            OR
          </MenuItem>
          <MenuItem className={styles.menuItemStyles} value="AND">
            AND
          </MenuItem>
        </CustomizedDropdown>
      </div>

      {showDelIcon ? (
        <IconButton
          onClick={deleteRow}
          id="pmweb_addNewCondition_deleteRuleRow"
          tabIndex={0}
          aria-label="Delete"
          onKeyDown={(e) => e.key === "Enter" && deleteRow()}
          className={styles.iconButton}
          disableFocusRipple
          disableTouchRipple
        >
          <DeleteOutlinedIcon
            className={styles.deleteIcon}
            style={{ margin: "0px" }}
          />
        </IconButton>
      ) : null}
    </div>
  );
}

export default AddNewCondition;
