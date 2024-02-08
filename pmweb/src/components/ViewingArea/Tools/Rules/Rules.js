// #BugID - 119039
// #BugDescription - Switching tab data showing issue for Rules has been fixed.
// #Date - 15 November 2022
// #BugID - 117901
// #BugDescription - If conddtions radio button issue has been solved.
// #BugID - 120114
// #BugDescription - Added validation while modifying the rules.
// #BugID - 121019
// #BugDescription - Fixed issue for Logical Operator(converted the button into select box).

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./rule.module.css";
import AddNewCondition from "./AddNewCondition";
import { Divider } from "@material-ui/core";
import RuleDataList from "./RuleDataList";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  CONSTANT,
  ENDPOINT_ADD_RULES,
  ENDPOINT_DELETE_RULES,
  ENDPOINT_MODIFY_RULES,
  ENDPOINT_MOVE_RULES,
  RULES_IF_CONDITION,
  SERVER_URL,
  SPACE,
  VARIABLE_RULES_ALWAYS_CONDITION,
} from "../../../../Constants/appConstants";
import axios from "axios";
import { connect, useDispatch } from "react-redux";
import CommonCondition from "./CommonCondition";
import NoRuleScreen from "./NoRuleScreen";
import { shortenRuleStatement } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import {
  getConditionalOperatorLabel,
  getLogicalOperator,
} from "../../../Properties/PropetiesTab/ActivityRules/CommonFunctionCall";
import { convertToArabicDate } from "../../../../UI/DatePicker/DateInternalization";

// Functional component for showing Rule statement.
function RuleStatement(props) {
  const { shortenRuleStatement, ruleDescription } = props;
  return (
    <div style={{ flex: "1" }}>
      <LightTooltip
        id="pmweb_Rules_ES_Tooltip"
        arrow={true}
        enterDelay={500}
        placement="bottom"
        title={ruleDescription + "."}
      >
        <div>
          <p style={{ direction: "ltr" }}>
            {shortenRuleStatement(ruleDescription, 120)}
            {ruleDescription?.length < 120 && "."}
          </p>
        </div>
      </LightTooltip>
    </div>
  );
}

function Rules(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const { isReadOnly, calledFrom } = props;
  const [selected, setselected] = useState(null);
  const [showDragIcon, setShowDragIcon] = useState(false);
  const [selectCon, setselectCon] = useState(t("if"));
  const [addedVarList, setaddedVarList] = useState([]);
  const [disabled, setdisabled] = useState(false);
  const [rules, setrules] = useState([]);
  const [showBtn, setshowBtn] = useState(null);
  const [bShowRuleData, setbShowRuleData] = useState(false);
  const [count, setCount] = useState(null);
  const [checkValidation, setCheckValidation] = useState(false);
  const [ruleConditionErrors, setRuleConditionErrors] = useState(false);
  const [ruleOperationErrors, setRuleOperationErrors] = useState(false);
  const [addClicked, setAddClicked] = useState(false);
  const [showDragIconArr, setShowDragIconArr] = useState([]);

  useEffect(() => {
    let outputArray = [];
    const tempArray = [...props.interfaceRules];
    // modified on 27/09/2023 for BugId 136677
    /*if (calledFrom === "variable") {
      tempArray?.forEach((element) => {
        let ruleConList = getRuleConditionList(element);
        let ruleOpList = getOperationList(element);
        outputArray.push({
          ruleId: element.RuleID,
          ruleOrderId: element.RuleOrderId,
          ruleType: "I",
          Desc: buildRuleStatement(ruleConList, ruleOpList),
          ruleCondList: ruleConList,
          ruleOpList: ruleOpList,
        });
      });
    } else {
      tempArray?.forEach((element) => {
        outputArray.push({
          ruleId: element.RuleID,
          ruleOrderId: element.RuleOrderId,
          ruleType: element.RuleType,
          Desc: element.Desc,
          ruleCondList: getRuleConditionList(element),
          ruleOpList: getOperationList(element),
        });
      });
    } */
    let iconArr = [];
    tempArray?.forEach((element) => {
      let ruleConList = getRuleConditionList(element);
      let ruleOpList = getOperationList(element);
      outputArray.push({
        // modified on 12/10/23 for BugId 139374
        // ruleId: element.RuleId,
        ruleId: element.RuleID,
        ruleOrderId: element.RuleOrderId,
        ruleType: "I",
        Desc: buildRuleStatement(ruleConList, ruleOpList),
        ruleCondList: ruleConList,
        ruleOpList: ruleOpList,
      });
      iconArr.push(false);
    });

    setShowDragIconArr(iconArr);
    // till here BugId 136677
    //Sorting Array on the basis of RuleOrderId
    outputArray.sort((a, b) => {
      if (a.ruleOrderId < b.ruleOrderId) return -1;
      if (a.ruleOrderId > b.ruleOrderId) return 1;
      return 0;
    });

    setrules(outputArray);
    setCount(outputArray.length);
    if (outputArray?.length > 0 && selected === null) {
      setselected(0);
    }
    setbShowRuleData(props.bShowRuleData);
  }, [props.interfaceRules]);

  useEffect(() => {
    if (selected !== null || selected === 0) {
      if (rules[selected] && rules[selected]?.ruleCondList?.length > 0) {
        let firstRule = rules[selected]?.ruleCondList[0];
        if (
          (calledFrom !== "variable" && firstRule?.param1 === "Always") ||
          (calledFrom === "variable" &&
            firstRule?.param1?.toUpperCase() ===
              VARIABLE_RULES_ALWAYS_CONDITION)
        ) {
          setselectCon(t("always"));
          setdisabled(true);
        } else {
          setselectCon(t("if"));
          setdisabled(false);
        }
      } else {
        setselectCon(t("always"));
        setdisabled(true);
      }
    } else if (rules && rules.length > 0) {
      if (rules[0] && rules[0]?.ruleCondList?.length > 0) {
        let firstRule = rules[0]?.ruleCondList[0];
        if (
          (calledFrom !== "variable" && firstRule?.param1 === "Always") ||
          (calledFrom === "variable" &&
            firstRule?.param1 === VARIABLE_RULES_ALWAYS_CONDITION)
        ) {
          setselectCon(t("always"));
          setdisabled(true);
        } else {
          setselectCon(t("if"));
          setdisabled(false);
        }
      } else {
        setselectCon(t("always"));
        setdisabled(true);
      }
    }
  }, [selected]);

  // Function that builds the rule statement for a rule.
  const buildRuleStatement = (ruleCondList, ruleOpList) => {
    let ruleStatement = "";
    let operationStatement = "show" + SPACE;
    let ruleType = RULES_IF_CONDITION;
    if (
      ruleCondList &&
      ruleCondList[0].param1?.toUpperCase() === VARIABLE_RULES_ALWAYS_CONDITION
    ) {
      ruleType = VARIABLE_RULES_ALWAYS_CONDITION;
    }
    ruleCondList.forEach((element) => {
      const concatenatedString = ruleStatement.concat(
        SPACE,
        element.param1,
        SPACE,
        "is",
        SPACE,
        getConditionalOperatorLabel(element.operator),
        SPACE,
        // modified on 27/09/23 for BugId 136677
        // element.param2
        (element.datatype1 === "8" || element.datatype1 === "15") &&
          element.type2 === "C"
          ? convertToArabicDate(element.param2)
          : element.param2,
        // till here BugId 136677
        element.logicalOp === "3" ||
          element.logicalOp === "" ||
          element.logicalOp === "4"
          ? ""
          : SPACE,
        getLogicalOperator(element.logicalOp)
      );
      ruleStatement = concatenatedString;
    });

    // Function to check if the operation is the last operation or not.
    const isLastOperation = (elemIndex) => {
      return elemIndex === ruleOpList.length - 1;
    };

    // Function that gets the final rule statement.
    function getFinalRuleStatement() {
      if (ruleType === VARIABLE_RULES_ALWAYS_CONDITION) {
        let alwaysOpList = "show" + SPACE;
        ruleOpList?.forEach((element, elemIndex) => {
          const concatenatedOperations = alwaysOpList.concat(
            element.interfaceName,
            !isLastOperation(elemIndex) ? "," + SPACE : ""
          );
          alwaysOpList = concatenatedOperations;
        });
        return ruleType + SPACE + alwaysOpList;
      } else {
        ruleOpList?.forEach((element, elemIndex) => {
          const concatenatedOperations = operationStatement.concat(
            element.interfaceName,
            !isLastOperation(elemIndex) ? "," + SPACE : ""
          );
          operationStatement = concatenatedOperations;
        });
        return ruleType + ruleStatement + ", Then" + SPACE + operationStatement;
      }
    }
    return getFinalRuleStatement();
  };

  const getRuleConditionList = (element) => {
    let ruleConditionArray = [];
    if (calledFrom === "variable") {
      if (element.RuleCondition && element.RuleCondition?.length > 0) {
        element.RuleCondition?.forEach((elem) => {
          ruleConditionArray.push({
            condOrderId: elem.ConditionOrderId,
            param1: elem.Param1,
            type1: elem.Type1,
            extObjID1: elem.ExtObjID1,
            variableId_1: elem.VariableId_1,
            varFieldId_1: elem.VarFieldId_1,
            operator: elem.Operator,
            logicalOp: elem.LogicalOp,
            param2: elem.Param2,
            type2: elem.Type2,
            extObjID2: elem.ExtObjID2,
            variableId_2: elem.VariableId_2,
            varFieldId_2: elem.VarFieldId_2,
            // added on 27/09/23 for BugId 136677
            datatype1: elem.datatype1,
          });
        });
      } else {
        ruleConditionArray = [ruleCondListAlways];
      }
    } else {
      if (element.RuleConditions && element.RuleConditions?.length > 0) {
        element.RuleConditions?.forEach((elem) => {
          ruleConditionArray.push({
            condOrderId: elem.ConditionOrderId,
            param1: elem.Param1,
            type1: elem.Type1,
            extObjID1: elem.ExtObjID1,
            variableId_1: elem.VariableId_1,
            varFieldId_1: elem.VarFieldId_1,
            operator: elem.Operator,
            logicalOp: elem.LogicalOp,
            param2: elem.Param2,
            type2: elem.Type2,
            extObjID2: elem.ExtObjID2,
            variableId_2: elem.VariableId_2,
            varFieldId_2: elem.VarFieldId_2,
            // added on 27/09/23 for BugId 136677
            datatype1: elem.datatype1,
          });
        });
      } else {
        ruleConditionArray = [ruleCondListAlways];
      }
    }
    return ruleConditionArray;
  };

  const setRuleConditionList = (RuleConditionList) => {
    let ruleConditionArray = [];
    if (RuleConditionList?.length > 0) {
      RuleConditionList?.forEach((elem) => {
        ruleConditionArray.push({
          ConditionOrderId: elem.condOrderId,
          Param1: elem.param1,
          Type1: elem.type1,
          ExtObjID1: elem.extObjID1,
          VariableId_1: elem.variableId_1,
          VarFieldId_1: elem.varFieldId_1,
          Operator: elem.operator,
          LogicalOp: elem.logicalOp,
          Param2: elem.param2,
          Type2: elem.type2,
          ExtObjID2: elem.extObjID2,
          VariableId_2: elem.variableId_2,
          VarFieldId_2: elem.varFieldId_2,
          // added on 27/09/23 for BugId 136677
          datatype1: elem.datatype1,
        });
      });
    } else {
      ruleConditionArray = [ruleCondListAlways];
    }
    return ruleConditionArray;
  };

  const getOperationList = (element) => {
    let operationArray = [];
    if (calledFrom === "variable") {
      element.RuleOperation?.forEach((elem) => {
        operationArray.push({
          interfaceId: elem.InterfaceElementId,
          interfaceName: elem.InterfaceElementName,
        });
      });
    } else {
      element.RuleOperations?.forEach((elem) => {
        operationArray.push({
          interfaceId: elem.InterfaceId,
          interfaceName: elem.InterfaceName,
        });
      });
    }

    return operationArray;
  };

  const blankObjectCondition = {
    param1: "",
    type1: "M",
    extObjID1: "0",
    variableId_1: "0",
    varFieldId_1: "0",
    operator: "",
    logicalOp: "3",
    param2: "",
    type2: "M",
    extObjID2: "0",
    variableId_2: "0",
    varFieldId_2: "0",
    datatype1: "", // added on 27/09/23 for BugId 136677
  };

  const ruleCondListAlways = {
    condOrderId: "1",
    param1: "Always",
    type1: "S",
    extObjID1: "0",
    variableId_1: "0",
    varFieldId_1: "0",
    operator: "0",
    logicalOp: "4",
    param2: "Always",
    type2: "S",
    extObjID2: "0",
    variableId_2: "0",
    varFieldId_2: "0",
    datatype1: "", // added on 27/09/23 for BugId 136677
  };

  const newRow = (value, index, parentIndex) => {
    /* if (value == ADD_SYMBOL) {
      let maxId = 0;
      rules[index].ruleCondList.forEach((element) => {
        if (element.condOrderId > maxId) {
          maxId = element.condOrderId;
        }
      });
      let ConOrderID = { condOrderId: +maxId + 1 + "" };
      let newRow = { ...ConOrderID, ...blankObjectCondition };

      rules[index].ruleCondList.push(newRow);
      setrules([...rules]);
    } */
    if (index === rules[parentIndex].ruleCondList.length - 1) {
      let maxId = 0;
      rules[parentIndex].ruleCondList.forEach((element) => {
        if (element.condOrderId > maxId) {
          maxId = element.condOrderId;
        }
      });
      let ConOrderID = { condOrderId: +maxId + 1 + "" };
      let newRow = { ...ConOrderID, ...blankObjectCondition };

      rules[parentIndex].ruleCondList.push(newRow);
      setrules([...rules]);
    }
    setRuleConditionErrors(false);
    setRuleOperationErrors(false);
    setCheckValidation(false);
  };

  const optionSelector = (e) => {
    setselectCon(e.target.value);
    if (e.target.value === t("always")) {
      setdisabled(true);
    } else {
      setdisabled(false);
    }
    setRuleConditionErrors(false);
    setRuleOperationErrors(false);
    setCheckValidation(false);
  };

  const selectedVariableList = (list) => {
    setaddedVarList(list);
  };

  const validateRule = (isModified) => {
    let isValid = true;
    if (addedVarList.length === 0) {
      isValid = false;
      setRuleOperationErrors(true);
    } else if (ruleOperationErrors) {
      setRuleOperationErrors(false);
    }
    if (selectCon === t("if")) {
      let conditionFieldsFilled = true;
      let conditionFieldKeys = {
        ruleCondition: ["param1", "param2", "operator"],
        specialCondition: ["param1", "operator"],
      };
      rules[selected]?.ruleCondList?.forEach((element) => {
        if (element.operator === "9" || element.operator === "10") {
          conditionFieldKeys["specialCondition"]?.forEach((value) => {
            if (
              !element[value] ||
              element[value]?.trim() === "" ||
              element[value] === null ||
              element[value]?.trim() === CONSTANT
            ) {
              conditionFieldsFilled = false;
            }
          });
        } else {
          conditionFieldKeys["ruleCondition"]?.forEach((value) => {
            if (
              !element[value] ||
              element[value]?.trim() === "" ||
              element[value] === null ||
              element[value]?.trim() === CONSTANT
            ) {
              conditionFieldsFilled = false;
            }
          });
        }
      });
      setRuleConditionErrors(!conditionFieldsFilled);
      if (!conditionFieldsFilled) {
        isValid = false;
      }
    } else {
      setCheckValidation(false); // Changes made to solve Bug 125677
    }
    if (isValid) {
      setCheckValidation(false);
      if (isModified) {
        updateRule();
      } else if (addClicked) {
        addClickRule();
      }
    } else {
      setAddClicked(false);
    }
  };

  // Function that runs when the localRuleData changes to check the validation in the dropdown and fields.
  useEffect(() => {
    if (checkValidation) {
      validateRule(false);
    }
  }, [checkValidation, rules, addedVarList]);

  // add rule
  const addClickRule = () => {
    //code added on 23 September 2022 for BugId 111853
    let localRuleListOp = [];
    addedVarList?.forEach((el) => {
      localRuleListOp.push({
        interfaceName: el.Name,
        interfaceId: el.NameId,
      });
    });

    let RuleConditionList =
      selectCon === t("if")
        ? rules[selected].ruleCondList
        : [ruleCondListAlways];

    let postJson = {
      processDefId: props.openProcessID + "",
      processMode: props.openProcessType,
      ruleId: rules[selected].ruleId,
      ruleOrderId: rules[selected].ruleOrderId,
      ruleType: props.ruleType,
      ruleCondList: RuleConditionList,
      ruleOpList: localRuleListOp,
    };

    axios.post(SERVER_URL + ENDPOINT_ADD_RULES, postJson).then((res) => {
      if (res.data.Status === 0) {
        let temp = global.structuredClone(rules);
        let opList = [];
        temp[selected].Desc = res.data.Description;
        localRuleListOp?.forEach((ruleOp) => {
          temp[selected].ruleOpList.push({
            interfaceId: ruleOp.interfaceId,
            interfaceName: ruleOp.interfaceName,
          });
          opList.push({
            InterfaceId: ruleOp.interfaceId,
            InterfaceName: ruleOp.interfaceName,
          });
        });
        setrules([...temp]);
        if (props.setInterfaceRules) {
          props.setInterfaceRules((prev) => {
            let newRules = [...prev];
            newRules.push({
              RuleOrderId: rules[selected].ruleOrderId,
              Desc: temp[selected].Desc,
              RuleOperations: [...opList],
              RuleID: rules[selected].ruleId,
              RuleType: "",
              RuleConditions: setRuleConditionList(RuleConditionList),
            });
            return newRules;
          });
        }
        setshowBtn("");
        setCount(rules.length);
        setAddClicked(false);
        dispatch(
          setToastDataFunc({
            message: t("RuleAddedSuccessfully"),
            severity: "success",
            open: true,
          })
        );
      }
    });
  };

  //add rule locally
  const addNewRule = () => {
    let maxRuleId = 0;
    rules.forEach((element) => {
      if (element.ruleId > maxRuleId) {
        maxRuleId = element.ruleId;
      }
    });

    let ConOrderID = { condOrderId: +maxRuleId + 1 + "" };
    let ruleCondListLocal = { ...ConOrderID, ...blankObjectCondition };

    let newRule = {
      processDefId: props.openProcessID + "",
      processMode: props.openProcessType,
      ruleId: +maxRuleId + 1 + "",
      ruleOrderId: +maxRuleId + 1,
      Desc: t("newRule"),
      ruleType: props.ruleType,
      ruleCondList: [ruleCondListLocal],
      ruleOpList: [],
    };
    let temp = rules;
    temp.push(newRule);
    setrules([...temp]);
    setshowBtn("none");
    setselected(rules.length - 1);
    setRuleConditionErrors(false);
    setRuleOperationErrors(false);
    setCheckValidation(false);
    setShowDragIconArr([...showDragIconArr, false]);
  };

  const updateRule = () => {
    let localRuleListOp = [];
    addedVarList?.forEach((el) => {
      // code edited on 20 Dec 2022 for BugId 120530
      localRuleListOp.push({
        interfaceName: el.Name,
        interfaceId: el.NameId,
      });
    });

    let RuleConditionList =
      selectCon === t("if")
        ? rules[selected].ruleCondList
        : [ruleCondListAlways];

    let postJson = {
      processDefId: props.openProcessID + "",
      processMode: props.openProcessType,
      ruleId: rules[selected].ruleId,
      ruleOrderId: rules[selected].ruleOrderId,
      ruleType: props.ruleType,
      ruleCondList: RuleConditionList,
      ruleOpList: localRuleListOp,
    };

    axios.post(SERVER_URL + ENDPOINT_MODIFY_RULES, postJson).then((res) => {
      if (res.data.Status === 0) {
        let opList = [];
        let ruleOpList = [];
        let temp = global.structuredClone(rules);
        temp[selected].Desc = res.data.Description;
        localRuleListOp?.forEach((ruleOp) => {
          ruleOpList.push({
            interfaceId: ruleOp.interfaceId,
            interfaceName: ruleOp.interfaceName,
          });
          if (calledFrom === "variable") {
            opList.push({
              InterfaceElementId: ruleOp.interfaceId,
              InterfaceElementName: ruleOp.interfaceName,
            });
          } else {
            opList.push({
              InterfaceId: ruleOp.interfaceId,
              InterfaceName: ruleOp.interfaceName,
            });
          }
        });
        temp[selected].ruleOpList = [...ruleOpList];
        setrules([...temp]);
        setshowBtn("");
        if (props.setInterfaceRules) {
          props.setInterfaceRules((prev) => {
            let newRules = [...prev];
            newRules?.forEach((rule, idx) => {
              if (calledFrom === "variable") {
                // modified on 12/10/23 for BugId 139374
                // if (rule.RuleId === rules[selected].ruleId) {
                if (rule.RuleID === rules[selected].ruleId) {
                  newRules[idx].RuleOrderId = rules[selected].ruleOrderId;
                  newRules[idx].Desc = res.data.Description;
                  newRules[idx].RuleOperation = [...opList];
                  newRules[idx].RuleCondition =
                    setRuleConditionList(RuleConditionList);
                }
              } else {
                if (rule.RuleID === rules[selected].ruleId) {
                  newRules[idx].RuleOrderId = rules[selected].ruleOrderId;
                  newRules[idx].Desc = res.data.Description;
                  newRules[idx].RuleOperations = [...opList];
                  newRules[idx].RuleConditions =
                    setRuleConditionList(RuleConditionList);
                }
              }
            });
            return newRules;
          });
        }
        // code added on 25 Nov 2022 for BugId 114889
        dispatch(
          setToastDataFunc({
            message: t("RuleModifiedSuccessfully"),
            severity: "success",
            open: true,
          })
        );
      }
    });
  };

  const deleteRule = (selected) => {
    let localRuleListOp = "";
    addedVarList?.forEach((el) => {
      localRuleListOp = localRuleListOp + el.Name + ",";
    });

    let postJson = {
      processDefId: props.openProcessID + "",
      processMode: props.openProcessType,
      ruleId: rules[selected].ruleId,
      ruleType: props.ruleType,
      ruleOrderId: rules[selected].ruleOrderId,
      interfaceName: localRuleListOp.slice(0, -1),
    };

    axios.post(SERVER_URL + ENDPOINT_DELETE_RULES, postJson).then((res) => {
      if (res.data.Status === 0) {
        let temp = [...rules];
        temp.splice(selected, 1);
        if (props.setInterfaceRules) {
          props.setInterfaceRules((prev) => {
            let newRules = [...prev];
            let ruleIdx = null;
            newRules?.forEach((rule, idx) => {
              if (rule.RuleID === rules[selected].ruleId) {
                ruleIdx = idx;
              }
            });
            newRules.splice(ruleIdx, 1);
            return newRules;
          });
        }
        setrules([...temp]);
        setCount(rules.length);
        setshowBtn("");
        setselected(0);
        setShowDragIconArr(
          showDragIconArr.filter((item, index) => index !== selected)
        );
        dispatch(
          setToastDataFunc({
            message: t("RuleDeletedSuccessfully"),
            severity: "success",
            open: true,
          })
        );
      }
    });
  };

  const cancelRule = (selected) => {
    let temp = rules;
    temp.splice(selected, 1);
    setrules([...temp]);
    setshowBtn("");
    setselected(0);
    setRuleConditionErrors(false);
    setRuleOperationErrors(false);
    setCheckValidation(false);
  };
  const onDragOverHandler = (e) => {
    e.preventDefault();
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const rulesArray = [...rules];
    const [reOrderedRuleItem] = rulesArray.splice(source.index, 1);
    rulesArray.splice(destination.index, 0, reOrderedRuleItem);

    //Changes made for Bug 139812

    //call the backend api to update the rule list.

    let updatedRuleIds = "";
    rulesArray.forEach((item) => {
      if (updatedRuleIds === "") {
        updatedRuleIds = item.ruleId;
      } else {
        updatedRuleIds = updatedRuleIds + "," + item.ruleId;
      }
    });
    let postJson = {
      processDefId: props.openProcessID,
      processMode: props.openProcessType,
      ruleIds: updatedRuleIds,
      ruleType: props.ruleType,
    };
    axios.post(SERVER_URL + ENDPOINT_MOVE_RULES, postJson).then((res) => {
      if (res.data.Status === 0) {
        //if api is successfull, update the data
        setrules(rulesArray);
        let i = 0;
        let outputArray = [];
        const tempArray = [...props.interfaceRules];
        rulesArray.forEach((item) => {
          let nArray = tempArray.filter(
            (element) => element.RuleID === item.ruleId
          );
          let data = { ...nArray[0], RuleOrderId: ++i };
          outputArray.push(data);
        });
        props.setInterfaceRules(outputArray);
      }
    });

    //till here Bug 139812
  };

  return (
    <>
      {rules?.length > 0 ? (
        <div
          className={styles.RuleScreen}
          style={{
            height: calledFrom === "variable" ? "100%" : "80vh",
            maxHeight: calledFrom === "variable" ? "66vh" : "80vh",
          }}
        >
          <div
            className={styles.LeftPannel}
            style={{
              width: calledFrom === "variable" ? "25%" : "29.6rem",
            }}
          >
            {count === 0 ? (
              <div
                style={{
                  margin: "1rem 0 0",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                }}
              >
                <p
                  className={styles.noRuleDefined}
                  style={{
                    marginTop: calledFrom === "variable" ? "0" : "13%",
                  }}
                >
                  {t("no")}
                  {" " + t("rulesAreDefined")}
                </p>
                <button
                  className={styles.addnavBtn}
                  onClick={addNewRule}
                  style={{ display: showBtn }}
                  id="pmweb_Rule_addRuleLocaly"
                >
                  {t("addRule")}
                </button>
              </div>
            ) : (
              <div
                style={{
                  margin: "1rem 0 0",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                }}
              >
                <p
                  className={styles.noRuleDefined}
                  style={{
                    marginTop: calledFrom === "variable" ? "0" : "13%",
                  }}
                >
                  {count === 1
                    ? count + SPACE + t("ruleIsDefined")
                    : count + SPACE + t("rulesAreDefined")}
                </p>
                {!isReadOnly && calledFrom !== "variable" ? (
                  <button
                    className={styles.addnavBtn}
                    onClick={addNewRule}
                    style={{ display: showBtn }}
                    id="pmweb_Rule_addRuleLocalBtn"
                  >
                    {t("addRule")}
                  </button>
                ) : null}
              </div>
            )}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pickListInputs">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef}>
                    {rules && rules.length !== 0 ? (
                      rules.map((el, index) => {
                        return (
                          <Draggable
                            draggableId={`${index}`}
                            key={`${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                // onMouseOver={() => setShowDragIcon(true)}
                                // onMouseLeave={() => setShowDragIcon(false)}

                                onMouseOver={() => {
                                  if (!isReadOnly) {
                                    setShowDragIconArr(
                                      showDragIconArr.map((item, i) => {
                                        if (i === index) return true;
                                      })
                                    );
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (!isReadOnly) {
                                    setShowDragIconArr(
                                      showDragIconArr.map((item, i) => {
                                        if (i === index) return false;
                                      })
                                    );
                                  }
                                }}
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                onDragOver={(e) => onDragOverHandler(e)}
                              >
                                <li
                                  className={styles.restList}
                                  style={{
                                    backgroundColor:
                                      selected === index ? "#0072C60F " : null,
                                    color:
                                      selected === index ? "#000000" : null,
                                    borderInlineStart:
                                      selected === index
                                        ? "5px solid #0072C6"
                                        : null,
                                  }}
                                  onClick={() => {
                                    setselected(index);
                                    setRuleConditionErrors(false);
                                    setRuleOperationErrors(false);
                                    setCheckValidation(false);
                                  }}
                                  id={`pmweb_Rule_list_${index}`}
                                >
                                  <p
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      wordBreak: "break-word",
                                      gap: "1vw",
                                    }}
                                    tabIndex={0}
                                    aria-description={`Rule Number: ${
                                      index + 1
                                    }`}
                                  >
                                    <span
                                      {...provided.dragHandleProps}
                                      tabIndex={-1}
                                    >
                                      {showDragIconArr.filter(
                                        (item, i) => i === index
                                      )[0] ? (
                                        <DragIndicatorIcon
                                          className={styles.dragIcon}
                                        />
                                      ) : (
                                        <>{`${index + 1}.`}</>
                                      )}
                                    </span>
                                    <RuleStatement
                                      shortenRuleStatement={
                                        shortenRuleStatement
                                      }
                                      ruleDescription={el.Desc}
                                    />
                                  </p>
                                </li>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    ) : (
                      <li
                        className={styles.restList}
                        style={{
                          backgroundColor: "#0072C60F ",
                          color: "#000000",
                          borderInlineStart: "5px solid #0072C6",
                        }}
                      >
                        {t("no")}
                        {" " + t("rulesAreDefined")}
                      </li>
                    )}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className={styles.vl}></div>

          <div
            className={styles.RightPannel}
            style={{
              width: calledFrom === "variable" ? "75%" : "80%",
            }}
          >
            <CommonCondition
              rulesSelected={rules[selected]}
              deleteRule={deleteRule}
              cancelRule={cancelRule}
              selected={selected}
              updateRule={() => {
                setCheckValidation(true);
                validateRule(true);
              }}
              addClickRule={() => {
                setCheckValidation(true);
                setAddClicked(true);
              }}
              optionSelector={optionSelector}
              selectCon={selectCon}
              openProcessType={props.openProcessType}
              isReadOnly={isReadOnly}
              calledFrom={calledFrom}
            />
            <div>
              {ruleConditionErrors && selectCon === t("if") && (
                <p className={styles.errorStatement}>
                  {t("mandatoryErrorStatement")}
                </p>
              )}
            </div>
            <div
              style={{
                marginTop: calledFrom === "variable" ? "0.5rem" : "0.75rem",
              }}
            >
              {rules[selected]?.ruleCondList.map((val, index) => {
                return (
                  <AddNewCondition
                    allRowData={val}
                    setrowData={setrules}
                    index={index}
                    newRow={newRow}
                    parentIndex={selected}
                    rules={rules}
                    showDelIcon={rules[selected].ruleCondList.length > 1}
                    disabled={disabled || isReadOnly}
                    checkValidation={checkValidation}
                    setCheckValidation={setCheckValidation}
                    ruleConditionErrors={ruleConditionErrors}
                    setRuleConditionErrors={setRuleConditionErrors}
                    isAlwaysRule={selectCon === t("always")}
                    calledFrom={calledFrom}
                  />
                );
              })}
            </div>

            {bShowRuleData ? (
              <React.Fragment>
                <p className={styles.showHeading} style={{ marginTop: "1rem" }}>
                  <span>{t("show")}</span>
                  <Divider className={styles.showLine} />
                </p>
                {ruleOperationErrors ? (
                  <p className={styles.errorStatement}>
                    {t("selectOperations")}
                  </p>
                ) : null}
                <RuleDataList
                  ruleDataType={props.ruleDataType}
                  selectedVariableList={selectedVariableList}
                  rules={rules[selected]}
                  ruleDataTableStatement={props.ruleDataTableStatement}
                  addRuleDataTableStatement={props.addRuleDataTableStatement}
                  addRuleDataTableHeading={props.addRuleDataTableHeading}
                  ruleDataTableHeading={props.ruleDataTableHeading}
                  openProcessType={props.openProcessType}
                  hideGroup={props.hideGroup}
                  listName={props.listName}
                  availableList={props.availableList}
                  isReadOnly={isReadOnly}
                  calledFrom={calledFrom}
                />
              </React.Fragment>
            ) : null}
          </div>
        </div>
      ) : (
        <NoRuleScreen
          handleScreen={addNewRule}
          processType={props.openProcessType}
          isReadOnly={isReadOnly}
          calledFrom={calledFrom}
        />
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(Rules);
