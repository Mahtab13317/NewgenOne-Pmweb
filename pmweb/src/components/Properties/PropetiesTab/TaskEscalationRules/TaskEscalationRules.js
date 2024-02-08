// #BugID - 121824
// #BugDescription - Handled the function to add and modify the subject and message.
// #BugID - 122427
// #BugDescription - Handled the key for escalatio rules.
// #BugID - 122679
// #BugDescription - Variable populated in subject and message.
// #BugID - 122681
// #BugDescription - Populated variable in priority.
// #BugID - 124009
// #BugDescription - Handled the value for toUSer and FromUser when constant value is entered.
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import "../../Properties.css";
import { useTranslation } from "react-i18next";
import { connect, useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { store, useGlobalState } from "state-pool";
import * as actionCreatorsDrawer from "../../../../redux-store/actions/Properties/showDrawerAction.js";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  COMPLEX_VARTYPE,
  DATE_VARIABLE_TYPE,
  headerHeight,
  propertiesLabel,
  RTL_DIRECTION,
  SPACE,
} from "../../../../Constants/appConstants.js";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import Field from "../../../../UI/InputFields/TextField/Field.js";
import TurnAroundTime from "../../../../UI/InputFields/TurnAroundTime/TurnAroundTime";
import styles from "./taskescalation.module.css";
import {
  getComplex,
  getIncorrectLenErrMsg,
  getVariableExtObjectIdByName,
  getVariableIdByName,
  getVariableScopeByName,
  getVariableVarFieldIdByName,
  isProcessDeployedFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import {
  TRIGGER_PRIORITY_HIGH,
  TRIGGER_PRIORITY_LOW,
  TRIGGER_PRIORITY_MEDIUM,
} from "../../../../Constants/triggerConstants.js";
import TabsHeading from "../../../../UI/TabsHeading";
import NoRulesScreen from "../ActivityRules/NoRuleScreen";
import { PMWEB_REGEX, validateRegex } from "../../../../validators/validator";
import { addConstantsToString } from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { convertToArabicDate } from "../../../../UI/DatePicker/DateInternalization";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";

const makeFieldInputs = (value) => {
  return {
    value: value,
    error: false,
    helperText: "",
  };
};

const useStyles = makeStyles((props) => ({
  input: {
    height: "var(--line_height)",
  },
  inputWithError: {
    height: "var(--line_height)",
    width: "4.875rem",
  },
  errorStatement: {
    color: "#b52a2a",
    fontSize: "11px",
  },
  mainDiv: {
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    /* code edited on 6 July 2023 for issue - save and 
    discard button hide issue in case of tablet(landscape mode)*/
    height: (props) =>
      `calc((${props.windowInnerHeight}px - ${headerHeight}) - 12.25rem)`,
    fontFamily: "Open Sans",
    width: "100%",
    direction: props.direction,
    "&::-webkit-scrollbar": {
      overflowY: "visible",
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
    "&:hover::-webkit-scrollbar": {
      width: "0.375rem",
      height: "1.125rem",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
    scrollbarColor: "#8c8c8c #fafafa",
    scrollbarWidth: "thin",
  },
  GroupTitleMain: {
    fontWeight: 700,
    color: "#606060",
    fontSize: "var(--subtitle_text_font_size)",
  },
  btnIcon: {
    cursor: "pointer",
    height: "28px",
    width: "28px",
    border: "1px solid #CECECE",
  },
  GroupTitleSecondary: {
    fontWeight: 600,
    color: "#000000",
    fontSize: "var(--subtitle_text_font_size)",
  },
  bold: {
    fontWeight: 600,
    fontSize: "var(--base_text_font_size)",
  },
}));

function TaskEscalationRules(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const classes = useStyles({
    ...props,
    direction,
    windowInnerHeight: windowInnerHeight,
  });
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  let isReadOnly =
    props.openTemplateFlag ||
    isProcessDeployedFunc(localLoadedProcessData) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;
  const [spinner, setspinner] = useState(true);
  //rules related states
  const [selectedRule, setSelectedRule] = useState(null);
  const [allRules, setAllRules] = useState([]);
  const [rulesCount, setRulesCount] = useState(0); // To show count for rules.
  const [isRuleBeingCreated, setIsRuleBeingCreated] = useState(false);
  const [mailData, setMailData] = useState({
    isFromConstant: false,
    isToConstant: false,
    isCcConstant: false,
    isBccConstant: false,
    priorityInput: "",
    fromInput: "",
    toInput: "",
    ccInput: "",
    bccInput: "",
    fromError: false,
    fromHelperText: "",
    toError: false,
    toHelperText: "",
  });
  const [TATData, setTATData] = useState({
    days: "",
    hours: "",
    minutes: "",
    calendarType: "Y",
    isDaysConstant: false,
    isHoursConstant: false,
    isMinutesConstant: false,
    daysError: false,
    hoursError: false,
    minsError: false,
    daysHelperText: "",
    hoursHelperText: "",
    minsHelperText: "",
  });
  /*  const priorityOpt = [
    t(TRIGGER_PRIORITY_LOW),
    t(TRIGGER_PRIORITY_MEDIUM),
    t(TRIGGER_PRIORITY_HIGH),
  ]; */
  const [priorityOpt, setPriorityOpt] = useState([
    t(TRIGGER_PRIORITY_LOW),
    t(TRIGGER_PRIORITY_MEDIUM),
    t(TRIGGER_PRIORITY_HIGH),
  ]);
  const [allDateTypeVars, setDateTypeVars] = useState([]);
  const [escalateAfter, setEscalateAfter] = useState(
    makeFieldInputs({ param2: "", type2: "C", variableId_2: "0" })
  );
  const [subject, setSubject] = useState(
    makeFieldInputs({ includeVariable: "", content: "" })
  );
  const [msg, setMsg] = useState(
    makeFieldInputs({ includeVariable: "", content: "" })
  );
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const getDisplayNameForSysDefVars = (key) => {
    const varNames = {
      CreatedDateTime: "Workitem Creation Date Time",
      EntryDateTime: "Case/Activity Initiation Date Time",
      IntroductionDateTime: "Workitem Introduction Date Time",
      TurnAroundDateTime: "SLA Date Time",
      ValidTillDateTime: "Workitem Expiry Date Time",
    };
    if (varNames[key]) {
      return varNames[key];
    }
    return key;
  };
  const smallScreen = useMediaQuery("(max-width: 999px");

  const triggerSubRef = useRef();

  useEffect(() => {
    if (localLoadedProcessData?.Variable) {
      let dateVars = localLoadedProcessData.Variable.filter(
        (variable) => +variable.VariableType === DATE_VARIABLE_TYPE
      );

      dateVars = dateVars.map((variable) => ({
        name: getDisplayNameForSysDefVars(variable.VariableName),
        value: variable.VariableName,
        ...variable,
      }));
      const hardCodeVars = [
        {
          name: "Task Due Date",
          value: "TaskDueDate",
          VariableName: "TaskDueDate",
        },
        {
          name: "Task Initiation Date Time",
          value: "TaskEntryDateTime",
          VariableName: "TaskEntryDateTime",
        },
      ];
      setDateTypeVars([...dateVars, ...hardCodeVars]);
    }
  }, [localLoadedProcessData?.Variable]);

  // code added on 16 Nov 2022 for BugId 118114
  useEffect(() => {
    if (localLoadedProcessData) {
      console.log("$$$", "opt", priorityOpt);
      let variableWithConstants = [];
      localLoadedProcessData.DynamicConstant?.forEach((element) => {
        let tempObj = {
          VariableName: element.ConstantName,
          VariableScope: "C",
          ExtObjectId: "0",
          VarFieldId: "0",
          VariableId: "0",
        };
        variableWithConstants.push(tempObj);
      });
      localLoadedProcessData.Variable?.forEach((element) => {
        if (+element.VariableType === 3) {
          variableWithConstants.push(element);
        }
      });
      setDropdownOptions(variableWithConstants);
      // Changes made to solve Bug 132215
      setPriorityOpt((prev) => {
        let temp = [...prev];
        let tempVarListComplex = [];
        let variables = localLoadedProcessData.Variable.filter((_var) => {
          //Modified on 23/01/2024 for bug_id:142843
          /*  if (_var.VariableType === COMPLEX_VARTYPE) {
            let tempList = getComplex(_var);
            tempList
              .filter((el) => el.VariableType == "3" || el.VariableType == "4")
              ?.forEach((el) => {
                tempVarListComplex.push(el.VariableName);
              });
          } */
          //till here for bug_id:142843
          if (
            (_var.VariableScope == "U" &&
              // (_var.VariableType == "3" || _var.VariableType == "4")) ||
              _var.VariableType == "3") || //Modified on 23/01/2024 for bug_id:142843
            (_var.VariableScope == "I" &&
              // (_var.VariableType == "3" || _var.VariableType == "4"))
              _var.VariableType == "3") //Modified on 23/01/2024 for bug_id:142843
          ) {
            tempVarListComplex.push(_var.VariableName);
          }
        });
        // till here dated 26thOct
        let okay = [];
        variables.forEach((pl) => {
          okay.push(pl.VariableName);
        });
        return [...temp, ...okay, ...tempVarListComplex];
      });
    }
  }, [localLoadedProcessData]);

  useEffect(() => {
    if (
      localLoadedActivityPropertyData?.taskGenPropInfo?.m_objTaskRulesListInfo
    ) {
      const taskRules =
        localLoadedActivityPropertyData?.taskGenPropInfo?.m_objTaskRulesListInfo
          ?.esRuleList || [];
      // code added on 16 Nov 2022 for BugId 118114
      let taskArrRules = [];
      taskRules?.forEach((rule) => {
        taskArrRules.push({ ...rule, status: "ADDED" });
      });
      setAllRules([...taskArrRules]);
      if (
        selectedRule === null &&
        taskRules?.length > 0 &&
        props.isDrawerExpanded
      ) {
        setSelectedRule(0);
        handleSelectedRule(0, taskArrRules);
      }
      setspinner(false);
    }
  }, [localLoadedActivityPropertyData]);

  // Function to set the rule count.
  // code added on 16 Nov 2022 for BugId 118114
  useEffect(() => {
    if (allRules && !isRuleBeingCreated) {
      setRulesCount(allRules.length);
    }
  }, [allRules]);

  // code added on 16 Nov 2022 for BugId 118114
  useEffect(() => {
    if (escalateAfter.error && escalateAfter.value?.param2 !== "") {
      setEscalateAfter({
        ...escalateAfter,
        error: false,
        helperText: "",
      });
    }
    if (TATData.daysError && TATData.days !== "") {
      setTATData({
        ...TATData,
        daysError: false,
        daysHelperText: "",
      });
    }
    if (TATData.hoursError && TATData.hours !== "") {
      setTATData({
        ...TATData,
        hoursError: false,
        hoursHelperText: "",
      });
    }
    if (TATData.minsError && TATData.minutes !== "") {
      setTATData({
        ...TATData,
        minsError: false,
        minsHelperText: "",
      });
    }
    if (
      subject.error &&
      subject.value?.content !== "" &&
      subject.value?.content.length < 255
    ) {
      setSubject({
        ...subject,
        error: false,
        helperText: "",
      });
    }
    if (mailData.fromError && mailData.fromInput !== "") {
      // modified on 21/10/23 for BugId 139644
      /*if (
        validateRegex(mailData.fromInput, "[a-z0-9]+@[a-z]+.[a-z]{2,3}") &&
        mailData.isFromConstant
      ) {*/
      if (
        mailData.isFromConstant &&
        validateRegex(mailData.fromInput, PMWEB_REGEX.EmailId)
      ) {
        setMailData({
          ...mailData,
          fromError: false,
          fromHelperText: "",
        });
      } else if (!mailData.isFromConstant) {
        setMailData({
          ...mailData,
          fromError: false,
          fromHelperText: "",
        });
      }
    }
    if (mailData.toError && mailData.toInput !== "") {
      // modified on 21/10/23 for BugId 139644
      /*if (
        validateRegex(mailData.toInput, "[a-z0-9]+@[a-z]+.[a-z]{2,3}") &&
        mailData.isToConstant
      ) {*/
      if (
        mailData.isToConstant &&
        validateRegex(mailData.toInput, PMWEB_REGEX.EmailId)
      ) {
        setMailData({
          ...mailData,
          toError: false,
          toHelperText: "",
        });
      } else if (!mailData.isToConstant) {
        setMailData({
          ...mailData,
          toError: false,
          toHelperText: "",
        });
      }
    }
  }, [escalateAfter, TATData, mailData, subject]);

  const getPriority = (id) => {
    const priorityVal = { 1: "Low", 2: "Medium", 3: "High" };
    if (priorityVal[id]) {
      return priorityVal[id];
    } else {
      return id;
    }
    // return "";
  };

  const getPriorityNumber = (name) => {
    const priorityVal = { Low: 1, Medium: 2, High: 3 };
    if (priorityVal[name]) {
      return priorityVal[name];
    } else {
      return name;
    }

    //return "";
  };

  // code updated on 16 Nov 2022 for BugId 118114
  const addNewRule = () => {
    props.expandDrawer(true);
    let newRules = [...allRules];
    const ids = newRules?.map((rule) => +rule.ruleId);
    let maxId = Math.max(...ids);
    if (newRules?.length === 0) {
      maxId = 0;
    }
    const newRule = {
      ruleId: `${maxId + 1}`,
      ruleOpList: [
        {
          durationInfo: {
            varFieldIdDays: "0",
            varFieldIdHours: "0",
            varFieldIdMinutes: "0",
            varFieldIdSeconds: "0",
            variableIdDays: "0",
            variableIdHours: "0",
            variableIdMinutes: "0",
            variableIdSeconds: "0",

            paramDays: "",
            paramHours: "",
            paramMinutes: "",
            paramSeconds: "0",
          },
          mailTrigInfo: {
            mailInfo: {
              fromUser: "",
              variableIdFrom: "",
              varFieldIdFrom: "0",
              varFieldTypeFrom: "M",
              extObjIDFrom: "0",
              toUser: "",
              variableIdTo: "",
              varFieldIdTo: "0",
              varFieldTypeTo: "M",
              extObjIDTo: "0",
              ccUser: "",
              variableIdCC: "",
              varFieldIdCC: "0",
              varFieldTypeCC: "M",
              extObjIDCC: "0",
              bccUser: "",
              variableIdBCC: "",
              varFieldIdBCC: "0",
              varFieldTypeBCC: "M",
              extObjIDBCC: "0",
              subject: "",
              selectedSubject: "",
              selectedMessage: "",
              message: "",
              m_bFromConst: false,
              m_bToConst: false,
              m_bCcConst: false,
              m_bBCcConst: false,
              priority: "",
              variableIdPriority: "0",
              varFieldIdPriority: "0",
              varFieldTypePriority: "C",
              extObjIDPriority: "0",
              fromConstant: "",
              toConstant: "",
              ccConstant: "",
              bccConstant: "",
            },
          },
          param2: "",
          type2: "S",
          variableId_2: "0",
          extObjID2: "0",
          varFieldId_2: "0",
          ruleCalFlag: "Y",
          param1: "",
          type1: "",
          variableId_1: "0",
          varFieldId_1: "0",
          extObjID1: "0",
          type3: "",
          param3: "",
          extObjID3: "0",
          variableId_3: "0",
          varFieldId_3: "0",
        },
      ],
      status: "CREATED",
    };
    newRules.splice(newRules.length, 0, newRule);
    setAllRules(newRules);
    setIsRuleBeingCreated(true);
    setSelectedRule(newRules.length - 1);
    handleSelectedRule(newRules.length - 1, newRules);
  };

  // code updated on 16 Nov 2022 for BugId 118114
  const handleSelectedRule = (index, rulesArrTemp) => {
    if (!props.isDrawerExpanded) {
      props.expandDrawer(true);
    }
    subject["value"]["includeVariable"] = "";
    msg["value"]["includeVariable"] = "";
    const rule = rulesArrTemp[index];
    if (rule && rule.status === "ADDED") {
      const durationData = rule.ruleOpList[0]?.durationInfo || null;
      const mailDataLocal = rule.ruleOpList[0]?.mailTrigInfo?.mailInfo || null;

      setTATData({
        ...TATData,
        days: durationData?.paramDays,
        hours: durationData?.paramHours,
        minutes: durationData?.paramMinutes,
        calendarType: rule.ruleOpList[0]?.ruleCalFlag,
        isDaysConstant: durationData?.variableIdDays === "0",
        isHoursConstant: durationData?.variableIdHours === "0",
        isMinutesConstant: durationData?.variableIdMinutes === "0",
      });

      if (mailDataLocal) {
        const fromInput =
          // mailDataLocal.m_bFromConst || mailDataLocal.fromUser === CONSTANT_CAPS
          mailDataLocal.m_bFromConst ||
          mailDataLocal.fromUser === t("<constant>") //Modified on 25/10/2023, bug_id:139944
            ? mailDataLocal.fromConstant
            : mailDataLocal.fromUser;
        const toInput =
          //mailDataLocal.m_bToConst || mailDataLocal.toUser === CONSTANT_CAPS
          mailDataLocal.m_bToConst || mailDataLocal.toUser === t("<constant>") //Modified on 25/10/2023, bug_id:139944
            ? mailDataLocal.toConstant
            : mailDataLocal.toUser;
        const bccInput =
          //mailDataLocal.m_bBCcConst || mailDataLocal.bccUser === CONSTANT_CAPS
          mailDataLocal.m_bBCcConst || mailDataLocal.bccUser === t("<constant>") //Modified on 25/10/2023, bug_id:139944
            ? mailDataLocal.bccConstant
            : mailDataLocal.bccUser;
        const ccInput =
          // mailDataLocal.m_bCcConst || mailDataLocal.ccUser === CONSTANT_CAPS
          mailDataLocal.m_bCcConst || mailDataLocal.ccUser === t("<constant>") //Modified on 25/10/2023, bug_id:139944
            ? mailDataLocal.ccConstant
            : mailDataLocal.ccUser;

        setMailData({
          ...mailDataLocal,
          // isFromConstant: mailDataLocal.m_bFromConst,
          isFromConstant:
            // mailDataLocal.fromUser === CONSTANT_CAPS ? true : false,
            mailDataLocal.fromUser === t("<constant>") ? true : false, //Modified on 25/10/2023, bug_id:139944
          // isToConstant: mailDataLocal.m_bToConst,
          //isToConstant: mailDataLocal.toUser === CONSTANT_CAPS ? true : false,
          isToConstant: mailDataLocal.toUser === t("<constant>") ? true : false, //Modified on 25/10/2023, bug_id:139944
          //isCcConstant: mailDataLocal.m_bCcConst,
          // isCcConstant: mailDataLocal.m_bCcConst === t("<constant>") ? true : false,
          isCcConstant: mailDataLocal.ccUser === t("<constant>") ? true : false, //Modified on 25/10/2023, bug_id:139944
          // isBccConstant: mailDataLocal.m_bBCcConst,
          // isBccConstant: mailDataLocal.m_bBCcConst === t("<constant>") ? true : false,
          isBccConstant:
            mailDataLocal.bccUser === t("<constant>") ? true : false, //Modified on 25/10/2023, bug_id:139944
          priorityInput: getPriority(mailDataLocal.priority),
          fromInput: fromInput,
          toInput: toInput,
          ccInput: ccInput,
          bccInput: bccInput,
        });
      }
      const newEscalateAfterVal = {
        // modified on 27/09/23 for BugId 136677
        // param2:
        //   rule.ruleOpList[0]?.type2 === "C"
        //     ? moment(rule.ruleOpList[0]?.param2).format("YYYY-MM-DD")
        //     : rule.ruleOpList[0]?.param2 || "",
        param2: rule.ruleOpList[0]?.param2 || "",
        // till here BugId 136677
        type2: rule.ruleOpList[0]?.type2 || "C",
        variableId_2: rule.ruleOpList[0]?.variableId_2 || "0",
      };
      setEscalateAfter({
        ...escalateAfter,
        value: { ...newEscalateAfterVal },
      });
      const newSub = { ...subject };
      newSub["value"]["content"] =
        (mailDataLocal && decode_utf8(mailDataLocal.subject)) || "";

      setSubject({ ...newSub });
      const newMSG = { ...msg };
      newMSG["value"]["content"] =
        (mailDataLocal && decode_utf8(mailDataLocal.message)) || "";
      setMsg({ ...newMSG });
    } else if (rule && rule.status === "CREATED") {
      setEscalateAfter(
        makeFieldInputs({ param2: "", type2: "C", variableId_2: "0" })
      );
      setSubject(makeFieldInputs({ includeVariable: "", content: "" }));
      setMsg(makeFieldInputs({ includeVariable: "", content: "" }));
      setMailData({
        isFromConstant: false,
        isToConstant: false,
        isCcConstant: false,
        isBccConstant: false,
        priorityInput: "",
        fromInput: "",
        toInput: "",
        ccInput: "",
        bccInput: "",
        fromError: false,
        fromHelperText: "",
        toError: false,
        toHelperText: "",
      });
      setTATData({
        days: "",
        hours: "",
        minutes: "",
        calendarType: "Y",
        isDaysConstant: false,
        isHoursConstant: false,
        isMinutesConstant: false,
        daysError: false,
        hoursError: false,
        minsError: false,
        daysHelperText: "",
        hoursHelperText: "",
        minsHelperText: "",
      });
    }
  };

  const addVarToSubContent = () => {
    if (subject.value.includeVariable) {
      const newSub = { ...subject };
      // newSub["value"]["content"] =
      //  newSub["value"]["content"] + `&${subject["value"]["includeVariable"]}&`;

      newSub["value"]["content"] = addConstantsToString(
        newSub["value"]["content"],
        subject["value"]["includeVariable"]
      );
      setSubject({ ...newSub });
      // code updated on 16 Nov 2022 for BugId 118114
      let tempRules = [...allRules];
      if (tempRules[selectedRule].status === "ADDED") {
        tempRules[selectedRule].status = "EDITED";
      }
      setAllRules(tempRules);
    }
  };

  const addVarToMsgContent = () => {
    if (msg.value.includeVariable) {
      const newMSG = { ...msg };
      /*  newMSG["value"]["content"] =
        newMSG["value"]["content"] + `&${msg["value"]["includeVariable"]}&`; */
      newMSG["value"]["content"] = addConstantsToString(
        newMSG["value"]["content"],
        msg["value"]["includeVariable"]
      );
      setMsg({ ...newMSG });
      // code updated on 16 Nov 2022 for BugId 118114
      let tempRules = [...allRules];
      if (tempRules[selectedRule].status === "ADDED") {
        tempRules[selectedRule].status = "EDITED";
      }
      setAllRules(tempRules);
    }
  };

  const handleChangeSubAndMsg = (e, fieldType) => {
    const newSub = { ...subject };
    const newMsg = { ...msg };
    const { name, value } = e.target;
    if (fieldType === "Subject") {
      newSub["value"][name] = value;
      if (!value || value.trim() === "") {
        newSub["error"] = true;
        newSub["helperText"] = t("subjectEmptyError");
      }
      // Modified on 21/10/2023, bug_id:135804
      if (value.length > 255) {
        newSub["error"] = true;
        newSub["helperText"] = getIncorrectLenErrMsg("Subject", 255, t);
      }
      //till here for  bug_id:135804
    } else if (fieldType === "Message") {
      newMsg["value"][name] = value;
    }
    setMsg({ ...msg, ...newMsg });
    setSubject({ ...subject, ...newSub });
    // code updated on 16 Nov 2022 for BugId 118114
    let tempRules = [...allRules];
    if (tempRules[selectedRule].status === "ADDED") {
      tempRules[selectedRule].status = "EDITED";
    }
    setAllRules(tempRules);
  };

  // code updated on 16 Nov 2022 for BugId 118114
  const addOrModifyRuleToRules = (ruleVal) => {
    const rule = { ...allRules[selectedRule] };
    let operationObj = (rule.ruleOpList && rule.ruleOpList[0]) || {};
    let isValid = true;
    if (!escalateAfter.value?.param2 || escalateAfter.value?.param2 === "") {
      setEscalateAfter({
        ...escalateAfter,
        error: true,
        helperText: t("escalationDateEmptyError"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      });
      isValid = false;
    }
    let tatObj = {},
      tatError = false;
    if (!TATData.days || TATData.days === "") {
      tatObj = {
        ...tatObj,
        daysError: true,
        daysHelperText: t("daysErrorMsg"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      };
      isValid = false;
      tatError = true;
    }
    if (!TATData.hours || TATData.hours === "") {
      tatObj = {
        ...tatObj,
        hoursError: true,
        hoursHelperText: t("hourErrorMsg"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      };
      isValid = false;
      tatError = true;
    }
    if (!TATData.minutes || TATData.minutes === "") {
      tatObj = {
        ...tatObj,
        minsError: true,
        minsHelperText: t("minutesErrorMsg"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      };
      isValid = false;
      tatError = true;
    }

    let mailObj = {},
      mailError = false;
    if (!mailData.fromInput || mailData.fromInput === "") {
      mailObj = {
        ...mailObj,
        fromError: true,
        fromHelperText: t("fromEmptyError"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      };
      isValid = false;
      mailError = true;
    } else if (
      mailData.fromInput !== "" &&
      mailData.isFromConstant &&
      !validateRegex(mailData.fromInput, PMWEB_REGEX.EmailId) // code added on 16 Nov 2022 for BugId 116598
      //Bug 139021:- Included all the characters of Arabic in EmailID Regex
    ) {
      mailObj = {
        ...mailObj,
        fromError: true,
        fromHelperText: t("emailInvalidFormat"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      };
      isValid = false;
      mailError = true;
    }
    if (!mailData.toInput || mailData.toInput === "") {
      mailObj = {
        ...mailObj,
        toError: true,
        toHelperText: t("toEmptyError"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      };
      isValid = false;
      mailError = true;
    } else if (
      mailData.toInput !== "" &&
      mailData.isToConstant &&
      !validateRegex(mailData.toInput, PMWEB_REGEX.EmailId) // code added on 16 Nov 2022 for BugId 116598
      //Bug 139021:- Included all the characters of Arabic in EmailID Regex
    ) {
      mailObj = {
        ...mailObj,
        toError: true,
        toHelperText: t("emailInvalidFormat"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      };
      isValid = false;
      mailError = true;
    }

    if (!subject.value?.content || subject.value?.content === "") {
      setSubject({
        ...subject,
        error: true,
        helperText: t("subjectEmptyError"), //Added key instead of text// Modified on 21/09/2023, bug_id:137370
      });
      isValid = false;
    }

    if (isValid) {
      operationObj["ruleCalFlag"] = TATData.calendarType || "N";
      operationObj["durationInfo"] = {
        varFieldIdDays: TATData.isDaysConstant
          ? "0"
          : getVariableVarFieldIdByName({
              variables: dropdownOptions,
              name: TATData.days,
            }),
        variableIdSeconds: "0",
        paramSeconds: "0",
        variableIdDays: TATData.isDaysConstant
          ? "0"
          : getVariableIdByName({
              variables: dropdownOptions,
              name: TATData.days,
            }),
        variableIdMinutes: TATData.isMinutesConstant
          ? "0"
          : getVariableIdByName({
              variables: dropdownOptions,
              name: TATData.minutes,
            }),
        variableIdHours: TATData.isHoursConstant
          ? "0"
          : getVariableIdByName({
              variables: dropdownOptions,
              name: TATData.hours,
            }),
        varFieldIdSeconds: "0",
        varFieldIdHours: TATData.isHoursConstant
          ? "0"
          : getVariableVarFieldIdByName({
              variables: dropdownOptions,
              name: TATData.hours,
            }),
        paramDays: TATData.days,
        paramHours: TATData.hours,
        paramMinutes: TATData.minutes,
        varFieldIdMinutes: TATData.isMinutesConstant
          ? "0"
          : getVariableVarFieldIdByName({
              variables: dropdownOptions,
              name: TATData.minutes,
            }),
      };
      operationObj["mailTrigInfo"]["mailInfo"] = {
        varFieldTypeBCC: mailData.isBccConstant
          ? "C"
          : getVariableScopeByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.bccInput,
            }),
        bccConstant: mailData.isBccConstant ? true : false,
        // bccUser: mailData.isBccConstant ? "<Constant>" : mailData.bccInput,
        // bccUser: mailData.isBccConstant ? t("<constant>") : mailData.bccInput,
        bccUser: mailData.bccInput, //Modified on 25/10/2023, bug_id:139944
        /*  toUser: mailData.isToConstant ? "<Constant>" : mailData.toInput,
        toConstant: mailData.isToConstant ? mailData.toInput : false, */
        toUser: mailData.toInput,
        toConstant: mailData.isToConstant ? true : false,
        varFieldTypeTo: mailData.isToConstant
          ? "C"
          : getVariableScopeByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.toInput,
            }),
        varFieldTypeFrom: mailData.isFromConstant
          ? "C"
          : getVariableScopeByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.fromInput,
            }),
        /*  fromConstant: mailData.isFromConstant ? mailData.fromInput : false,
        fromUser: mailData.isFromConstant ? "<Constant>" : mailData.fromInput, */
        fromConstant: mailData.isFromConstant ? true : false,
        fromUser: mailData.fromInput,

        // ccUser: mailData.isCcConstant ? "<Constant>" : mailData.ccInput,
        // ccUser: mailData.isCcConstant ? t("<constant>") : mailData.ccInput,
        ccUser: mailData.ccInput, //Modified on 25/10/2023, bug_id:139944
        ccConstant: mailData.isCcConstant ? true : false,
        varFieldTypeCC: mailData.isCcConstant
          ? "C"
          : getVariableScopeByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.ccInput,
            }),
        subject: encode_utf8(subject.value?.content) || "",
        variableIdPriority: getVariableIdByName({
          variables: localLoadedProcessData?.Variable,
          name: getPriorityNumber(mailData.priorityInput),
        }),
        varFieldTypePriority: getVariableScopeByName({
          variables: localLoadedProcessData?.Variable,
          name: getPriorityNumber(mailData.priorityInput),
        }),
        VarFieldIdBCC: "0",
        varFieldIdTo: "0",
        message: encode_utf8(msg.value?.content) || "",
        priority: getPriorityNumber(mailData.priorityInput),
        varFieldIdCC: "0",
        variableIdBCC: mailData.isBccConstant
          ? "0"
          : getVariableIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.bccInput,
            }),
        varFieldIdFrom: "0",
        variableIdCC: mailData.isCcConstant
          ? "0"
          : getVariableIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.ccInput,
            }),
        variableIdFrom: mailData.isFromConstant
          ? "0"
          : getVariableIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.fromInput,
            }),
        variableIdTo: mailData.isToConstant
          ? "0"
          : getVariableIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.toInput,
            }),
        extObjIDFrom: mailData.isFromConstant
          ? "0"
          : getVariableExtObjectIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.fromInput,
            }),
        extObjIDTo: mailData.isToConstant
          ? "0"
          : getVariableExtObjectIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.toInput,
            }),
        extObjIDCC: mailData.isCcConstant
          ? "0"
          : getVariableExtObjectIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.ccInput,
            }),
        extObjIDBCC: mailData.isBccConstant
          ? "0"
          : getVariableExtObjectIdByName({
              variables: localLoadedProcessData?.Variable,
              name: mailData.bccInput,
            }),
        varFieldIdPriority: "0",
        extObjIDPriority: "0",
      };
      // modified on 27/09/23 for BugId 136677
      // operationObj["param2"] =
      //   escalateAfter.value?.type2 === "C"
      //     ? moment(escalateAfter.value?.param2).format(dateFormat)
      //     : escalateAfter.value?.param2 || "";
      operationObj["param2"] = escalateAfter.value?.param2 || "";
      // till here BugId 136677
      operationObj["type2"] = escalateAfter.value?.type2 || "S";
      operationObj["variableId_2"] = escalateAfter.value?.variableId_2 || "0";
      operationObj["varFieldId_2"] = getVariableVarFieldIdByName({
        variables: localLoadedProcessData?.Variable,
        name: escalateAfter.value?.param2,
      });
      operationObj["extObjID2"] = getVariableExtObjectIdByName({
        variables: localLoadedProcessData?.Variable,
        name: escalateAfter.value?.param2,
      });

      rule.ruleOpList[0] = { ...operationObj };
      setIsRuleBeingCreated(false);
      setSubject({ ...subject, value: { includeVariable: "", content: "" } });
      setMsg({ ...msg, value: { includeVariable: "", content: "" } });

      let newRules = [...allRules];
      newRules[selectedRule] = { ...rule, status: "ADDED" };
      if (ruleVal === "addRule") {
        setSelectedRule(newRules.length - 1);
        handleSelectedRule(newRules.length - 1, newRules);
      } else {
        setSelectedRule(+newRules[selectedRule].ruleId - 1);
        handleSelectedRule(+newRules[selectedRule].ruleId - 1, newRules);
      }

      setAllRules(newRules);
      updateLocalProp(newRules);
    } else {
      if (tatError) {
        setTATData({
          ...TATData,
          ...tatObj,
        });
      }
      if (mailError) {
        setMailData({
          ...mailData,
          ...mailObj,
        });
      }
    }
  };

  // code updated on 16 Nov 2022 for BugId 118114
  const updateLocalProp = (rules) => {
    const newPropObj = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    let ruleArr = rules?.map((rule) => {
      if (rule.status) {
        delete rule.status;
      }
      return rule;
    });
    newPropObj.taskGenPropInfo.m_objTaskRulesListInfo.esRuleList = ruleArr;
    setlocalLoadedActivityPropertyData(newPropObj);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.escalationRules]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  // code updated on 16 Nov 2022 for BugId 118114
  const cancelAddingRuleToRules = () => {
    const newRules = [...allRules];
    if (newRules[selectedRule]?.status === "CREATED") {
      newRules.splice(selectedRule, 1);
      setAllRules(newRules);
      if (newRules.length > 0) {
        setSelectedRule(0);
        handleSelectedRule(0, newRules);
      } else {
        setSelectedRule(null);
      }
      setIsRuleBeingCreated(false);
    } else {
      const taskRules =
        localLoadedActivityPropertyData?.taskGenPropInfo?.m_objTaskRulesListInfo
          ?.esRuleList;
      taskRules?.forEach((rule) => {
        if (+rule.ruleId === +allRules[selectedRule].ruleId) {
          newRules[selectedRule] = { ...rule, status: "ADDED" };
        }
      });
      setAllRules(newRules);
    }
  };

  // code added on 16 Nov 2022 for BugId 118114
  const deleteRules = () => {
    const newRules = [...allRules];
    newRules.splice(selectedRule, 1);
    setAllRules(newRules);
    if (newRules.length > 0) {
      setSelectedRule(0);
      handleSelectedRule(0, newRules);
    } else {
      setSelectedRule(null);
    }
    updateLocalProp(newRules);
  };

  const onChangeMailData = (name, value) => {
    setMailData((prev) => {
      let newData = { ...prev };
      newData[name] = typeof value === "object" ? value?.VariableName : value;
      return newData;
    });
    // code updated on 16 Nov 2022 for BugId 118114
    let tempRules = [...allRules];
    if (tempRules[selectedRule].status === "ADDED") {
      tempRules[selectedRule].status = "EDITED";
    }
    setAllRules(tempRules);
  };

  const onChangeTATData = (name, value, isConstant) => {
    if (isConstant) {
      if (value !== "" && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
        value = 0;
        dispatch(
          setToastDataFunc({
            message: t("charMsg"), //Modified on 11/10/2023, bug_id:137371
            severity: "error",
            open: true,
          })
        );
      }
    }
    setTATData((prev) => {
      let newData = { ...prev };
      if (name === "calendarType") {
        newData[name] = value;
      } else {
        newData[name] = !isConstant ? value?.VariableName : value;
        if (name === "days") {
          newData["isDaysConstant"] = isConstant;
        } else if (name === "hours") {
          newData["isHoursConstant"] = isConstant;
        } else if (name === "minutes") {
          newData["isMinutesConstant"] = isConstant;
        }
      }
      return newData;
    });
    // code updated on 16 Nov 2022 for BugId 118114
    let tempRules = [...allRules];
    if (tempRules[selectedRule].status === "ADDED") {
      tempRules[selectedRule].status = "EDITED";
    }
    setAllRules(tempRules);
  };

  const onChangeEscalateAfter = (name, value) => {
    if (typeof value === "object") {
      const newVal = {
        ...escalateAfter.value,
        param2: value.VariableName,
        type2: "S",
        variableId_2:
          getVariableIdByName({
            variables: allDateTypeVars,
            name: value.VariableName,
          }) || "0",
      };
      setEscalateAfter({ ...escalateAfter, value: newVal });
    } else {
      if (name === "EscalateAfter") {
        const newVal = {
          ...escalateAfter.value,
          param2: value,
          type2: "C",
          variableId_2: "0",
        };
        setEscalateAfter({ ...escalateAfter, value: newVal });
      }
    }
    // code updated on 16 Nov 2022 for BugId 118114
    let tempRules = [...allRules];
    if (tempRules[selectedRule].status === "ADDED") {
      tempRules[selectedRule].status = "EDITED";
    }
    setAllRules(tempRules);
  };

  // code updated on 16 Nov 2022 for BugId 118114
  const getVarsOptionsForMails = () => {
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
    localLoadedProcessData?.Variable?.forEach((element) => {
      if (
        +element.VariableType === 10 &&
        (element.VariableScope === "M" ||
          element.VariableScope === "U" ||
          element.VariableScope === "I")
      ) {
        variableWithConstants.push(element);
      }
    });

    return variableWithConstants;
  };

  // code added on 16 Nov 2022 for BugId 118114
  const getSubjectMsgOptions = () => {
    let variableWithConstants = [];
    localLoadedProcessData?.DynamicConstant?.forEach((element) => {
      let tempObj = {
        name: element.ConstantName,
        value: element.ConstantName,
      };
      variableWithConstants.push(tempObj);
    });
    localLoadedProcessData?.Variable?.forEach((element) => {
      //if (+element.VariableType === 10) {
      if (element.VariableScope == "M" || element.VariableScope == "U") {
        variableWithConstants.push({
          name: element.VariableName,
          value: element.VariableName,
        });
      }
    });
    return variableWithConstants;
  };

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <Grid container direction="column">
        <Grid item>
          <div style={{ width: "100%", height: "100%" }}>
            <hr style={{ opacity: "0.5", width: "100%" }} />
            {spinner ? (
              <CircularProgress
                style={{ marginTop: "30vh", marginInlineStart: "40%" }}
              />
            ) : allRules.length > 0 ? (
              <div
                className={classes.mainDiv}
                style={{
                  flexDirection: props.isDrawerExpanded ? "row" : "column",
                  direction: direction == RTL_DIRECTION ? "rtl" : "ltr",
                }}
              >
                <div
                  style={{
                    margin: "0 0.75vw",
                    height: "100%",
                    width: props.isDrawerExpanded ? "24%" : null,
                    padding: props.isDrawerExpanded ? "0.5rem 0" : "0.25rem 0",
                  }}
                >
                  <Grid container direction="column" spacing={2}>
                    <Grid item>
                      <Grid container style={{ alignItems: "center" }}>
                        <Grid item>
                          <Typography className={styles.noRuleDefined}>
                            {rulesCount === 0
                              ? t("no") + SPACE + t("rulesAreDefined")
                              : rulesCount === 1
                              ? rulesCount + SPACE + t("ruleIsDefined")
                              : rulesCount + SPACE + t("rulesAreDefined")}
                          </Typography>
                        </Grid>
                        {!isReadOnly && !isRuleBeingCreated ? (
                          <Grid item style={{ marginInlineStart: "auto" }}>
                            <Button
                              className="secondary"
                              onClick={addNewRule}
                              disabled={
                                isRuleBeingCreated ||
                                allRules[selectedRule]?.status === "EDITED"
                              }
                              id="pmweb_taskEscalationrule_addnewrule_button"
                            >
                              {`${t("addRule")}`}
                            </Button>
                          </Grid>
                        ) : null}
                      </Grid>
                    </Grid>
                    {allRules?.map((rule, index) => (
                      <div
                        className={
                          selectedRule === index
                            ? styles.selectedListItem
                            : styles.listItem
                        }
                        onClick={() => {
                          //Modified on 27/09/2023, bug_id:137340
                          if (!isRuleBeingCreated) {
                            setSelectedRule(index);
                            handleSelectedRule(index, allRules);
                          }
                          //till here for bug id:137340
                          /* setSelectedRule(index);
                            handleSelectedRule(index, allRules);*/
                        }}
                        id={`taskEscalation_listItem${index}`}
                      >
                        <Typography
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            direction: "ltr",
                            textAlign:
                              direction === RTL_DIRECTION ? "right" : "left",
                          }}
                        >
                          {rule.status === "CREATED" ? (
                            t("newRule")
                          ) : (
                            <>
                              <span
                                style={{
                                  fontSize: "var(--base_text_font_size)",
                                }}
                              >
                                ESCALATE TO WITH TRIGGER After
                              </span>{" "}
                              <span className={classes.bold}>
                                {rule.ruleOpList
                                  ? rule.ruleOpList[0]?.type2 === "C"
                                    ? // modified on 27/09/23 for BugId 136677
                                      // moment(rule.ruleOpList[0]?.param2).format(
                                      //   dateFormat
                                      // )
                                      convertToArabicDate(
                                        rule.ruleOpList[0]?.param2
                                      )
                                    : // till here BugId 136677
                                      rule.ruleOpList[0]?.param2 || null
                                  : null}
                              </span>{" "}
                              <span className={classes.bold}>
                                + '
                                {`${
                                  (rule.ruleOpList &&
                                    rule.ruleOpList[0]?.durationInfo
                                      ?.paramDays) ||
                                  0
                                }`}
                                'Day(s)
                              </span>
                              <span className={classes.bold}>
                                + '
                                {`${
                                  (rule.ruleOpList &&
                                    rule.ruleOpList[0]?.durationInfo
                                      ?.paramHours) ||
                                  0
                                }`}
                                'Hr(s)
                              </span>
                              <span className={classes.bold}>
                                + '
                                {`${
                                  (rule.ruleOpList &&
                                    rule.ruleOpList[0]?.durationInfo
                                      ?.paramMinutes) ||
                                  0
                                }`}
                                'Min(s)
                              </span>{" "}
                              <span className={classes.bold}>
                                {rule.ruleOpList &&
                                rule.ruleOpList[0]?.ruleCalFlag === "Y"
                                  ? "Working Day(s)"
                                  : "Calender Day(s)"}
                              </span>
                            </>
                          )}
                        </Typography>
                      </div>
                    ))}
                  </Grid>
                </div>
                <Divider orientation="vertical" flexItem fullWidth />
                {selectedRule !== null && props.isDrawerExpanded && (
                  <div
                    style={{
                      margin: "0",
                      marginInlineStart: "0.75vw",
                      marginInlineEnd: "0.5vw",
                      width: props.isDrawerExpanded ? "73%" : null,
                      height: "100%",
                      padding: props.isDrawerExpanded
                        ? "0.5rem 0"
                        : "0.25rem 0",
                    }}
                  >
                    <Grid
                      container
                      spacing={2}
                      style={{ height: "100%", overflow: "auto" }}
                    >
                      <Grid
                        item
                        container
                        style={{ alignItems: "center", paddingBottom: "0" }}
                      >
                        <Grid item>
                          <Typography
                            component="h5"
                            className={classes.GroupTitleSecondary}
                          >
                            {`${t("escalation")} ${t("details")}`}
                          </Typography>
                        </Grid>
                        {!isReadOnly && (
                          <Grid item style={{ marginInlineStart: "auto" }}>
                            {allRules[selectedRule].status === "ADDED" ? (
                              <Button
                                className={styles.deleteButton}
                                onClick={() => deleteRules()}
                                style={{
                                  margin:
                                    "var(--spacing_v) var(--spacing_h) 0 0rem !important",
                                }}
                                id="pmweb_taskEscalationrule_deleterule_button"
                              >
                                {`${t("delete")}`}
                              </Button>
                            ) : (
                              <>
                                <Button
                                  className="secondary"
                                  onClick={() => cancelAddingRuleToRules()}
                                  style={{
                                    margin:
                                      "var(--spacing_v) var(--spacing_h) 0 0rem !important",
                                  }}
                                  id="pmweb_taskEscalationrule_cancelrule_button"
                                >
                                  {t("cancel")}
                                </Button>
                                <Button
                                  className="primary"
                                  onClick={() =>
                                    addOrModifyRuleToRules(
                                      allRules[selectedRule].status !==
                                        "CREATED"
                                        ? "modifyRule"
                                        : "addRule"
                                    )
                                  }
                                  style={{
                                    margin:
                                      "var(--spacing_v) var(--spacing_h) 0 0rem !important",
                                  }}
                                  id="pmweb_taskEscalationrule_modifyOrAddnewrule_button"
                                  disabled={subject.error} // Modified on 21/10/2023, bug_id:135804
                                >
                                  {`${t(
                                    allRules[selectedRule].status !== "CREATED"
                                      ? "modifyRule"
                                      : "addRule"
                                  )}`}
                                </Button>
                              </>
                            )}
                          </Grid>
                        )}
                      </Grid>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "1vw",
                          // alignItems: "end",
                          width: "100%",
                          padding: "1rem 0.75vw",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75vw",
                            alignItems: "center",
                            flex: smallScreen ? 2 : 1,
                          }}
                        >
                          <div style={{ flex: "9" }}>
                            <Field
                              selectCombo={true}
                              name="EscalateAfter"
                              type={
                                escalateAfter.value?.type2 === "C"
                                  ? "date"
                                  : null
                              }
                              label={`${t("escalate")} ${t("after")}`}
                              value={escalateAfter.value?.param2}
                              id="pmweb_taskEscalationrule_EscalateAfter_field"
                              onChange={onChangeEscalateAfter}
                              dropdownOptions={allDateTypeVars}
                              optionKey="value"
                              setIsConstant={(val) => {
                                onChangeEscalateAfter(
                                  "isEscalateAfterConstant",
                                  val
                                );
                              }}
                              setValue={(val) => {
                                onChangeEscalateAfter("EscalateAfter", val);
                              }}
                              format={localLoadedProcessData?.DateFormat}
                              isConstant={escalateAfter.value?.type2 === "C"}
                              showEmptyString={false}
                              showConstValue={true}
                              inputClass={
                                styles["selectWithInputTextField_WS"] || ""
                              }
                              constantInputClass={
                                styles[
                                  direction === RTL_DIRECTION
                                    ? "multiSelectConstInput_WS_Arabic"
                                    : "multiSelectConstInput_WS"
                                ] || ""
                              }
                              selectWithInput={styles["selectWithInput_WS"]}
                              disabled={isReadOnly}
                              error={escalateAfter.error}
                              helperText={escalateAfter.helperText}
                            />
                          </div>
                          <div style={{ flex: "0.5" }}>
                            <Typography
                              style={{ fontSize: "16px", marginTop: "10px" }}
                            >
                              +
                            </Typography>
                          </div>
                        </div>
                        <div style={{ flex: "4" }}>
                          <TurnAroundTime
                            selectCombo={true}
                            stopOnBlur={true}
                            days={TATData.days}
                            hours={TATData.hours}
                            minutes={TATData.minutes}
                            calendarType={TATData.calendarType}
                            isDaysConstant={TATData.isDaysConstant}
                            isMinutesConstant={TATData.isMinutesConstant}
                            isHoursConstant={TATData.isHoursConstant}
                            handleChange={onChangeTATData}
                            calendarTypeLabel={t("Calendar Type")}
                            inputClass={
                              styles["selectWithInputTextField_WS"] || ""
                            }
                            selectWithInput={styles["selectWithInput_WS"]}
                            disabled={isReadOnly}
                            dropdownOptions={dropdownOptions}
                            hoursError={TATData.hoursError}
                            hoursHelperText={TATData.hoursHelperText}
                            daysError={TATData.daysError}
                            daysHelperText={TATData.daysHelperText}
                            minsError={TATData.minsError}
                            minsHelperText={TATData.minsHelperText}
                          />
                        </div>
                      </div>
                      <Grid
                        container
                        style={{
                          padding: "0.5rem 0.75vw",
                        }}
                      >
                        <Typography
                          component="h5"
                          className={classes.GroupTitleSecondary}
                        >
                          {`${t("MAIL")} ${t("Template")}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={props.isDrawerExpanded ? 12 : 12}>
                        <Grid
                          container
                          direction={props.isDrawerExpanded ? "row" : "column"}
                          spacing={props.isDrawerExpanded ? 2 : 1}
                          alignItems={
                            props.isDrawerExpanded ? "flex-end" : null
                          }
                        >
                          <Grid
                            item
                            xs={props.isDrawerExpanded ? 4 : 12}
                            style={{ padding: "0.75rem 0.75vw" }}
                          >
                            <Field
                              selectCombo={true}
                              label={`${t("from")}`}
                              dropdownOptions={getVarsOptionsForMails()}
                              optionKey="VariableName"
                              id="pmweb_taskEscalationrule_from_selectcombo"
                              setIsConstant={(val) => {
                                onChangeMailData("isFromConstant", val);
                              }}
                              setValue={(val) => {
                                onChangeMailData("fromInput", val);
                              }}
                              value={mailData.fromInput}
                              isConstant={mailData.isFromConstant}
                              showEmptyString={false}
                              showConstValue={true}
                              disabled={isReadOnly}
                              inputClass={
                                styles["selectWithInputTextField_WS"] || ""
                              }
                              constantInputClass={
                                styles["multiSelectConstInput_WS"] || ""
                              }
                              selectWithInput={styles["selectWithInput_WS"]}
                              required={true}
                              error={mailData.fromError}
                              helperText={mailData.fromHelperText}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={props.isDrawerExpanded ? 4 : 12}
                            style={{ padding: "0.75rem 0.75vw" }}
                          >
                            <Field
                              selectCombo={true}
                              label={`${t("to")}`}
                              dropdownOptions={getVarsOptionsForMails()}
                              id="pmweb_taskEscalationrule_to_selectcombo_filed"
                              optionKey="VariableName"
                              setIsConstant={(val) => {
                                onChangeMailData("isToConstant", val);
                              }}
                              setValue={(val) => {
                                onChangeMailData("toInput", val);
                              }}
                              value={mailData.toInput}
                              isConstant={mailData.isToConstant}
                              showEmptyString={false}
                              showConstValue={true}
                              disabled={isReadOnly}
                              inputClass={
                                styles["selectWithInputTextField_WS"] || ""
                              }
                              constantInputClass={
                                styles["multiSelectConstInput_WS"] || ""
                              }
                              selectWithInput={styles["selectWithInput_WS"]}
                              required={true}
                              error={mailData.toError}
                              helperText={mailData.toHelperText}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={props.isDrawerExpanded ? 4 : 12}
                            style={{ padding: "0.75rem 0.75vw" }}
                          >
                            <Field
                              selectCombo={true}
                              dropdownOptions={getVarsOptionsForMails()}
                              optionKey="VariableName"
                              label={`${t("CC")}`}
                              id="pmweb_TaskEscalationrules_cc_selectcombo_field"
                              setIsConstant={(val) => {
                                onChangeMailData("isCcConstant", val);
                              }}
                              setValue={(val) => {
                                onChangeMailData("ccInput", val);
                              }}
                              value={mailData.ccInput}
                              isConstant={mailData.isCcConstant}
                              showConstValue={true}
                              inputClass={
                                styles["selectWithInputTextField_WS"] || ""
                              }
                              constantInputClass={
                                styles["multiSelectConstInput_WS"] || ""
                              }
                              selectWithInput={styles["selectWithInput_WS"]}
                              disabled={isReadOnly}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={props.isDrawerExpanded ? 4 : 12}
                            style={{ padding: "0.75rem 0.75vw" }}
                          >
                            <Field
                              selectCombo={true}
                              dropdownOptions={getVarsOptionsForMails()}
                              optionKey="VariableName"
                              label={`${t("BCC")}`}
                              id="pmweb_TaskEscalationrules_bcc_selectcombo_field"
                              setIsConstant={(val) => {
                                onChangeMailData("isBccConstant", val);
                              }}
                              setValue={(val) => {
                                onChangeMailData("bccInput", val);
                              }}
                              value={mailData.bccInput}
                              isConstant={mailData.isBccConstant}
                              showConstValue={true}
                              inputClass={
                                styles["selectWithInputTextField_WS"] || ""
                              }
                              constantInputClass={
                                styles["multiSelectConstInput_WS"] || ""
                              }
                              selectWithInput={styles["selectWithInput_WS"]}
                              disabled={isReadOnly}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={props.isDrawerExpanded ? 4 : 12}
                            style={{ padding: "0.75rem 0.75vw" }}
                          >
                            <Field
                              selectCombo={true}
                              label={`${t("Priority")}`}
                              dropdownOptions={priorityOpt}
                              setValue={(val) => {
                                onChangeMailData("priorityInput", val);
                              }}
                              value={mailData.priorityInput}
                              showConstValue={false}
                              id="priority_select_input"
                              inputClass={
                                styles[
                                  "selectWithInputTextField_WS_Expanded"
                                ] || ""
                              }
                              constantInputClass={
                                styles["multiSelectConstInput_WS_Expanded"] ||
                                ""
                              }
                              selectWithInput={
                                styles["selectWithInput_WS_Expanded"]
                              }
                              disabled={isReadOnly}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        style={{
                          padding: "0.75rem 0.75vw 0.25rem",
                        }}
                      >
                        <Typography component="h5" className={classes.bold}>
                          {`${t("Subject")}`}{" "}
                          <span style={{ color: "#b52a2a" }}>*</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={props.isDrawerExpanded ? 9 : 12}>
                        <Grid
                          container
                          direction={props.isDrawerExpanded ? "row" : "column"}
                          spacing={props.isDrawerExpanded ? 2 : 1}
                          alignItems={props.isDrawerExpanded ? "center" : null}
                        >
                          <Grid
                            item
                            container
                            spacing={1}
                            alignItems="center"
                            xs={props.isDrawerExpanded ? 8 : 12}
                            style={{ padding: "0.25rem 0.75vw 0 0.75vw" }}
                          >
                            <Grid item xs={props.isDrawerExpanded ? 8 : 10}>
                              <Field
                                //Bug 124387 [01-03-2023] Added minHeight and height
                                minHeight="var(--line_height)"
                                height="auto"
                                dropdown={true}
                                name="includeVariable"
                                label={`${t("includeVariable")}`}
                                value={subject.value.includeVariable}
                                onChange={(e) =>
                                  handleChangeSubAndMsg(e, "Subject")
                                }
                                id="pmweb_TaskEscalationrules_includevariable_dropdownfield"
                                options={getSubjectMsgOptions()}
                                disabled={isReadOnly}
                              />
                            </Grid>
                            <Grid item xs={2} style={{ marginTop: "12px" }}>
                              <Button
                                className="secondary"
                                onClick={() => addVarToSubContent()}
                                disabled={isReadOnly}
                                id="pmweb_TaskEscalationrules_addvartoSubcontent_Button"
                              >
                                {t("add")}
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            xs={props.isDrawerExpanded ? 11 : 12}
                            style={{ padding: "0 0.75vw 0.5rem 0.75vw" }}
                          >
                            <Field
                              name="content"
                              label={`${t("Content")}`}
                              value={decode_utf8(subject.value.content)}
                              multiline={false}
                              onChange={(e) =>
                                handleChangeSubAndMsg(e, "Subject")
                              }
                              id="pmweb_TaskEscalationrules_content_field"
                              disabled={isReadOnly}
                              error={subject.error}
                              helperText={subject.helperText}
                              inputRef={triggerSubRef} // Added on 21/10/2023, bug_id:135804
                              onKeyPress={(e) =>
                                FieldValidations(
                                  e,
                                  250,
                                  triggerSubRef.current,
                                  255
                                )
                              } // Added on 21/10/2023, bug_id:135804
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        style={{
                          padding: "0.75rem 0.75vw 0.25rem",
                        }}
                      >
                        <Typography component="h5" className={classes.bold}>
                          {`${t("message")}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={props.isDrawerExpanded ? 9 : 12}>
                        <Grid
                          container
                          direction={props.isDrawerExpanded ? "row" : "column"}
                          spacing={props.isDrawerExpanded ? 2 : 1}
                          alignItems={props.isDrawerExpanded ? "center" : null}
                        >
                          <Grid
                            item
                            container
                            spacing={1}
                            alignItems="center"
                            xs={props.isDrawerExpanded ? 8 : 12}
                            style={{ padding: "0.25rem 0.75vw 0 0.75vw" }}
                          >
                            <Grid item xs={props.isDrawerExpanded ? 8 : 10}>
                              <Field
                                //Bug 124387 [01-03-2023] Added minHeight and height
                                minHeight="var(--line_height)"
                                height="auto"
                                dropdown={true}
                                name="includeVariable"
                                label={`${t("includeVariable")}`}
                                value={msg.value.includeVariable}
                                onChange={(e) =>
                                  handleChangeSubAndMsg(e, "Message")
                                }
                                options={getSubjectMsgOptions()}
                                disabled={isReadOnly}
                                id="pmweb_TaskEscalationrules_includevariable_field"
                              />
                            </Grid>
                            <Grid item xs={2} style={{ marginTop: "12px" }}>
                              <Button
                                className="secondary"
                                onClick={() => addVarToMsgContent()}
                                disabled={isReadOnly}
                                id="pmweb_TaskEscalationrules_add_button"
                              >
                                {t("add")}
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            xs={props.isDrawerExpanded ? 11 : 12}
                            style={{ padding: "0 0.75vw 0.5rem 0.75vw" }}
                          >
                            <Field
                              name="content"
                              label={`${t("Content")}`}
                              value={decode_utf8(msg.value.content)}
                              multiline={true}
                              onChange={(e) =>
                                handleChangeSubAndMsg(e, "Message")
                              }
                              disabled={isReadOnly}
                              id="pmweb_taskescalationrule_content_field"
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noRulesDiv}>
                <NoRulesScreen isReadOnly={isReadOnly} />
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    id="AR_Add_Rule_Locally"
                    className={styles.addRuleLocallyButton}
                    style={{ display: isReadOnly ? "none" : "" }}
                    onClick={addNewRule}
                  >
                    {t("addRule")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Grid>
      </Grid>
    </>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreatorsDrawer.expandDrawer(flag)),
  };
};

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskEscalationRules);
