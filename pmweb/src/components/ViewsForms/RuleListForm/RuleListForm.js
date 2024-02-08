import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./RuleListForm.module.css";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import {
  ENDPOINT_ADD_INTERFACE_RULE,
  ENDPOINT_DELETE_INTERFACE_RULE,
  ENDPOINT_GET_FORM_RULE,
  ENDPOINT_MODIFY_INTERFACE_RULE,
  RTL_DIRECTION,
  SERVER_URL,
  SPACE,
} from "../../../Constants/appConstants.js";
import { store, useGlobalState } from "state-pool";
import {
  getConditionalOperatorLabel,
  getLogicalOperator,
} from "../../Properties/PropetiesTab/ActivityRules/CommonFunctionCall";
import CircularProgress from "@material-ui/core/CircularProgress";
import RuleSelect from "./RuleSelect";
import SearchBox from "../../../UI/Search Component";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import EmptyStateIcon from "../../../assets/ProcessView/EmptyState.svg";
import { IconButton, useMediaQuery } from "@material-ui/core";
import { convertToArabicDate } from "../../../UI/DatePicker/DateInternalization";

const useStyles = makeStyles({
  labelForm: {
    fontSize: "var(--base_text_font_size)",
  },
  labelRoot: {
    marginLeft: "0",
    marginInlineStart: "0",
  },
});

function RuleListForm(props) {
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const formsList = store.getState("allFormsList");
  const dispatch = useDispatch();
  const [allGlobalFormsList] = useGlobalState(formsList);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const [spinner, setspinner] = useState(true);
  const classes = useStyles();
  const [selectedRuleId, setselectedRuleId] = useState();
  const [originalRulesListData, setoriginalRulesListData] = useState([]);
  const [formRulesListData, setFormRulesListData] = useState([]);
  const [addRuleApiBool, setaddRuleApiBool] = useState(null);
  const [modifyApiBool, setmodifyApiBool] = useState(null);
  const [selectedRuleObject, setselectedRuleObject] = useState({});
  const [searchText, setsearchText] = useState("");
  const ruleConditionListRef = useRef(null);
  const [finalStatementList, setfinalStatementList] = useState([]);
  const [showErrorCss, setshowErrorCss] = useState(false);
  const [showErrorMandForm, setshowErrorMandForm] = useState(false);
  const smallScreen = useMediaQuery("(max-width: 1300px)");

  let { ProcessDefId, ProcessType, ProcessName } = localLoadedProcessData;

  const getFormRules = async () => {
    const response = await axios.get(
      SERVER_URL +
        `${ENDPOINT_GET_FORM_RULE}/${ProcessDefId}/${ProcessName}/${ProcessType}`
    );
    if (response.data.Status === 0) {
      if (
        response.data.FormRules?.hasOwnProperty("Rules") &&
        response.data.FormRules?.Rules !== null &&
        response.data.FormRules?.Rules?.length > 0
      ) {
        setselectedRuleId(response.data?.FormRules?.Rules[0]?.RuleId);
        setoriginalRulesListData(response.data.FormRules?.Rules);
        setFormRulesListData(response.data.FormRules?.Rules);
        setselectedRuleObject(response.data?.FormRules?.Rules[0]);
        getRuleSentences(response.data.FormRules?.Rules);
      }
      setspinner(false);
    }
  };

  useEffect(() => {
    getFormRules();
  }, []);

  useEffect(() => {
    handleSelectedRuleObject();
  }, [selectedRuleId]);

  useEffect(() => {
    ruleConditionListRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [originalRulesListData]);

  const getRuleSentences = (temp) => {
    if (temp?.length > 0) {
      let formRuleList = [];
      temp?.forEach((rule) => {
        let ruleStatement = "";
        let isNewStatement = false;
        rule.RuleCondition.forEach((element) => {
          const concatenatedString = ruleStatement.concat(
            " ",
            element.Param1,
            " ",
            element.Param1 === "" ? "" : "is",
            " ",
            getConditionalOperatorLabel(element.Operator),
            " ",
            // modified on 27/09/2023 for BugId 136677
            // element.Param2
            (element.datatype1 === "8" || element.datatype1 === "15") &&
              element.Type2 === "C"
              ? convertToArabicDate(element.Param2)
              : element.Param2,
            // till here BugId 136677
            " ",
            getLogicalOperator(element.LogicalOp),
            " "
          );
          ruleStatement = concatenatedString;
          if (concatenatedString?.trim() === "") {
            isNewStatement = true;
          }
        });

        let rulesData = {
          ruleStatement: isNewStatement
            ? t("newRule")
            : "If " +
              ruleStatement +
              " then show " +
              rule.RuleOperation[0]?.InterfaceElementName,
          ruleId: rule.RuleId,
          ruleOrderId: rule.RuleOrderId,
        };
        formRuleList = [...formRuleList, rulesData];
      });
      setfinalStatementList(formRuleList);
    } else {
      setfinalStatementList([]);
    }
  };

  const handleOriginalRulesListDataChange = (data) => {
    setoriginalRulesListData(data);
  };

  const addNewRuleHandler = async () => {
    // modified on 08/09/2023 for Bug 134464 - WI and forms>>rule>>modify and delete button should
    // not appear without adding the rules
    if (originalRulesListData.length > 0) {
      let temp = JSON.parse(JSON.stringify(originalRulesListData));
      let ruleToAdd = {
        RuleOrderId:
          +getHighestNumber(originalRulesListData, "RuleOrderId") + 1,
        RuleOperation: [
          {
            InterfaceElementName: allGlobalFormsList.filter(
              (form) => form.formId != -1
            ).length
              ? allGlobalFormsList.filter((form) => form.formId != -1)[0]
                  ?.formName
              : "",
            InterfaceElementId: allGlobalFormsList.filter(
              (form) => form.formId != -1
            ).length
              ? allGlobalFormsList.filter((form) => form.formId != -1)[0]
                  ?.formId
              : "",
          },
        ],
        RuleCondition: [
          {
            VarFieldId_1: "0",
            Operator: "",
            Type2: "",
            VarFieldId_2: "0",
            VariableId_1: "",
            //code changes on 07-09-23 for bug 135184
            //VariableId_2: "",
            VariableId_2: "0",
            LogicalOp: "3",
            Param2: "",
            Param1: "",
            Type1: "",
            ConditionOrderId: 1,
            ExtObjID1: "0",
            ExtObjID2: "0",
            // added on 27/09/2023 for BugId 136677
            datatype1: "",
          },
        ],
        RuleId: getHighestNumber(originalRulesListData, "RuleId") + 1 + "",
      };
      temp.push(ruleToAdd);
      handleOriginalRulesListDataChange(temp);
      getRuleSentences(temp);
      let newSelectedId =
        getHighestNumber(originalRulesListData, "RuleId") + 1 + "";
      setselectedRuleId(newSelectedId);
      setaddRuleApiBool(newSelectedId);
    } else {
      let temp2 = [
        {
          RuleOrderId: 1,
          RuleOperation: [
            {
              InterfaceElementId: allGlobalFormsList.filter(
                (form) => form.formId != -1
              ).length
                ? allGlobalFormsList.filter((form) => form.formId != -1)[0]
                    ?.formId
                : "",
              InterfaceElementName: allGlobalFormsList.filter(
                (form) => form.formId != -1
              ).length
                ? allGlobalFormsList.filter((form) => form.formId != -1)[0]
                    ?.formName
                : "",
            },
          ],
          RuleCondition: [
            {
              VarFieldId_1: "0",
              Operator: "",
              Type2: "",
              VarFieldId_2: "0",
              VariableId_1: "",
              VariableId_2: "0",
              LogicalOp: "3",
              Param2: "",
              Param1: "",
              Type1: "",
              ConditionOrderId: 1,
              ExtObjID1: "0",
              ExtObjID2: "0",
              // added on 27/09/2023 for BugId 136677
              datatype1: "",
            },
          ],
          RuleId: "1",
        },
      ];
      handleOriginalRulesListDataChange(temp2);
      getRuleSentences(temp2);
      setselectedRuleId("1");
      setaddRuleApiBool("1");
    }
  };

  const getHighestNumber = (data, fieldName) => {
    let arr = [];
    data.map((el) => {
      arr.push(+el[fieldName]);
    });
    if (data.length === 0) {
      return 0;
    } else return Math.max(...arr);
  };

  const getLowestNumber = (data, fieldName) => {
    let arr = [];
    data.map((el) => {
      arr.push(+el[fieldName]);
    });
    return Math.min(...arr);
  };

  const handleRuleAdd = async () => {
    let temp = {};
    originalRulesListData.forEach((rule) => {
      if (+rule.RuleId === +selectedRuleId) temp = rule;
    });

    let newRule = {
      RuleOrderId: +getHighestNumber(originalRulesListData, "RuleOrderId"),
      RuleOperation: [
        {
          interfaceName: temp.RuleOperation[0]?.InterfaceElementName,
        },
      ],
      RuleCondition: temp.RuleCondition.map((cond) => {
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
      RuleId: getHighestNumber(originalRulesListData, "RuleId") + "",
    };
    let postJson = {
      processDefId: localLoadedProcessData.ProcessDefId + "",
      processMode: localLoadedProcessData.ProcessType,
      ruleId: newRule.RuleId,
      ruleOrderId: newRule.RuleOrderId,
      ruleType: "F",
      ruleCondList: newRule.RuleCondition,
      ruleOpList: newRule.RuleOperation,
    };
    if (validateJson(postJson)) {
      const res = await axios.post(
        SERVER_URL + ENDPOINT_ADD_INTERFACE_RULE,
        postJson
      );
      if (res?.data?.Status === 0) {
        getRuleSentences(originalRulesListData);
        setFormRulesListData(originalRulesListData);
        dispatch(
          setToastDataFunc({
            message: t("RuleAddedSuccessfully"),
            severity: "success",
            open: "true",
          })
        );
        setaddRuleApiBool(null);
      } else {
        setselectedRuleId(formRulesListData[0]?.RuleId);
        setoriginalRulesListData(formRulesListData);
        setselectedRuleObject(formRulesListData[0]);
        getRuleSentences(formRulesListData);
        setaddRuleApiBool(null);
        dispatch(
          setToastDataFunc({
            message: "Rule not Added",
            severity: "error",
            open: "true",
          })
        );
      }
      setshowErrorCss(false);
      setshowErrorMandForm(false);
    }
  };

  const handleSelectedRuleObject = () => {
    setshowErrorCss(false);
    let temp = {};
    originalRulesListData.forEach((rule) => {
      if (+rule.RuleId === +selectedRuleId) temp = rule;
    });
    setselectedRuleObject(temp);
  };

  const getFormDetailsById = (id) => {
    let temp = {};
    allGlobalFormsList.forEach((form) => {
      if (form.formId == id) {
        temp = form;
      }
    });
    return temp;
  };

  const handleFormChange = (e) => {
    setshowErrorMandForm(false);
    let temp = JSON.parse(JSON.stringify(originalRulesListData));
    let obj = {};
    temp.forEach((rule) => {
      if (+rule.RuleId === +selectedRuleId) {
        obj = rule;
        rule.RuleOperation[0].InterfaceElementId = e.target.value + "";
        rule.RuleOperation[0].InterfaceElementName = getFormDetailsById(
          e.target.value
        ).formName;
      }
    });
    handleOriginalRulesListDataChange(temp);
    setselectedRuleObject(obj);
    if (addRuleApiBool !== selectedRuleId && modifyApiBool !== selectedRuleId) {
      setmodifyApiBool(selectedRuleId);
    }
  };

  const handleRuleModify = async () => {
    let temp = {};
    originalRulesListData.map((rule) => {
      if (rule.RuleId == selectedRuleId) temp = rule;
    });

    let newRule = {
      RuleOrderId: +temp.RuleOrderId,
      RuleOperation: [
        {
          interfaceName: temp.RuleOperation[0]?.InterfaceElementName,
        },
      ],
      RuleCondition: temp.RuleCondition.map((cond) => {
        return {
          varFieldId_1: cond.VarFieldId_1 || "0",
          operator: cond.Operator,
          type2: cond.Type2,
          varFieldId_2: cond.VarFieldId_2 || "0",
          variableId_1: cond.VariableId_1,
          variableId_2: cond.VariableId_2,
          logicalOp: cond.LogicalOp === "" ? "0" : cond.LogicalOp,
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
      RuleId: temp.RuleId + "",
    };
    let postJson = {
      processDefId: localLoadedProcessData.ProcessDefId + "",
      processMode: localLoadedProcessData.ProcessType,
      ruleId: newRule.RuleId,
      ruleOrderId: newRule.RuleOrderId,
      ruleType: "F",
      ruleCondList: newRule.RuleCondition,
      ruleOpList: newRule.RuleOperation,
    };
    if (validateJson(postJson)) {
      const res = await axios.post(
        SERVER_URL + ENDPOINT_MODIFY_INTERFACE_RULE,
        postJson
      );

      if (res.data.Status === 0) {
        getRuleSentences(originalRulesListData);
        setFormRulesListData(originalRulesListData);
        dispatch(
          setToastDataFunc({
            message: t("RuleModifiedSuccessfully"),
            severity: "success",
            open: "true",
          })
        );
        setmodifyApiBool(null);
      } else {
        setselectedRuleId(formRulesListData[0]?.RuleId);
        setoriginalRulesListData(formRulesListData);
        setselectedRuleObject(formRulesListData[0]);
        getRuleSentences(formRulesListData);
        setmodifyApiBool(null);
        dispatch(
          setToastDataFunc({
            message: "Rule not modified",
            severity: "error",
            open: "true",
          })
        );
      }
      setshowErrorCss(false);
      setshowErrorMandForm(false);
    }
  };

  const handleRuleDelete = async () => {
    let temp = {};
    let newArr = [];
    originalRulesListData.forEach((rule) => {
      if (+rule.RuleId === +selectedRuleId) {
        temp = rule;
      } else {
        newArr.push(rule);
      }
    });

    let newRule = {
      RuleOrderId: +temp.RuleOrderId,
      RuleOperation: [
        {
          interfaceName: temp.RuleOperation[0]?.InterfaceElementName,
        },
      ],

      RuleId: temp.RuleId + "",
    };
    let postJson = {
      processDefId: localLoadedProcessData.ProcessDefId + "",
      processMode: localLoadedProcessData.ProcessType,
      ruleId: newRule.RuleId,
      ruleOrderId: newRule.RuleOrderId,
      ruleType: "F",
      interfaceName: newRule.RuleOperation[0].interfaceName,
    };

    const res = await axios.post(
      SERVER_URL + ENDPOINT_DELETE_INTERFACE_RULE,
      postJson
    );
    if (res.data.Status === 0) {
      getRuleSentences(newArr);
      setoriginalRulesListData(newArr);
      setselectedRuleId(getLowestNumber(newArr, "RuleId") + "");
      setFormRulesListData(newArr);
      dispatch(
        setToastDataFunc({
          message: t("RuleDeletedSuccessfully"),
          severity: "success",
          open: "true",
        })
      );
    } else {
      setselectedRuleId(formRulesListData[0]?.RuleId);
      setoriginalRulesListData(formRulesListData);
      setselectedRuleObject(formRulesListData[0]);
      getRuleSentences(formRulesListData);
      dispatch(
        setToastDataFunc({
          message: "Rule not deleted",
          severity: "error",
          open: "true",
        })
      );
    }
    setshowErrorMandForm(false);
  };

  const validateJson = (json) => {
    let flag = true;
    json.ruleCondList.forEach((cond, index) => {
      if (cond.param2 === "<constant>") flag = false;
      if (json.ruleCondList.length > 1) {
        if (index == json.ruleCondList.length - 1) {
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
        //const restrictedOperators = ["9", "10"];
        if (
          cond.variableId_1 === "" ||
          cond.operator === ""
          //code changes on 07-09-23 for bug 135184
          //||
          /*  (!restrictedOperators.includes(cond.operator) &&
            cond.variableId_2 === ""*/
        ) {
          flag = false;
        }
      }
    });
    setshowErrorCss(!flag);
    if (json.ruleOpList && json.ruleOpList[0]) {
      if (!json.ruleOpList[0]?.interfaceName) {
        setshowErrorMandForm(true);
        flag = false;
      }
    }
    return flag;
  };

  const searchFormHandler = (formList) => {
    return formList.filter((form) =>
      form.formName.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleRuleCancel = () => {
    let temp = global.structuredClone(originalRulesListData);
    temp.splice(temp.length - 1, 1);
    setoriginalRulesListData(temp);
    getRuleSentences(temp);
    setselectedRuleId(temp[temp.length - 1]?.RuleId || null);
    setaddRuleApiBool(null);
    setshowErrorMandForm(false);
    setmodifyApiBool(null);
  };

  const changeSelectedRule = (rule) => {
    setselectedRuleId(rule.ruleId);
    const currentRule = originalRulesListData.find(
      (item) => item.RuleId === selectedRuleId
    );
    if (currentRule && modifyApiBool !== null) {
      setoriginalRulesListData(formRulesListData);
      setmodifyApiBool(null);
    }
  };

  return (
    <>
      {spinner ? (
        <CircularProgress
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
      ) : (
        <div style={{ direction: direction }} className={styles.mainDiv}>
          <div className={styles.header}>
            <p>{t("ruleListForForms")}</p>
            <IconButton
              onClick={() => props.closeModal()}
              id="pmweb_RuleListform_CloseModal"
               // Changes to reolve the bug Id 139904
              title="Close"
            >
              <ClearOutlinedIcon
                classes={{
                  root: styles.deleteIcon,
                }}
              />
            </IconButton>
          </div>
          <div className={styles.body}>
            {/* modified on 08/09/2023 for Bug 134464 - WI and forms>>rule>>modify and delete button 
            should not appear without adding the rules */}
            {finalStatementList?.length > 0 ? (
              <>
                <div className={styles.rulesListDiv}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: smallScreen ? "column" : "row",
                      justifyContent: "space-between",
                      width: "100%",
                      // modified on 28-9-2023 for bug_id: 138220
                      alignItems: "start",
                      // height: "3.5rem",
                      //till here
                    }}
                  >
                    <p
                      style={{
                        fontSize: "var(--subtitle_text_font_size)",
                        fontWeight: "600",
                      }}
                    >
                      {finalStatementList?.filter(
                        (el) => el.ruleStatement !== t("newRule")
                      )?.length === 0 ? (
                        t("noRuleDefined")
                      ) : (
                        <>
                          {finalStatementList?.filter(
                            (el) => el.ruleStatement !== t("newRule")
                          )?.length === 1
                            ? finalStatementList?.filter(
                                (el) => el.ruleStatement !== t("newRule")
                              )?.length +
                              SPACE +
                              t("ruleIsDefined")
                            : finalStatementList?.filter(
                                (el) => el.ruleStatement !== t("newRule")
                              )?.length +
                              SPACE +
                              t("rulesAreDefined")}
                        </>
                      )}
                    </p>
                    <button
                      style={{
                        backgroundColor: "var(--button_color)",
                        border: "none",
                        borderRadius: "2px",
                        color: "white",
                        cursor: "pointer",
                        display: addRuleApiBool !== null ? "none" : "flex",
                        fontWeight: "500",
                        marginLeft:
                          direction === RTL_DIRECTION
                            ? "8px !important"
                            : "unset !important",
                        marginRight:
                          direction !== RTL_DIRECTION
                            ? "8px !important"
                            : "unset !important",
                      }}
                      onClick={() => addNewRuleHandler()}
                      id="pmweb_RuleListform_addRule"
                    >
                      {t("addRule")}
                    </button>
                  </div>
                  {finalStatementList?.length > 0 &&
                    finalStatementList?.map((rule) => (
                      <div
                        key={rule.ruleId}
                        style={{
                          width: "96%",
                          marginBlock: "0.5rem",
                          padding: "0.5rem 0.5vw",
                          cursor: "pointer",
                          border: "1px solid #c4c4c4",
                          direction:
                            finalStatementList?.filter(
                              (el) => el.ruleStatement !== t("newRule")
                            )?.length === 0 && direction === RTL_DIRECTION
                              ? "rtl"
                              : "ltr",
                          background:
                            rule.ruleId === selectedRuleId
                              ? "#0072C60F"
                              : "white",
                        }}
                        onClick={() => changeSelectedRule(rule)}
                        id={`pmweb_RuleListform_${rule?.ruleStatement}`}
                        tabIndex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            changeSelectedRule(rule);
                          }
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            textAlign:
                              direction === RTL_DIRECTION ? "right" : "left",
                          }}
                        >
                          {rule?.ruleStatement}
                        </p>
                      </div>
                    ))}
                </div>
                <div
                // Changes on 18-10-2023to resolve the bug Id 139779 border comes outside the modal from bottom
                  style={{ border: "1px solid rgb(0,0,0,0.4)", height: "88%" }}
                ></div>
                <div className={styles.rulesDescDiv}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                      paddingInline: "10px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "var(--subtitle_text_font_size)",
                        fontWeight: "600",
                      }}
                    >
                      {t("rulesConditions")}{" "}
                      <span className={styles.starIcon}>*</span>
                    </p>
                    <div
                      style={{
                        width: "160px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      {addRuleApiBool === selectedRuleId ? (
                        <>
                          <button
                            style={{
                              background: "#FFF",
                              border: "1px solid rgb(0,0,0,0.3)",
                              borderRadius: "2px",
                              color: "#606060",
                              marginInline: "8px",
                              cursor: "pointer",
                            }}
                            onClick={handleRuleCancel}
                            id="pmweb_RuleListform_addRule_cancelBtn"
                          >
                            {t("cancel")}
                          </button>
                          <button
                            style={{
                              background: "var(--button_color)",
                              border: "none",
                              borderRadius: "2px",
                              color: "white",
                              cursor: "pointer",
                            }}
                            onClick={handleRuleAdd}
                            id="pmweb_RuleListform_addRule_addRuleBtn"
                          >
                            {t("addRule")}
                          </button>
                        </>
                      ) : (
                        <>
                          {modifyApiBool === selectedRuleId ? (
                            <>
                              <button
                                style={{
                                  background: "#FFF",
                                  border: "1px solid rgb(0,0,0,0.3)",
                                  borderRadius: "2px",
                                  color: "#606060",
                                  marginInline: "8px",
                                  cursor: "pointer",
                                }}
                                onClick={handleRuleDelete}
                                id="pmweb_RuleListform_modifyApi_delete"
                              >
                                {t("delete")}
                              </button>
                              <button
                                style={{
                                  background: "var(--button_color)",
                                  border: "none",
                                  borderRadius: "2px",
                                  color: "white",
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                }}
                                onClick={handleRuleModify}
                                id="pmweb_RuleListform_modifyApi_modifyRule"
                              >
                                {t("modifyRule")}
                              </button>
                            </>
                          ) : (
                            <button
                              style={{
                                background: "#FFF",
                                border: "1px solid rgb(0,0,0,0.3)",
                                borderRadius: "2px",
                                color: "#606060",
                                cursor: "pointer",
                              }}
                              onClick={handleRuleDelete}
                              id="pmweb_RuleListform_Delete"
                            >
                              {t("delete")}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.ruleConditionDiv}>
                    <p
                      style={{
                        fontSize: "var(--subtitle_text_font_size)",
                        marginInlineStart: "1vw",
                        fontWeight: "600",
                      }}
                    >
                      {t("if")}
                    </p>
                    <RuleSelect
                      showErrorCss={showErrorCss}
                      setshowErrorCss={setshowErrorCss}
                      originalRulesListData={originalRulesListData}
                      selectedRuleId={selectedRuleId}
                      setoriginalRulesListData={
                        handleOriginalRulesListDataChange
                      }
                      addRuleApiBool={addRuleApiBool}
                      modifyApiBool={modifyApiBool}
                      setmodifyApiBool={setmodifyApiBool}
                    />
                    <div ref={ruleConditionListRef} />
                  </div>
                  <div
                    style={{
                      width: "100%",
                      paddingInlineStart: "1vw",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          marginBlock: "0.25rem",
                          // marginInlineStart: "0.25rem",

                          fontWeight: "600",
                          // marginInlineEnd: "0.5vw",
                        }}
                      >
                        {t("show")}
                      </p>
                      <div
                        style={{
                          width: "100%",
                          borderTop: "1px solid rgb(0,0,0,0.4)",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          fontWeight: "600",
                        }}
                      >
                        {t("formList")}
                        <span className={styles.starIcon}>*</span>
                      </p>
                      <div style={{ width: "30%" }}>
                        <SearchBox
                          height="28px"
                          title={"RuleDataForm"}
                          // Changes on 29/08/2023 to resolve the bug Id 135203 changes the width & placeholder
                          // width="100px"
                          // placeholder={"Search Here"}
                          width="100%"
                          placeholder={t("Search")}
                          setSearchTerm={(data) => setsearchText(data)}
                        />
                      </div>
                    </div>

                    <div>
                      {showErrorMandForm && (
                        <p className={styles.errMsg}>{t("mandatoryErrForm")}</p>
                      )}
                      <div
                        style={{
                          background: "#F0F0F0",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <p
                          style={{
                            marginBlock: "0.5rem",
                            marginInlineStart: "2rem",

                            fontWeight: "600",
                            fontSize: "var(--base_text_font_size)",
                            // marginInlineStart: "2vw",
                          }}
                        >
                          {t("name")}
                        </p>
                      </div>
                      <div className={styles.formDiv}>
                        <FormControl component="fieldset">
                          <RadioGroup
                            aria-label=""
                            value={
                              selectedRuleObject?.hasOwnProperty(
                                "RuleOperation"
                              )
                                ? +selectedRuleObject?.RuleOperation[0]
                                    ?.InterfaceElementId
                                : null
                            }
                            onChange={handleFormChange}
                            id="pmweb_RuleListform_RadioGroup"
                          >
                            {searchFormHandler(
                              allGlobalFormsList.filter(
                                (form) => form.formId != -1
                              )
                            ).map((form, index) => (
                              <div
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <FormControlLabel
                                  value={form.formId}
                                  control={<Radio size="small" />}
                                  label={form.formName}
                                  classes={{
                                    label: classes.labelForm,
                                    root: classes.labelRoot,
                                  }}
                                  id={`pmweb_RuleListform_RadioGroup_${index}`}
                                />
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyStateMainDiv}>
                {/* added on 08/09/2023 for Bug 134464 - WI and forms>>rule>>modify and delete 
                button should not appear without adding the rules */}
                <img
                  className={styles.emptyStateImage}
                  src={EmptyStateIcon}
                  alt={t("emptyState")}
                />
                <p className={styles.emptyStateHeading}>{t("createRules")}</p>
                <p className={styles.emptyStateText}>
                  {t("noRulesAdded")}
                  {t("pleaseCreateRules")}
                </p>
                <button
                  style={{
                    backgroundColor: "var(--button_color)",
                    border: "none",
                    borderRadius: "2px",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                  onClick={() => addNewRuleHandler()}
                  id="pmweb_NoRuleListform_addRule"
                >
                  {t("addRule")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default RuleListForm;
