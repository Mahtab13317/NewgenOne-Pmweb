// #BugID - 112055
// #BugDescription - Made changes,added validations and made changes for set and get for bug.
// #BugID - 112988
// #BugDescription - already handled this bug with bug id 112055.
// Changes made to solve Bug 118365 - Timer event - Manual unhold- target activity is not getting saved
// #BugID - 121861
// #BugDescription - Constant variable in variable list populated.
// #BugID - 122402
// #BugDescription - Shown event list table in collapse view also.

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Grid,
  TableHead,
  TableContainer,
  Table,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  MenuItem,
  Checkbox,
} from "@material-ui/core";

import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import SelectWithInput from "../../../../UI/SelectWithInput";
import { connect, useDispatch, useSelector } from "react-redux";
import "./index.css";
import {
  headerHeight,
  propertiesLabel,
  RTL_DIRECTION,
  SPACE,
} from "../../../../Constants/appConstants";
import {
  setActivityPropertyChange,
  ActivityPropertyChangeValue,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import AddIcon from "@material-ui/icons/Add";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import DeleteIcon from "@material-ui/icons/Delete";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { noIncomingTypes } from "../../../../utility/bpmnView/noIncomingTypes";
import {
  OpenProcessSliceValue,
  setOpenProcess,
} from "../../../../redux-store/slices/OpenProcessSlice";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import arabicStyles from "./ArabicStyles.module.css";
import styles from "./index.module.css";

function Options(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const [errorsObj, setErrorsObj] = useState({
    hours: false,
    minutes: false,
    seconds: false,
  });
  const [tatErrorObj, setTatErrorObj] = useState({
    hours: false,
    minutes: false,
    seconds: false,
  });
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;
  const [expireStatus, setExpireStatus] = useState(
    props.tabName === "Timer" ||
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo
        ?.expFlag
      ? t("expiresAfter")
      : t("neverExpires")
  );
  const [dateTime, setDateTime] = useState("CreatedDateTime");
  const dispatch = useDispatch();
  const [operatorType, setOperatorType] = useState("11");
  let expiryInfo =
    localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo;
  let tatInfo =
    localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.tatInfo;

  const [days, setDays] = useState(
    expiryInfo?.wfDays
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.wfDays
      : "0"
  );
  const [turnAroundDays, setTurnAroundDays] = useState(
    tatInfo?.wfDays
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.tatInfo
          ?.wfDays
      : "0"
  );
  const [hours, setHours] = useState(
    expiryInfo?.wfHours
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.wfHours
      : "0"
  );
  const [turnAroundHours, setTurnAroundHours] = useState(
    tatInfo?.wfDays
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.tatInfo
          ?.wfHours
      : "0"
  );
  const [minutes, setMinutes] = useState(
    expiryInfo?.wfMinutes
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.wfMinutes
      : "0"
  );
  const [turnAroundMinutes, setTurnAroundMinutes] = useState(
    tatInfo?.wfDays
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.tatInfo
          ?.wfMinutes
      : "0"
  );
  const [seconds, setSeconds] = useState(
    expiryInfo?.wfSeconds
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.wfSeconds
      : "0"
  );
  const [turnAroundSeconds, setTurnAroundSeconds] = useState(
    tatInfo?.wfDays
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.tatInfo
          ?.wfSeconds
      : "0"
  );
  const [daysType, setDaysType] = useState("Y");
  //Modified on 06/09/2023, bug_id:135570
  const [routeTo, setRouteTo] = useState("PreviousStage");
  //till here for bug_id:135570
  //const [routeTo, setRouteTo] = useState("");
  const [triggerCheckValue, setTriggerCheckValue] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [turnAroundCheckValue, setTurnAroundCheckValue] = useState(
    tatInfo?.tatFlag
  );
  const [filteredVarList, setFilteredVarList] = useState([]);
  const [holdUntilList, setHoldUntilList] = useState([]);
  const [tatInfoDaysType, setTatInfoDaysType] = useState("Y");

  //mahtab code starts here
  const [targetActVal, setTargetActVal] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.holdEventInfo
      ?.m_strHoldActivity != ""
      ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.holdEventInfo?.m_strHoldActivity
      : "PreviousStage"
  );
  const [triggerCheckValueMU, setTriggerCheckValueMU] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.holdEventInfo
      ?.m_bHoldTrigOption
  );
  const [selectedTriggerMU, setSelectedTriggerMU] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.holdEventInfo
      ?.m_strtriggerName
  );
  //Modified on 06/09/2023, bug_id:135128
  const [selectedTriggerEvent, setSelectedTriggerEvent] = useState("");
  //till here for bug_id:135128
  //const [selectedTriggerEvent, setSelectedTriggerEvent] = useState(null);
  const [targetActEvent, setTargetActEvent] = useState("PreviousStage");
  const [eventName, setEventName] = useState("");
  const [mappedEvents, setMappedEvents] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
      ?.m_arrEventList
  );
  const [localState, setLocalState] = useState(null);
  const openProcessData = useSelector(OpenProcessSliceValue);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  const eventNameRef = useRef();

  useEffect(() => {
    let temp = JSON.parse(JSON.stringify(openProcessData.loadedData));
    setLocalState(temp);
  }, [openProcessData.loadedData]);

  useEffect(() => {
    if (localLoadedProcessData?.Variable) {
      let variableWithConstants = [];
      localLoadedProcessData.DynamicConstant?.forEach((element) => {
        let tempObj = {
          VariableName: element.ConstantName,
          VariableScope: "C",
        };
        variableWithConstants.push(tempObj);
      });
      let filteredList = localLoadedProcessData?.Variable?.filter(
        (element) =>
          (element.VariableScope === "U" || element.VariableScope === "I") &&
          element.VariableType !== "11" &&
          (element.VariableType === "3" || element.VariableType === "4") &&
          element.Unbounded === "N"
      );

      filteredList?.forEach((element) => {
        variableWithConstants.push(element);
      });

      setFilteredVarList(variableWithConstants);
      setHoldUntilList(
        localLoadedProcessData?.Variable?.filter(
          (element) =>
            element.VariableType !== "11" &&
            element.VariableType === "8" &&
            element.Unbounded === "N"
        )
      );
    }
  }, [localLoadedProcessData?.Variable]);

  // Added on 06/09/2023, bug_id:135570
  useEffect(() => {
    let tempData = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (props?.tabName == "Timer") {
      let tempState = tempData?.ActivityProperty?.optionInfo;
      // code edited on 14 Jan 2023 for BugId 122463
      if (!tempState?.expiryInfo?.expFlag) {
        tempState.expiryInfo = {
          varFieldId_Minutes: "0",
          holdTillVar: "CreatedDateTime",
          variableId_Hours: "0",
          triggerName: "",
          expiryActivity: "PreviousStage",
          triggerId: "0",
          wfDays: "0",
          wfMinutes: "0",
          varFieldId_Seconds: "0",
          variableId_Minutes: "0",
          expFlag: true,
          varFieldId_Hours: "0",
          expCalFlag: "Y",
          varFieldId_Days: "0",
          expiryOperator: "11",
          variableId_Seconds: "0",
          variableId_Days: "28",
          wfSeconds: "0",
          wfHours: "0",
        };
        tempData.ActivityProperty.optionInfo = tempState;
        setlocalLoadedActivityPropertyData(tempData);
      }
    }
  }, []);
  //till here for bug_id:135570

  const clearLocalObj = () => {
    let tempData = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let tempState = tempData?.ActivityProperty?.optionInfo;
    // code edited on 14 Jan 2023 for BugId 122463
    tempState = {
      ...tempState,
      expiryInfo: {
        expFlag: false,
      },
    };
    tempData.ActivityProperty.optionInfo = tempState;
    // code edited on 14 Jan 2023 for BugId 122463
    setTriggerCheckValue(false);
    setDays("0");
    setHours("0");
    setMinutes("0");
    setSeconds("0");
    setlocalLoadedActivityPropertyData(tempData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.options]: { isModified: true, hasError: false },
      })
    );
  };

  const expireStatusHandler = (event) => {
    setExpireStatus(event.target.value);
    const expStatus = event.target.value;
    if (expStatus === t("neverExpires")) {
      clearLocalObj();
    } else {
      let tempData = JSON.parse(
        JSON.stringify(localLoadedActivityPropertyData)
      );
      let tempState = tempData?.ActivityProperty?.optionInfo;
      // code edited on 14 Jan 2023 for BugId 122463
      tempState.expiryInfo = {
        varFieldId_Minutes: "0",
        holdTillVar: "",
        variableId_Hours: "0",
        triggerName: "",
        expiryActivity: "",
        triggerId: "0",
        wfDays: "0",
        wfMinutes: "0",
        varFieldId_Seconds: "0",
        variableId_Minutes: "0",
        expFlag: true,
        varFieldId_Hours: "0",
        expCalFlag: "Y",
        varFieldId_Days: "0",
        expiryOperator: "11",
        variableId_Seconds: "0",
        variableId_Days: "0",
        wfSeconds: "0",
        wfHours: "0",
      };
      tempData.ActivityProperty.optionInfo = tempState;
      setlocalLoadedActivityPropertyData(tempData);
    }
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.options]: { isModified: true, hasError: false },
      })
    );
  };

  const clearTurnAroundTimeValues = () => {
    let tempData = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (turnAroundCheckValue) {
      const tempObj = {
        tatFlag: false,
      };
      tempData.ActivityProperty.optionInfo.tatInfo = tempObj;
      setTurnAroundDays("0");
      setTurnAroundHours("0");
      setTurnAroundMinutes("0");
      setTurnAroundSeconds("0");
      setTatInfoDaysType("Y");
    } else {
      tempData.ActivityProperty.optionInfo.tatInfo = {
        varFieldId_Minutes: "0",
        variableId_Hours: "0",
        wfDays: "0",
        wfMinutes: "0",
        tatCalFlag: "Y",
        varFieldId_Seconds: "0",
        variableId_Minutes: "0",
        tatFlag: true,
        varFieldId_Hours: "0",
        varFieldId_Days: "0",
        variableId_Seconds: "0",
        variableId_Days: "0",
        wfSeconds: "0",
        wfHours: "0",
      };
    }
    setlocalLoadedActivityPropertyData(tempData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.options]: { isModified: true, hasError: false },
      })
    );
  };

  const clearTriggerValues = (isChecked) => {
    // code edited on 2 Jan 2023 for BugId 121375
    if (!isChecked) {
      let tempData = JSON.parse(
        JSON.stringify(localLoadedActivityPropertyData)
      );
      let tempState = tempData?.ActivityProperty?.optionInfo;
      if (
        tempState.expiryInfo.hasOwnProperty("triggerId") &&
        tempState.expiryInfo.hasOwnProperty("triggerName")
      ) {
        tempState.expiryInfo.triggerId = "";
        tempState.expiryInfo.triggerName = "";
      }
      setSelectedTrigger(null);
      tempData.ActivityProperty.optionInfo = tempState;
      setlocalLoadedActivityPropertyData(tempData);
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.options]: { isModified: true, hasError: false },
        })
      );
    }
  };

  const setDateTimeHandler = (event) => {
    setDateTime(event.target.value);
    setActivityPropertyData(
      event.target.value,
      "expiryInfo",
      "holdTillVar",
      "",
      ""
    );
  };

  const getVariableDetails = (variableName) => {
    let tempObj = {
      variableId: "",
      varFieldId: "",
    };
    localLoadedProcessData?.Variable?.forEach((element) => {
      if (element.VariableName === variableName) {
        tempObj.varFieldId = element.VarFieldId;
        tempObj.variableId = element.VariableId;
      }
    });
    return tempObj;
  };

  const getTriggerId = (triggerName) => {
    let triggerId = "";
    localLoadedProcessData.TriggerList?.forEach((element) => {
      if (element.TriggerName === triggerName) {
        triggerId = element.TriggerId;
      }
    });
    return triggerId;
  };

  const getTriggerName = (triggerId) => {
    let triggerName = "";
    localLoadedProcessData.TriggerList?.forEach((element) => {
      if (+element.TriggerId === +triggerId) {
        triggerName = element.TriggerName;
      }
    });
    return triggerName;
  };

  const setActivityPropertyData = (
    value,
    type,
    key,
    varFieldIdKey,
    variableIdKey
  ) => {
    let tempData = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let tempLocalState = tempData?.ActivityProperty?.optionInfo;
    const variableId = getVariableDetails(value)?.variableId || "0";
    const varFieldId = getVariableDetails(value)?.varFieldId || "0";

    if (type === "expiryInfo") {
      if (!tempLocalState?.expiryInfo?.hasOwnProperty(key)) {
        const tempObj = {
          varFieldId_Minutes: "0",
          holdTillVar: "CreatedDateTime",
          variableId_Hours: "0",
          triggerName: "",
          expiryActivity: "PreviousStage",
          triggerId: "0",
          wfDays: "0",
          wfMinutes: "0",
          varFieldId_Seconds: "0",
          variableId_Minutes: "0",
          expFlag: true,
          varFieldId_Hours: "0",
          expCalFlag: "Y",
          varFieldId_Days: "0",
          expiryOperator: "",
          variableId_Seconds: "0",
          variableId_Days: "28",
          wfSeconds: "0",
          wfHours: "0",
        };
        if (tempLocalState?.expiryInfo) {
          tempLocalState.expiryInfo = tempObj;
        } else {
          tempLocalState = { ...tempLocalState, expiryInfo: tempObj };
        }
      }
      tempLocalState.expiryInfo[key] = value;
      if (varFieldIdKey !== "") {
        tempLocalState.expiryInfo[varFieldIdKey] = varFieldId;
      }
      if (variableIdKey !== "") {
        tempLocalState.expiryInfo[variableIdKey] = variableId;
      }
      if (key === "triggerName") {
        tempLocalState.expiryInfo.triggerId = getTriggerId(value);
      }
    } else {
      if (!tempLocalState?.tatInfo?.hasOwnProperty(key)) {
        const tempObj = {
          varFieldId_Minutes: "0",
          variableId_Hours: "0",
          wfDays: "0",
          wfMinutes: "0",
          tatCalFlag: "",
          varFieldId_Seconds: "0",
          variableId_Minutes: "0",
          tatFlag: true,
          varFieldId_Hours: "0",
          varFieldId_Days: "0",
          variableId_Seconds: "0",
          variableId_Days: "0",
          wfSeconds: "0",
          wfHours: "0",
        };
        tempLocalState.tatInfo = tempObj;
      }
      tempLocalState.tatInfo[key] = value;
      if (varFieldIdKey !== "") {
        tempLocalState.tatInfo[varFieldIdKey] = varFieldId;
      }
      if (variableIdKey !== "") {
        tempLocalState.tatInfo[variableIdKey] = variableId;
      }
    }

    tempLocalState.m_arrEventList = mappedEvents;
    tempData.ActivityProperty.optionInfo = tempLocalState;
    setlocalLoadedActivityPropertyData(tempData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.options]: { isModified: true, hasError: false },
      })
    );
  };

  const operatorTypeHandler = (e) => {
    setOperatorType(e.target.value);
    setActivityPropertyData(
      e.target.value,
      "expiryInfo",
      "expiryOperator",
      "",
      ""
    );
  };

  const daysTypeHandler = (e) => {
    setDaysType(e.target.value);
    setActivityPropertyData(e.target.value, "expiryInfo", "expCalFlag", "", "");
  };

  const tatInfoDaysTypeHandler = (e) => {
    setTatInfoDaysType(e.target.value);
    setActivityPropertyData(e.target.value, "tatInfo", "tatCalFlag", "", "");
  };

  const routeToHandler = (e) => {
    // code edited on 2 Jan 2023 for BugId 121402
    setRouteTo(e.target.value);
    let tempLocal = JSON.parse(JSON.stringify(localState));
    let previousValue =
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo
        ?.expiryActivity;
    if (e.target.value === t("previousStage")) {
      let prevVal = null;
      tempLocal.MileStones?.map((mile) => {
        mile.Activities?.map((activity) => {
          if (activity.ActivityName === previousValue) {
            prevVal = activity.ActivityId;
          }
        });
      });
      tempLocal.Connections.forEach((conn, index) => {
        if (
          props.cellID === conn.SourceId &&
          prevVal === conn.TargetId &&
          conn.Type === "X"
        ) {
          tempLocal.Connections[index] = {
            ...tempLocal.Connections[index],
            removedByOptions: true,
          };
          if (tempLocal.Connections[index].addedByOptions) {
            delete tempLocal.Connections[index].addedByOptions;
          }
        }
      });
    } else {
      let target = null;
      if (previousValue === "" || previousValue === t("previousStage")) {
        let maxConnId = 0;
        tempLocal.Connections.forEach((conn) => {
          if (+conn.ConnectionId > +maxConnId && !conn.removedByOptions) {
            maxConnId = +conn.ConnectionId;
          }
        });
        tempLocal.MileStones?.map((mile) => {
          mile.Activities?.map((activity) => {
            if (activity.ActivityName === e.target.value) {
              target = activity.ActivityId;
            }
          });
        });
        tempLocal.Connections.push({
          ConnectionId: maxConnId + 1,
          Type: "X",
          SourceId: props.cellID,
          TargetId: target,
          xLeft: [],
          yTop: [],
          addedByOptions: true,
        });
      } else {
        let prevVal = null;
        let maxConnId = 0;
        tempLocal.MileStones?.map((mile) => {
          mile.Activities?.map((activity) => {
            if (activity.ActivityName === e.target.value) {
              target = activity.ActivityId;
            }
            if (activity.ActivityName === previousValue) {
              prevVal = activity.ActivityId;
            }
          });
        });
        tempLocal.Connections.forEach((conn, index) => {
          if (
            props.cellID === conn.SourceId &&
            prevVal === conn.TargetId &&
            conn.Type === "X"
          ) {
            tempLocal.Connections[index] = {
              ...tempLocal.Connections[index],
              removedByOptions: true,
            };
            if (tempLocal.Connections[index].addedByOptions) {
              delete tempLocal.Connections[index].addedByOptions;
            }
          }
        });
        tempLocal.Connections.forEach((conn) => {
          if (+conn.ConnectionId > +maxConnId && !conn.removedByOptions) {
            maxConnId = +conn.ConnectionId;
          }
        });
        tempLocal.Connections.push({
          ConnectionId: maxConnId + 1,
          Type: "X",
          SourceId: props.cellID,
          TargetId: target,
          xLeft: [],
          yTop: [],
          addedByOptions: true,
        });
      }
    }
    dispatch(setOpenProcess({ loadedData: tempLocal }));
    setActivityPropertyData(
      e.target.value,
      "expiryInfo",
      "expiryActivity",
      "",
      ""
    );
  };

  useEffect(() => {
    //Modified on 06/09/2023, bug_id:135570
    if (
      !localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo
        ?.expCalFlag
    ) {
      setDateTime("CreatedDateTime");
      setRouteTo("PreviousStage");
    } else {
      setDateTime(
        localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.holdTillVar != ""
          ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
              ?.expiryInfo?.holdTillVar
          : "CreatedDateTime"
      );

      setRouteTo(
        localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.expiryActivity != ""
          ? localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
              ?.expiryInfo?.expiryActivity
          : "PreviousStage"
      );
    }

    //till here for bug_id:135570

    /*  setDateTime(
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
        ?.expiryInfo?.holdTillVar 
    );

    setRouteTo(
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
        ?.expiryInfo?.expiryActivity 
    ); */

    let expOperator =
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo
        ?.expiryOperator;
    if (expOperator?.trim() !== "" && expOperator) {
      setOperatorType(
        localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.expiryOperator
      );
    } else if (
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo
        ?.expFlag // code edited on 14 Jan 2023 for BugId 122463
    ) {
      setActivityPropertyData("11", "expiryInfo", "expiryOperator", "", "");
    }
    let expCalFlag =
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo
        ?.expCalFlag;
    if (expCalFlag?.trim() !== "" && expCalFlag) {
      setDaysType(
        localLoadedActivityPropertyData?.ActivityProperty?.optionInfo
          ?.expiryInfo?.expCalFlag
      );
    }
    let tatCalFlag =
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.tatInfo
        ?.tatCalFlag;
    if (tatCalFlag?.trim() !== "" && tatCalFlag) {
      setTatInfoDaysType(
        localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.tatInfo
          ?.tatCalFlag
      );
    }
    /* code updated on 30 Dec 2022 for BugId 121396 */
    let triggerIdValue =
      localLoadedActivityPropertyData?.ActivityProperty?.optionInfo?.expiryInfo
        ?.triggerId;
    if (triggerIdValue && triggerIdValue !== "0" && triggerIdValue !== "") {
      setTriggerCheckValue(true);
      setSelectedTrigger(getTriggerName(triggerIdValue));
    }
  }, [localLoadedActivityPropertyData]);

  const changeTargetAct = (e) => {
    setTargetActVal(e.target.value);
    const tempLocalState = { ...localLoadedActivityPropertyData };
    // if (triggerCheckValueMU) {
    tempLocalState.ActivityProperty.optionInfo.holdEventInfo.m_strHoldActivity =
      e.target.value;
    // }
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.options]: { isModified: true, hasError: false },
      })
    );
  };

  const changeTrigerMU = (value) => {
    setSelectedTriggerMU(value);
    const tempLocalState = { ...localLoadedActivityPropertyData };
    if (triggerCheckValueMU) {
      tempLocalState.ActivityProperty.optionInfo.holdEventInfo.m_strtriggerName =
        value;
      /* code added on 14 July 2023 for BugId 132222 - regression>>timer event>>getting internal 
      server error while saving timer details with event field */
      tempLocalState.ActivityProperty.optionInfo.holdEventInfo.m_iTriggerId =
        getTriggerId(value);
    }
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.options]: { isModified: true, hasError: false },
      })
    );
  };

  const triggerEventHandler = (e) => {
    setSelectedTriggerEvent(e.target.value);
  };

  const targetActEventHandler = (e) => {
    setTargetActEvent(e.target.value);
  };

  const changeEventHandler = (e) => {
    setEventName(e.target.value);
  };

  /* code updated on 23 September 2022 for BugId 115914 */
  const associateData = () => {
    let data;
    let isStack = false;
    let tempEventName = eventName;
    if (eventName === "") {
      dispatch(
        setToastDataFunc({
          message: t("eventName") + SPACE + t("couldNotBeBlank"),
          severity: "error",
          open: true,
        })
      );

      return false;
    } else if (eventName.length > 50) {
      dispatch(
        setToastDataFunc({
          message:
            t("eventName") +
            SPACE +
            t("lengthShouldNotExceed") +
            SPACE +
            t("than") +
            SPACE +
            t("fifty"),
          severity: "error",
          open: true,
        })
      );

      return false;
    }
    //Added on 04/09/2023, bug_id:135128
    else if (targetActEvent === "" || targetActEvent === null) {
      dispatch(
        setToastDataFunc({
          message: t("targetAct") + SPACE + t("couldNotBeBlank"),
          severity: "error",
          open: true,
        })
      );
    }
    //till here for bug_id:135128
    else {
      data = {
        m_strEventTrigName: selectedTriggerEvent,
        /* code added on 14 July 2023 for BugId 132222 - regression>>timer event>>getting internal 
        server error while saving timer details with event field */
        m_iTriggerId: getTriggerId(selectedTriggerEvent),
        m_strEventTrgAct: targetActEvent,
        m_iEventActSelectIndex: 0,
        m_strEventName: tempEventName,
        m_iEventTrigSelectIndex: 0,
      };
      /*code updated on 14 October 2022 for BugId 115916 */
      mappedEvents?.forEach((item) => {
        if (item.m_strEventName.trim() === data.m_strEventName.trim()) {
          isStack = true;
        }
      });

      if (isStack === true) {
        dispatch(
          setToastDataFunc({
            message: t("event") + SPACE + t("withTheSameNameAlreadyExists"),
            severity: "error",
            open: true,
          })
        );
        return false;
      } else {
        setMappedEvents([...mappedEvents, data]);
        setEventName(""); //code updated on 28 September 2022 for BugId 116207
        //Modified on 06/09/2023, bug_id:135570
        setTargetActEvent("PreviousStage");
        //till here for bug_id:135570
        //Modified on 06/09/2023, bug_id:135128
        setSelectedTriggerEvent("");
        //till here for bug_id:135128
        // setTargetActEvent("PreviousStage");
        // setSelectedTriggerEvent(nyll);
        const tempLocalState = { ...localLoadedActivityPropertyData };
        tempLocalState.ActivityProperty.optionInfo.m_arrEventList.push(data);
        setlocalLoadedActivityPropertyData(tempLocalState);
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.options]: { isModified: true, hasError: false },
          })
        );
      }
    }
  };

  function deleteData(name, i) {
    setMappedEvents(
      mappedEvents?.filter((item) => item.m_strEventName !== name)
    );

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.optionInfo.m_arrEventList?.splice(i, 1);
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.businessRule]: { isModified: true, hasError: false },
      })
    );
  }

  const triggerCheckedMU = (e) => {
    setTriggerCheckValueMU(e.target.checked);
    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.optionInfo.holdEventInfo.m_bHoldTrigOption =
      e.target.checked;
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.options]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <div
        id="OptionsTab"
        /* code added on 6 July 2023 for issue - save and discard button hide 
        issue in case of tablet(landscape mode)*/
        style={{
          height: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
        }}
      >
        <RadioGroup
          defaultValue={t("neverExpires")}
          onChange={(e) => expireStatusHandler(e)}
          row={true}
          value={expireStatus}
          name="row-radio-buttons-group"
        >
          <FormControlLabel
            id="pmweb_OptionsTab_NeverExpires"
            style={{
              marginLeft: direction === RTL_DIRECTION ? "1vw" : "-0.5vw",
              marginRight: direction === RTL_DIRECTION ? "-0.5vw" : "1vw",
            }}
            value={t("neverExpires")}
            control={
              <Radio disabled={isReadOnly || props.tabName === "Timer"} />
            }
            label={t("neverExpires")}
          />
          <FormControlLabel
            id="pmweb_OptionsTab_ExpiresAfter"
            style={{
              marginLeft: direction === RTL_DIRECTION ? "1vw" : "unset",
              marginRight: direction === RTL_DIRECTION ? "unset" : "1vw",
            }}
            value={t("expiresAfter")}
            control={
              <Radio disabled={isReadOnly || props.tabName === "Timer"} />
            }
            label={t("expiresAfter")}
          />
        </RadioGroup>
        {/* Bug 122253 - Case Workdesk issues: 
        1)Fields should be coming only if user had selected Expires after
        2)Wherever fields are disabled, the field color should be f0f0f0
      [30-03-2023] Provided the condition to show fields only when the ExpiresStatus is ExpiresAfter
      and Provided the appropriate css */}

        {
          //Modified on 23/05/2023, bug_id:127557
          //{expireStatus !== t("neverExpires") && (
        }
        <div
          className="option_selectionBoxes"
          // style={{
          //   width:
          //     props.isDrawerExpanded && window.innerWidth > 800
          //       ? "80%"
          //       : "100%",
          // }}
        >
          <Grid container style={{ flexDirection: "column" }}>
            {expireStatus !== t("neverExpires") && (
              <Grid
                container
                xs={
                  props.isDrawerExpanded
                    ? window.innerWidth > 820
                      ? 6
                      : 10
                    : 12
                }
              >
                <div className="holdUntilDiv" style={{ width: "100%" }}>
                  <Grid
                    container
                    xs={props.isDrawerExpanded ? 7 : 12}
                    justifyContent="space-between"
                    spacing={1}
                    style={{ flexWrap: "nowrap" }}
                  >
                    <Grid item xs={3}>
                      <p className="holdUntilLabel">{t("holdUntil")}</p>
                    </Grid>
                    <Grid item xs={1}></Grid>
                    <Grid item container xs={8} style={{ flexWrap: "nowrap" }}>
                      <Grid item xs={9}>
                        <FormControl style={{ width: "100%" }}>
                          <CustomizedDropdown
                            id={`pmweb_OptionsTab_DateTimeHandler_${dateTime}`}
                            disabled={
                              expireStatus === t("neverExpires") || isReadOnly
                            }
                            inputProps={{ "aria-label": "Without label" }}
                            value={dateTime}
                            onChange={(e) => setDateTimeHandler(e)}
                            className={
                              isReadOnly
                                ? "selectDateTime_options_disabled newWidth"
                                : "selectDateTime_options newWidth"
                            }
                            style={{
                              marginLeft:
                                direction === RTL_DIRECTION ? "0.75vw" : "0vw",
                              marginRight:
                                direction === RTL_DIRECTION ? "0vw" : "0.75vw",
                            }}
                            hideDefaultSelect={true}
                            isNotMandatory={true}
                          >
                            {holdUntilList?.map((variable, index) => {
                              return (
                                <MenuItem
                                  //id={`pmweb_OptionsTab_DateTimeHandler_${index}`}
                                  id={
                                    variable.VariableName
                                      ? `pmweb_OptionsTab_DateTimeHandler_${index}`
                                      : `pmweb_OptionsTab_DateTimeHandler`
                                  }
                                  className={
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.menuItemStyles
                                      : styles.menuItemStyles
                                  }
                                  value={variable.VariableName}
                                >
                                  {variable.VariableName}
                                </MenuItem>
                              );
                            })}
                          </CustomizedDropdown>
                        </FormControl>
                      </Grid>
                      <Grid item xs={1}></Grid>
                      <Grid item xs={3}>
                        <FormControl style={{ width: "100%" }}>
                          <CustomizedDropdown
                            id={
                              operatorType == 11
                                ? `pmweb_OptionsTab_OperatorTypeHandler_+symbol`
                                : `pmweb_OptionsTab_OperatorTypeHandler_-symbol`
                            }
                            disabled={
                              expireStatus == t("neverExpires") || isReadOnly
                            }
                            inputProps={{ "aria-label": "Without label" }}
                            value={operatorType}
                            onChange={(e) => operatorTypeHandler(e)}
                            className={
                              isReadOnly
                                ? "selectPlusMinus_options_disabled newWidth"
                                : "selectPlusMinus_options newWidth"
                            }
                            hideDefaultSelect={true}
                            isNotMandatory={true}
                          >
                            <MenuItem
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.menuItemStyles
                                  : styles.menuItemStyles
                              }
                              value="11"
                            >
                              +
                            </MenuItem>
                            <MenuItem
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.menuItemStyles
                                  : styles.menuItemStyles
                              }
                              value="12"
                            >
                              -
                            </MenuItem>
                          </CustomizedDropdown>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
                <div
                  className="optionsTab_timeMapping"
                  style={{ width: "100%" }}
                >
                  <div>
                    <div className="options_time">
                      <Grid
                        container
                        xs={props.isDrawerExpanded ? 7 : 12}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Grid item xs={3}>
                          <span
                            // htmlFor={`pmweb_input_with_select_${
                            //   filteredVarList
                            //     ? `pmweb_OptionsTab_DaysInput_${days}`
                            //     : `pmweb_OptionsTab_DaysInput`
                            // }`}
                            className="options_days"
                            style={{
                              marginRight:
                                direction == RTL_DIRECTION ? "0px" : "0.5vw",
                              marginLeft:
                                direction == RTL_DIRECTION ? "0.5vw" : "0px",
                            }}
                          >
                            {t("days")}
                          </span>
                        </Grid>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={8}>
                          <SelectWithInput
                            dropdownOptions={filteredVarList}
                            showError={true}
                            optionKey="VariableName"
                            setValue={(val) => {
                              setDays(val);
                              setActivityPropertyData(
                                !isNaN(val) ? val : val?.VariableName,
                                "expiryInfo",
                                "wfDays",
                                "varFieldId_Days",
                                "variableId_Days"
                              );
                            }}
                            value={days}
                            isConstant={!isNaN(days)}
                            inputClass="selectWithInputTextField_WS"
                            constantInputClass="multiSelectConstInput_WS"
                            selectWithInput="selectWithInput_WS"
                            showEmptyString={false}
                            showConstValue={true}
                            disabled={
                              expireStatus === t("neverExpires") || isReadOnly
                            }
                            id={
                              filteredVarList
                                ? `pmweb_OptionsTab_DaysInput_${days}`
                                : `pmweb_OptionsTab_DaysInput`
                            }
                            type="number" //code updated on 26 September 2022 for BugId 115919
                          />
                        </Grid>
                      </Grid>
                    </div>
                    <div className="options_time">
                      <Grid
                        container
                        xs={props.isDrawerExpanded ? 7 : 12}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Grid item xs={3}>
                          <span
                            className="options_hours"
                            style={{
                              marginRight:
                                direction == RTL_DIRECTION ? "0px" : "8px",
                              marginLeft:
                                direction == RTL_DIRECTION ? "8px" : "0px",
                            }}
                          >
                            {/*code modified on 12-09-2023 for bug 36572 */}
                            {t("hours")}
                          </span>
                        </Grid>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={8}>
                          <SelectWithInput
                            dropdownOptions={filteredVarList}
                            optionKey="VariableName"
                            setValue={(val) => {
                              setHours(val);
                              let tempObj = { ...errorsObj };
                              if (!isNaN(val)) {
                                if (val > 24) {
                                  tempObj.hours = true;
                                } else {
                                  tempObj.hours = false;
                                }
                              } else {
                                tempObj.hours = false;
                              }
                              setErrorsObj(tempObj);
                              if (!tempObj.hours) {
                                setActivityPropertyData(
                                  !isNaN(val) ? val : val?.VariableName,
                                  "expiryInfo",
                                  "wfHours",
                                  "varFieldId_Hours",
                                  "variableId_Hours"
                                );
                              }
                            }}
                            showError={true}
                            value={hours}
                            isConstant={!isNaN(hours)}
                            inputClass="selectWithInputTextField_WS"
                            constantInputClass="multiSelectConstInput_WS"
                            selectWithInput="selectWithInput_WS"
                            showEmptyString={false}
                            showConstValue={true}
                            disabled={
                              expireStatus == t("neverExpires") || isReadOnly
                            }
                            id="pmweb_OptionsTab_HoursInput"
                            type="number" //code updated on 26 September 2022 for BugId 115919
                          />
                        </Grid>
                      </Grid>
                    </div>
                    {hours > 24 ? (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "red",
                          margin:
                            direction === RTL_DIRECTION
                              ? "-7px 134px 5px 0px"
                              : "-7px 0px 5px 134px",
                        }}
                      >
                        {
                          //Modified on 14/10/2023, bug_id:139358
                        }
                        {t("valueMustLieinRangeMessage")}
                        {SPACE}
                        {t("zeroToTwentyFour")}
                      </p>
                    ) : null}
                    <div className="options_time">
                      <Grid
                        container
                        xs={props.isDrawerExpanded ? 7 : 12}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Grid item xs={3}>
                          <span
                            className="options_minutes"
                            style={{
                              marginRight:
                                direction == RTL_DIRECTION ? "0px" : "16px",
                              marginLeft:
                                direction == RTL_DIRECTION ? "16px" : "0px",
                            }}
                          >
                            {t("minutes")}
                          </span>
                        </Grid>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={8}>
                          <SelectWithInput
                            dropdownOptions={filteredVarList}
                            showError={true}
                            optionKey="VariableName"
                            setValue={(val) => {
                              setMinutes(val);
                              let tempObj = { ...errorsObj };
                              if (!isNaN(val)) {
                                if (val > 60) {
                                  tempObj.minutes = true;
                                } else {
                                  tempObj.minutes = false;
                                }
                              } else {
                                tempObj.minutes = false;
                              }
                              setErrorsObj(tempObj);
                              if (!tempObj.minutes) {
                                setActivityPropertyData(
                                  !isNaN(val) ? val : val?.VariableName,
                                  "expiryInfo",
                                  "wfMinutes",
                                  "varFieldId_Minutes",
                                  "variableId_Minutes"
                                );
                              }
                            }}
                            value={minutes}
                            isConstant={!isNaN(minutes)}
                            inputClass="selectWithInputTextField_WS"
                            constantInputClass="multiSelectConstInput_WS"
                            selectWithInput="selectWithInput_WS"
                            showEmptyString={false}
                            showConstValue={true}
                            disabled={
                              expireStatus == t("neverExpires") || isReadOnly
                            }
                            id="pmweb_OptionsTab_MinutesInput"
                            type="number" //code updated on 26 September 2022 for BugId 115919
                          />
                        </Grid>
                      </Grid>
                    </div>
                    {minutes > 60 ? (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "red",
                          margin:
                            direction === RTL_DIRECTION
                              ? "-7px 134px 5px 0px"
                              : "-7px 0px 5px 134px",
                        }}
                      >
                        {
                          //Modified on 14/10/2023, bug_id:139358
                        }
                        {t("valueMustLieinRangeMessage")}
                        {SPACE}
                        {t("zeroToSixty")}
                      </p>
                    ) : null}

                    <div className="options_time">
                      <Grid
                        container
                        xs={props.isDrawerExpanded ? 7 : 12}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Grid item xs={3}>
                          <span
                            className="options_seconds"
                            style={{
                              marginRight:
                                direction == RTL_DIRECTION ? "0px" : "0.5vw",
                              marginLeft:
                                direction == RTL_DIRECTION ? "0.5vw" : "0px",
                            }}
                          >
                            {t("seconds")}
                          </span>
                        </Grid>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={8}>
                          <SelectWithInput
                            dropdownOptions={filteredVarList}
                            showError={true}
                            optionKey="VariableName"
                            setValue={(val) => {
                              setSeconds(val);
                              let tempObj = { ...errorsObj };
                              if (!isNaN(val)) {
                                if (val > 60) {
                                  tempObj.seconds = true;
                                } else {
                                  tempObj.seconds = false;
                                }
                              } else {
                                tempObj.seconds = false;
                              }
                              setErrorsObj(tempObj);
                              if (!tempObj.seconds) {
                                setActivityPropertyData(
                                  !isNaN(val) ? val : val?.VariableName,
                                  "expiryInfo",
                                  "wfSeconds",
                                  "varFieldId_Seconds",
                                  "variableId_Seconds"
                                );
                              }
                            }}
                            value={seconds}
                            isConstant={!isNaN(seconds)}
                            inputClass="selectWithInputTextField_WS"
                            constantInputClass="multiSelectConstInput_WS"
                            selectWithInput="selectWithInput_WS"
                            showEmptyString={false}
                            showConstValue={true}
                            disabled={
                              expireStatus == t("neverExpires") || isReadOnly
                            }
                            id="pmweb_OptionsTab_SecondsInput"
                            type="number" //code updated on 26 September 2022 for BugId 115919
                          />
                        </Grid>
                      </Grid>
                    </div>
                    {seconds > 60 ? (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "red",
                          margin:
                            direction === RTL_DIRECTION
                              ? "-7px 134px 5px 0px"
                              : "-7px 0px 5px 134px",
                        }}
                      >
                        {
                          //Modified on 14/10/2023, bug_id:139358
                        }
                        {t("valueMustLieinRangeMessage")}
                        {SPACE}
                        {t("zeroToSixty")}
                      </p>
                    ) : null}
                  </div>
                  <Grid
                    item
                    container
                    xs={props.isDrawerExpanded ? 7 : 12}
                    spacing={1}
                    justifyContent="end"
                    style={{ marginTop: "1rem" }}
                  >
                    <Grid item xs={4}></Grid>
                    <Grid item xs={8}>
                      <CustomizedDropdown
                        id={
                          daysType == "Y"
                            ? "pmweb_OptionsTab_DaysTypeHandler_WorkingDays"
                            : "pmweb_OptionsTab_DaysTypeHandler_CalendarDays"
                        }
                        disabled={
                          expireStatus == t("neverExpires") || isReadOnly
                        }
                        inputProps={{ "aria-label": "Without label" }}
                        value={daysType}
                        onChange={(e) => daysTypeHandler(e)}
                        displayEmpty
                        // style={{
                        //   marginLeft:
                        //     direction == RTL_DIRECTION
                        //       ? "0px"
                        //       : props.isDrawerExpanded
                        //       ? "9.3vw"
                        //       : "6.4vw",
                        //   marginRight:
                        //     direction == RTL_DIRECTION
                        //       ? props.isDrawerExpanded
                        //         ? "9.5vw"
                        //         : "6.7vw"
                        //       : "0vw",
                        //   // width: props.isDrawerExpanded ? "100%" : "75%",
                        // }}
                        className={
                          isReadOnly
                            ? "time_Options_disabled newWidth"
                            : "time_Options newWidth"
                        }
                        hideDefaultSelect={true}
                        isNotMandatory={true}
                        relativeStyle={{ width: "100%" }}
                      >
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.menuItemStyles
                              : styles.menuItemStyles
                          }
                          value={"Y"}
                        >
                          Working Day(s)
                        </MenuItem>
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.menuItemStyles
                              : styles.menuItemStyles
                          }
                          value={"N"}
                        >
                          Calender Day(s)
                        </MenuItem>
                      </CustomizedDropdown>
                    </Grid>
                  </Grid>
                </div>
                <div
                  className="onExpiryDivSection"
                  style={{ marginBottom: "1rem", width: "100%" }}
                >
                  <Grid
                    container
                    xs={props.isDrawerExpanded ? 7 : 12}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Grid item xs={4}>
                      <p className="onExpiryLabel">{t("onExpiry")}</p>
                    </Grid>
                    <Grid item xs={8}>
                      <FormControl style={{ width: "100%" }}>
                        <CustomizedDropdown
                          id={`pmweb_OptionsTab_RouteToHandler`}
                          disabled={
                            expireStatus === t("neverExpires") || isReadOnly
                          }
                          inputProps={{ "aria-label": "Without label" }}
                          value={routeTo}
                          onChange={(e) => routeToHandler(e)}
                          displayEmpty
                          className={
                            isReadOnly
                              ? "time_Options_disabled newWidth"
                              : "time_Options newWidth"
                          }
                          hideDefaultSelect={true}
                          isNotMandatory={true}
                          // style={{ marginLeft: "16px" }}
                        >
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.menuItemStyles
                                : styles.menuItemStyles
                            }
                            value={t("previousStage")}
                          >
                            {t("previousStage")}
                          </MenuItem>
                          {localLoadedProcessData.MileStones?.map((mile) => {
                            return mile.Activities?.map((activity) => {
                              if (
                                activity.ActivityName !== props.cellName &&
                                noIncomingTypes(activity, t)
                              )
                                return (
                                  <MenuItem
                                    className={
                                      direction === RTL_DIRECTION
                                        ? arabicStyles.menuItemStyles
                                        : styles.menuItemStyles
                                    }
                                    value={activity.ActivityName}
                                  >
                                    {activity.ActivityName}
                                  </MenuItem>
                                );
                            });
                          })}
                        </CustomizedDropdown>
                      </FormControl>
                    </Grid>
                  </Grid>
                </div>
                <div className="triggerDivSection" style={{ width: "100%" }}>
                  <Grid
                    container
                    xs={props.isDrawerExpanded ? 7 : 12}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Grid item xs={2}>
                      <p className="triggerLabel">{t("trigger")}</p>
                    </Grid>
                    <Grid item xs={2}>
                      <Checkbox
                        id="pmweb_OptionsTab_TriggerCheckValue"
                        disabled={
                          expireStatus == t("neverExpires") || isReadOnly
                        }
                        checked={triggerCheckValue}
                        onChange={(e) => {
                          // code edited on 2 Jan 2023 for BugId 121375
                          setTriggerCheckValue(e.target.checked);
                          clearTriggerValues(e.target.checked);
                        }}
                        inputProps={{ "aria-label": "Trigger" }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setTriggerCheckValue(!triggerCheckValue);
                            clearTriggerValues(!triggerCheckValue);
                            e.stopPropagation();
                          }
                        }}
                        // style={{ marginRight: "2.5vw" }}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <FormControl style={{ width: "100%" }}>
                        <CustomizedDropdown
                          id={
                            selectedTrigger
                              ? `pmweb_OptionsTab_SelectedTrigger_${selectedTrigger}`
                              : `pmweb_OptionsTab_SelectedTrigger`
                          }
                          disabled={
                            expireStatus == t("neverExpires") ||
                            !triggerCheckValue ||
                            isReadOnly
                          }
                          inputProps={{ "aria-label": "Without label" }}
                          value={selectedTrigger}
                          onChange={(e) => {
                            setSelectedTrigger(e.target.value);
                            setActivityPropertyData(
                              e.target.value,
                              "expiryInfo",
                              "triggerName",
                              "",
                              ""
                            );
                          }}
                          className={
                            !triggerCheckValue || isReadOnly
                              ? "time_Options_disabled newWidth"
                              : "time_Options newWidth"
                          }
                          hideDefaultSelect={true}
                          isNotMandatory={true}
                        >
                          {localLoadedProcessData.TriggerList?.map(
                            (trigger) => {
                              return (
                                <MenuItem
                                  className={
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.menuItemStyles
                                      : styles.menuItemStyles
                                  }
                                  value={trigger.TriggerName}
                                >
                                  {trigger.TriggerName}
                                </MenuItem>
                              );
                            }
                          )}
                        </CustomizedDropdown>
                      </FormControl>
                    </Grid>
                  </Grid>
                </div>
              </Grid>
            )}
            {props.tabName && props.tabName === "Timer" ? (
              <>
                {
                  //added by mahtab for timer
                }
                <Grid
                  container
                  xs={
                    props.isDrawerExpanded
                      ? window.innerWidth > 820
                        ? 6
                        : 10
                      : 12
                  }
                >
                  <div id="manualUnhold" style={{ width: "100%" }}>
                    <Grid item xs={props.isDrawerExpanded ? 7 : 12} spacing={1}>
                      <h3 className="timerHeading title_text">
                        {t("manualUnhold")}
                      </h3>
                    </Grid>
                    {/* <div
                    className="onExpiryDivSection"
                    style={{ gridGap: "1vw" }}
                  > */}
                    {/* code updated on 28-09-2023 added MUI grid to design the fields and make it responsive for bugId:138137  */}
                    <Grid
                      container
                      direction="column"
                      style={{ paddingTop: "10px" }}
                      spacing={1}
                    >
                      <Grid
                        item
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                        xs={props.isDrawerExpanded ? 7 : 12}
                      >
                        <Grid item xs={4}>
                          <p className="targetAct subtitle_text">
                            {t("targetAct")}
                          </p>
                        </Grid>
                        <Grid item xs={8}>
                          <FormControl
                            // style={{
                            //   paddingLeft: props.isDrawerExpanded
                            //     ? "2.3vw"
                            //     : "" ||
                            //       (window.innerWidth < 800 &&
                            //         props.isDrawerExpanded < 800)
                            //     ? "4.2vw"
                            //     : "2.3vw",
                            // }}
                            style={{ width: "100%" }}
                          >
                            {/*code updated on 10 October 2022 for BugId 116897*/}
                            <CustomizedDropdown
                              id="pmweb_OptionsTab_TargetActivityValue"
                              disabled={
                                expireStatus == t("neverExpires") || isReadOnly
                              }
                              inputProps={{ "aria-label": "Without label" }}
                              value={targetActVal}
                              onChange={(e) => changeTargetAct(e)}
                              displayEmpty
                              className={
                                isReadOnly
                                  ? "time_Options_disabled newWidth"
                                  : "time_Options newWidth"
                              }
                              hideDefaultSelect={true}
                              isNotMandatory={true}
                            >
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                value={t("previousStage")}
                              >
                                {t("previousStage")}
                              </MenuItem>
                              {localLoadedProcessData.MileStones?.map(
                                (mile) => {
                                  return mile.Activities.map((activity) => {
                                    if (
                                      activity.ActivityName !==
                                        props.cellName &&
                                      noIncomingTypes(activity, t)
                                    )
                                      return (
                                        <MenuItem
                                          className={
                                            direction === RTL_DIRECTION
                                              ? arabicStyles.menuItemStyles
                                              : styles.menuItemStyles
                                          }
                                          value={activity.ActivityName}
                                        >
                                          {activity.ActivityName}
                                        </MenuItem>
                                      );
                                  });
                                }
                              )}
                            </CustomizedDropdown>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Grid
                        item
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                        xs={props.isDrawerExpanded ? 7 : 12}
                      >
                        {/* </div> */}
                        {/* <div className="triggerDivSection" style={{ gridGap: "1vw" }}> */}
                        <Grid item xs={2}>
                          <p className="triggerLabel">{t("trigger")}</p>
                        </Grid>
                        <Grid item xs={2}>
                          <Checkbox
                            id="pmweb_OptionsTab_TriggerCheckVal"
                            tabIndex={0}
                            inputProps={{ "aria-label": "Trigger" }}
                            disabled={
                              expireStatus == t("neverExpires") || isReadOnly
                            }
                            checked={triggerCheckValueMU}
                            onChange={(e) => {
                              triggerCheckedMU(e);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                triggerCheckedMU(e);
                                e.stopPropagation();
                              }
                            }}
                            // style={{ marginRight: "2.5vw" }}
                          />
                        </Grid>
                        <Grid item xs={8}>
                          <FormControl
                            // style={{
                            //   paddingLeft: props.isDrawerExpanded
                            //     ? "2.3vw"
                            //     : "" ||
                            //       (window.innerWidth < 800 &&
                            //         props.isDrawerExpanded < 800)
                            //     ? "1.2vw"
                            //     : "0.3vw",
                            // }}
                            style={{ width: "100%" }}
                          >
                            <CustomizedDropdown
                              id={
                                selectedTriggerMU
                                  ? `pmweb_OptionsTab_SelectedTriggerMU_${selectedTriggerMU}`
                                  : `pmweb_OptionsTab_SelectedTriggerMU`
                              }
                              disabled={!triggerCheckValueMU}
                              inputProps={{ "aria-label": "Without label" }}
                              value={selectedTriggerMU}
                              onChange={(e) => {
                                changeTrigerMU(e.target.value);
                              }}
                              displayEmpty
                              className={
                                isReadOnly
                                  ? "time_Options_disabled newWidth"
                                  : "time_Options newWidth"
                              }
                              hideDefaultSelect={true}
                              isNotMandatory={true}
                            >
                              {localLoadedProcessData.TriggerList?.map(
                                (trigger) => {
                                  return (
                                    <MenuItem
                                      className={
                                        direction === RTL_DIRECTION
                                          ? arabicStyles.menuItemStyles
                                          : styles.menuItemStyles
                                      }
                                      value={trigger.TriggerName}
                                    >
                                      {trigger.TriggerName}
                                    </MenuItem>
                                  );
                                }
                              )}
                            </CustomizedDropdown>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* till here for bugId:138137  */}
                    {/* </div> */}
                  </div>
                </Grid>
                <Grid
                  container
                  id="events"
                  style={{ width: "100%", minWidth: "70vw", marginTop: "1rem" }}
                >
                  <Grid item xs={12}>
                    <h3 className="timerHeading title_text">{t("events")}</h3>
                  </Grid>
                  <Grid
                    item
                    container
                    className="eventsField"
                    xs={12}
                    spacing={1}
                    style={{ flexWrap: "nowrap" }}
                  >
                    <Grid
                      item
                      container
                      className="evtFldName"
                      xs={4}
                      style={{ flexWrap: "nowrap" }}
                    >
                      <Grid item xs={3} className="elementLabel">
                        {t("eventName")}
                        <span style={{ color: "red" }}>*</span>
                      </Grid>
                      <Grid item xs={9} className="elementTxt">
                        <TextField
                          id="pmweb_OptionsTab_EventName"
                          inputProps={{ "aria-label": "Event Name" }}
                          onChange={changeEventHandler}
                          className={
                            isReadOnly
                              ? "time_Options_disabled newWidth"
                              : "time_Options newWidth"
                          }
                          variant="outlined"
                          disabled={
                            expireStatus == t("neverExpires") || isReadOnly
                          }
                          inputRef={eventNameRef}
                          onKeyPress={(e) => {
                            FieldValidations(e, 150, eventNameRef.current, 50);
                          }}
                          value={eventName} //code updated on 28 September 2022 for BugId 116207
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      container
                      className="evtFldName"
                      xs={4}
                      style={{ flexWrap: "nowrap" }}
                    >
                      <Grid item xs={3} className="elementLabel">
                        {t("triggerName")}
                      </Grid>
                      <Grid item xs={9} className="elementSelect">
                        <FormControl style={{ width: "100%" }}>
                          <CustomizedDropdown
                            id={
                              selectedTriggerEvent
                                ? `pmweb_OptionsTab_SelectedTriggerEvent_${selectedTriggerEvent}`
                                : `pmweb_OptionsTab_SelectedTriggerEvent`
                            }
                            disabled={
                              expireStatus === t("neverExpires") || isReadOnly
                            }
                            inputProps={{ "aria-label": "Without label" }}
                            value={selectedTriggerEvent}
                            onChange={(e) => {
                              triggerEventHandler(e);
                            }}
                            displayEmpty
                            className={
                              isReadOnly
                                ? "time_Options_disabled newWidth"
                                : "time_Options newWidth"
                            }
                            hideDefaultSelect={true}
                            isNotMandatory={true}
                          >
                            {localLoadedProcessData.TriggerList?.map(
                              (trigger) => {
                                return (
                                  <MenuItem
                                    className={
                                      direction === RTL_DIRECTION
                                        ? arabicStyles.menuItemStyles
                                        : styles.menuItemStyles
                                    }
                                    value={trigger.TriggerName}
                                  >
                                    {trigger.TriggerName}
                                  </MenuItem>
                                );
                              }
                            )}
                          </CustomizedDropdown>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid
                      item
                      container
                      className="evtFldName"
                      xs={4}
                      style={{ flexWrap: "nowrap" }}
                    >
                      <Grid item xs={3} className="elementLabel">
                        {t("targetAct")}
                        <span style={{ color: "red" }}>*</span>
                      </Grid>
                      <Grid item xs={9} className="elementSelect">
                        <FormControl style={{ width: "100%" }}>
                          <CustomizedDropdown
                            id={
                              targetActEvent
                                ? `pmweb_OptionsTab_TargetActivityEvent_${targetActEvent}`
                                : `pmweb_OptionsTab_TargetActivityEvent`
                            }
                            disabled={
                              expireStatus === t("neverExpires") || isReadOnly
                            }
                            inputProps={{ "aria-label": "Without label" }}
                            value={targetActEvent}
                            onChange={(e) => {
                              targetActEventHandler(e);
                            }}
                            displayEmpty
                            className={
                              isReadOnly
                                ? "time_Options_disabled newWidth"
                                : "time_Options newWidth"
                            }
                            hideDefaultSelect={true}
                            isNotMandatory={true}
                          >
                            <MenuItem
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.menuItemStyles
                                  : styles.menuItemStyles
                              }
                              value={t("previousStage")}
                            >
                              {t("previousStage")}
                            </MenuItem>
                            {localLoadedProcessData.MileStones?.map((mile) => {
                              return mile.Activities.map((activity) => {
                                if (
                                  activity.ActivityName !== props.cellName &&
                                  noIncomingTypes(activity, t)
                                )
                                  return (
                                    <MenuItem
                                      className={
                                        direction === RTL_DIRECTION
                                          ? arabicStyles.menuItemStyles
                                          : styles.menuItemStyles
                                      }
                                      value={activity.ActivityName}
                                    >
                                      {activity.ActivityName}
                                    </MenuItem>
                                  );
                              });
                            })}
                          </CustomizedDropdown>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      container
                      className="evtFldName"
                      xs={1}
                      style={{ flexWrap: "nowrap" }}
                      justifyContent="center"
                    >
                      <Button
                        id="pmweb_OptionsTab_AssociateDataBtn"
                        tabIndex={0}
                        variant="contained"
                        aria-label="Add Event"
                        size="small"
                        className="primary btnEvent"
                        onClick={associateData}
                        disabled={
                          expireStatus === t("neverExpires") || isReadOnly
                        }
                      >
                        <AddIcon />
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    container
                    className={
                      props.isDrawerExpanded
                        ? "associate-list-expand"
                        : "associate-list"
                    }
                    xs={12}
                  >
                    <TableContainer
                      component={Paper}
                      className={
                        props.isDrawerExpanded
                          ? direction == RTL_DIRECTION
                            ? "associate-tbl-expand-rtl"
                            : "associate-tbl-expand"
                          : direction == RTL_DIRECTION
                          ? "associate-tbl-rtl"
                          : "associate-tbl"
                      }
                    >
                      <Table size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              align={
                                direction == RTL_DIRECTION ? "right" : "left"
                              }
                              style={{ width: "31%" }}
                            >
                              {t("eventName")}
                            </TableCell>
                            <TableCell
                              align={
                                direction == RTL_DIRECTION ? "right" : "left"
                              }
                              style={{ width: "31%" }}
                            >
                              {t("triggerName")}
                            </TableCell>
                            <TableCell
                              align={
                                direction == RTL_DIRECTION ? "right" : "left"
                              }
                              style={{ width: "31%" }}
                            >
                              {t("targetAct")}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                width: "7%",
                                textAlign: "center !important",
                              }}
                            ></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mappedEvents && mappedEvents.length > 0
                            ? mappedEvents?.map((item, i) => (
                                <TableRow
                                  key={i}
                                  // sx={{
                                  //   "&:last-child td, &:last-child th": {
                                  //     border: 0,
                                  //   },
                                  // }}
                                >
                                  <TableCell
                                    //component="th"
                                    align={
                                      direction == RTL_DIRECTION
                                        ? "right"
                                        : "left"
                                    }
                                    scope="row"
                                    style={{ width: "31%" }}
                                  >
                                    {item.m_strEventName}
                                  </TableCell>
                                  <TableCell
                                    align={
                                      direction == RTL_DIRECTION
                                        ? "right"
                                        : "left"
                                    }
                                    style={{ width: "31%" }}
                                  >
                                    {item.m_strEventTrigName}
                                  </TableCell>
                                  <TableCell
                                    align={
                                      direction == RTL_DIRECTION
                                        ? "right"
                                        : "left"
                                    }
                                    style={{ width: "31%" }}
                                  >
                                    {item.m_strEventTrgAct}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={{
                                      width: "7%",
                                    }}
                                  >
                                    <DeleteIcon
                                      id={`pmweb_OptionsTab_DeleteDataBtn_${i}`}
                                      tabIndex={0}
                                      onClick={() => {
                                        deleteData(item.m_strEventName, i);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          deleteData(item.m_strEventName, i);
                                          e.stopPropagation();
                                        }
                                      }}
                                      className="icon-button"
                                      style={{ cursor: "pointer" }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            : null}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* <table
                      className={
                        props.isDrawerExpanded
                          ? direction == RTL_DIRECTION
                            ? "associate-tbl-expand-rtl"
                            : "associate-tbl-expand"
                          : direction == RTL_DIRECTION
                          ? "associate-tbl-rtl"
                          : "associate-tbl"
                      }
                      direction
                    >
                      <tr>
                        <th>{t("eventName")}</th>
                        <th>{t("triggerName")}</th>
                        <th>{t("targetAct")}</th>
                        <th>
                          <span style={{ display: "none" }}>
                            Delete Icon header
                          </span>
                        </th>
                      </tr>

                      {mappedEvents && mappedEvents.length > 0
                        ? mappedEvents?.map((item, i) => (
                            <tr key={i}>
                              <td className="" align="center">
                                {item.m_strEventName}
                              </td>
                              <td align="center">{item.m_strEventTrigName}</td>
                              <td align="center">{item.m_strEventTrgAct}</td>

                              <td>
                                <DeleteIcon
                                  id={`pmweb_OptionsTab_DeleteDataBtn_${i}`}
                                  tabIndex={0}
                                  onClick={() => {
                                    deleteData(item.m_strEventName, i);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      deleteData(item.m_strEventName, i);
                                      e.stopPropagation();
                                    }
                                  }}
                                  className="icon-button"
                                  style={{ cursor: "pointer" }}
                                />
                              </td>
                            </tr>
                          ))
                        : null}
                    </table> */}
                  </Grid>
                </Grid>
              </>
            ) : (
              <>
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* 
                      Bug 134643 - improper spacing of checkbox and the date and time boxes appears to be distorted
                      Author: Siddhant Rastogi
                      Resolution:- Spacing issue has been resolved by using Material UI Grid component.
                      Date:- 25-Aug-2023
                    */}
                    <Grid container>
                      <Grid item>
                        <Checkbox
                          id="pmweb_OptionsTab_TurnAroundCheckVal"
                          tabIndex={0}
                          checked={turnAroundCheckValue}
                          onChange={() => {
                            setTurnAroundCheckValue(!turnAroundCheckValue);
                            clearTurnAroundTimeValues();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setTurnAroundCheckValue(!turnAroundCheckValue);
                              clearTurnAroundTimeValues();
                              e.stopPropagation();
                            }
                          }}
                          disabled={isReadOnly} // code edited on 14 Jan 2023 for BugId 122463
                          style={{
                            margin:
                              direction === RTL_DIRECTION
                                ? "0px 0 0 0.5vw"
                                : "0px 0.5vw 0 0",
                          }}
                        />
                      </Grid>

                      <Grid item>
                        <span className="turnAroundTimeLabel">
                          {t("turnAroundTime")}
                        </span>
                      </Grid>
                    </Grid>
                  </div>
                  <Grid
                    className="optionsTab_timeMapping"
                    style={{ width: "100%" }}
                    xs={
                      props.isDrawerExpanded
                        ? window.innerWidth > 820
                          ? 6
                          : 10
                        : 12
                    }
                  >
                    <div>
                      <div className="options_time">
                        <Grid
                          container
                          xs={props.isDrawerExpanded ? 7 : 12}
                          spacing={1}
                          justifyContent="space-between"
                        >
                          <Grid item xs={4}>
                            <span
                              className="options_days"
                              style={{
                                marginRight:
                                  direction == RTL_DIRECTION ? "0px" : "0.5vw",
                                marginLeft:
                                  direction == RTL_DIRECTION ? "0.5vw" : "0px",
                              }}
                            >
                              {t("days")}
                            </span>
                          </Grid>
                          <Grid item xs={8}>
                            <SelectWithInput
                              dropdownOptions={filteredVarList}
                              showError={true}
                              optionKey="VariableName"
                              setValue={(val) => {
                                setTurnAroundDays(val);
                                setActivityPropertyData(
                                  !isNaN(val) ? val : val?.VariableName,
                                  "tatInfo",
                                  "wfDays",
                                  "varFieldId_Days",
                                  "variableId_Days"
                                );
                              }}
                              value={turnAroundDays}
                              isConstant={!isNaN(turnAroundDays)}
                              inputClass="selectWithInputTextField_WS"
                              constantInputClass="multiSelectConstInput_WS"
                              selectWithInput="selectWithInput_WS"
                              showEmptyString={false}
                              showConstValue={true}
                              disabled={!turnAroundCheckValue || isReadOnly}
                              id="pmweb_OptionsTab_TurnAroundDays"
                              constHeight={true}
                            />
                          </Grid>
                        </Grid>
                      </div>
                      <div className="options_time">
                        <Grid
                          container
                          xs={props.isDrawerExpanded ? 7 : 12}
                          spacing={1}
                          justifyContent="space-between"
                        >
                          <Grid item xs={4}>
                            <span
                              className="options_hours"
                              style={{
                                marginRight:
                                  direction == RTL_DIRECTION ? "0px" : "8px",
                                marginLeft:
                                  direction == RTL_DIRECTION ? "8px" : "0px",
                              }}
                            >
                              {/*code modified on 12-09-2023 for bug 36572 */}
                              {t("hours")}
                            </span>
                          </Grid>
                          <Grid item xs={8}>
                            <SelectWithInput
                              dropdownOptions={filteredVarList}
                              showError={true}
                              optionKey="VariableName"
                              setValue={(val) => {
                                setTurnAroundHours(val);
                                let tempObj = { ...tatErrorObj };
                                if (!isNaN(val)) {
                                  if (val > 24) {
                                    tempObj.hours = true;
                                  } else {
                                    tempObj.hours = false;
                                  }
                                } else {
                                  tempObj.hours = false;
                                }
                                setTatErrorObj(tempObj);
                                if (!tempObj.hours) {
                                  setActivityPropertyData(
                                    !isNaN(val) ? val : val?.VariableName,
                                    "tatInfo",
                                    "wfHours",
                                    "varFieldId_Hours",
                                    "variableId_Hours"
                                  );
                                }
                              }}
                              value={turnAroundHours}
                              isConstant={!isNaN(turnAroundHours)}
                              inputClass="selectWithInputTextField_WS"
                              constantInputClass="multiSelectConstInput_WS"
                              selectWithInput="selectWithInput_WS"
                              showEmptyString={false}
                              showConstValue={true}
                              disabled={!turnAroundCheckValue || isReadOnly}
                              id="pmweb_OptionsTab_TurnAroundHours"
                              constHeight={true}
                            />
                          </Grid>
                        </Grid>
                      </div>
                      {turnAroundHours > 24 ? (
                        <p
                          style={{
                            fontSize: "10px",
                            color: "red",
                            margin:
                              direction === RTL_DIRECTION
                                ? "-7px 134px 5px 0px"
                                : "-7px 0px 5px 134px",
                          }}
                        >
                          {
                            //Modified on 14/10/2023, bug_id:139358
                          }
                          {t("valueMustLieinRangeMessage")}
                          {SPACE}
                          {t("zeroToTwentyFour")}
                        </p>
                      ) : null}
                      <div className="options_time">
                        <Grid
                          container
                          xs={props.isDrawerExpanded ? 7 : 12}
                          spacing={1}
                          justifyContent="space-between"
                        >
                          <Grid item xs={4}>
                            <span
                              className="options_minutes"
                              style={{
                                marginRight:
                                  direction == RTL_DIRECTION ? "0px" : "16px",
                                marginLeft:
                                  direction == RTL_DIRECTION ? "16px" : "0px",
                              }}
                            >
                              {t("minutes")}
                            </span>
                          </Grid>
                          <Grid item xs={8}>
                            <SelectWithInput
                              dropdownOptions={filteredVarList}
                              showError={true}
                              optionKey="VariableName"
                              setValue={(val) => {
                                setTurnAroundMinutes(val);
                                let tempObj = { ...tatErrorObj };
                                if (!isNaN(val)) {
                                  if (val > 60) {
                                    tempObj.minutes = true;
                                  } else {
                                    tempObj.minutes = false;
                                  }
                                } else {
                                  tempObj.minutes = false;
                                }
                                setTatErrorObj(tempObj);
                                if (!tempObj.minutes) {
                                  setActivityPropertyData(
                                    !isNaN(val) ? val : val?.VariableName,
                                    "tatInfo",
                                    "wfMinutes",
                                    "varFieldId_Minutes",
                                    "variableId_Minutes"
                                  );
                                }
                              }}
                              value={turnAroundMinutes}
                              isConstant={!isNaN(turnAroundMinutes)}
                              inputClass="selectWithInputTextField_WS"
                              constantInputClass="multiSelectConstInput_WS"
                              selectWithInput="selectWithInput_WS"
                              showEmptyString={false}
                              showConstValue={true}
                              disabled={!turnAroundCheckValue || isReadOnly}
                              id="pmweb_OptionsTab_TurnAroundMinutes"
                              constHeight={true}
                            />
                          </Grid>
                        </Grid>
                      </div>
                      {turnAroundMinutes > 60 ? (
                        <p
                          style={{
                            fontSize: "10px",
                            color: "red",
                            margin:
                              direction === RTL_DIRECTION
                                ? "-7px 134px 5px 0px"
                                : "-7px 0px 5px 134px",
                          }}
                        >
                          {
                            //Modified on 14/10/2023, bug_id:139358
                          }
                          {t("valueMustLieinRangeMessage")}
                          {SPACE}
                          {t("zeroToSixty")}
                        </p>
                      ) : null}
                      <div className="options_time">
                        <Grid
                          container
                          xs={props.isDrawerExpanded ? 7 : 12}
                          spacing={1}
                          justifyContent="space-between"
                        >
                          <Grid item xs={4}>
                            <span
                              className="options_seconds"
                              style={{
                                marginRight:
                                  direction == RTL_DIRECTION ? "0px" : "0.5vw",
                                marginLeft:
                                  direction == RTL_DIRECTION ? "0.5vw" : "0px",
                              }}
                            >
                              {t("seconds")}
                            </span>
                          </Grid>
                          <Grid item xs={8}>
                            <SelectWithInput
                              dropdownOptions={filteredVarList}
                              showError={true}
                              optionKey="VariableName"
                              setValue={(val) => {
                                setTurnAroundSeconds(val);
                                let tempObj = { ...tatErrorObj };
                                if (!isNaN(val)) {
                                  if (val > 60) {
                                    tempObj.seconds = true;
                                  } else {
                                    tempObj.seconds = false;
                                  }
                                } else {
                                  tempObj.seconds = false;
                                }
                                setTatErrorObj(tempObj);
                                if (!tempObj.seconds) {
                                  setActivityPropertyData(
                                    !isNaN(val) ? val : val?.VariableName,
                                    "tatInfo",
                                    "wfSeconds",
                                    "varFieldId_Seconds",
                                    "variableId_Seconds"
                                  );
                                }
                              }}
                              value={turnAroundSeconds}
                              isConstant={!isNaN(turnAroundSeconds)}
                              inputClass="selectWithInputTextField_WS"
                              constantInputClass="multiSelectConstInput_WS"
                              selectWithInput="selectWithInput_WS"
                              showEmptyString={false}
                              showConstValue={true}
                              disabled={!turnAroundCheckValue || isReadOnly}
                              id="pmweb_OptionsTab_TurnAroundSeconds"
                              constHeight={true}
                            />
                          </Grid>
                        </Grid>
                      </div>
                      {turnAroundSeconds > 60 ? (
                        <p
                          style={{
                            fontSize: "10px",
                            color: "red",
                            margin:
                              direction === RTL_DIRECTION
                                ? "-7px 134px 5px 0px"
                                : "-7px 0px 5px 134px",
                          }}
                        >
                          {
                            //Modified on 14/10/2023, bug_id:139358
                          }
                          {t("valueMustLieinRangeMessage")}
                          {SPACE}
                          {t("zeroToSixty")}
                        </p>
                      ) : null}
                    </div>
                    <Grid
                      item
                      container
                      xs={props.isDrawerExpanded ? 7 : 12}
                      justifyContent="end"
                      spacing={1}
                    >
                      <Grid item xs={4}></Grid>
                      <Grid item xs={8} spacing={1}>
                        <CustomizedDropdown
                          id="pmweb_OptionsTab_TATInfoDaysType"
                          disabled={!turnAroundCheckValue || isReadOnly} // code edited on 14 Jan 2023 for BugId 122463
                          inputProps={{ "aria-label": "Without label" }}
                          value={tatInfoDaysType}
                          onChange={(e) => tatInfoDaysTypeHandler(e)}
                          displayEmpty
                          className={
                            !turnAroundCheckValue || isReadOnly
                              ? "time_Options_disabled newWidth"
                              : "time_Options newWidth"
                          }
                          hideDefaultSelect={true}
                          isNotMandatory={true}
                        >
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.menuItemStyles
                                : styles.menuItemStyles
                            }
                            value={"Y"}
                          >
                            Working Day(s)
                          </MenuItem>
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.menuItemStyles
                                : styles.menuItemStyles
                            }
                            value={"N"}
                          >
                            Calender Day(s)
                          </MenuItem>
                        </CustomizedDropdown>
                      </Grid>
                      {/* <div
                        style={{
                          display: "flex",
                          // justifyContent:
                          //   direction == RTL_DIRECTION ? "none" : "end",
                          // width: "27vw",
                          marginTop: "1rem",
                          marginRight:
                            props.isDrawerExpanded || direction == RTL_DIRECTION
                              ? null
                              : "0.5vw",
                        }}
                      >
                        <Grid
                          container
                          xs={props.isDrawerExpanded ? 9 : 12}
                          justifyContent="end"
                          spacing={1}
                        >
                          <Grid
                            item
                            xs={4}
                            // style={{
                            //   marginRight:
                            //     direction == RTL_DIRECTION ? "0px" : "0.5vw",
                            //   marginLeft:
                            //     direction == RTL_DIRECTION ? "0.5vw" : "0px",
                            // }}
                          ></Grid>
                          <Grid
                            item
                            xs={8}
                            // style={{
                            //   marginLeft:
                            //     direction == RTL_DIRECTION
                            //       ? "0px"
                            //       : props.isDrawerExpanded
                            //       ? "9.5vw"
                            //       : //code modified added conditions for innerwidth to make it responsive on 05-10-2023 for BugId: 133987
                            //       window.innerWidth < 830
                            //       ? "10.7vw"
                            //       : window.innerWidth > 830 &&
                            //         window.innerWidth < 1200
                            //       ? "8.7vw"
                            //       : //till here for BugId: 133987
                            //         "6.7vw",
                            //   marginRight:
                            //     direction == RTL_DIRECTION
                            //       ? props.isDrawerExpanded
                            //         ? "9.5vw"
                            //         : "6.7vw"
                            //       : "0vw",
                            //   width: "100%",
                            // }}
                          >
                            <CustomizedDropdown
                              id="pmweb_OptionsTab_TATInfoDaysType"
                              disabled={!turnAroundCheckValue || isReadOnly} // code edited on 14 Jan 2023 for BugId 122463
                              inputProps={{ "aria-label": "Without label" }}
                              value={tatInfoDaysType}
                              onChange={(e) => tatInfoDaysTypeHandler(e)}
                              displayEmpty
                              className={
                                !turnAroundCheckValue || isReadOnly
                                  ? "time_Options_disabled newWidth"
                                  : "time_Options newWidth"
                              }
                              hideDefaultSelect={true}
                              isNotMandatory={true}
                            >
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                value={"Y"}
                              >
                                Working Day(s)
                              </MenuItem>
                              <MenuItem
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.menuItemStyles
                                    : styles.menuItemStyles
                                }
                                value={"N"}
                              >
                                Calender Day(s)
                              </MenuItem>
                            </CustomizedDropdown>
                          </Grid>
                          <Grid item></Grid>
                        </Grid>
                      </div> */}
                    </Grid>
                  </Grid>
                </div>
              </>
            )}
          </Grid>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(Options);
