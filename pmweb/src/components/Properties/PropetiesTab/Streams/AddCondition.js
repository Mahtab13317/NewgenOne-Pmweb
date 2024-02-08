import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import { Button, MenuItem, makeStyles } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import { store, useGlobalState } from "state-pool";
import {
  STRING_VARIABLE_TYPE,
  BOOLEAN_VARIABLE_TYPE,
} from "../../../../Constants/appConstants";
import {
  conditionalBooleanOperator,
  conditionalOperator,
  conditionalTextOperator,
} from "../ActivityRules/CommonFunctionCall";
import {
  getLogicalOperator,
  getLogicalOperatorReverse,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useDispatch } from "react-redux";
import { LightTooltip } from "../../../../UI/StyledTooltip";

// code added on 12-10-23 for bug 139355
const useStyles = makeStyles({
  toggleBtn: {
    margin: " 0 !important",
    marginInlineEnd: "1vw !important",
    width: "2.5vw",
    // height: var(--line_height) !important,
    // background: "#ffffff 0% 0% no-repeat padding-box",
    font: "normal normal normal var(--base_text_font_size) / 17px var(--font_family) !important",
    border: "1px solid #c4c4c4",
    borderRadius: "2px",
    textAlign: "center",
    cursor: "pointer",

    "& .MuiButton-label-541": {
      fontWeight: 400,
    },
  },
});
// Till here for bug 139355

function AddCondition(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  // code added on 23 Aug 2022 for BugId 114353
  const constantsData = localLoadedProcessData.DynamicConstant;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const [param1, setParam1] = useState(""); // State to store value for param 1 dropdown.
  const [param2, setParam2] = useState(""); // State to store value for param 2 dropdown.
  const [selectedOperator, setSelectedOperator] = useState(""); // State to store value for operator dropdown.
  const [conditionalDropdown, setConditionalDropdown] = useState([]); // State to store the dropdown operators for conditional operator.
  const [param1DropdownOptions, setParam1DropdownOptions] = useState([]); // State to store the dropdown options for parameter 1.
  const [logicalOperator, setLogicalOperator] = useState("+"); // State to store the dropdown options for logical operator.
  const [param2DropdownOptions, setParam2DropdownOptions] = useState([]); // State to store the dropdown options for parameter 2.
  // code added on 23 Aug 2022 for BugId 114353
  const [variableType, setVariableType] = useState("");
  const [isParam2Const, setIsParam2Const] = useState(false); // State that tells whether constant option is selected in param2.

  const {
    workList,
    setdisable,
    localData,
    streamsData,
    index,
    setStreamData,
    newRow,
    parentIndex,
    showDelIcon,
    disabled,
    isReadOnly,
  } = props;
  const classes = useStyles();

  // Function that runs when workList value changes.
  useEffect(() => {
    if (workList && workList === "A") {
      setParam1("");
      setParam2("");
      setSelectedOperator("");
      setdisable(true);
    } else {
      setdisable(false);
    }
  }, [workList]);

  // Function that runs when the component renders.
  useEffect(() => {
    let list = [];
    // code added on 23 Aug 2022 for BugId 114353
    constantsData?.forEach((element) => {
      let tempObj = {
        VariableName: element.ConstantName,
        VariableScope: "C",
      };
      list.push(tempObj);
    });
    localLoadedProcessData?.Variable?.filter(
      (el) => el.VariableType !== "11" || el.Unbounded !== "Y"
    )?.forEach((el) => {
      if (
        el.VariableScope === "M" ||
        el.VariableScope === "S" ||
        (el.VariableScope === "U" && checkForVarRights(el)) ||
        (el.VariableScope === "I" && checkForVarRights(el))
      ) {
        list.push(el);
      }
    });
    setParam1DropdownOptions(list);
  }, [localLoadedProcessData?.Variable, constantsData]);

  const checkForVarRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item, i) => {
        if (item?.processVarInfo?.variableId === data.VariableId) {
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

  const deleteRow = () => {
    let temp = { ...streamsData };
    if (
      temp?.ActivityProperty?.streamInfo?.esRuleList[parentIndex]?.status ===
      "added"
    ) {
      temp.ActivityProperty.streamInfo.esRuleList[parentIndex].status =
        "edited";
    }
    if (
      temp?.ActivityProperty?.streamInfo?.esRuleList[parentIndex]?.ruleCondList
        ?.length -
        1 ===
      index
    ) {
      temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
        index - 1
      ].logicalOp = "3";
    }

    temp.ActivityProperty.streamInfo.esRuleList[
      parentIndex
    ].ruleCondList.splice(index, 1);
    setStreamData(temp);
  };

  // code added on 25 Nov 2022 for BugId 119278
  useEffect(() => {
    if (localData) {
      if (localData.type2 !== "C") {
        setIsParam2Const(false);
      }
      if (localData.param1?.trim() !== "") {
        let tempList = [];
        // code added on 23 Aug 2022 for BugId 114353
        constantsData?.forEach((element) => {
          let tempObj = {
            VariableName: element.ConstantName,
            VariableScope: "C",
          };
          tempList.push(tempObj);
        });
        localLoadedProcessData?.Variable?.filter(
          (el) => el.VariableType !== "11" || el.Unbounded !== "Y"
        )?.forEach((el) => {
          if (
            el.VariableScope === "M" ||
            el.VariableScope === "S" ||
            (el.VariableScope === "U" && checkForVarRights(el)) ||
            (el.VariableScope === "I" && checkForVarRights(el))
          ) {
            tempList.push(el);
          }
        });
        setParam1(localData.param1);
        let varType;
        tempList?.forEach((value) => {
          if (value.VariableName === localData.param1) {
            varType = value.VariableType;
          }
        });
        let list = [];
        // code added on 23 Aug 2022 for BugId 114353
        constantsData?.forEach((element) => {
          let tempObj = {
            VariableName: element.ConstantName,
            VariableScope: "C",
          };
          list.push(tempObj);
        });
        localLoadedProcessData?.Variable?.filter(
          (el) => el.VariableType !== "11" || el.Unbounded !== "Y"
        ).forEach((el) => {
          if (
            el.VariableScope === "M" ||
            el.VariableScope === "S" ||
            (el.VariableScope === "U" && checkForVarRights(el)) ||
            (el.VariableScope === "I" && checkForVarRights(el))
          ) {
            let type = el.VariableType;
            if (+varType === +type) {
              list.push(el);
            }
          }
        });
        setParam2DropdownOptions(list);

        if (+varType === STRING_VARIABLE_TYPE) {
          setConditionalDropdown(conditionalTextOperator);
        } else if (+varType === BOOLEAN_VARIABLE_TYPE) {
          setConditionalDropdown(conditionalBooleanOperator);
        } else {
          setConditionalDropdown(conditionalOperator);
        }
        setParam2(localData.param2);
        setIsParam2Const(localData.type2 === "C");
        setSelectedOperator(localData.operator);
      } else {
        setParam1("");
        setParam2("");
        setSelectedOperator("");
      }
      setLogicalOperator(getLogicalOperatorReverse(localData.logicalOp));
    }
  }, [localData, streamsData]);

  const setDropdownVal = (paramVal) => {
    let varType;
    param1DropdownOptions?.forEach((value) => {
      if (value.VariableName === paramVal) {
        varType = value.VariableType;
      }
    });

    let list = [];
    // code added on 23 Aug 2022 for BugId 114353
    constantsData?.forEach((element) => {
      let tempObj = {
        VariableName: element.ConstantName,
        VariableScope: "C",
      };
      list.push(tempObj);
    });
    localLoadedProcessData?.Variable?.filter(
      (el) => el.VariableType !== "11" || el.Unbounded !== "Y"
    ).forEach((el) => {
      if (
        el.VariableScope === "M" ||
        el.VariableScope === "S" ||
        (el.VariableScope === "U" && checkForVarRights(el)) ||
        (el.VariableScope === "I" && checkForVarRights(el))
      ) {
        let type = el.VariableType;
        if (+varType === +type) {
          list.push(el);
        }
      }
    });
    setParam2DropdownOptions(list);

    if (+varType === STRING_VARIABLE_TYPE) {
      setConditionalDropdown(conditionalTextOperator);
    } else if (+varType === BOOLEAN_VARIABLE_TYPE) {
      setConditionalDropdown(conditionalBooleanOperator);
    } else {
      setConditionalDropdown(conditionalOperator);
    }
  };

  const handleParam1Value = (event) => {
    setParam1(event.target.value);
    let varScope, extObjId, varFieldId, variableId, variableType;
    param1DropdownOptions?.forEach((value) => {
      if (value.VariableName === event.target.value) {
        extObjId = value.ExtObjectId;
        varFieldId = value.VarFieldId;
        variableId = value.VariableId;
        varScope = value.VariableScope;
        variableType = value.VariableType;
      }
      //Added on 23/06/2023, bug_id:130962
      if (value.VariableScope === "C") {
        extObjId = "0";
        varFieldId = "0";
        variableId = "0";
        varScope = "C";
        variableType = "";
      }
    });
    // code added on 23 Aug 2022 for BugId 114353
    setVariableType(variableType);
    setDropdownVal(event.target.value);
    let temp = { ...streamsData };
    if (
      temp?.ActivityProperty?.streamInfo?.esRuleList[parentIndex]?.status ===
      "added"
    ) {
      temp.ActivityProperty.streamInfo.esRuleList[parentIndex].status =
        "edited";
    }
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].param1 = event.target.value;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].type1 = varScope;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].extObjID1 = extObjId;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].varFieldId_1 = varFieldId;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].variableId_1 = variableId;
    // added on 27/09/2023 for BugId 136677
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].datatype1 = variableType;
    setStreamData(temp);
    // Commented on 13-10-23 for Bug 139353
    // dispatch(
    //   setActivityPropertyChange({
    //     [propertiesLabel.streams]: { isModified: true, hasError: false },
    //   })
    // );
    // Till here for Bug 139353
  };

  const onSelectOperator = (event) => {
    let temp = { ...streamsData };
    if (
      temp?.ActivityProperty?.streamInfo?.esRuleList[parentIndex]?.status ===
      "added"
    ) {
      temp.ActivityProperty.streamInfo.esRuleList[parentIndex].status =
        "edited";
    }
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].operator = event.target.value;
    // Added on 18-10-23 for Bug 139491
    if (event.target.value === "9" || event.target.value === "10") {
      temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
        index
      ].param2 = "";
      setParam2("");
    }
    // Till here for Bug 139491
    setStreamData(temp);
    setSelectedOperator(event.target.value);
    // Commented on 13-10-23 for Bug 139353
    // dispatch(
    //   setActivityPropertyChange({
    //     [propertiesLabel.streams]: { isModified: true, hasError: false },
    //   })
    // );
    // Till here for Bug 139353
  };

  const handleParam2Value = (event, isConstant) => {
    let varScope, extObjId, varFieldId, variableId;
    // code added on 23 Aug 2022 for BugId 114353
    if (isConstant) {
      extObjId = "0";
      varFieldId = "0";
      variableId = "0";
      varScope = "C";
    }
    param1DropdownOptions.map((value) => {
      if (value.VariableName === event.target.value) {
        extObjId = value.ExtObjectId;
        varFieldId = value.VarFieldId;
        variableId = value.VariableId;
        varScope = value.VariableScope;
      }

      //Added on 23/06/2023, bug_id:130962
      if (value.VariableScope === "C") {
        extObjId = "0";
        varFieldId = "0";
        variableId = "0";
        varScope = "C";
      }
    });
    let temp = { ...streamsData };
    if (
      temp?.ActivityProperty?.streamInfo?.esRuleList[parentIndex]?.status ===
      "added"
    ) {
      temp.ActivityProperty.streamInfo.esRuleList[parentIndex].status =
        "edited";
    }
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].param2 = event.target.value;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].type2 = varScope;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].extObjID2 = extObjId;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].varFieldId_2 = varFieldId;
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].variableId_2 = variableId;
    setStreamData(temp);
    setParam2(event.target.value);
    // Commented on 13-10-23 for Bug 139353
    // dispatch(
    //   setActivityPropertyChange({
    //     [propertiesLabel.streams]: { isModified: true, hasError: false },
    //   })
    // );
    // Till here for Bug 139353
  };

  const onSelectLogicalOperator = (e) => {
    let newText = "";
    if (e.target.innerText === "+") {
      newText = "AND";
      setLogicalOperator("AND");
    } else if (e.target.innerText === "AND") {
      newText = "OR";
      setLogicalOperator("OR");
    } else if (e.target.innerText === "OR") {
      newText = "AND";
      setLogicalOperator("AND");
    }
    let temp = { ...streamsData };
    if (
      temp?.ActivityProperty?.streamInfo?.esRuleList[parentIndex]?.status ===
      "added"
    ) {
      temp.ActivityProperty.streamInfo.esRuleList[parentIndex].status =
        "edited";
    }
    temp.ActivityProperty.streamInfo.esRuleList[parentIndex].ruleCondList[
      index
    ].logicalOp = getLogicalOperator(newText);
    setStreamData(temp);
    newRow(e.target.innerText, props.parentIndex);
  };

  return (
    <div>
      <div className={styles.addNewRule}>
        {/*code edited on 5 August 2022 for Bug 112847 */}
        <CustomizedDropdown
          inputProps={{ "data-testid": "select" }}
          className={styles.dropdown}
          value={param1}
          hideDefaultSelect={true}
          isNotMandatory={disabled ? true : false}
          onChange={(event) => handleParam1Value(event)}
          disabled={disabled}
          validateError={
            localData?.isNew ? !localData?.isNew : props.validateError
          } //code edited on 5 August 2022 for Bug 112847
        >
          {/* Modified on 17-10-23 for Bug 139676 */}
          {param1DropdownOptions
            ?.filter((element) => element.VariableScope !== "C")
            ?.map((element) => {
              return (
                <MenuItem
                  className={styles.menuItemStyles}
                  key={element.VariableName}
                  value={element.VariableName}
                  inputProps={{ "data-testid": "selectOption" }}
                >
                  {element.VariableName}
                </MenuItem>
              );
            })}
          {/* Till here for Bug 139676 */}
        </CustomizedDropdown>
        {/*code edited on 5 August 2022 for Bug 112847 */}
        <CustomizedDropdown
          id="AR_Rule_Condition_Dropdown"
          className={styles.dropdown}
          hideDefaultSelect={true}
          value={selectedOperator}
          onChange={(event) => onSelectOperator(event)}
          disabled={disabled}
          isNotMandatory={disabled ? true : false}
          validateError={
            localData?.isNew ? !localData?.isNew : props.validateError
          } //code edited on 5 August 2022 for Bug 112847
        >
          {conditionalDropdown &&
            conditionalDropdown.map((element) => {
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
        {/*code edited on 5 August 2022 for Bug 112847 */}
        {/*code added on 23 Aug 2022 for BugId 114353*/}
        {/* Modified on 26-09-23 for Bug 135397 */}
        {!(selectedOperator === "9" || selectedOperator === "10") && (
          <CustomizedDropdown
            id="AR_Param2_Dropdown"
            disabled={disabled}
            className={styles.dropdown}
            value={param2}
            hideDefaultSelect={true}
            onChange={(event, isConstant) =>
              handleParam2Value(event, isConstant)
            }
            validateError={
              localData?.isNew ? !localData?.isNew : props.validateError
            } //code edited on 5 August 2022 for Bug 112847
            isConstant={isParam2Const}
            setIsConstant={(val) => setIsParam2Const(val)}
            isNotMandatory={disabled ? true : false}
            showConstValue={param2DropdownOptions?.length > 0}
            constType={variableType}
            menuItemStyles={styles.menuItemStyles}
          >
            {param2DropdownOptions?.map((element) => {
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
        )}
        {/* Till here for Bug 135397 */}

        {/* code modified on 12-10-23 We have used Button component of Mui for bug 139355  */}
        {/* Added on 18-10-23 for Bug 139525 */}
        <LightTooltip
          id="pmweb_AddCondition_AddBtn"
          arrow={true}
          enterDelay={500}
          placement="bottom"
          title={
            logicalOperator === "+"
              ? t("addANewFilter")
              : t("clickToToggleLogicalOperator")
          }
        >
          <Button
            // className={styles.toogleBtn}
            className={classes.toggleBtn}
            onClick={(e) => onSelectLogicalOperator(e)}
            disabled={disabled}
            type="button"
            data-testid="logicalBtn"
            id="logicalOperatorBtn"
            style={{ fontWeight: 200 }}
          >
            {logicalOperator}
          </Button>
        </LightTooltip>
        {/* Till here for Bug 139525 */}
        {/*Till here for bug 139355  */}

        <div className={styles.deleteIcon}>
          {/*Added code for bug 136030 */}
          {!isReadOnly && showDelIcon ? (
            // Modified on 17-10-23 for Bug 139678
            <LightTooltip
              id="pmweb_AddCondition_DeleteIcon"
              arrow={true}
              enterDelay={500}
              placement="bottom"
              title={t("delete")}
            >
              <DeleteOutlinedIcon
                id="AR_Delete_Row_Button"
                onClick={deleteRow}
                style={{ cursor: "pointer" }} // Added on 17-10-23 for Bug 139526
              />
            </LightTooltip>
          ) : // Till here for Bug 139678
          null}
        </div>
      </div>
    </div>
  );
}

export default AddCondition;
