import React, { useEffect, useState } from "react";
import { Select, MenuItem, IconButton } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import styles from "./RuleListForm.module.css";
import { store, useGlobalState } from "state-pool";
import { logicalOperatorOptions } from "../../Properties/PropetiesTab/ActivityRules/CommonFunctionCall";
import AddIcon from "@material-ui/icons/Add";
import CustomizedDropdown from "../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useTranslation } from "react-i18next";
import {
  COMPLEX_VARTYPE,
  hideComplexFromVariables,
} from "../../../Constants/appConstants";
import { ConditionalOperator } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

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
      maxHeight: "15rem",
    },
  },
};

function RuleSelect({
  originalRulesListData,
  selectedRuleId,
  setoriginalRulesListData,
  setmodifyApiBool,
  addRuleApiBool,
  modifyApiBool,
  showErrorCss,
  setshowErrorCss,
}) {
  const processData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(processData);
  const [isCustomConstant, setisCustomConstant] = useState(false);
  const localVarDef = hideComplexFromVariables
    ? localLoadedProcessData?.Variable?.filter(
        (el) => el.VariableType !== COMPLEX_VARTYPE
      )
    : localLoadedProcessData.Variable;
  const [pos, setpos] = useState(0);
  let { t } = useTranslation();

  useEffect(() => {
    if (checkForErrors(originalRulesListData, pos)) {
      setshowErrorCss(false);
    }
  }, [originalRulesListData, pos]);

  const checkForErrors = (data, position) => {
    let temp = data[position];
    if (!!temp) {
      let newRule = {
        RuleOrderId: +getHighestNumber(data, "RuleOrderId"),
        RuleOperation: [
          {
            interfaceName:
              temp?.RuleOperation &&
              temp?.RuleOperation[0]?.InterfaceElementName,
          },
        ],
        RuleCondition: temp?.RuleCondition.map((cond) => {
          return {
            varFieldId_1: cond.VarFieldId_1 || "0",
            operator: cond.Operator,
            type2: cond.Type2,
            varFieldId_2: cond.VarFieldId_2 || "0",
            variableId_1: cond.VariableId_1,
            variableId_2: cond.VariableId_2,
            logicalOp: !!cond.LogicalOp ? cond.LogicalOp : "3",
            param2: cond.Param2,
            param1: cond.Param1,
            type1: cond.Type1,
            condOrderId: cond.ConditionOrderId,
            extObjID1: cond.ExtObjID1 || "0",
            extObjID2: cond.ExtObjID2 || "0",
            // added on 27/09/2023 for BugId 136677
            datatype1: cond.datatype1 || "",
          };
        }),
        RuleId: getHighestNumber(data, "RuleId") + "",
      };
      let json = {
        processDefId: localLoadedProcessData.ProcessDefId + "",
        processMode: localLoadedProcessData.ProcessType,
        ruleId: newRule.RuleId,
        ruleOrderId: newRule.RuleOrderId,
        ruleType: "F",
        ruleCondList: newRule.RuleCondition,
        ruleOpList: newRule.RuleOperation,
      };

      return validateJson(json);
    }
  };

  const validateJson = (json) => {
    let flag = true;
    json.ruleCondList.forEach((cond, index) => {
      if (cond.param2 === "<constant>") flag = false;
      if (json.ruleCondList.length > 1) {
        if (index === json.ruleCondList.length - 1) {
          if (cond.variableId_1 === "" || cond.operator === "") flag = false;
        } else {
          if (
            cond.variableId_1 === "" ||
            cond.operator === "" ||
            cond.logicalOp === "3"
          )
            flag = false;
        }
      } else {
        if (
          cond.variableId_1 === "" ||
          cond.operator === "" ||
          ((cond.operator !== "9" || cond.operator !== "10") &&
            cond.variableId_2 === "")
        ) {
          flag = false;
        }
      }
    });
    return flag;
  };

  useEffect(() => {
    if (originalRulesListData?.length > 0)
      setpos(
        originalRulesListData
          ?.map(function (e) {
            return e.RuleId;
          })
          .indexOf(selectedRuleId)
      );
    else setpos(-1);
  }, [selectedRuleId, originalRulesListData?.length]);

  const getHighestNumber = (data, fieldName) => {
    let arr = [];
    data.map((el) => {
      arr.push(+el[fieldName]);
    });
    return Math.max(...arr);
  };

  const getVariableNameFromId = (id) => {
    let temp = "";
    localVarDef.map((_var) => {
      if (_var.VariableId === id) {
        temp = _var;
      }
    });
    return temp;
  };

  const getVariableByName = (variableName) => {
    let temp = {};
    [...localLoadedProcessData.DynamicConstant, ...localVarDef].forEach(
      (content) => {
        if (content.VariableName === variableName) {
          temp = content;
        }
      }
    );
    return temp;
  };

  const checkIfConstant = (constName) => {
    let temp = false;
    localLoadedProcessData?.DynamicConstant?.forEach((constant) => {
      if (constant.ConstantName === constName) temp = true;
    });
    return temp;
  };

  const handleRuleDataChange = (e, OrderId, isConstant) => {
    let temp = JSON.parse(JSON.stringify(originalRulesListData));
    temp[pos]?.RuleCondition?.forEach((cond) => {
      if (+cond.ConditionOrderId === +OrderId) {
        // modified on 08/09/2023 for BugId 135193
        cond[e.target.name] = e.target.value;
        if (e.target.name === "Param1") {
          let variable = getVariableByName(e.target.value);
          cond.VariableId_1 = variable.VariableId;
          cond.Type1 = variable.VariableScope;
          cond.VarFieldId_1 = variable.VarFieldId;
          cond.ExtObjID1 = variable.ExtObjectId;
          // added on 27/09/2023 for BugId 136677
          cond.datatype1 = variable.VariableType;
          cond.Operator = "";
          cond.Type2 = "";
          cond.VarFieldId_2 = "0";
          cond.VariableId_2 = "0";
          cond.LogicalOp = "3";
          cond.Param2 = "";
          cond.ExtObjID2 = "0";
        } else if (e.target.name === "Param2") {
          if (cond.VariableId_1 === "49") {
            cond.VariableId_2 = "0";
            cond.Type2 = "C";
            cond.VarFieldId_2 = "0";
            cond.ExtObjID2 = "0";
          } else {
            if (isConstant || e.target.value === "<constant>") {
              if (e.target.value === "<constant>") {
                cond.Param2 = "";
              }
              cond.VariableId_2 = "0";
              cond.Type2 = "C";
              cond.VarFieldId_2 = "0";
              cond.ExtObjID2 = "0";
            } else if (checkIfConstant(e.target.value)) {
              cond.VariableId_2 = "0";
              cond.Type2 = "F";
              cond.VarFieldId_2 = "0";
              cond.ExtObjID2 = "0";
            } else {
              let variable = getVariableByName(e.target.value);
              cond.VariableId_2 = variable.VariableId;
              cond.Type2 = variable.VariableScope;
              cond.VarFieldId_2 = variable.VarFieldId;
              cond.ExtObjID2 = variable.ExtObjectId;
            }
          }
        } else if (
          e.target.name === "Operator" &&
          e.target.value === "9"
          // || e.target.value === "10" //Code commented to solve Bug 127781
        ) {
          cond.Param2 = "";
          cond.Type2 = "";
          cond.VarFieldId_2 = "0";
          cond.VariableId_2 = "0";
          cond.ExtObjID2 = "0";
        }
      }
    });
    if (addRuleApiBool !== selectedRuleId && modifyApiBool !== selectedRuleId) {
      setmodifyApiBool(selectedRuleId);
    }
    setoriginalRulesListData(temp);
  };

  const handleDelete = (OrderId) => {
    let temp = JSON.parse(JSON.stringify(originalRulesListData));
    temp?.forEach((rule) => {
      // modified on 08/09/2023 for BugId 135198 - WI and forms>>details of rules are getting
      // removed if one of the rules is getting deleted with its conditon row
      if (+rule.RuleId === +selectedRuleId) {
        rule?.RuleCondition?.forEach((cond, index) => {
          if (+cond.ConditionOrderId === +OrderId) {
            rule.RuleCondition.splice(index, 1);
          }
        });
      }
    });
    if (addRuleApiBool !== selectedRuleId && modifyApiBool !== selectedRuleId) {
      setmodifyApiBool(selectedRuleId);
    }
    setoriginalRulesListData(temp);
  };

  const handleAdd = (RuleId) => {
    let temp = JSON.parse(JSON.stringify(originalRulesListData));
    temp.forEach((rule) => {
      if (+rule.RuleId === +RuleId) {
        rule.RuleCondition.push({
          VarFieldId_1: "0",
          Operator: "",
          Type2: "",
          VarFieldId_2: "0",
          VariableId_1: "",
          /**code change on 07-09-23 for bug id 135189 */
          // VariableId_2: "",
          VariableId_2: "0",
          LogicalOp: "3",
          //till here
          Param2: "",
          Param1: "",
          Type1: "",
          ConditionOrderId:
            +getHighestNumber(
              originalRulesListData[pos].RuleCondition,
              "ConditionOrderId"
            ) + 1,
          ExtObjID1: "0",
          ExtObjID2: "0",
          // added on 27/09/2023 for BugId 136677
          datatype1: "",
        });
      }
    });
    if (addRuleApiBool !== selectedRuleId && modifyApiBool !== selectedRuleId) {
      setmodifyApiBool(selectedRuleId);
    }
    setoriginalRulesListData(temp);
    setisCustomConstant(false);
  };

  const getParam2Option = (var1) => {
    if (var1 !== "" && var1 === "49") {
      let temp = [];
      localLoadedProcessData.MileStones.forEach((mile) => {
        mile.Activities.forEach((act) => {
          temp.push(act);
        });
      });
      return temp.map((_var) => {
        return (
          <MenuItem value={_var.ActivityName} className={styles.menuItemStyles}>
            <p
              style={{
                fontSize: "12px",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {_var.ActivityName}
            </p>
          </MenuItem>
        );
      });
    } else if (var1 !== "" && var1 !== "49") {
      return localLoadedProcessData.DynamicConstant.map((constant) => {
        return {
          VariableName: constant.ConstantName,
          VariableScope: "F",
          ExtObjectId: "0",
          VarFieldId: "0",
          VariableId: "0",
          VariableType: "0", // added on 31/08/2023 for BugId 135541
        };
      })
        .concat(
          localVarDef.filter(
            (_var) =>
              _var.VariableType === getVariableNameFromId(var1).VariableType
          )
        )
        .map((_var) => {
          return (
            <MenuItem
              value={_var.VariableName}
              className={styles.menuItemStyles}
            >
              <p
                style={{
                  fontSize: "12px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {_var.VariableName}
              </p>
            </MenuItem>
          );
        });
    }
  };

  // code added on 28 Aug 2023 for BugId 135005 - form rules-> greater than/less than options are
  // not displayed in the integer type
  const getOperatorList = (var1) => {
    let varDetail = getVariableNameFromId(var1);
    let varType = varDetail?.VariableType;
    if (
      +varType === 10 ||
      +varType === 12 ||
      +varType === 3 ||
      +varType === 4 ||
      +varType === 6 ||
      +varType === 8 ||
      /* code added on 20-09-23 for BugId 137232 */
      +varType === 15 ||
      +varType === 18
      /* till here for BugId 137232 */
    ) {
      let localArr = ConditionalOperator?.filter((val) =>
        val.type?.includes(+varType)
      );
      return localArr;
    } else {
      return [];
    }
  };

  if (pos === -1) return <></>;
  else
    return (
      <>
        {showErrorCss && <p className={styles.errMsg}>{t("mandatoryErr")}</p>}
        {originalRulesListData[pos]?.RuleCondition?.map(
          (
            {
              VariableId_1,
              Operator,
              LogicalOp,
              ConditionOrderId,
              Param2,
              Param1,
              Type2,
            },
            index
          ) => (
            <div
              style={{
                width: "100%",
                padding: "0rem 1vw",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
              key={index}
            >
              <label
                htmlFor={`pmweb_RuleSelect_Param1_${index}`}
                className="pmweb_sr_only"
              >
                {"Operand1"}
              </label>
              <Select
                className={
                  Param1 === "" && showErrorCss
                    ? styles.errorSelect
                    : styles.select
                }
                style={{
                  // width:"30%",  code modified on 03-10-2023 for bug: 138225
                  width: "15vw",
                }}
                MenuProps={menuProps}
                variant="outlined"
                IconComponent={ExpandMoreIcon}
                inputProps={{ id: `pmweb_RuleSelect_Param1_${index}` }}
                value={Param1}
                name="Param1"
                onChange={(e) => handleRuleDataChange(e, ConditionOrderId)}
              >
                {localVarDef.map((_var) => {
                  return (
                    <MenuItem value={_var.VariableName} key={_var.VariableName}>
                      <p
                        style={{
                          fontSize: "12px",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                      >
                        {_var.VariableName}
                      </p>
                    </MenuItem>
                  );
                })}
              </Select>

              <label
                htmlFor={`pmweb_RuleSelect_operator_${index}`}
                className="pmweb_sr_only"
              >
                {"Operator"}
              </label>
              <Select
                className={
                  Operator.trim() === "" && showErrorCss
                    ? styles.errorSelect
                    : styles.select
                }
                MenuProps={menuProps}
                variant="outlined"
                style={{ width: "9vw" }} // code modified on 03-10-2023 for bug: 138225
                IconComponent={ExpandMoreIcon}
                value={Operator}
                name="Operator"
                inputProps={{ id: `pmweb_RuleSelect_operator_${index}` }}
                onChange={(e) => handleRuleDataChange(e, ConditionOrderId)}
              >
                {/* code added on 28 Aug 2023 for BugId 135005 */}
                {getOperatorList(VariableId_1).map((op) => (
                  <MenuItem value={op.value} key={op.value}>
                    <p
                      style={{
                        fontSize: "12px",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {op.label.toLocaleUpperCase()}
                    </p>
                  </MenuItem>
                ))}
              </Select>
              {Operator == "9" || Operator == "10" ? null : (
                <>
                  <label
                    htmlFor={`pmweb_RuleSelect_Param2_${index}`}
                    className="pmweb_sr_only"
                  >
                    {"Operand2"}
                  </label>

                  <CustomizedDropdown
                    //inputId={`pmweb_RuleSelect_Param2_${index}`}
                    id={`pmweb_RuleSelect_Param2_${index}`}
                    name="Param2"
                    //disabled={isReadOnly || disabled}
                    className={
                      Param2 === "" && showErrorCss
                        ? styles.errorDropdown
                        : styles.dropdown
                    }
                    value={Param2}
                    isConstant={
                      VariableId_1 === "49"
                        ? false
                        : isCustomConstant || Type2 === "C"
                    }
                    setIsConstant={(val) => setisCustomConstant(val)}
                    showConstValue={
                      localVarDef?.length > 0 && Param1 !== "ActivityName"
                    }
                    onChange={(e, isConstant) =>
                      handleRuleDataChange(e, ConditionOrderId, isConstant)
                    }
                    validationBoolean={false}
                    validationBooleanSetterFunc={null}
                    constType={
                      getVariableNameFromId(VariableId_1)?.VariableType
                    }
                    menuItemStyles={styles.menuItemStyles}
                  >
                    {getParam2Option(VariableId_1)}
                  </CustomizedDropdown>
                </>
              )}
              <label
                htmlFor={`pmweb_RuleSelect_logicalOp_${index}`}
                className="pmweb_sr_only"
              >
                {"Logical Operation"}
              </label>

              <Select
                className={
                  LogicalOp === "3" &&
                  showErrorCss &&
                  originalRulesListData[pos]?.RuleCondition.length > 1 &&
                  originalRulesListData[pos]?.RuleCondition.length - 1 !== index
                    ? styles.errorSelect
                    : styles.select
                }
                style={{ width: "15vw" }} //code modified on 03-10-2023 for bug: 138225
                variant="outlined"
                IconComponent={ExpandMoreIcon}
                value={LogicalOp === "0" ? "" : LogicalOp}
                name="LogicalOp"
                inputProps={{ id: `pmweb_RuleSelect_logicalOp_${index}` }}
                onChange={(e) => handleRuleDataChange(e, ConditionOrderId)}
              >
                {logicalOperatorOptions.map((logOp) => (
                  <MenuItem value={logOp.value} key={logOp.value}>
                    <p
                      style={{
                        fontSize: "12px",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {logOp.label}
                    </p>
                  </MenuItem>
                ))}
              </Select>
              <div
                style={{
                  width: "9vw", //code modified on 03-10-2023 for bug: 138225
                  justifyContent: "flex-start",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {originalRulesListData[pos]?.RuleCondition.length ===
                1 ? null : (
                  // Changes to resolve the bug Id 139904
                  <IconButton
                    onClick={() => handleDelete(ConditionOrderId)}
                    id={`pmweb_RuleSelect_deleteIcon_${index}`}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <DeleteOutlineIcon
                      classes={{
                        root: styles.deleteIcon,
                      }}
                    />
                  </IconButton>
                )}

                {index ===
                originalRulesListData[pos]?.RuleCondition.length - 1 ? (
                  // Changes to resolve the bug Id 139904
                  <IconButton
                    onClick={() => handleAdd(originalRulesListData[pos].RuleId)}
                    id={`pmweb_RuleSelect_addIcon_${index}`}
                    aria-label="Add"
                    title="Add"
                  >
                    <AddIcon
                      classes={{
                        root: styles.deleteIcon,
                      }}
                    />
                  </IconButton>
                ) : null}
              </div>
            </div>
          )
        )}
      </>
    );
}

export default RuleSelect;
