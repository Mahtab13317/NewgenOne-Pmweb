// Changes made to solve Bug with Id 113573 => Basicdetails=>associatedqueue and use swimlane queue not working in expanded mode.
// #BugID - 116516
// #BugDescription - Added outgoing connection count to routing criteria count field and some CSS changes.
//Changes made to solve Bug 116386 - Call Activity: Instead of Registered Process it should be Deployed Process as every screen deployed process name is used
// #BugID - 115279
// #BugDescription - Double scrollbar issue has been fixed.
// #BugID - 110930
// #BugDescription - Calendar distortion issue fixed in .
//Changes made to solve Bug 123515 -Process Designer-icons related- UX and UI bugs

import React, { useState, useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import "../../Properties.css";
import { useTranslation } from "react-i18next";
import SunEditor from "../../../../UI/SunEditor/SunTextEditor";
import { connect } from "react-redux";
import { getActivityProps } from "../../../../utility/abstarctView/getActivityProps";
import MenuItem from "@material-ui/core/MenuItem";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import AddIcon from "@material-ui/icons/Add";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { store, useGlobalState } from "state-pool";
import * as actionCreators from "../../../../redux-store/actions/selectedCellActions";
import CreateIcon from "../../../../assets/Preview.svg";
import FormsAndValidations from "./FormsAndValidations";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown/index";
import {
  activityType,
  SERVER_URL,
  WEBSERVICESOAP,
  WEBSERVICEREST,
  RESCONSUMERJMS,
  RESCONSUMERSOAP,
  REQUESTCONSUMERSOAP,
  propertiesLabel,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  ENDPOINT_QUEUEASSOCIATION_DELETE,
  RTL_DIRECTION,
  headerHeight,
  ERROR_MANDATORY,
  SPACE,
  ERROR_INCORRECT_VALUE,
} from "../../../../Constants/appConstants.js";
import PeopleAndSystems from "./PeopleAndSystems";
import {
  arrMobileEnabledAbsent,
  arrEntrySettingsPresent,
  arrFormValidationAbsent,
} from "../../PropertyTabConstants";
import SetIconWithActivityType from "./SetIconWithActivityType.js";
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import { ChangeActivityType } from "../../../../utility/CommonAPICall/ChangeActivityType";
import { noIncomingTypes } from "../../../../utility/bpmnView/noIncomingTypes.js";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField";
// -----------------
import { useDispatch, useSelector } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import QueueAssociation from "../QueueAssociation/index.js";
import Modal from "../../../../UI/Modal/Modal.js";
import { getSelectedCellType } from "../../../../utility/abstarctView/getSelectedCellType.js";
import {
  OpenProcessSliceValue,
  setOpenProcess,
} from "../../../../redux-store/slices/OpenProcessSlice";
import {
  setWebservice,
  webserviceChangeVal,
} from "../../../../redux-store/slices/webserviceChangeSlice";
import {
  getIncorrectLenErrMsg,
  isArabicLocaleSelected,
  isReadOnlyFunc,
  restrictSpecialCharacter,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { expandDrawer } from "../../../../redux-store/actions/Properties/showDrawerAction";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { checkIfParentSwimlaneCheckedOut } from "../../../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { EditIcon } from "../../../../utility/AllImages/AllImages";
import { FormControlLabel, IconButton } from "@material-ui/core";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import secureLocalStorage from "react-secure-storage";
import TabsHeading from "../../../../UI/TabsHeading";
import { REGEX, validateRegex } from "../../../../validators/validator";

function BasicDetails(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const costRef = React.useRef();
  const mappedDocRef = React.useRef();

  const direction = `${t("HTML_DIR")}`;
  const [selfQueueCreated, setSelfQueueCreated] = useState(false);
  const [addDescriptionBoolean, setAddDescriptionBoolean] = useState(false);
  const [configPeopleAndSystem, setConfigPeopleAndSystem] = useState(false);
  const localActivityPropertyData = store.getState("activityPropertyData");
  const calendarList = store.getState("calendarList");
  const [conditionalValue, setConditionalValue] = useState("");
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [localCalendarList, setlocalCalendarList] =
    useGlobalState(calendarList);
  const [content, setContent] = useState("");
  const [
    localLoadedActivityPropertyData,
    setlocalLoadedActivityPropertyData,
    updatelocalLoadedActivityPropertyData,
  ] = useGlobalState(localActivityPropertyData);
  const [selectedWebService, setSelectedWebService] = useState(null);
  const [targetId, setTargetId] = useState("None");
  const [basicDetails, setbasicDetails] = useState({});
  const [spinner, setspinner] = useState(true);
  const [allActivitiesTargetDropdown, setAllActivitiesTargetDropdown] =
    useState([]);
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [selectedRegisteredProcess, setSelectedRegisteredProcess] =
    useState(null);
  const [deployedProcesses, setDeployedProcesses] = useState([]);
  const [showCostError, setShowCostError] = useState({});
  const [queueType, setQueueType] = useState(0);
  const [isUsingSwimlaneQueue, setIsUsingSwimlaneQueue] = useState(false);
  const [isUsingSelfQueue, setIsUsingSelfQueue] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  // code added on 07-10-2023 for Bug 132919
  const [tooltipOpen, setTooltipOpen] = useState(false);
  // till here for Bug 132919
  const [costLengthError, setCostLengthError] = useState(false)

  // code added on 6 July 2022 for BugId 111910
  const openProcessData = useSelector(OpenProcessSliceValue);
  // code added on 6 July 2022 for BugId 110924
  const [hasDefaultCheck, setHasDefaultCheck] = useState(false);
  const [defaultCheckDisabled, setDefaultCheckDisabled] = useState(false);
  const [localState, setLocalState] = useState(null);
  const webserviceVal = useSelector(webserviceChangeVal);
  const [showCalenderMFBool, setshowCalenderMFBool] = useState(false);
  const [updatedQueueId, setUpdatedQueueId] = useState(null);
  const locale = secureLocalStorage.getItem("locale");
  const [caseSummaryType, setCaseSummaryType] = useState("");
  const [costValue, setCostValue] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
      ?.genPropInfo?.cost != ""
      ? localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
          ?.genPropInfo?.cost
      : "0"
  );

  //Added on 23-08-2023 for BUGID: 134024
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  const webServiceDropdownOptions = [
    {
      value: WEBSERVICESOAP,
      activityType: 22,
      activitySubType: 1,
      name: t("webServiceSOAP"),
    },
    {
      value: WEBSERVICEREST,
      activityType: 40,
      activitySubType: 1,
      name: t("webServiceREST"),
    },
    {
      value: RESCONSUMERJMS,
      activityType: 23,
      activitySubType: 1,
      name: t("resConsumerJms"),
    },
    {
      value: RESCONSUMERSOAP,
      activityType: 25,
      activitySubType: 1,
      name: t("resConsumerSoap"),
    },
    {
      value: REQUESTCONSUMERSOAP,
      activityType: 24,
      activitySubType: 1,
      name: t("requestConsumerSoap"),
    },
  ];
  // code added on 07-10-2023 for Bug 132919
  const handleTooltipOpen = () => {
    setTooltipOpen(true);
  };

  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };
  //till here for Bug 132919

  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    let flag = false;
    localLoadedProcessData?.Lanes?.map((el) => {
      if (el.QueueId == props.cellQueueId) {
        flag = true;
      }
    });
    if (flag) {
      setIsUsingSwimlaneQueue(true);
      setIsUsingSelfQueue(false);
    } else {
      setIsUsingSwimlaneQueue(false);
      setIsUsingSelfQueue(true);
      setSelfQueueCreated(true);
    }
  }, []);

  useEffect(() => {
    // );
    if (
      (props.cellActivityType === 18 && props.cellActivitySubType === 1) ||
      (props.cellActivityType === 2 && props.cellActivitySubType === 2)
    ) {
      axios.get(SERVER_URL + `/getprocesslist/R/-1`).then((res) => {
        if (res?.data?.Status === 0) {
          setDeployedProcesses(res.data.Processes);
        }
      });
    }
    let activityProps = getActivityProps(
      props.cellActivityType,
      props.cellActivitySubType
    );
    setSelectedActivityType(activityProps[5]);
  }, []);

  const handleChange = (con) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (temp?.ActivityProperty?.actGenPropInfo?.genPropInfo?.description) {
      temp.ActivityProperty.actGenPropInfo.genPropInfo.description = con;
      setlocalLoadedActivityPropertyData(temp);
    }
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  useEffect(() => {
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
        ?.genPropInfo?.description !== ""
    ) {
      setAddDescriptionBoolean(true);
    }
    if (props.cellActivityType === 18 && props.cellActivitySubType === 1) {
      setSelectedRegisteredProcess(
        localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
          ?.importedProcessName
      );
    } else if (
      props.cellActivityType === 2 &&
      props.cellActivitySubType === 2
    ) {
      setSelectedRegisteredProcess(
        localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd
          ?.processName
      );
    }

    if (
      localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo?.genPropInfo?.cost?.trim() ===
      ""
    ) {
      setShowCostError({
        statement: t("CostFieldCantBeEmpty"),
        severity: "error",
        errorType: ERROR_MANDATORY,
      });
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: {
            isModified: true,
            hasError: true,
          },
        })
      );
    }
    /* else if (!validateRegex(localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo?.genPropInfo?.cost, REGEX.FloatPositive)) {
      setShowCostError({
        statement: t("numericValMsg"),
        severity: "error",
        errorType: ERROR_INCORRECT_VALUE,
      });
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: {
            isModified: true,
            hasError: true,
          },
        })
      );
    } */
    else {
      setCostValue(
        localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
          ?.genPropInfo?.cost
      );
    }
  }, [deployedProcesses, localLoadedActivityPropertyData]);

  useEffect(() => {
    let temp = JSON.parse(JSON.stringify(openProcessData.loadedData));
    setLocalState(temp);
    getAllActivities();
  }, [openProcessData.loadedData]);

  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status === 0) {
      setbasicDetails({ ...localLoadedActivityPropertyData?.ActivityProperty });
      if (
        (+localLoadedActivityPropertyData?.ActivityProperty?.actType === 40 &&
          +localLoadedActivityPropertyData?.ActivityProperty?.actSubType ===
            1) ||
        (+localLoadedActivityPropertyData?.ActivityProperty?.actType === 23 &&
          +localLoadedActivityPropertyData?.ActivityProperty?.actSubType ===
            1) ||
        (+localLoadedActivityPropertyData?.ActivityProperty?.actType === 24 &&
          +localLoadedActivityPropertyData?.ActivityProperty?.actSubType ===
            1) ||
        (+localLoadedActivityPropertyData?.ActivityProperty?.actType === 25 &&
          +localLoadedActivityPropertyData?.ActivityProperty?.actSubType ===
            1) ||
        (+localLoadedActivityPropertyData?.ActivityProperty?.actType === 22 &&
          +localLoadedActivityPropertyData?.ActivityProperty?.actSubType === 1)
      ) {
        webServiceDropdownOptions.forEach((item) => {
          if (
            +localLoadedActivityPropertyData?.ActivityProperty?.actType ===
              +item.activityType &&
            +localLoadedActivityPropertyData?.ActivityProperty?.actSubType ===
              +item.activitySubType
          ) {
            setSelectedWebService(item.value);
          }
        });
      }
      setTargetId(localLoadedActivityPropertyData?.ActivityProperty?.targetId);
      setspinner(false);
      // code added on 6 July 2022 for BugId 110924
      setHasDefaultCheck(
        localLoadedActivityPropertyData?.ActivityProperty?.primaryAct === "Y"
      );
      setDefaultCheckDisabled(
        localLoadedActivityPropertyData?.ActivityProperty?.oldPrimaryAct === "Y"
      );
      setContent(
        decodeURIComponent(
          localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
            ?.genPropInfo?.description
        )
      );
      let valid = validateActivity();
      if (!valid) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.basicDetails]: {
              isModified: false,
              hasError: true,
            },
          })
        );
      }
    }
    setConditionalValue(
      localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
        ?.m_strConditioalStart
    );
  }, [localLoadedActivityPropertyData]);

  // code added on 5 April 2023 for BugId 112610 and edited on 13 April 2023 for BugId 126756
  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status !== 0) {
      setspinner(true);
    }
  }, [props.cellID, localLoadedActivityPropertyData]);

  useEffect(() => {
    if (saveCancelStatus.CancelClicked) {
      webServiceDropdownOptions.forEach((item) => {
        if (+webserviceVal.initialWebservice === +item.activityType) {
          setSelectedWebService(item.value);
        }
      });
      if (
        (+props.cellActivityType === 40 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 23 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 24 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 25 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 22 && +props.cellActivitySubType === 1)
      ) {
        props.selectedCell(
          props.cellID,
          props.cellName,
          webserviceVal.initialWebservice,
          1,
          null,
          null,
          getSelectedCellType("ACTIVITY"),
          props.cellCheckedOut,
          props.cellLaneId
        );
      }
    }
    if (saveCancelStatus.SaveOnceClicked) {
      if (
        localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo?.genPropInfo?.cost?.trim() ===
        ""
      ) {
        setShowCostError({
          statement: t("CostFieldCantBeEmpty"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        });
      }

      if(costLengthError)
      {
        setShowCostError({
          statement: getIncorrectLenErrMsg("cost",13,t),
          severity: "error",
          errorType: ERROR_INCORRECT_VALUE,
        });
      }

      const { mileStoneIndex, activityIndex, activityId } =
        getActivityDetailsFromOpenProcess(props.cellID);
      let tempOpenProcess = JSON.parse(JSON.stringify(localLoadedProcessData));
      if (
        (+props.cellActivityType === 40 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 23 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 24 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 25 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 22 && +props.cellActivitySubType === 1)
      ) {
        // code edited on 22 Aug 2022 for BugId 114418
        if (
          +props.cellActivityType !== +webserviceVal.initialWebservice &&
          mileStoneIndex &&
          activityIndex &&
          // added on 16/10/23 for BugId 139602
          saveCancelStatus.SaveClicked
        ) {
          ChangeActivityType(
            tempOpenProcess?.ProcessDefId,
            props.cellName,
            // modified on 16/10/23 for BugId 139602
            /*tempOpenProcess.MileStones[mileStoneIndex].Activities[activityIndex]
              .ActivityType,
            tempOpenProcess.MileStones[mileStoneIndex].Activities[activityIndex]
              .ActivitySubType,
            setLocalLoadedProcessData, */
            props.cellActivityType,
            props.cellActivitySubType,
            setLocalState,
            mileStoneIndex,
            activityIndex,
            activityId,
            null
          );
        }
      }
    }
    dispatch(setSave({ SaveClicked: false, CancelClicked: false }));
  }, [saveCancelStatus.CancelClicked, saveCancelStatus.SaveClicked]);

  const validateActivity = () => {
    if (+props.cellActivityType === 18 && +props.cellActivitySubType === 1) {
      if (
        localLoadedActivityPropertyData?.ActivityProperty?.SubProcess?.importedProcessDefId?.trim() ===
          "" ||
        !localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
          ?.importedProcessDefId
      ) {
        return false;
      }
    }
    return true;
  };

  const getAllActivities = () => {
    let actList = [];
    let temp = JSON.parse(JSON.stringify(openProcessData.loadedData));
    // code added on 24 Jan 2023 for BugId 122791
    let isEmbedded = false,
      parentEmbeddedActId = null;

    let isParentLaneChecked =
      checkIfParentSwimlaneCheckedOut(temp, props.cellLaneId)?.length > 0;
    temp?.MileStones?.forEach((mileStone) => {
      mileStone?.Activities?.forEach((activity) => {
        if (
          +activity.ActivityId !== +props.cellID &&
          activity.EmbeddedActivity
        ) {
          activity.EmbeddedActivity[0]?.forEach((embAct) => {
            if (+embAct.ActivityId === +props.cellID) {
              isEmbedded = true;
              parentEmbeddedActId = activity.ActivityId;
            }
          });
        }
      });
    });
    temp?.MileStones?.forEach((mileStone) => {
      mileStone?.Activities?.forEach((activity) => {
        if (isEmbedded) {
          if (
            +parentEmbeddedActId === +activity.ActivityId &&
            activity.EmbeddedActivity
          ) {
            activity.EmbeddedActivity[0]?.forEach((embAct) => {
              if (
                embAct.ActivityId !== props.cellID &&
                noIncomingTypes(embAct, t)
              ) {
                if (
                  temp?.ProcessType !== PROCESSTYPE_LOCAL &&
                  temp?.ProcessType !== PROCESSTYPE_LOCAL_CHECKED &&
                  isParentLaneChecked &&
                  +embAct.LaneId === +props.cellLaneId
                ) {
                  actList = [...actList, embAct];
                } else {
                  actList = [...actList, embAct];
                }
              }
            });
          }
        } else {
          if (
            activity.ActivityId !== props.cellID &&
            noIncomingTypes(activity, t)
          ) {
            if (
              temp?.ProcessType !== PROCESSTYPE_LOCAL &&
              temp?.ProcessType !== PROCESSTYPE_LOCAL_CHECKED &&
              isParentLaneChecked &&
              +activity.LaneId === +props.cellLaneId
            ) {
              actList = [...actList, activity];
            } else {
              actList = [...actList, activity];
            }
          }
        }
      });
    });
    setAllActivitiesTargetDropdown(actList);
  };

  const getActivityDetailsFromOpenProcess = (activityId) => {
    let activityDetails = {
      mileStoneIndex: "",
      activityIndex: "",
      activityId: "",
    };
    localState?.MileStones?.forEach((mileStone, indexMilestone) => {
      mileStone?.Activities?.forEach((activity, indexActivity) => {
        if (activity.ActivityId == activityId) {
          activityDetails = {
            mileStoneIndex: indexMilestone,
            activityIndex: indexActivity,
            activityId: activityId,
            activityName: activity.ActivityName,
          };
        }
      });
    });
    return activityDetails;
  };

  // code edited on 22 July 2022 for BugId 113313
  const onSelect = (e) => {
    const { mileStoneIndex, activityIndex, activityId } =
      getActivityDetailsFromOpenProcess(props.cellID);
    let actType, actSubType;
    webServiceDropdownOptions.forEach((item) => {
      if (e.target.value === item.value) {
        actType = item.activityType;
        actSubType = item.activitySubType;
      }
    });
    props.selectedCell(
      activityId,
      props.cellName,
      actType,
      actSubType,
      null,
      null,
      getSelectedCellType("ACTIVITY"),
      props.cellCheckedOut,
      props.cellLaneId
    );
    let temp = { ...localLoadedActivityPropertyData };
    temp.ActivityProperty.actType = actType;
    temp.ActivityProperty.actSubType = actSubType;
    setlocalLoadedActivityPropertyData(temp);
    let tempLocal = JSON.parse(JSON.stringify(localState));
    tempLocal.MileStones[mileStoneIndex].Activities[
      activityIndex
    ].ActivityType = actType;
    tempLocal.MileStones[mileStoneIndex].Activities[
      activityIndex
    ].ActivitySubType = actSubType;
    dispatch(setOpenProcess({ loadedData: tempLocal }));
    dispatch(setWebservice({ webserviceChanged: true }));
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
      })
    );
  };

  const useStyles = makeStyles({
    input: {
      height: "var(--line_height)",
    },
    inputWithError: {
      height: "var(--line_height)",
      width: "5.875rem",
    },
    errorStatement: {
      color: "red",
      fontSize: "11px",
    },
    mainDiv: {
      //overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      /* code edited on 6 July 2023 for issue - save and 
      discard button hide issue in case of tablet(landscape mode)*/
      // modified on 26-9-2023 for bug_id: 133957
      height: (props) =>
        `calc((${props.windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
      fontFamily: "Open Sans",
      width: "100%",
      paddingTop: props.isDrawerExpanded ? "0" : "0.4rem",
      direction: direction,
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
        // overflowY: "visible",
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
    iconButton: {
      padding: "0px !important",
      height: "fit-content !important",
    },
  });
  // modified on 26-9-2023 for bug_id: 133957
  const classes = useStyles({ windowInnerHeight: windowInnerHeight });

  const getSelectedActivity = (data) => {
    let temp = JSON.parse(JSON.stringify(localState));
    let maxConnId = 0;
    temp.Connections?.forEach((conn) => {
      if (+conn.ConnectionId > +maxConnId) {
        maxConnId = +conn.ConnectionId;
      }
    });
    let newConnection = {
      ConnectionId: maxConnId + 1,
      Type: "D",
      SourceId: props.cellID,
      TargetId: data,
      xLeft: [],
      yTop: [],
    };

    if (data === 0) {
      temp.Connections?.forEach((el) => {
        if (el.SourceId == props.cellID) {
          let pos = temp.Connections.map(function (e) {
            return e.SourceId;
          }).indexOf(+props.cellID);
          temp.Connections[pos].TargetId = data;
          // method = DELETE;
        }
      });
    } else {
      if (temp.Connections.length !== 0) {
        let editBool = false,
          indexVal = null;
        temp.Connections.forEach((el, index) => {
          if (+el.SourceId === props.cellID) {
            editBool = true;
            indexVal = index;
          }
        });
        if (editBool) {
          temp.Connections[indexVal].TargetId = newConnection.TargetId;
          // code added on 5 Dec 2022 for BugId 111141
          temp.Connections[indexVal].status = "E";
          newConnection = temp.Connections[indexVal];
          // method = EDIT;
        } else {
          temp.Connections.push(newConnection);
          // method = ADD;
        }
      } else {
        temp.Connections.push(newConnection);
        // method = ADD;
      }
    }
    dispatch(setOpenProcess({ loadedData: JSON.parse(JSON.stringify(temp)) }));
    dispatch(setWebservice({ connChanged: true }));
    // code added on 6 July 2022 for BugId 111910
    let localAct = { ...localLoadedActivityPropertyData };
    localAct.ActivityProperty = {
      ...localAct?.ActivityProperty,
      targetId: data + "",
    };
    setlocalLoadedActivityPropertyData(localAct);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const HandleRegisteredProcessChange = (e) => {
    setSelectedRegisteredProcess(e.target.value);
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    if (props.cellActivityType === 2 && props.cellActivitySubType === 2) {
      tempLocalState.ActivityProperty.pMMessageEnd.m_arrFwdVarMapping = [];
      tempLocalState.ActivityProperty.pMMessageEnd.processName = e.target.value;
    } else {
      tempLocalState.ActivityProperty.SubProcess = {
        importedProcessName: e.target.value,
      };
    }
    deployedProcesses?.map((process) => {
      if (process.ProcessName == e.target.value) {
        if (props.cellActivityType === 2 && props.cellActivitySubType === 2) {
          tempLocalState.ActivityProperty.pMMessageEnd.processId =
            process.ProcessDefId;
        } else {
          if (tempLocalState?.ActivityProperty?.SubProcess) {
            tempLocalState.ActivityProperty.SubProcess.importedProcessDefId =
              process.ProcessDefId;
            tempLocalState.ActivityProperty.SubProcess.importedVersion =
              process.Version;
          } else {
            tempLocalState.ActivityProperty.SubProcess = {
              ...tempLocalState.ActivityProperty.SubProcess,
              importedProcessDefId: process.ProcessDefId,
              importedVersion: process.Version,
            };
          }
        }
      }
    });
    setlocalLoadedActivityPropertyData(tempLocalState);
    if (props.cellActivityType === 2 && props.cellActivitySubType === 2) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
          [propertiesLabel.initiateWorkstep]: {
            isModified: true,
            hasError: true,
          },
        })
      );
    } else if (
      props.cellActivityType === 18 &&
      props.cellActivitySubType === 1
    ) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
          [propertiesLabel.fwdVarMapping]: { isModified: true, hasError: true },
          [propertiesLabel.revVarMapping]: { isModified: true, hasError: true },
        })
      );
    }
  };

  const editQueueHandler = () => {
    setShowQueueModal(true);
    +queueType === 0 ? setQueueType(1) : setQueueType(0);
  };

  //  Changes made to solve Bug 116892 - Conditional Start: value in the Conditional Text field is not saved
  const changeBasicDetails = (e, customName) => {
    console.log("###","COST VALIDATION",validateRegex(e.target.value, REGEX.FloatPositive))
    if (e.target.name === "condtionalText") {
      setConditionalValue(e.target.value);
      updatelocalLoadedActivityPropertyData((prev) => {
        prev.ActivityProperty.actGenPropInfo.m_strConditioalStart =
          e.target.value;
      });
    }
    if (e.target.name === "mobileEnabled") {
      updatelocalLoadedActivityPropertyData((prev) => {
        prev.ActivityProperty.isMobileEnabled = e.target.checked;
      });
    } else if (e.target.name === "cost") {
      if (e.target.value?.trim() === "") {
        setShowCostError({
          statement: t("CostFieldCantBeEmpty"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        });
      }
      //added on 06/09/2023, bug_id:135583
      
      else if (!validateRegex(e.target.value, REGEX.FloatPositive)) {
        setShowCostError({
          statement: t("numericValMsg"),
          severity: "error",
          errorType: ERROR_INCORRECT_VALUE,
        });
      }
      //till here for bug_id:135583
      updatelocalLoadedActivityPropertyData((prev) => {
        prev.ActivityProperty.actGenPropInfo.genPropInfo.cost = e.target.value;
      });
    } else if (e.target.name === "formEnabled") {
      updatelocalLoadedActivityPropertyData((prev) => {
        prev.ActivityProperty.actGenPropInfo.m_bFormView = e.target.checked;
      });
    }
    if (customName) {
      if (customName === "descBasicDetails") {
        // code edited on 2 March 2023 for BugId 123801 - basic detail description is getting saved in single line only
        updatelocalLoadedActivityPropertyData((prev) => {
          prev.ActivityProperty.actGenPropInfo.genPropInfo.description =
            encode_utf8(e.target.innerHTML);
        });
      }
      if (customName === "validationBasicDetails") {
        updatelocalLoadedActivityPropertyData((prev) => {
          prev.ActivityProperty.actGenPropInfo.genPropInfo.customValidation =
            e.target.innerText;
        });
      }
    }

    if (
      (e.target.name === "cost" && e.target.value?.trim() === "") ||
      (e.target.name !== "cost" &&
        localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo?.genPropInfo?.cost?.trim() ===
          "")
    ) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: { isModified: true, hasError: true },
        })
      );
    } else {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
        })
      );
    }
  };

  //added on 10/10/2023, bug_id:135583
  function isPrecise(num) {
    if (String(num).split(".")[1]?.length > 2) {
      return false;
    } else {
      return true;
    }
    // return String(num).split(".")[1]?.length == 2;
  }

  function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
  }
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  const changeCost = (e) => {
    if (e.target.value.trim() === "") {
      setCostValue(e.target.value);
      setShowCostError({
        statement: t("CostFieldCantBeEmpty"),
        severity: "error",
        errorType: ERROR_MANDATORY,
      });
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: { isModified: true, hasError: true },
        })
      );
    } else if (!isNumber(e.target.value)) {
      setShowCostError({
        statement: t("numericValMsg"),
        severity: "error",
        errorType: ERROR_INCORRECT_VALUE,
      });
    } else {
      console.log("###", "CHECK NUM", isFloat(+e.target.value));
      setShowCostError({
        statement: "",
        severity: "",
        errorType: "",
      });
      if (isFloat(+e.target.value)) {
        console.log("###", "PREcise", isPrecise(e.target.value));
        if (isPrecise(e.target.value)) {
          setCostValue(+e.target.value);
          updatelocalLoadedActivityPropertyData((prev) => {
            prev.ActivityProperty.actGenPropInfo.genPropInfo.cost =
              e.target.value;
          });
        } else {
          setShowCostError({
            statement: t("decimalPresicion"),
            severity: "error",
            errorType: ERROR_INCORRECT_VALUE,
          });
        }
      } else {
        setCostValue(+e.target.value);
        if (e.target.value.length > 13) {
          setShowCostError({
            statement: getIncorrectLenErrMsg("cost",13,t),
            severity: "error",
            errorType: ERROR_INCORRECT_VALUE,
          });
          setCostLengthError(true)
        } else {
          setCostValue(+e.target.value);

          updatelocalLoadedActivityPropertyData((prev) => {
            prev.ActivityProperty.actGenPropInfo.genPropInfo.cost =
              e.target.value;
          });
        }
      }

      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
        })
      );
    }
  };

  //till here for bug_id:135583

  const checkQueueType = (cellActivityType, cellActivitySubType) => {
    if (
      // Default Queues
      (+cellActivityType === 1 && +cellActivitySubType === 1) ||
      (+cellActivityType === 1 && +cellActivitySubType === 3) ||
      (+cellActivityType === 1 && +cellActivitySubType === 7) ||
      // (+cellActivityType === 32 && +cellActivitySubType === 1) ||
      (+cellActivityType === 11 && +cellActivitySubType === 1) ||
      (+cellActivityType === 27 && +cellActivitySubType === 1) ||
      (+cellActivityType === 19 && +cellActivitySubType === 1) ||
      (+cellActivityType === 21 && +cellActivitySubType === 1) ||
      (+cellActivityType === 4 && +cellActivitySubType === 1)
    ) {
      /*start event, conditional start, message start, case workdesk, query, event, 
    jms producer, jms consumer, timer event*/
      return 1;
    } else if (
      // No Queues to show on front End
      (+cellActivityType === 1 && +cellActivitySubType === 6) ||
      (+cellActivityType === 18 && +cellActivitySubType === 1) ||
      (+cellActivityType === 10 && +cellActivitySubType === 4) ||
      (+cellActivityType === 33 && +cellActivitySubType === 1) ||
      (+cellActivityType === 34 && +cellActivitySubType === 1) ||
      (+cellActivityType === 20 && +cellActivitySubType === 1) ||
      (+cellActivityType === 22 && +cellActivitySubType === 1) ||
      (+cellActivityType === 31 && +cellActivitySubType === 1) ||
      (+cellActivityType === 5 && +cellActivitySubType === 1) ||
      (+cellActivityType === 5 && +cellActivitySubType === 2) ||
      (+cellActivityType === 6 && +cellActivitySubType === 1) ||
      (+cellActivityType === 6 && +cellActivitySubType === 2) ||
      (+cellActivityType === 7 && +cellActivitySubType === 1) ||
      (+cellActivityType === 2 && +cellActivitySubType === 1) ||
      (+cellActivityType === 3 && +cellActivitySubType === 1) ||
      (+cellActivityType === 2 && +cellActivitySubType === 2) ||
      (+cellActivityType === 10 && +cellActivitySubType === 1) ||
      (+cellActivityType === 30 && +cellActivitySubType === 1) ||
      (+cellActivityType === 29 && +cellActivitySubType === 1)
    ) {
      //     timer start, call activity, export, inclusive distribute, parallel distribute, inclusive collect,
      //   parallel collect, data based exclusive, end event, terminate event, message end,
      // email, sharepoint, sap adapter,dms adapter, data exchange,webservice,oms adapter, businessRule
      return 0;
    } else {
      return 2;
    }
  };

  const handleOwnQueueCheck = () => {
    setIsUsingSwimlaneQueue(!isUsingSwimlaneQueue);
    setIsUsingSelfQueue(!isUsingSelfQueue);
  };

  const handleSwimlaneQueueCheck = () => {
    let tempId;
    let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
    temp.MileStones?.map((mile) => {
      mile.Activities?.map((el) => {
        if (el.ActivityId == props.cellID) {
          tempId = el.QueueId;
        }
      });
    });
    axios
      .post(SERVER_URL + ENDPOINT_QUEUEASSOCIATION_DELETE, {
        processDefId: props.openProcessID,
        // queueId: props.cellQueueId,
        queueId: tempId,
        // props.cellActivityType == 32 && props.cellActivitySubType == 1
        //   ? props.cellQueueId
        //   : updatedQueueId,
        actId: props.cellID,
      })
      .then((res) => {
        let tempPro = JSON.parse(JSON.stringify(localLoadedProcessData));
        let tempQueueId;
        setSelfQueueCreated(false);
        tempPro.Lanes.forEach((el) => {
          if (+el.LaneId === +props.cellLaneId) {
            tempQueueId = el.QueueId;
          }
        });
        tempPro.MileStones.forEach((el, mileIndex) => {
          el.Activities.forEach((pl, actIndex) => {
            if (+pl.ActivityId === +props.cellID) {
              tempPro.MileStones[mileIndex].Activities[actIndex].QueueId =
                tempQueueId;
            }
          });
        });
        tempPro.Queue = tempPro?.Queue?.filter(
          (el, i) => +el.QueueId !== +props.cellQueueId
        );
        setLocalLoadedProcessData(tempPro);
        props.selectedCell(
          props.cellID,
          props.cellName,
          props.cellActivityType,
          props.cellActivitySubType,
          props.cellSeqId,
          tempQueueId,
          getSelectedCellType("ACTIVITY"),
          props.cellCheckedOut,
          props.cellLaneId
        );
      });
    setIsUsingSwimlaneQueue(!isUsingSwimlaneQueue);
    setIsUsingSelfQueue(!isUsingSelfQueue);
  };

  const queueContent = () => {
    if (
      checkQueueType(props.cellActivityType, props.cellActivitySubType) == 1
    ) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <p style={{ fontSize: "12px", cursor: "pointer" }}>
            {t("accInitiativeQueue")}&nbsp;
            <IconButton
              onClick={editQueueHandler}
              id="pmweb_basicDetails_editQueueHandler"
              className={classes.iconButton}
              disabled={isReadOnly}
              tabindex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  editQueueHandler(e);
                }
              }}
              aria-label={`${t("accInitiativeQueue")}`}
              disableTouchRipple
              disableFocusRipple
            >
              <EditIcon
                style={{
                  height: "15px",
                  width: "15px",
                  transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
                }}
              />
            </IconButton>
          </p>
        </div>
      );
    } else if (
      checkQueueType(props.cellActivityType, props.cellActivitySubType) == 0 ||
      (isUsingSwimlaneQueue && props.openProcessType == "R")
    ) {
      return null;
    } else if (
      checkQueueType(props.cellActivityType, props.cellActivitySubType) == 2
    ) {
      return (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p style={{ fontSize: "var(--base_text_font_size)" }}>
              <FormControlLabel
                style={{ marginRight: "0px", marginInlineEnd: "0px" }}
                label={
                  <span style={{ fontSize: "var(--base_text_font_size)" }}>
                    {t("useSwimlaneQueue")}
                  </span>
                }
                control={
                  <Checkbox
                    disabled={isReadOnly}
                    checked={isUsingSwimlaneQueue}
                    onChange={() => handleSwimlaneQueueCheck()}
                    id="pmweb_basicDetails_useSwimlane_checkbox"
                    name="UseSwimlane"
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        handleSwimlaneQueueCheck();
                      }
                    }}
                  />
                }
              />
              {isUsingSwimlaneQueue ? (
                <img
                  style={{
                    cursor: "pointer",
                    width: "1.5em",
                    height: "1em",
                  }}
                  src={CreateIcon}
                  alt={t("useSwimlaneQueue")}
                  id="pmweb_basicDetails_useSwimlaneQueue"
                  onClick={() => setShowQueueModal(true)}
                  tabIndex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      setShowQueueModal(true);
                    }
                  }}
                />
              ) : null}
            </p>
            <p style={{ fontSize: "var(--base_text_font_size)" }}>
              <FormControlLabel
                style={{ marginRight: "0px", marginInlineEnd: "0px" }}
                label={
                  <span style={{ fontSize: "var(--base_text_font_size)" }}>
                    {t("createOwnQueue")}
                  </span>
                }
                control={
                  <Checkbox
                    disabled={isReadOnly}
                    checked={isUsingSelfQueue}
                    onChange={() => handleOwnQueueCheck()}
                    id="pmweb_basicDetails_useOwn_checkbox"
                    name="UseOwn"
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        handleOwnQueueCheck();
                      }
                    }}
                  />
                }
              />
              {isUsingSelfQueue ? (
                <EditIcon
                  style={{
                    cursor: "pointer",
                    width: "1.5em",
                    height: "1em",
                    transform:
                      direction === RTL_DIRECTION ? "scaleX(-1)" : null,
                  }}
                  onClick={() => setShowQueueModal(true)}
                  id="pmweb_basicDetails_QueueModalEdit"
                  tabIndex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      setShowQueueModal(true);
                    }
                  }}
                  aria-label="Edit"
                />
              ) : null}
            </p>
          </div>
        </div>
      );
    }
  };

  // code added on 6 July 2022 for BugId 110924
  const setDefaultCheckFunc = (e) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (e.target.checked) {
      temp.ActivityProperty.primaryAct = "Y";
    } else {
      temp.ActivityProperty.primaryAct = "N";
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
      })
    );
  };

  // Function that gives the count for outgoing connections.
  const getOutgoingConnectionsCount = () => {
    let count = 0;
    localLoadedProcessData.Connections.forEach((conn) => {
      if (conn.SourceId === props.cellID) count++;
    });
    return count;
  };

  const handleQueueSwitching = () => {
    // queueType == 0?setQueueType(1):setQueueType(0);
    setShowQueueModal(true);
  };

  const addNewCalendar = (data) => {
    let temp = global.structuredClone(localCalendarList);
    temp.push({
      CalendarName: data.calName,
      CalendarId: data.calId,
      DefinedWithProcessDefId:
        data.calType === "L" ? localLoadedProcessData.ProcessDefId : "0",
    });
    setlocalCalendarList(temp);
  };

  const openCalenderMf = () => {
    props.expandDrawer(true);
    let microProps = {
      Component: "ProcessCalendar", // change here
      Callback: (data) => addNewCalendar(data),
      source: "CAL_PRO",
      popupIndex: "1",
      ProcessDefinitionId: localLoadedProcessData.ProcessDefId + "",
      calId: -1,
      AssociationFlag: "N",
      CalendarType: "G",
      RegisteredProcess:
        localLoadedProcessData?.ProcessType === "R" ? "Y" : "N",
      ActivityId: +props.cellID,
      ContainerId: "calenderDiv",
      Module: "WCL",
      InFrame: false,
      Renderer: "renderProcessCalendar",
      closeDialog: () => {
        setshowCalenderMFBool(false);
        // code edited on 22 April 2023 for BugId 127409 - Custom Calendar || Cannot edit a Calendar once added. Loading Forever
        var elem = document.getElementById("workspacestudio_assetManifest");
        elem.parentNode.removeChild(elem);
      },
    };
    window.MdmDataModelPMWEB(microProps);
    if (isReadOnly) {
    } else {
      setshowCalenderMFBool(true);
    }
  };

  const handleCalendarChange = (e) => {
    let calName = "";
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.actGenPropInfo.calendarType =
      e.target.value.substring(0, 1);
    temp.ActivityProperty.actGenPropInfo.calendarId =
      e.target.value.substring(1);

    localCalendarList
      .filter((cal) => {
        if (e.target.value.substring(0, 1) === "G")
          return cal.DefinedWithProcessDefId === "0";
        else return cal.DefinedWithProcessDefId !== "0";
      })
      .forEach((cal) => {
        if (cal.CalendarId === e.target.value.substring(1)) {
          calName = cal.CalendarName;
        }
      });
    temp.ActivityProperty.actGenPropInfo.calenderName = calName;
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const handleCalendarEdit = () => {
    props.expandDrawer(true);
    let microProps = {
      Component: "ProcessCalendar", // change here
      Callback: (id, name) => console.log(id, name),
      source: "CAL_PRO",
      popupIndex: "2",
      ProcessDefinitionId:
        //Modified  on 07/08/2023, bug_id:133195
        /* localLoadedActivityPropertyData.ActivityProperty.actGenPropInfo
          .calendarType === "L"
          ? localLoadedProcessData.ProcessDefId + ""
          : "0", */
        localLoadedProcessData.ProcessDefId,
      calId:
        +localLoadedActivityPropertyData.ActivityProperty.actGenPropInfo
          .calendarId,
      AssociationFlag: "N",
      CalendarType:
        localLoadedActivityPropertyData.ActivityProperty.actGenPropInfo
          .calendarType,
      RegisteredProcess:
        localLoadedProcessData?.ProcessType === "R" ? "Y" : "N",
      ActivityId: +props.cellID,
      ContainerId: "calenderDiv",
      Module: "WCL",
      InFrame: false,
      Renderer: "renderProcessCalendar",
      closeDialog: () => {
        setshowCalenderMFBool(false);
        // code edited on 22 April 2023 for BugId 127409 - Custom Calendar || Cannot edit a Calendar once added. Loading Forever
        var elem = document.getElementById("workspacestudio_assetManifest");
        elem.parentNode.removeChild(elem);
      },
    };
    window.MdmDataModelPMWEB(microProps);
    setshowCalenderMFBool(true);
  };

  const setGenerateSummaryFunc = (e) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.isGenerateSummaryDoc = e.target.checked;
    if (!e.target.checked) {
      temp.ActivityProperty.m_strCaseSummaryDocName = "";
      setCaseSummaryType("");
      temp.ActivityProperty.sDocTypeId = "-1";
    } else if (e.target.checked) {
      let docId = 0;
      let tempLocal = JSON.parse(JSON.stringify(localState));
      tempLocal?.DocumentTypeList?.forEach((doc) => {
        if (+doc.DocTypeId > +docId) {
          docId = doc.DocTypeId;
        }
      });
      temp.ActivityProperty.m_strCaseSummaryDocName = `CaseSummary - ${props.cellName}`;
      setCaseSummaryType(`CaseSummary - ${props.cellName}`);
      temp.ActivityProperty.sDocTypeId = `${+docId + 1}`;
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
      })
    );
  };

  /*   const containsSpecialChars = (str) => {
    if (locale === ARABIC_LOCALE || locale === ARABIC_SA_LOCALE) {
      const regex = new RegExp("[&*|:'\"<>?////]+");
      return !regex.test(str);
    } else {
      const regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
      return regex.test(str);
    }
  }; */

  const containsSpecialChars = (str) => {
    var regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
    // var regex = new RegExp('^[A-Za-z][^\\\\/:*?\"<>|#,]+$');
    return regex.test(str);
  };

  const setCaseNameFunc = (e) => {
    let toastMsg = "";
    let isValid = true;
    const restrictChars = `*|\:"<>?,/`;
    const allowedChars = `/\:*?"<>|&'#+,.`;

    if (isArabicLocaleSelected()) {
      isValid = restrictSpecialCharacter(e.target.value, '[*|\\\\:"<>?,//]+');

      toastMsg = `${t("mappedDocumentType")}${SPACE}${t(
        "cannotContain"
      )}${SPACE}${restrictChars}${SPACE}${t("charactersInIt")}`;
    } else {
      isValid = containsSpecialChars(e.target.value);
      toastMsg = `${t("firstCharExcept")}${SPACE}${restrictChars}${SPACE}${t(
        "charNotAllow"
      )}${SPACE}${t("mappedDocumentType")}`;
    }
    console.log("@@@", "Check validattion", isValid, locale);
    if (!isValid && e.target.value.length > 0) {
      dispatch(
        setToastDataFunc({
          message: toastMsg,
          severity: "error",
          open: true,
        })
      );
    } else {
      setCaseSummaryType(e.target.value);
      let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
      temp.ActivityProperty.m_strCaseSummaryDocName = e.target.value;
      setlocalLoadedActivityPropertyData(temp);
    }

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <div className="flexScreen basicDetails-mainDiv">
      {/* <div className="headingSectionTab">
        <h4>{t(props?.heading)}</h4>
      </div> */}
      <TabsHeading heading={props?.heading} />
      {spinner ? (
        <CircularProgress
          style={{ marginTop: "30vh", marginInlineStart: "40%" }}
        />
      ) : (
        <div
          className={classes.mainDiv}
          style={{
            flexDirection: props.isDrawerExpanded ? "row" : "column",
            fontSize: "var(--subtitle_text_font_size)",
            /* code edited on 6 July 2023 for issue - save and 
            discard button hide issue in case of tablet(landscape mode)*/
            // modified on 26-9-2023 for bug_id: 133957
            minHeight: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`, //Bug 110956 [21-02-2023] - provided MinHeight and setting height as auto
            height: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              marginInlineStart: "0.8rem",
              width: props.isDrawerExpanded ? "50%" : null,
              paddingTop: props.isDrawerExpanded ? "0.4rem" : "0",
            }}
          >
            {/* code added on 6 July 2022 for BugId 110924*/}
            {(+props.cellActivityType === 1 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 1 &&
              +props.cellActivitySubType === 3) ||
            (+props.cellActivityType === 1 &&
              +props.cellActivitySubType === 2) ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginInlineStart: "-0.6875rem",
                }}
              >
                <Checkbox
                  size="medium"
                  style={{ color: "rgba(0, 0, 0, 0.54)" }}
                  checked={hasDefaultCheck} // code added on 6 July 2022 for BugId 110924
                  onChange={(e) => setDefaultCheckFunc(e)}
                  id="pmweb_basicDetails_setAsDefaultStart_checkbox" // code added on 6 July 2022 for BugId 110924
                  disabled={defaultCheckDisabled || isReadOnly} // code added on 6 July 2022 for BugId 110924
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      changeBasicDetails({
                        ...e,
                        target: {
                          ...e.target,
                          checked: !hasDefaultCheck,
                        },
                      });
                    }
                  }}
                  tabIndex={0}
                ></Checkbox>
                <label
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    fontWeight: "600",
                  }}
                  htmlFor="pmweb_basicDetails_setAsDefaultStart_checkbox"
                >
                  {t("setAsDefaultStart")}
                </label>
              </div>
            ) : null}
            {!addDescriptionBoolean && !isReadOnly && (
              <p
                id="pmweb_basicDetails_sunEditor_add_description"
                style={{
                  color: "var(--button_color)",
                  cursor: "pointer",
                  fontSize: "var(--base_text_font_size)",
                  fontWeight: "600",
                }}
                onClick={() => setAddDescriptionBoolean(true)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    setAddDescriptionBoolean(true);
                  }
                }}
                tabIndex={0}
              >
                {t("add")} {t("Discription")}
              </p>
            )}
            {addDescriptionBoolean && (
              <div style={{ marginBottom: "0.5rem" }}>
                <p
                  style={{
                    // color: "#606060",
                    marginBottom: "0.5rem",
                    fontSize: "var(--base_text_font_size)",
                    fontWeight: "600",
                  }}
                >
                  {t("Discription")}
                </p>
                <div
                  id="sunEditor_Div"
                  style={{
                    height: "27vh",
                    width: props.isDrawerExpanded ? "60%" : "97%",
                    minWidth: "270px",
                  }}
                >
                  <SunEditor
                    id="pmweb_add_description_sunEditor"
                    width={props.isDrawerExpanded ? "98%" : "100%"}
                    customHeight="8rem"
                    placeholder={t("placeholderDescription")}
                    value={content}
                    handleChange={handleChange}
                    disabled={isReadOnly}
                    getValue={(e) => changeBasicDetails(e, "descBasicDetails")}
                    zIndex={99}
                  />
                </div>
              </div>
            )}
            {(+props.cellActivityType === 40 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 23 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 24 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 25 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 22 &&
              +props.cellActivitySubType === 1) ? (
              <div
                style={{
                  marginBlock: "0.9rem",
                  width: props.isDrawerExpanded ? "95%" : "100%",
                }}
              >
                <p
                  style={{
                    color: "#727272",
                    fontSize: "var(--base_text_font_size)",
                  }}
                >
                  {t("webServiceType")}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    color: "#727272",
                    marginTop: "0.25rem",
                    width: props.isDrawerExpanded ? "63%" : "100%",
                  }}
                >
                  {/* <Select
                    id="webservice_dropdown"
                    onChange={onSelect}
                    value={selectedWebService}
                    IconComponent={ExpandMoreIcon}
                    style={{
                      width: "95%",
                      height: "var(--line_height)",
                    }}
                    variant="outlined"
                    defaultValue="WSRC"
                    disabled={isReadOnly}
                  >
                    {webServiceDropdownOptions.map((item) => {
                      return (
                        <MenuItem
                          style={{ width: "100%", marginBlock: "0.4rem" }}
                          value={item.value}
                          actType={item.activityType}
                        >
                          <p
                            style={{
                              marginInline: "0.5rem",
                              fontSize: "var(--base_text_font_size)",
                              fontFamily: "var(--font_family)",
                            }}
                          >
                            {item.name}
                          </p>
                        </MenuItem>
                      );
                    })}
                  </Select> */}
                  <CustomizedDropdown
                    id="pmweb_basicDetails_webservice_dropdown"
                    onChange={onSelect}
                    value={selectedWebService}
                    IconComponent={ExpandMoreIcon}
                    style={{
                      width: "100%",
                      height: "var(--line_height)",
                    }}
                    relativeStyle={{ width: "95%" }}
                    variant="outlined"
                    defaultValue="WSRC"
                    disabled={isReadOnly}
                    isNotMandatory={true}
                    ariaLabel={`${t("webServiceType")}`}
                  >
                    {webServiceDropdownOptions.map((item) => {
                      return (
                        <MenuItem
                          style={{
                            width: "100%",
                            marginBlock: "0.4rem",
                            justifyContent:
                              direction === RTL_DIRECTION ? "end" : null,
                          }}
                          value={item.value}
                          actType={item.activityType}
                        >
                          <p
                            style={{
                              marginInline: "0.5rem",
                              fontSize: "var(--base_text_font_size)",
                              fontFamily: "var(--font_family)",
                            }}
                          >
                            {item.name}
                          </p>
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </div>
            ) : null}
            {!arrMobileEnabledAbsent().includes(selectedActivityType) ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginInlineStart: "-0.5vw",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  id="pmweb_basicDetails_mobile_enabled"
                  disabled={isReadOnly}
                  checked={
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.isMobileEnabled
                  }
                  name="mobileEnabled"
                  onChange={(e) => changeBasicDetails(e)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      changeBasicDetails({
                        ...e,
                        target: {
                          ...e.target,
                          checked:
                            !localLoadedActivityPropertyData?.ActivityProperty
                              ?.isMobileEnabled,
                        },
                      });
                    }
                  }}
                  tabIndex={0}
                />
                <label
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    fontWeight: "600",
                  }}
                  htmlFor="pmweb_basicDetails_mobile_enabled"
                >
                  {t("mobileEnabled")}
                </label>
                {}
                <LightTooltip
                  id="pmweb_basicDetails_mobileEnabled_Tooltip"
                  arrow={true}
                  placement="bottom-start"
                  title={t("mobileEnabledTootipMessage")}
                  open={tooltipOpen}
                  onClose={handleTooltipClose}
                >
                  <InfoOutlinedIcon
                    style={{
                      margin: "0 0.5vw",
                      width: "1.25rem",
                      height: "1.25rem",
                      opacity: "0.7",
                    }}
                    // code added on 07-10-2023 for Bug 132919
                    onTouchStart={handleTooltipOpen}
                    onMouseEnter={handleTooltipOpen}
                    onMouseLeave={handleTooltipClose}
                    // till here for Bug 132919
                  />
                </LightTooltip>
              </div>
            ) : null}
            <div style={{ margin: "0.5rem 0 1rem" }}>
              <p
                style={{
                  fontWeight: "600",
                  fontSize: "var(--base_text_font_size)",
                  cursor: "pointer",
                  margin: "0.25rem 0 0",
                }}
              >
                {checkQueueType(
                  props.cellActivityType,
                  props.cellActivitySubType
                ) === 0 ||
                (isUsingSwimlaneQueue && props.openProcessType === "R")
                  ? null
                  : t("associatedQueue")}
              </p>
              {queueContent()}

              {/* <div>
                {!isReadOnly && (
                  <p
                    style={{
                      fontWeight: "600",
                      color: "var(--button_color)",
                      fontSize: "var(--base_text_font_size)",
                      cursor: "pointer",
                      margin: "0.5rem 0",
                    }}
                    onClick={handleQueueSwitching}
                  >
                    {queueType == 0
                      ? t("useSwimlaneQueue")
                      : t("useWorkstepQueue")}
                  </p>
                )}
              </div> */}
            </div>
            {/*code edited on 7 Sep 2022 for BugId 115321*/}
            {selectedActivityType !== activityType.query &&
              selectedActivityType !== activityType.endEvent &&
              selectedActivityType !== activityType.terminate &&
              selectedActivityType !== activityType.messageEnd &&
              selectedActivityType !== activityType.parallelDistribute &&
              selectedActivityType !== activityType.inclusiveDistribute &&
              selectedActivityType !== activityType.dataBasedExclusive && (
                <div style={{ marginBlock: "0.5rem" }}>
                  <label
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      margin: "0 0 0.25rem",
                    }}
                    id="pmweb_basicDetails_targetWorkStep_basicDetails"
                    htmlFor="pmweb_basicDetails_target_workstep"
                  >
                    {t("targetWorkstep")}
                  </label>
                  <div
                    style={{ width: props.isDrawerExpanded ? "60%" : "100%" }}
                  >
                    <SetIconWithActivityType
                      id="pmweb_basicDetails_target_workstep"
                      disabled={
                        isReadOnly ||
                        (checkIfParentSwimlaneCheckedOut(
                          localState,
                          props.cellLaneId
                        )?.length === 0 &&
                          props.cellCheckedOut === "Y")
                      }
                      selectedActivity={targetId}
                      activityList={allActivitiesTargetDropdown}
                      getSelectedActivity={(val) => getSelectedActivity(val)}
                      ariaLabel={`${t("targetWorkstep")}`}
                    />
                  </div>
                </div>
              )}
            {selectedActivityType !== activityType.subProcess ? (
              <div>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.125vw",
                    marginTop: "0.5rem",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="pmweb_basicDetails_costInBasicDetails"
                >
                  <span
                    id="pmweb_basicDetails_cost_basicDetails"
                    style={{
                      fontFamily: "var(--font_family)",
                      fontSize: "var(--base_text_font_size)",
                    }}
                  >
                    {t("cost")}
                  </span>
                  <span
                    style={{
                      /**WCAG - Color Contrast Issue:- Updated the color to rgb(181,42,42) */
                      //color: "red",
                      color: `rgb(181,42,42)`,
                      fontSize: "1rem",
                    }}
                  >
                    *
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font_family)",
                      fontSize: "var(--base_text_font_size)",
                    }}
                  >
                    {" "}
                    ({t("in $")})
                  </span>
                </label>
                {
                  //Modified on 03/10/2023, bug_id:135583
                }
                {/* <TextInput
                  type="text"
                  readOnlyCondition={isReadOnly}
                  inputValue={costValue}
                  idTag="pmweb_basicDetails_costInBasicDetails"
                  onChangeEvent={(e) => changeCost(e)}
                  //Added on 07/09/2023, bug_id:135963
                  inputRef={costRef}
                  errorStatement={showCostError?.statement}
                  errorSeverity={showCostError?.severity}
                  errorType={showCostError?.errorType}
                  inlineError={true}
                  ariaLabel={`${t("cost")} ${t("in $")}`}
                  onKeyPress={(e) =>
                    FieldValidations(e, 130, costRef.current, 16)
                  }
                /> */}
                {
                  //till here for bug_id:135583
                }
                 <TextInput
                  type="number"
                  classTag={classes.inputWithError}
                  readOnlyCondition={isReadOnly}
                  inputValue={
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.actGenPropInfo?.genPropInfo?.cost
                  }
                  name="cost"
                  idTag="pmweb_basicDetails_costInBasicDetails"
                  inputRef={costRef}
                  onKeyPress={(e) =>
                    FieldValidations(e, 130, costRef.current, 13)
                  }
                  onChangeEvent={(e) => changeBasicDetails(e)}
                  errorStatement={showCostError?.statement}
                  errorSeverity={showCostError?.severity}
                  errorType={showCostError?.errorType}
                  inlineError={true}
                  ariaLabel={`${t("cost")} ${t("in $")}`}
                />
              </div>
            ) : null}
            {/* ------------------------------------------------------------------ */}
            {(props.cellActivityType === 18 &&
              props.cellActivitySubType === 1) ||
            (props.cellActivityType === 2 &&
              props.cellActivitySubType === 2) ? (
              <div style={{ marginBlock: "1rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font_family)",
                    fontSize: "var(--base_text_font_size)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {t("deployedProcessName")}
                  <span
                    style={{
                      /**WCAG - Color Contrast Issue:- Updated the color to rgb(181,42,42) */
                      //color: "red",
                      color: `rgb(181,42,42)`,
                      fontSize: "1rem",
                    }}
                  >
                    *
                  </span>
                </p>
                {/* Changes on 28/08/2023 to resolve the bug Id 134216 & 134208 added width: props.isDrawerExpanded ? "60%" : "100%" */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: props.isDrawerExpanded ? "60%" : "100%",
                  }}
                >
                  <CustomizedDropdown
                    isNotMandatory={false}
                    className={
                      props.isDrawerExpanded
                        ? "dropDownSelect_expanded"
                        : "dropDownSelect"
                    }
                    value={selectedRegisteredProcess}
                    onChange={(e) => HandleRegisteredProcessChange(e)}
                    id="pmweb_basicDetails_deployedProcessName"
                    relativeStyle={{ width: "95%" }}
                    style={{
                      width: "100%",
                      height: "var(--line_height)",
                    }}
                    disabled={isReadOnly}
                    variant="outlined"
                    ariaLabel={`${t("deployedProcessName")}`}
                  >
                    {deployedProcesses?.map((process) => {
                      return (
                        <MenuItem
                          value={process.ProcessName}
                          style={{
                            fontFamily: "var(--font_family)",
                            fontSize: "var(--base_text_font_size)",
                            justifyContent:
                              direction === RTL_DIRECTION ? "end" : null,
                          }}
                          key={process.ProcessName}
                        >
                          {process.ProcessName}
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </div>
            ) : null}
            {selectedActivityType === activityType.caseWorkdesk ? (
              <div style={{ marginBlock: "1rem" }}>
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    fontWeight: "700",
                  }}
                >
                  {t("caseSummaryDetails")}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    //marginInlineStart: "-0.6875rem",
                  }}
                >
                  <FormControlLabel
                    label={
                      <p
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          fontWeight: "600",
                        }}
                      >
                        {t("generateSummaryDocument")}
                      </p>
                    }
                    control={
                      <Checkbox
                        size="medium"
                        id="pmweb_basicDetails_generateSummaryDoc"
                        style={{ color: "rgba(0, 0, 0, 0.54)" }}
                        checked={basicDetails.isGenerateSummaryDoc}
                        onChange={(e) => {
                          setGenerateSummaryFunc(e);
                        }}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            setGenerateSummaryFunc({
                              ...e,
                              target: {
                                ...e.target,
                                checked: !basicDetails?.isGenerateSummaryDoc,
                              },
                            });
                          }
                        }}
                        disabled={isReadOnly}
                      />
                    }
                  />
                </div>
                <label
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="pmweb_basicDetails_mapped_documentType"
                >
                  {t("mappedDocumentType")}
                </label>
                <TextField
                  inputRef={mappedDocRef}
                  id="pmweb_basicDetails_mapped_documentType"
                  InputProps={{
                    className: classes.input,
                    readOnly: isReadOnly,
                  }}
                  value={
                    basicDetails?.m_strCaseSummaryDocName != ""
                      ? basicDetails?.m_strCaseSummaryDocName
                      : caseSummaryType
                  }
                  onChange={(e) => setCaseNameFunc(e)}
                  onKeyPress={(e) =>
                    FieldValidations(e, 177, mappedDocRef.current, 50)
                  }
                  style={{ width: props.isDrawerExpanded ? "59%" : "95%" }}
                  variant="outlined"
                  size="small"
                  disabled={!basicDetails.isGenerateSummaryDoc || isReadOnly}
                />
              </div>
            ) : null}
            <div style={{ marginBlock: "1rem" }}>
              {arrEntrySettingsPresent().includes(selectedActivityType) ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        marginBottom: "0.25rem",
                      }}
                      htmlFor="pmweb_basicDetails_entry_settingsCount"
                    >
                      {t("entrySettings")}
                      {t("count")}
                    </label>
                  </div>
                  <TextField
                    disabled={true}
                    InputProps={{
                      className: classes.input,
                      readOnly: true,
                    }}
                    defaultValue="0"
                    style={{ width: props.isDrawerExpanded ? "57%" : "95%" }}
                    id="pmweb_basicDetails_entry_settingsCount"
                    variant="outlined"
                    size="small"
                  />
                </>
              ) : null}

              {selectedActivityType === activityType.inclusiveDistribute ||
              selectedActivityType === activityType.parallelDistribute ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "95%",
                    margin: "1rem 0rem",
                  }}
                >
                  <label
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      marginBottom: "0.25rem",
                    }}
                    className="disCount_basicDetails"
                    htmlFor="pmweb_basicDetails_distribute_count"
                  >
                    {t("distribute")} {t("count")}
                  </label>
                  <TextField
                    disabled
                    id="pmweb_basicDetails_distribute_count"
                    InputProps={{
                      className: classes.input,
                      readOnly: true,
                    }}
                    style={{
                      width: props.isDrawerExpanded ? "60%" : "100%",
                      cursor: "not-allowed",
                    }}
                    variant="outlined"
                    size="small"
                    value={getOutgoingConnectionsCount()}
                  />
                </div>
              ) : null}

              {selectedActivityType === activityType.dataBasedExclusive ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    // width: "95%",
                    width: props.isDrawerExpanded ? "58%" : "95%",
                    margin: "1rem 0rem",
                  }}
                >
                  <label
                    id="pmweb_basicDetails_routingCriteriaCount_basicDetails"
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      marginBottom: "0.25rem",
                    }}
                    htmlFor="pmweb_basicDetails_routing_criteriaCount"
                  >
                    {t("routingCriteria")} {t("count")}
                  </label>
                  <TextField
                    disabled
                    InputProps={{
                      className: classes.input,
                      readOnly: true,
                    }}
                    id="pmweb_basicDetails_routing_criteriaCount"
                    variant="outlined"
                    size="small"
                    value={
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.routingCriteria?.routCriteriaList.length
                    }
                    style={{
                      width: "100%",
                      cursor: "not-allowed",
                      fontSize: "var(--base_text_font_size)",
                    }}
                  />
                </div>
              ) : null}

              {selectedActivityType === activityType.conditionalStart ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      margin: "1rem 0",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        marginBottom: "0.25rem",
                      }}
                      htmlFor="pmweb_basicDetails_condtional_text"
                    >
                      {t("conditional")} {t("Text")}
                    </label>
                  </div>
                  <TextField
                    InputProps={{
                      className: classes.input,
                    }}
                    name="condtionalText"
                    style={{ width: props.isDrawerExpanded ? "59%" : "95%" }}
                    id="pmweb_basicDetails_condtional_text"
                    variant="outlined"
                    size="small"
                    value={conditionalValue}
                    onChange={(e) => changeBasicDetails(e)}
                  />
                </>
              ) : null}

              {!(
                selectedActivityType === activityType.event ||
                selectedActivityType === activityType.inclusiveCollect ||
                selectedActivityType === activityType.parallelCollect ||
                !props.isDrawerExpanded
              ) ? (
                <>
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      marginBottom: "0.25rem",
                    }}
                    className="calender_basicDetails"
                  >
                    {t("calendar")}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginBottom: "1.5rem",
                      width: props.isDrawerExpanded ? "60%" : "98%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "95%",
                        alignItems: "center",
                      }}
                    >
                      {/*code updated on 21 September 2022 for BugId 115467*/}

                      <CustomizedDropdown
                        isNotMandatory={true}
                        style={{
                          width: "100%",
                          height: "var(--line_height)",
                          fontSize: "var(--base_text_font_size)",
                        }}
                        id="pmweb_basicDetails_edit_calendar"
                        variant="outlined"
                        value={
                          localLoadedActivityPropertyData?.ActivityProperty
                            ?.actGenPropInfo?.calendarType +
                          localLoadedActivityPropertyData?.ActivityProperty
                            ?.actGenPropInfo?.calendarId
                        }
                        onChange={handleCalendarChange}
                        disabled={isReadOnly}
                        ariaLabel={`${t("calendar")}`}
                      >
                        {localCalendarList.map((cal, index) => {
                          return (
                            <MenuItem
                              style={{ margin: "0.5rem" }}
                              value={
                                cal.DefinedWithProcessDefId !== "0"
                                  ? "L" + cal.CalendarId
                                  : "G" + cal.CalendarId
                              } //1 is set as default value for this selectbox
                              key={index}
                            >
                              <p
                                style={{
                                  fontsize: "var(--base_text_font_size)",
                                }}
                              >
                                {cal.CalendarName}
                              </p>
                            </MenuItem>
                          );
                        })}
                      </CustomizedDropdown>

                      {!isReadOnly && (
                        <div className="basicDetails-addIcon">
                          {
                            //Added  on 11/08/2023, bug_id:132027
                          }
                          <LightTooltip
                            id="pmweb_basicDetails_addIconTooltip"
                            arrow={true}
                            placement="bottom-start"
                            title={`${t("add")} ${t("calendar")}`}
                          >
                            <AddIcon
                              onClick={() => {
                                openCalenderMf();
                              }}
                              id="pmweb_basicDetails_addIcon"
                              className="basicDetails-addIconSvg"
                              //disabled={isReadOnly}
                              style={{ cursor: "pointer" }}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  openCalenderMf();
                                }
                              }}
                              tabindex={0}
                            />
                          </LightTooltip>
                        </div>
                      )}
                      {!isReadOnly && (
                        <LightTooltip
                          id="pmweb_basicDetails_editIconTooltip"
                          arrow={true}
                          placement="bottom-start"
                          title={`${t("edit")} ${t("calendar")}`}
                        >
                          {
                            //Added  on 11/08/2023, bug_id:132027
                          }
                          <EditIcon
                            id="pmweb_basicDetails_editIcon_1"
                            style={{
                              color: "grey",
                              height: "2rem",
                              width: "2rem",
                              cursor: "pointer",
                              marginBlock: "0.5rem",
                              transform:
                                direction === RTL_DIRECTION
                                  ? "scaleX(-1)"
                                  : null,
                            }}
                            onClick={(e) => handleCalendarEdit()}
                            tabIndex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                handleCalendarEdit();
                              }
                            }}
                            //disabled={isReadOnly}
                          />
                        </LightTooltip>
                      )}
                    </div>
                    {/* <RefreshSharpIcon
                      style={{
                        color: "#606060",
                        marginInlineStart: "0.5rem",
                        marginTop: "0.5rem",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    /> */}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {selectedActivityType !== activityType.subProcess ? (
            <hr
              style={{
                width: props.isDrawerExpanded ? "0" : "100%",
                height: props.isDrawerExpanded ? "inherit" : "0", //Bug 110956 [21-02-2023] - setting the height to inherit
              }}
            />
          ) : null}

          {selectedActivityType !== activityType.subProcess ? (
            <div
              style={{
                marginInlineStart: "0.8rem",
                width: props.isDrawerExpanded ? "50%" : null,
                height: "100%",
              }}
            >
              {!(
                selectedActivityType === activityType.event ||
                selectedActivityType === activityType.inclusiveCollect ||
                selectedActivityType === activityType.parallelCollect ||
                props.isDrawerExpanded
              ) ? (
                <>
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      marginBottom: "0.25rem",
                      marginTop: "1rem",
                    }}
                  >
                    {t("calendar")}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginBottom: "1.5rem",
                      width: props.isDrawerExpanded ? "60%" : "98%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "inherit", //20vw
                        alignItems: "center",
                      }}
                    >
                      <CustomizedDropdown
                        isNotMandatory={true}
                        style={{
                          width: "100%",
                          height: "var(--line_height)",
                          fontSize: "var(--base_text_font_size)",
                        }}
                        variant="outlined"
                        value={
                          localLoadedActivityPropertyData?.ActivityProperty
                            ?.actGenPropInfo?.calendarType +
                          localLoadedActivityPropertyData?.ActivityProperty
                            ?.actGenPropInfo?.calendarId
                        }
                        onChange={handleCalendarChange}
                        id="pmweb_basicDetails_calender"
                        relativeStyle={{ width: "95%" }}
                        disabled={isReadOnly}
                        ariaLabel={`${t("calendar")}`}
                      >
                        {localCalendarList.map((cal, i) => (
                          <MenuItem
                            style={{
                              margin: "0.5rem",
                              justifyContent:
                                direction === RTL_DIRECTION ? "end" : null,
                            }}
                            value={
                              cal.DefinedWithProcessDefId !== "0"
                                ? "L" + cal.CalendarId
                                : "G" + cal.CalendarId
                            } //1 is set as default value for this selectbox
                            key={i}
                          >
                            <p
                              style={{ fontsize: "var(--base_text_font_size)" }}
                            >
                              {cal.CalendarName}
                            </p>
                          </MenuItem>
                        ))}
                      </CustomizedDropdown>

                      {!isReadOnly && (
                        <div className="basicDetails-addIcon">
                          <AddIcon
                            onClick={() => openCalenderMf()}
                            id="pmweb_basicDetails_addIconMF"
                            className="basicDetails-addIconSvg"
                            tabindex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                openCalenderMf();
                              }
                            }}
                          />
                        </div>
                      )}

                      {!isReadOnly && (
                        <EditIcon
                          id="pmweb_basicDetails_editIcon_1_calendar"
                          style={{
                            color: "grey",
                            height: "2rem",
                            width: "4rem",
                            cursor: "pointer",
                            marginBlock: "0.5rem",
                            transform:
                              direction === RTL_DIRECTION ? "scaleX(-1)" : null,
                          }}
                          onClick={(e) => handleCalendarEdit()}
                          disabled={isReadOnly}
                          tabindex={0}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              handleCalendarEdit();
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </>
              ) : null}

              {console.log("@@@", "BASIX", props)}
              {
                //Modified on 26/09/2023, bug_id:135588
                /*!arrFormValidationAbsent().includes(selectedActivityType) &&
                props?.cellActivityType !== 40 &&
                props?.cellActivitySubType !== 1 ? */
                //till here for bug_id:135588

                !arrFormValidationAbsent().includes(selectedActivityType) ? ( //Modified on 04/10/2023, bug_id:138922
                  /* !arrFormValidationAbsent().includes(selectedActivityType) ? */
                  <FormsAndValidations
                    cellActivityType={props.cellActivityType}
                    cellActivitySubType={props.cellActivitySubType}
                    formEnabled={basicDetails.FormId}
                    // disabled={isDisableTab}
                    customStyle={props.isDrawerExpanded ? "60%" : "95%"}
                    value={basicDetails.CustomValidation}
                    changeBasicDetails={changeBasicDetails}
                    disabled={isReadOnly}
                  />
                ) : null
              }
              <div>
                {!configPeopleAndSystem && !isReadOnly ? (
                  <p
                    className="pmweb_basicDetails_peopleAndSysHeading"
                    onClick={() => {
                      setConfigPeopleAndSystem(true);
                    }}
                    id="pmweb_basicDetails_configurePeople&sys"
                    tabindex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        setConfigPeopleAndSystem(true);
                      }
                    }}
                  >
                    {t("configure")} {t("peopleAndSystems")}
                  </p>
                ) : null}
              </div>
              {configPeopleAndSystem ? (
                <PeopleAndSystems
                  id="pmweb_basicDetails_peopleAndSystems"
                  disabled={isReadOnly}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      )}
      {showQueueModal ? (
        <Modal
          show={showQueueModal}
          backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            // modifed on 27-9-2023 for bug_id: 133950
            // transform: "translate(-50%,-50%)",
            // code modified on 07-10-2023 for Bug 133949
            top: window.innerWidth < 1200 ? "26%" : "20%",
            // till here for Bug 133949
            left: direction === RTL_DIRECTION ? "unset" : "calc(50% - 25rem)",
            right: direction === RTL_DIRECTION ? "calc(50% - 25rem)" : "unset",
            // position: "absolute",
            // width: "80%",
            minWidth: "50rem",
            // till here for bug_id: 133950
            // height: "475px",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
            direction: direction,
            padding: "0px",
          }}
          modalClosed={() => setShowQueueModal(false)}
          hideBackdrop={true} //code updated on 23 Feb 2023 for BugId 116205
          children={
            <QueueAssociation
              setShowQueueModal={setShowQueueModal}
              queueType={isUsingSwimlaneQueue ? "0" : "1"}
              selfQueueCreated={selfQueueCreated}
              setSelfQueueCreated={setSelfQueueCreated}
              queueFrom="abstractView"
              setUpdatedQueueId={setUpdatedQueueId}
            />
          }
        ></Modal>
      ) : null}
      {showCalenderMFBool ? (
        <Modal
          show={showCalenderMFBool}
          backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            width: "auto",
            padding: "0", // added on 04/10/23 for BugId 132020
            boxShadow: "none", // added on 04/10/23 for BugId 132020
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: "white",
          }}
          modalClosed={() => {
            setshowCalenderMFBool(false);
            // code edited on 22 April 2023 for BugId 127409 - Custom Calendar || Cannot edit a Calendar once added. Loading Forever
            var elem = document.getElementById("workspacestudio_assetManifest");
            elem?.parentNode.removeChild(elem);
          }}
          NofocusTrap={navigator.platform.indexOf("iPad") !== -1}
        >
          <div
            //Modified  on 09/08/2023, bug_id:133959
            // id="pmweb_basicDetails_calenderDiv"
            id="calenderDiv"
            style={{ width: "100%", height: "100%" }}
          >
            {/*code edited on 30 Dec 2022 for BugId 116354*/}
            <div
              style={{
                // modified on 04/10/23 for BugId 132020
                // width: "800px",
                // height: "500px",
                width: "430px",
                height: "35rem",
                fontSize: "22px",
                fontWeight: "bold",
                // commented on 04/10/23 for BugId 132020
                // padding: "250px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span tabIndex={0}></span>
              <CircularProgress
                id="pmweb_basicDetails_calendarSpinner"
                // commented on 04/10/23 for BugId 132020
                // style={{ marginLeft: "40%" }}
              />
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectedCell: (
      id,
      name,
      activityType,
      activitySubType,
      seqId,
      queueId,
      type,
      checkedOut,
      laneId
    ) =>
      dispatch(
        actionCreators.selectedCell(
          id,
          name,
          activityType,
          activitySubType,
          seqId,
          queueId,
          type,
          checkedOut,
          laneId
        )
      ),

    expandDrawer: (flag) => dispatch(expandDrawer(flag)),
  };
};

const mapStateToProps = (state) => {
  return {
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openProcessType: state.openProcessClick.selectedType,
    openTemplateFlag: state.openTemplateReducer.openFlag,
    openProcessID: state.openProcessClick.selectedId,
    cellSeqId: state.selectedCellReducer.selectedSeqId,
    cellQueueId: state.selectedCellReducer.selectedQueueId,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(BasicDetails);
