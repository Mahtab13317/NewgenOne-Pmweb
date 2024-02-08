// #BugID - 121817
// #BugDescription - Handled the function to select the reassign action user.
// #BugID - 122426
// #BugDescription - Handled multiple key and function to save the task.
// #BugID - 122156
// #BugDescription - Never expiry case changes done.

import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@material-ui/core";
import "./index.css";
import { useTranslation } from "react-i18next";
import { connect, useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { store, useGlobalState } from "state-pool";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  DATE_VARIABLE_TYPE,
  RTL_DIRECTION,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants.js";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import Field from "../../../../UI/InputFields/TextField/Field.js";
import TurnAroundTime from "../../../../UI/InputFields/TurnAroundTime/TurnAroundTime.js";
import { OpenProcessSliceValue } from "../../../../redux-store/slices/OpenProcessSlice";
import { getVariableBasedOnScopeAndTypes } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { getVariableIdByName } from "./../../../../utility/CommonFunctionCall/CommonFunctionCall";
import TabsHeading from "../../../../UI/TabsHeading";
import { isProcessDeployedFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

const makeFieldInputs = (value) => {
  return {
    value: value,
    error: false,
    helperText: "",
    isConstant: false,
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
    color: "red",
    fontSize: "11px",
  },
  mainDiv: {
    overflowY: "auto",
    /* code edited on 6 July 2023 for issue - save and 
    discard button hide issue in case of tablet(landscape mode)*/
    height: (props) =>
      `calc((${props.windowInnerHeight}px - ${headerHeight}) - 12rem)`,
    fontFamily: "var(--font_family)",
    width: "100%",
    //  paddingTop: props.isDrawerExpanded ? "0" : "0.4rem",
    direction: props.direction,
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: "0.313rem",
    },

    "&:hover::-webkit-scrollbar": {
      overflowY: "visible",
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
  disabled: {
    pointerEvents: "none",
    opacity: 0.5,
  },
}));

function TaskOptions(props) {
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
  const localActivityPropertyData = store.getState("activityPropertyData");
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const openProcessData = useSelector(OpenProcessSliceValue);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);

  const [spinner, setspinner] = useState(true);
  const [expiresOn, setExpiresOn] = useState(makeFieldInputs(""));
  const [operator, setOperator] = useState(makeFieldInputs(""));

  const [trigger, setTrigger] = useState(makeFieldInputs(""));
  const [expiryType, setExpiryType] = useState("");
  const [actionType, setActionType] = useState("1");
  const [allDateTypeVars, setDateTypeVars] = useState([]);
  const [triggersList, setTriggersList] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  let isReadOnly =
    props.openTemplateFlag ||
    isProcessDeployedFunc(localLoadedProcessData) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;
  const [reassignDropValues, setReassignDropValues] = useState(null);
  const [isConstAction, setisConstAction] = useState(false);
  const [actionVal, setActionVal] = useState("");
  const [actErr, setActErr] = useState({
    error: false,
    helperText: "",
  });
  const [TATData, setTATData] = useState({
    days: "",
    hours: "",
    minutes: "",
    calendarType: "Y",
    isDaysConstant: false,
    isHoursConstant: false,
    isMinutesConstant: false,
    variableId_Days: "0",
    variableId_Hours: "0",
    variableId_Minutes: "0",
    error: {},
  });

  const radioButtonsArrayForExpiresOn = [
    { label: t("neverExpires"), value: "1" },
    { label: t("expires"), value: "2" },
  ];

  const radioButtonsArrayForAction = [
    { label: t("revoke"), value: "1" },
    { label: t("reassignTo"), value: "2" },
  ];

  useEffect(() => {
    if (saveCancelStatus.SaveOnceClicked) {
      const isValid = checkValidation();
      if (isValid) {
        setActErr({
          error: false,
          helperText: "",
        });
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.taskOptions]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      } else {
        setActErr({
          error: true,
          helperText: t("emptyActionMsg"), //Modified on 23/09/2023, bug_id:137351
          // helperText: "Action can't be empty.",
        });
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  // Function that runs when the component loads.
  useEffect(() => {
    if (openProcessData.loadedData) {
      let temp = JSON.parse(JSON.stringify(openProcessData.loadedData));
      let triggerList = [];
      temp?.TriggerList?.forEach((element) => {
        triggerList.push({
          name: element.TriggerName,
          value: element.TriggerId,
        });
      });
      setTriggersList(triggerList);
    }
  }, [openProcessData.loadedData]);

  useEffect(() => {
    if (localLoadedActivityPropertyData) {
      const optionObj =
        localLoadedActivityPropertyData.taskGenPropInfo?.m_objOptionsView
          ?.m_objOptionInfo || {};
      const expiryInfoObj = optionObj?.expiryInfo || {};
      const expiryTypeOperation = expiryInfoObj?.expFlag || "";

      setExpiryType(expiryTypeOperation ? "2" : "1");
      setExpiresOn({
        ...expiresOn,
        value: expiryInfoObj?.holdTillVar || "",
      });
      setOperator({
        ...operator,
        value: expiryInfoObj?.expiryOperator || "",
      });

      setTrigger({ ...trigger, value: expiryInfoObj?.triggerId || "" });

      const newTurnAroundValues = {
        ...TATData,
        days: expiryInfoObj?.wfDays,
        hours: expiryInfoObj?.wfHours,
        minutes: expiryInfoObj?.wfMinutes,
        calendarType: expiryInfoObj?.expCalFlag,
        isDaysConstant: expiryInfoObj && expiryInfoObj.variableId_Days === "0",
        isHoursConstant:
          expiryInfoObj && expiryInfoObj.variableId_Hours === "0",
        isMinutesConstant:
          expiryInfoObj && expiryInfoObj.variableId_Minutes === "0",
        variableId_Days: expiryInfoObj?.variableId_Days || "0",
        variableId_Hours: expiryInfoObj?.variableId_Hours || "0",
        variableId_Minutes: expiryInfoObj?.variableId_Minutes || "0",
      };

      setTATData(newTurnAroundValues);

      setActionType(expiryInfoObj?.expiryOperation || "1");
      if (expiryInfoObj?.expiryOperation === "2") {
        if (expiryInfoObj?.m_bUserConst) {
          setActionVal(expiryInfoObj?.m_strUserConst);
          setisConstAction(true);
        } else {
          setActionVal(expiryInfoObj?.userValue);
          setisConstAction(false);
        }
      }

      const isValid = checkValidation();
      if (!isValid) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.taskOptions]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      }

      setspinner(false);
    }

    let temp = getVariableBasedOnScopeAndTypes({
      scopes: ["U", "I"],
      types: [10],
      variables: localLoadedProcessData?.Variable,
    });

    setReassignDropValues([
      ...temp,
      {
        VarFieldId: "0",
        VariableId: "0",
        VariableName: "Case Manager",
        varType: "M", //Modified on 08/09/2023, bug_id:135885
      },
      {
        VarFieldId: "0",
        VariableId: "0",
        VariableName: "Task Initiator", //Modified on 08/09/2023, bug_id:135885
        varType: "I",
      },
    ]);
  }, [localLoadedActivityPropertyData]);

  const checkValidation = () => {
    if (
      localLoadedActivityPropertyData?.taskGenPropInfo?.m_objOptionsView
        ?.m_objOptionInfo?.expiryInfo?.m_bUserConst
    ) {
      if (
        !localLoadedActivityPropertyData?.taskGenPropInfo?.m_objOptionsView
          ?.m_objOptionInfo?.expiryInfo?.m_strUserConst ||
        localLoadedActivityPropertyData?.taskGenPropInfo?.m_objOptionsView?.m_objOptionInfo?.expiryInfo?.m_strUserConst?.trim() ===
          ""
      ) {
        return false;
      }
    }
    return true;
  };

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

  useEffect(() => {
    if (localLoadedProcessData?.Variable) {
      let dateVars = localLoadedProcessData.Variable.filter(
        (variable) => +variable.VariableType === DATE_VARIABLE_TYPE
      );

      dateVars = dateVars.map((variable) => ({
        name: getDisplayNameForSysDefVars(variable.VariableName),
        value: variable.VariableName,
      }));
      const hardCodeVars = [
        { name: "Task Due Date", value: "TaskDueDate" },
        { name: "Task Initiation Date Time", value: "TaskEntryDateTime" },
      ];
      setDateTypeVars([...dateVars, ...hardCodeVars]);
    }
  }, [localLoadedProcessData?.Variable]);

  useEffect(() => {
    if (localLoadedProcessData) {
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
        if (
          +element.VariableType === 3 &&
          (element.VariableScope === "U" || element.VariableScope === "I")
        ) {
          variableWithConstants.push(element);
        }
      });
      setDropdownOptions(variableWithConstants);
    }
  }, [localLoadedProcessData]);

  useEffect(() => {
    const tempPropData = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    /*  if (
      tempPropData?.taskGenPropInfo?.m_objOptionsView?.m_objOptionInfo
        ?.expiryInfo?.variableId
    ) {
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
        "0";
    } */
    if (
      tempPropData?.taskGenPropInfo?.m_objOptionsView?.m_objOptionInfo
        ?.expiryInfo?.variableId === null
    ) {
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
        "0";
    }

    setlocalLoadedActivityPropertyData(tempPropData);
  }, []);

  const handleChange = (e) => {
    // const tempPropData =  { ...localLoadedActivityPropertyData };
    const tempPropData = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo =
      localLoadedActivityPropertyData?.taskGenPropInfo?.m_objOptionsView
        ?.m_objOptionInfo?.expiryInfo
        ? {
            ...localLoadedActivityPropertyData.taskGenPropInfo.m_objOptionsView
              .m_objOptionInfo.expiryInfo,
          }
        : {};

    const { name, value } = e.target;
    switch (name) {
      case "ExpiresOn":
        tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.holdTillVar =
          value;
        if (value === "ValidTillDateTime") {
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.expiryOperator =
            "12";
        }
        if (
          expiresOn.value === "ValidTillDateTime" &&
          value != "ValidTillDateTime"
        ) {
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.expiryOperator =
            "11";
        }
        break;
      case "Operator":
        tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.expiryOperator =
          value;

        break;
      case "Trigger":
        tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.triggerId =
          value;
        break;
      case "ExpiryType":
        /* code edited on 6 Jan 2023 for BugId 121805 */
        if (value == "1") {
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo =
            null;
        } else {
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo =
            {
              expFlag: true,
              expiryOperator: "11",
              holdTillVar: allDateTypeVars[0].value,
              wfDays: 0,
              wfHours: 0,
              wfMinutes: 0,
              expCalFlag: "Y",
              isDaysConstant: true,
              isHoursConstant: true,
              isMinutesConstant: true,
              variableId_Days: "0",
              variableId_Hours: "0",
              variableId_Minutes: "0",
            };
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_bUserConst = false;
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userType =
            "V";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userValue =
            "";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
            "0";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.operationType =
            "1";
        }
        setExpiryType(value);
        break;
      case "ActionType":
        tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.expiryOperation =
          value;
        if (value === "2") {
          // Code added to solve Bug 127416 and Bug 127415 dated 23rdMay
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_bUserConst = true;
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.expiryOpType =
            "Reassign";
        } else {
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.expiryOperation =
            "1";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.expiryOpType =
            "Revoke";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_SelectedUser =
            "";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userValue =
            "";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
            "0";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_strUserConst =
            "";
          tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_bUserConst = false;
          setActionVal("");
          setActErr({ error: false, helperText: "" });
        }
        break;

      default:
        break;
    }

    setlocalLoadedActivityPropertyData(tempPropData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskOptions]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const onChangeTATData = (name, value, isConstant) => {
    let newData = { ...TATData };

    if (name === "hours") {
      if (!isConstant) {
        newData["variableId_Hours"] = value?.VariableId;
        newData["hours"] = value?.VariableName;
      } else {
        newData["variableId_Hours"] = "0";
        newData["hours"] = value;
      }
    } else if (name === "minutes") {
      if (!isConstant) {
        newData["variableId_Minutes"] = value?.VariableId;
        newData["minutes"] = value?.VariableName;
      } else {
        newData["variableId_Minutes"] = "0";
        newData["minutes"] = value;
      }
    } else if (name === "days") {
      if (!isConstant) {
        newData["variableId_Days"] = value?.VariableId;
        newData["days"] = value?.VariableName;
      } else {
        newData["variableId_Days"] = "0";
        newData["days"] = value;
      }
    } else if (name === "CalendarType") {
      newData[name] = value;
    }
    const tempPropData = { ...localLoadedActivityPropertyData };
    const expiryInfoObj =
      localLoadedActivityPropertyData.taskGenPropInfo?.m_objOptionsView
        ?.m_objOptionInfo?.expiryInfo || {};
    tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo = {
      ...expiryInfoObj,
      wfDays: newData["days"],
      wfHours: newData["hours"],
      wfMinutes: newData["minutes"],
      expCalFlag: newData.calendarType,
      variableId_Days: newData?.variableId_Days,
      variableId_Hours: newData?.variableId_Hours,
      variableId_Minutes: newData?.variableId_Minutes,
    };

    setlocalLoadedActivityPropertyData(tempPropData);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskOptions]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const actionChange = (val, isConst) => {
    const tempPropData = { ...localLoadedActivityPropertyData };
    if (isConst) {
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_strUserConst =
        val?.trim();
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_SelectedUser =
        "<None>";
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_bUserConst = true;
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userValue =
        val?.trim();
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userType =
        "C";
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
        "0";
    } else {
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_strUserConst =
        "";
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_SelectedUser =
        "";
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.m_bUserConst = false;
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userValue =
        val.VariableName;
      //Modified on 07/09/2023, bug_id:135885
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userType =
        val?.varType ? val?.varType : "V";
      //till here for bug_id:135885
      /* tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.userType =
        "V"; */
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
        getVariableIdByName({
          variables: localLoadedProcessData?.Variable,
          name: val.VariableName,
        });
    }
    setlocalLoadedActivityPropertyData(tempPropData);
    if (
      actErr?.error &&
      ((isConst && val?.trim() !== "") || (!isConst && val !== ""))
    ) {
      setActErr({
        error: false,
        helperText: "",
      });
    }
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskOptions]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <div style={{ width: "100%", height: "100%" }}>
        {spinner ? (
          <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
        ) : (
          <div
            className={classes.mainDiv}
            style={{
              direction: direction == RTL_DIRECTION ? "rtl" : "ltr",
            }}
          >
            <div
              style={{
                marginLeft: "0.5vw",
                marginRight: "0.75vw",
                height: "100%",
                width: props.isDrawerExpanded ? "90%" : null,
                paddingTop: props.isDrawerExpanded ? "1rem" : "0.5rem",
              }}
            >
              <Grid container>
                <Grid item style={{ width: "100%" }}>
                  <Field
                    radio={true}
                    ButtonsArray={radioButtonsArrayForExpiresOn}
                    name="ExpiryType"
                    label={`${t("expiry")} ${t("type")}`}
                    value={expiryType}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    id="pmweb_taskOptions_expirytype_radio_button"
                  />
                </Grid>

                {
                  //code updated on 24 march 2023 for BugId 122158
                }
                {+expiryType === 2 ? (
                  <>
                    <Grid
                      item
                      style={{ width: "100%", margin: "1rem 0px 0.75rem" }}
                    >
                      <Typography
                        component="h5"
                        className={classes.GroupTitleSecondary}
                      >
                        {`${t("expiry")} ${t("details")}`}
                      </Typography>
                    </Grid>

                    <Grid item style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          // flexDirection: props.isDrawerExpanded
                          //   ? "row"
                          //   : "column",
                          flexDirection: "column",
                          gap: props.isDrawerExpanded ? "1vw" : "0.75rem",
                          // alignItems: props.isDrawerExpanded
                          //   ? "flex-end"
                          //   : "flex-start",
                          alignItems: "flex-start",
                        }}
                      >
                        <Grid
                          item
                          container
                          xs={props.isDrawerExpanded ? 9 : 12}
                          spacing={1}
                          alignItems={"flex-end"}
                        >
                          <Grid item xs={props.isDrawerExpanded ? 7 : 9}>
                            <Field
                              dropdown={true}
                              name="ExpiresOn"
                              label={t("expiresOn")}
                              value={expiresOn.value}
                              onChange={handleChange}
                              options={allDateTypeVars}
                              disabled={isReadOnly || expiryType == "1"}
                              minHeight="var(--line_height)"
                              height="auto"
                              id="pmweb_taskoptions_expireon_dropdownfield"
                            />
                          </Grid>

                          <Grid item xs={props.isDrawerExpanded ? 5 : 3}>
                            <Field
                              dropdown={true}
                              name="Operator"
                              value={operator.value}
                              onChange={handleChange}
                              /**code modified for bug id 136040 on 07-10-23 */

                              /*  options={
                                [
                                      { name: "+", value: "11" },
                                      { name: "-", value: "12" },
                                    ]
                                 
                              }*/
                              options={
                                expiresOn.value !== "ValidTillDateTime"
                                  ? [
                                      { name: "+", value: "11" },
                                      { name: "-", value: "12" },
                                    ]
                                  : [{ name: "-", value: "12" }]
                              }
                              //till here
                              disabled={isReadOnly || expiryType == "1"}
                              minHeight="var(--line_height)"
                              height="auto"
                              id="pmweb_taskoptions_operator_dropdownfield"
                            />
                          </Grid>
                        </Grid>

                        <Grid
                          item
                          xs={props.isDrawerExpanded ? 9 : 12}
                          style={{ width: "100%" }}
                        >
                          <TurnAroundTime
                            selectCombo={true}
                            stopOnBlur={false}
                            days={TATData.days}
                            hours={TATData.hours}
                            minutes={TATData.minutes}
                            calendarType={TATData.calendarType || ""}
                            isDaysConstant={TATData.isDaysConstant}
                            isMinutesConstant={TATData.isMinutesConstant}
                            isHoursConstant={TATData.isHoursConstant}
                            handleChange={onChangeTATData}
                            disabled={isReadOnly || expiryType == "1"}
                            inputClass={
                              props.isDrawerExpanded
                                ? "selectWithInputTextField_WS_Expanded"
                                : "selectWithInputTextField_WS"
                            }
                            constantInputClass={
                              props.isDrawerExpanded
                                ? "multiSelectConstInput_WS_Expanded"
                                : "multiSelectConstInput_WS"
                            }
                            selectWithInput={
                              props.isDrawerExpanded
                                ? "selectWithInput_WS_Expanded"
                                : "selectWithInput_WS"
                            }
                            // calenderStyle={{ width: "15.5vw" , }}
                            dropdownOptions={dropdownOptions}
                          />
                        </Grid>
                      </div>
                    </Grid>

                    <Grid
                      item
                      style={{ width: "100%", margin: "1.5rem 0px 0.25rem" }}
                    >
                      <Typography
                        component="h5"
                        className={classes.GroupTitleSecondary}
                      >
                        {`${t("action")}`}
                      </Typography>
                    </Grid>
                    <Grid item style={{ width: "100%" }}>
                      <Field
                        radio={true}
                        ButtonsArray={radioButtonsArrayForAction}
                        name="ActionType"
                        value={actionType}
                        disabled={isReadOnly || expiryType == "1"}
                        onChange={handleChange}
                        id="pmweb_taskoptions_actiontype_radiofield"
                      />
                    </Grid>
                    <Grid
                      item
                      xs={props.isDrawerExpanded ? 5 : 12}
                      style={{ width: props.isDrawerExpanded ? "30%" : "100%" }}
                    >
                      <Field
                        selectCombo={true}
                        name="ActionOnUser"
                        dropdown={true}
                        value={actionVal}
                        optionKey="VariableName"
                        id="pmweb_taskoptions_actiononuser_selectcombofield"
                        setIsConstant={(val) => {
                          setisConstAction(val);
                        }}
                        setValue={(val, isConstant) => {
                          setActionVal(val);
                          actionChange(val, isConstant);
                        }}
                        isConstant={isConstAction}
                        showEmptyString={false}
                        error={actErr?.error}
                        helperText={actErr?.helperText}
                        showConstValue={true}
                        disabled={
                          actionType === "1" || isReadOnly || expiryType == "1"
                        }
                        inputClass={"actionOnUserTF"}
                        constantInputClass={"actionOnUserConstInput"}
                        selectWithInput={"actionOnUser"}
                        dropdownOptions={reassignDropValues}
                      />
                    </Grid>

                    <Grid
                      item
                      style={{ width: "100%", margin: "1rem 0 0.5rem" }}
                    >
                      <Typography
                        component="h5"
                        className={classes.GroupTitleSecondary}
                      >
                        {`${t("trigger")}`}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={props.isDrawerExpanded ? 5 : 12}
                      style={{
                        width: props.isDrawerExpanded ? "33.25%" : "100%",
                      }}
                    >
                      <Field
                        name="Trigger"
                        dropdown={true}
                        value={trigger.value}
                        onChange={handleChange}
                        options={triggersList}
                        disabled={isReadOnly || expiryType == "1"}
                        minHeight="var(--line_height)"
                        height="auto"
                        id="pmweb_taskoptions_trigger_dropdownfield"
                      />
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};
export default connect(mapStateToProps, null)(TaskOptions);
