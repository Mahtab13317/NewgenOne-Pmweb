// #BugID - 107353
// #BugDescription - Fixed the issue for properties not being saved.
// #BugID - 107354
// #BugDescription - Fixed the issue for save changes popup being shown even after properties were saved.
// Changes made to solve  Bug 117336 - new task: not able to open property of task activity
// #BugID - 124738
// #BugDescription - Fixed the issue for New task: not able to map variable in one go after creating the form.
// #BugID - 124888
// #BugDescription - Fixed the issue for activity/swimlane check in>> getting error while check in the changes for distribute workstep
// #BugID - 126277
// #BugDescription - Changes made for while saving task as global template without adding form then no validation is appearing neither it is getting saved.
//Changes made to solve Bug 126364 -activity icon>> icon change option is allowed in deployed version

import React, { useEffect, useState } from "react";
import Drawer from "@material-ui/core/Drawer";
import Tabs from "../../UI/Tab/Tab";
import "./Properties.css";
import StopIcon from "@material-ui/icons/Stop";
import * as actionCreators from "../../redux-store/actions/Properties/showDrawerAction.js";
import * as actionCreators_selection from "../../redux-store/actions/selectedCellActions";
import { Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { ActivityPropertyTabs } from "../../Constants/defaultTabsForActivity";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import taskTemplateIcon from "../../assets/bpmnViewIcons/TaskTemplate.svg";
import {
  SERVER_URL,
  ENDPOINT_SAVEPROPERTY,
  ENDPOINT_GET_ACTIVITY_PROPERTY,
  RTL_DIRECTION,
  TaskType,
  ENDPOINT_GET_TASK_PROPERTY,
  ENDPOINT_UPDATE_GLOBAL_TEMPLATE,
  ENDPOINT_SAVE_TASK_PROPERTY,
  ENDPOINT_DELETE_GLOBAL_TEMPLATE,
  DELETE_CONSTANT,
  MODIFY_CONSTANT,
  ENDPOINT_GET_GLOBALTASKTEMPLATES,
  propertiesLabel,
  PROCESSTYPE_LOCAL,
  ENDPOINT_DELETE_CONNECTION,
  ENDPOINT_ADD_CONNECTION,
  ENDPOINT_MODIFY_CONNECTION,
  PROCESSTYPE_LOCAL_CHECKED,
  headerHeight,
  ENDPOINT_VALIDATE_QUERY,
  ROUTE_TO_OPERATION_TYPE,
  DISTRIBUTE_TO_OPERATION_TYPE,
} from "../../Constants/appConstants";
import { getActivityProps } from "../../utility/abstarctView/getActivityProps";
import { useDispatch, useSelector, connect } from "react-redux";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyToDefault,
  setActivityPropertyValues,
} from "../..//redux-store/slices/ActivityPropertyChangeSlice";
import {
  setSave,
  ActivityPropertySaveCancelValue,
} from "../../redux-store/slices/ActivityPropertySaveCancelClicked";
import Modal from "../../UI/Modal/Modal";
import PropertiesSaveAlert from "./saveAlert";
import { getSelectedCellType } from "../../utility/abstarctView/getSelectedCellType";
import CommonTabHeader from "./PropetiesTab/commonTabHeader";
import { createInstance } from "../../utility/CommonFunctionCall/CommonFunctionCall";
import SaveAsGlobalTaskTemplateModal from "./PropetiesTab/GlobalTaskTemplate/SaveAsGlobalTaskTemplateModal";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { setGlobalTaskTemplates } from "../../redux-store/actions/Properties/globalTaskTemplateAction";
import {
  OpenProcessSliceValue,
  setOpenProcess,
} from "../../redux-store/slices/OpenProcessSlice";
import {
  setWebservice,
  webserviceChangeVal,
} from "../../redux-store/slices/webserviceChangeSlice";
import { ProcessTaskTypeValue } from "../../redux-store/slices/ProcessTaskTypeSlice";
import { propertiesTabsForActivities as Tab } from "../../utility/propertiesTabsForActivity/propertiesTabsForActivity";
import {
  ActivityCheckoutValue,
  setCheckoutActEdited,
} from "../../redux-store/slices/ActivityCheckoutSlice";
import CheckInActivityValidation from "./CheckInActivityValidation";
import { getVariableType } from "../../utility/ProcessSettings/Triggers/getVariableType";
import { checkIfParentSwimlaneCheckedOut } from "../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import SaveFormModal from "./SaveFormModal";
import GlobalTaskAlert from "./GlobalTaskAlert";
import { ReplaceSpaceToUnderScore } from "../../utility/ReplaceChar";
import { setWindowInnerHeight } from "../../redux-store/actions/processView/actions";
import {
  getAlwaysRuleConditionObject,
  getRuleOperationObject,
  getRuleType,
  otherwiseRuleData,
} from "./PropetiesTab/ActivityRules/CommonFunctions";

const useStyles = makeStyles(() => ({
  paper: {
    /* code edited and commented on 6 July 2023 for issue - save and 
    discard button hide issue in case of tablet(landscape mode)*/
    height: (props) => `calc(${props.windowInnerHeight}px - ${headerHeight})`,
    //Bug  - safari>> property window alignment is distorted in footer
    //[05-04-2023] - Added media query for the height and added flex;
    // "@media (min-width: 1200px)": {
    //   height: "81vh !important",
    // },
    display: "flex",
    justifyContent: "space-between",
    /* code edited on 6 July 2023 for issue - save and 
    discard button hide issue in case of tablet(landscape mode)*/
    top: `calc(${headerHeight} - 0.2rem)`,
    overflowY: "visible !important",
    overflowX: "visible !important",
    borderLeft: "1px solid #dadada",
    direction: "ltr",
    width: (props) =>
      props.isDrawerExpanded ? "100vw !important" : "30vw !important",
    "@media (min-width: 600px) and (max-width: 899px)": {
      width: (props) =>
        props.isDrawerExpanded ? "100vw !important" : "50vw !important",
    },
    "@media (min-width: 900px) and (max-width: 1199px)": {
      width: (props) =>
        props.isDrawerExpanded ? "100vw !important" : "40vw !important",
    },
    // Changes on 18-10-2023 to resolve the bug Id 135755
    "&:focus-visible":{
      border: "0 !important"
    }
  },
  // code added on 5 April 2023 for BugId 112610
  root: {
    marginInlineStart: "auto",
    direction: (props) => props.direction,
    width: (props) =>
      props.isDrawerExpanded ? "100vw !important" : "30vw !important",
    "@media (min-width: 600px) and (max-width: 899px)": {
      width: (props) =>
        props.isDrawerExpanded ? "100vw !important" : "50vw !important",
    },
    "@media (min-width: 900px) and (max-width: 1199px)": {
      width: (props) =>
        props.isDrawerExpanded ? "100vw !important" : "40vw !important",
    },

  },
}));

function PropertiesTab(props) {
  const { isDrawerExpanded, direction, isReadOnly, caseEnabled } = props;
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const [tabsForActivity, setTabsForActivity] = useState([]);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [isEmbeddedSubprocess, setisEmbeddedSubprocess] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const originalProcess = store.getState("originalProcessData");
  const loadedActivityPropertyData = store.getState("activityPropertyData"); //current processdata clicked
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [originalProcessData, setoriginalProcessData] =
    useGlobalState(originalProcess);
  const [saveCancelDisabled, setsaveCancelDisabled] = useState(true);
  const [tabComponents, setTabComponents] = useState([]);
  const [tabsWithError, setTabsWithError] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(false);
  const [selectedActivityIcon, setSelectedActivityIcon] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isSavingAsGlobalTemp, setIsSavingAsGlobalTemp] = useState(false);
  const [initialWebservice, setInitialWebservice] = useState(null);
  const [showCheckedInAlert, setShowCheckedInAlert] = useState(false);
  const [showFormEnableAlert, setShowFormEnableAlert] = useState(false);
  const [showGlobalAlert, setShowGlobalAlert] = useState(false);
  const globalTemplates = useSelector(
    (state) => state.globalTaskTemplate.globalTemplates
  );
  const [initialTarget, setInitialTarget] = useState(0);
  const openProcessData = useSelector(OpenProcessSliceValue);
  const webserviceVal = useSelector(webserviceChangeVal);
  const ProcessTaskType = useSelector(ProcessTaskTypeValue);
  const CheckedAct = useSelector(ActivityCheckoutValue);
   // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const classes = useStyles({
    isDrawerExpanded: props.isDrawerExpanded,
    windowInnerHeight: windowInnerHeight,
    direction: direction,
  });

  // to call getActivityProperty API
  useEffect(() => {
    //getActivityProperty api should be called only when some cell is selected
    if (localLoadedProcessData && props.cellID && props.showDrawer) {
      // code added on 5 April 2023 for BugId 112610
      setTabValue(0);
      if (props.cellType === getSelectedCellType("TASKTEMPLATE")) {
        setSelectedActivityIcon(taskTemplateIcon);
        dispatch(setOpenProcess({ loadedData: { ...localLoadedProcessData } }));
      } else if (props.cellType === getSelectedCellType("TASK")) {
        setSelectedActivityIcon(taskTemplateIcon);
        fetchTaskProperties();
        dispatch(setOpenProcess({ loadedData: { ...localLoadedProcessData } }));
      } else if (props.cellType === getSelectedCellType("ACTIVITY")) {
        if (
          CheckedAct.isCheckoutActEdited &&
          CheckedAct.actCheckedId !== props.cellID
        ) {
          setShowCheckedInAlert(true);
        } else {
          fetchActivityProperties();
          setSelectedActivityIcon(
            getActivityProps(
              props.cellActivityType,
              props.cellActivitySubType
            )[0]
          );
          dispatch(
            setOpenProcess({ loadedData: { ...localLoadedProcessData } })
          );
        }
      }
    }
    // added on 29/09/23 for BugId 135398
    else if (
      localLoadedProcessData &&
      (!props.cellID || props.cellID === null) &&
      props.showDrawer
    ) {
      props.setShowDrawer(false);
    }
  }, [props.cellID, props.showDrawer, props.cellType]);

  //to get global task templates
  const getGlobalTemplates = async () => {
    // code edited because of authorization token missing error in response of api call
    axios.get(SERVER_URL + ENDPOINT_GET_GLOBALTASKTEMPLATES).then((res) => {
      if (res?.data?.Status === 0) {
        const globalTemps = res.data.GlobalTemplates || [];
        dispatch(setGlobalTaskTemplates(globalTemps));
      }
    });
  };

  useEffect(() => {
    getGlobalTemplates();
  }, []);

  // Function that runs when the component loads.
  useEffect(() => {
    if (
      props.cellType === getSelectedCellType("TASK") ||
      props.cellType === getSelectedCellType("TASKTEMPLATE")
    ) {
      let activityName = props.cellTaskType;
      ActivityPropertyTabs.forEach((item) => {
        if (item.name === activityName) {
          let tabs = [...item.components];
          let tempComp = [];
          let tabList = {};
          // Modified on 28/08/2023, bug_id:134624
          if (
            ProcessTaskType === "U" &&
            props?.cellTaskType === "ProcessTask"
          ) {
            //tab 48 for data tab push for user monitored synchronous
            tabs.splice(1, 0, Tab(48));
          }
          //till here for bug_id:134624

          /*   if (ProcessTaskType === "U") {
            //tab 48 for data tab push for user monitored synchronous
            tabs.splice(1, 0, Tab(48));
          } */
          setTabsForActivity(tabs);
          tabs.forEach((tabEl) => {
            if (Object.keys(allTabStatus).includes(tabEl.label)) {
              //changes to keep old state of isModified and hasError when any new tab is pushed or removed
              tabList = {
                ...tabList,
                [tabEl.label]: {
                  isModified: allTabStatus[tabEl.label].isModified,
                  hasError: allTabStatus[tabEl.label].hasError,
                },
              };
            } else {
              tabList = {
                ...tabList,
                [tabEl.label]: { isModified: false, hasError: false },
              };
            }

            tempComp.push(tabEl.name);
          });

          setTabComponents(tempComp);
          dispatch(setActivityPropertyValues(tabList));
        }
      });
    } else if (props.cellType === getSelectedCellType("ACTIVITY")) {
      let activityName = getActivityProps(
        props.cellActivityType,
        props.cellActivitySubType
      )[5];
      if (+props.cellActivityType === 35 && +props.cellActivitySubType === 1) {
        setisEmbeddedSubprocess(true);
      } else setisEmbeddedSubprocess(false);
      ActivityPropertyTabs.forEach((item) => {
        if (item.name === activityName) {
          let tabs = [...item.components];

          let tempComp = [];
          let tabList = {};
          setTabsForActivity(tabs);
          tabs.forEach((tabEl) => {
            if (
              webserviceVal.webserviceChanged &&
              tabEl.label === propertiesLabel.basicDetails
            ) {
              tabList = {
                ...tabList,
                [tabEl.label]: { isModified: true, hasError: false },
              };
            } else if (
              webserviceVal.connChanged &&
              tabEl.label === propertiesLabel.basicDetails
            ) {
              tabList = {
                ...tabList,
                [tabEl.label]: { isModified: true, hasError: false },
              };
            } else {
              tabList = {
                ...tabList,
                [tabEl.label]: { isModified: false, hasError: false },
              };
            }
            tempComp.push(tabEl.name);
          });
          setTabComponents(tempComp);
          dispatch(setActivityPropertyValues(tabList));
        }
      });
    }
  }, [
    props.cellID,
    props.cellActivityType,
    props.cellActivitySubType,
    ProcessTaskType,
    props.cellType,
  ]);

  useEffect(() => {
    let isModified = false;
    for (let tab in Object.values(allTabStatus)) {
      if (Object.values(allTabStatus)[tab].isModified === true) {
        isModified = true;
        break;
      }
    }
    setsaveCancelDisabled(!isModified);
    setIsModified(isModified);
  }, [allTabStatus]);

  useEffect(() => {
    if (saveCancelStatus.CloseClicked && isModified) {
      setShowConfirmationAlert(true);
    } else if (saveCancelStatus.CloseClicked && !isModified) {
      props.setShowDrawer(false);
      props.selectedCell(null, null, null, null, null, null, null, null, null);
      props.selectedTask(null, null, null, null);
      dispatch(setSave({ CloseClicked: false }));
    }
  }, [saveCancelStatus.CloseClicked, isModified]);

  useEffect(() => {
    if (!showConfirmationAlert) {
      dispatch(setSave({ CloseClicked: false }));
    }

    if (!showFormEnableAlert) {
      dispatch(setSave({ SaveFormEnabled: false }));
    }
  }, [showConfirmationAlert, showFormEnableAlert]);

  useEffect(() => {
    if (saveCancelStatus.SaveFormEnabled) {
      setShowFormEnableAlert(true);
    }
  }, [saveCancelStatus.SaveFormEnabled]);

  const setWebserviceFunc = (localActProperty) => {
    if (
      (+localActProperty?.ActivityProperty?.actType === 40 &&
        +localActProperty?.ActivityProperty?.actSubType === 1) ||
      (+localActProperty?.ActivityProperty?.actType === 23 &&
        +localActProperty?.ActivityProperty?.actSubType === 1) ||
      (+localActProperty?.ActivityProperty?.actType === 24 &&
        +localActProperty?.ActivityProperty?.actSubType === 1) ||
      (+localActProperty?.ActivityProperty?.actType === 25 &&
        +localActProperty?.ActivityProperty?.actSubType === 1) ||
      (+localActProperty?.ActivityProperty?.actType === 22 &&
        +localActProperty?.ActivityProperty?.actSubType === 1)
    ) {
      setInitialWebservice(localActProperty?.ActivityProperty?.actType);
      dispatch(
        setWebservice({
          initialWebservice: localActProperty?.ActivityProperty?.actType,
        })
      );
    }
  };

  const fetchActivityProperties = () => {
    if (
      localLoadedProcessData.ProcessType !== PROCESSTYPE_LOCAL &&
      props.cellType === getSelectedCellType("ACTIVITY") &&
      props.cellCheckedOut === "Y" &&
      CheckedAct.isCheckoutActEdited
    ) {
      let localActProperty = JSON.parse(
        JSON.stringify(CheckedAct.checkedActProp)
      );
      let targetId = 0;
      localLoadedProcessData?.Connections?.forEach((conn) => {
        if (conn.SourceId == localActProperty?.ActivityProperty?.actId) {
          targetId = conn.TargetId;
        }
      });
      setInitialTarget(targetId);
      dispatch(
        setWebservice({
          initialConn: targetId,
        })
      );
      setWebserviceFunc(localActProperty);
      setlocalLoadedActivityPropertyData(localActProperty);
      setoriginalProcessData(localActProperty);
    } else {
      getActProperty();
    }
  };

  const getIfActivityNewInCheckoutLane = (id) => {
    let flag = false;
    for (let mile of localLoadedProcessData?.MileStones) {
      for (let act of mile?.Activities) {
        if (+act.ActivityId === +id) {
          if (!!act.status && act.status === "I") {
            flag = true;
            break;
          }
        }
      }
    }
    return flag;
  };

  const getVariableObjById = (id) => {
    let temp;
    for (let mile of localLoadedProcessData.MileStones) {
      for (let act of mile.Activities) {
        if (+act.ActivityId === +id) {
          temp = act;
          break;
        }
      }
    }
    return temp;
  };

  const getActProperty = () => {
    setlocalLoadedActivityPropertyData(null);
    setTabValue(0);
    let _url =
      checkIfParentSwimlaneCheckedOut(localLoadedProcessData, props.cellLaneId)
        ?.length > 0 && getIfActivityNewInCheckoutLane(props.cellID)
        ? ENDPOINT_GET_ACTIVITY_PROPERTY +
          props.cellActivityType +
          "/" +
          props.cellActivitySubType
        : ENDPOINT_GET_ACTIVITY_PROPERTY +
          localLoadedProcessData.ProcessDefId +
          "/" +
          localLoadedProcessData.ProcessType +
          "/" +
          localLoadedProcessData.VersionNo +
          "/" +
          localLoadedProcessData.ProcessName +
          "/" +
          localLoadedProcessData.ProcessVariantType +
          "/" +
          props.cellID;
    axios
      .get(SERVER_URL + _url)
      .then((res) => {
        if (res.status === 200) {
          if (
            checkIfParentSwimlaneCheckedOut(
              localLoadedProcessData,
              props.cellLaneId
            )?.length > 0
          ) {
            let hasPropertiesKey = false,
              propertyLocal;
            let temp = global.structuredClone(localLoadedProcessData);
            let localActProperty = { ...res.data };
            let targetId = 0;
            temp?.Connections?.forEach((conn) => {
              // code edited on 25 May 2023 for BugId 127157 - swimlane checkout>> target workstep value is not getting displayed unless check in
              if (+conn.SourceId === +props.cellID && conn.Type === "D") {
                targetId = conn.TargetId;
              }
            });

            let responseData = {
              ...res.data,
              ActivityProperty: {
                ...res.data.ActivityProperty,
                actId: props.cellID,
                ActivityName: props.cellName,
                actName: props.cellName,
                actSubType: props.cellActivitySubType,
                actType: props.cellActivityType,
                targetId: targetId + "",
                // code added on 6 July 2022 for BugId 110924
                oldPrimaryAct: localActProperty?.ActivityProperty?.primaryAct
                  ? localActProperty.ActivityProperty.primaryAct
                  : "N",
              },
            };
            temp.MileStones.forEach((mile) => {
              mile.Activities.forEach((act) => {
                if (+act.ActivityId === +props.cellID) {
                  if (!act.hasOwnProperty("Properties")) {
                    act.Properties = responseData;
                  } else {
                    hasPropertiesKey = true;
                    // code edited on 25 May 2023 for BugId 127157 - swimlane checkout>> target workstep value is not getting displayed unless check in
                    propertyLocal = {
                      ...act.Properties,
                      ActivityProperty: {
                        ...act.Properties.ActivityProperty,
                        targetId: targetId + "",
                      },
                    };
                  }
                }
              });
            });

            // added on 07/10/23 for BugId 138931
            //--for data based exclusive
            if (
              props.cellActivityType === 7 &&
              props.cellActivitySubType === 1
            ) {
              let ruleObj = {
                ruleLabel: "",
                ruleCondList: [getAlwaysRuleConditionObject()],
                ruleType: getRuleType(
                  props.cellActivityType,
                  props.cellActivitySubType
                ),
                ruleOpList: [
                  getRuleOperationObject(1, ROUTE_TO_OPERATION_TYPE),
                ],
                ruleId: "",
                ruleOrderId: 0,
              };
              let targetArr = [];
              localLoadedProcessData?.Connections.forEach((conn) => {
                if (conn.SourceId === props.cellID) {
                  targetArr.push(
                    getVariableObjById(conn.TargetId).ActivityName
                  );
                }
              });
              let data = hasPropertiesKey
                ? { ...propertyLocal }
                : { ...responseData };
              let propTargetArr = [];
              data?.ActivityProperty?.routingCriteria?.routCriteriaList?.forEach(
                (el) => {
                  if (
                    el.ruleOpList[0].opType === ROUTE_TO_OPERATION_TYPE &&
                    el.ruleOpList[0].param1 !== "PreviousStage"
                  ) {
                    propTargetArr.push(el.ruleOpList[0].param1);
                  }
                }
              );
              if (targetArr?.sort()?.join() !== propTargetArr?.sort()?.join()) {
                if (targetArr?.length > propTargetArr?.length) {
                  let filteredArr = targetArr.filter(
                    (element) => !propTargetArr.includes(element)
                  );
                  if (
                    data?.ActivityProperty?.routingCriteria?.routCriteriaList
                      ?.length === 0
                  ) {
                    if (hasPropertiesKey) {
                      propertyLocal.ActivityProperty.routingCriteria.routCriteriaList =
                        otherwiseRuleData;
                    } else {
                      responseData.ActivityProperty.routingCriteria.routCriteriaList =
                        otherwiseRuleData;
                    }
                  }
                  filteredArr?.forEach((element) => {
                    let routingRule = global.structuredClone(ruleObj);
                    let newId =
                      Math.max(
                        ...data?.ActivityProperty?.routingCriteria?.routCriteriaList.map(
                          (rout) => +rout.ruleId
                        )
                      ) + 1;
                    routingRule.ruleId = newId + "";
                    routingRule.ruleOrderId = newId;
                    routingRule.ruleOpList[0].param1 = element;
                    if (hasPropertiesKey) {
                      propertyLocal.ActivityProperty?.routingCriteria?.routCriteriaList.push(
                        routingRule
                      );
                    } else {
                      responseData.ActivityProperty?.routingCriteria?.routCriteriaList.push(
                        routingRule
                      );
                    }
                  });
                } else if (targetArr?.length < propTargetArr?.length) {
                  let filteredArr = propTargetArr.filter(
                    (element) => !targetArr.includes(element)
                  );
                  filteredArr?.forEach((filterErr) => {
                    data?.ActivityProperty?.routingCriteria?.routCriteriaList?.forEach(
                      (el, idx) => {
                        if (
                          el.ruleOpList[0].opType === ROUTE_TO_OPERATION_TYPE &&
                          el.ruleOpList[0].param1 === filterErr
                        ) {
                          if (hasPropertiesKey) {
                            propertyLocal.ActivityProperty?.routingCriteria?.routCriteriaList.splice(
                              idx,
                              1
                            );
                          } else {
                            responseData.ActivityProperty?.routingCriteria?.routCriteriaList.splice(
                              idx,
                              1
                            );
                          }
                        }
                      }
                    );
                  });
                }
              }
            }

            // added on 07/10/23 for BugId 136062
            //-- for distribute gateways
            if (props.cellActivityType === 5) {
              let ruleObj = {
                ruleLabel: "",
                ruleCondList: [getAlwaysRuleConditionObject()],
                ruleType: getRuleType(
                  props.cellActivityType,
                  props.cellActivitySubType
                ),
                ruleOpList: [
                  getRuleOperationObject(1, DISTRIBUTE_TO_OPERATION_TYPE),
                ],
                ruleId: "",
                ruleOrderId: 0,
              };
              let targetArr = [];
              localLoadedProcessData?.Connections.forEach((conn) => {
                if (conn.SourceId === props.cellID) {
                  targetArr.push(
                    getVariableObjById(conn.TargetId).ActivityName
                  );
                }
              });
              let data = hasPropertiesKey
                ? { ...propertyLocal }
                : { ...responseData };
              let propTargetArr = [];
              data?.ActivityProperty?.distributeInfo?.disRuleInfo?.forEach(
                (el) => {
                  if (
                    el.ruleOpList[0].opType === DISTRIBUTE_TO_OPERATION_TYPE &&
                    el.ruleOpList[0].param1 !== "PreviousStage"
                  ) {
                    propTargetArr.push(el.ruleOpList[0].param1);
                  }
                }
              );
              if (targetArr?.sort()?.join() !== propTargetArr?.sort()?.join()) {
                if (targetArr?.length > propTargetArr?.length) {
                  let filteredArr = targetArr.filter(
                    (element) => !propTargetArr.includes(element)
                  );
                  filteredArr?.forEach((element) => {
                    let routingRule = global.structuredClone(ruleObj);
                    let newId =
                      data?.ActivityProperty?.distributeInfo?.disRuleInfo
                        ?.length > 0
                        ? Math.max(
                            ...data?.ActivityProperty?.distributeInfo?.disRuleInfo?.map(
                              (rout) => +rout.ruleId
                            )
                          ) + 1
                        : 1;
                    routingRule.ruleId = newId + "";
                    routingRule.ruleOrderId = newId;
                    routingRule.ruleOpList[0].param1 = element;
                    if (hasPropertiesKey) {
                      propertyLocal.ActivityProperty?.distributeInfo?.disRuleInfo.push(
                        routingRule
                      );
                    } else {
                      responseData.ActivityProperty?.distributeInfo?.disRuleInfo.push(
                        routingRule
                      );
                    }
                  });
                } else if (targetArr?.length < propTargetArr?.length) {
                  let filteredArr = propTargetArr.filter(
                    (element) => !targetArr.includes(element)
                  );
                  filteredArr?.forEach((filterErr) => {
                    data?.ActivityProperty?.distributeInfo?.disRuleInfo?.forEach(
                      (el, idx) => {
                        if (
                          el.ruleOpList[0].opType ===
                            DISTRIBUTE_TO_OPERATION_TYPE &&
                          el.ruleOpList[0].param1 === filterErr
                        ) {
                          if (hasPropertiesKey) {
                            propertyLocal.ActivityProperty?.distributeInfo?.disRuleInfo.splice(
                              idx,
                              1
                            );
                          } else {
                            responseData.ActivityProperty?.distributeInfo?.disRuleInfo.splice(
                              idx,
                              1
                            );
                          }
                        }
                      }
                    );
                  });
                }
              }
            }

            if (hasPropertiesKey) {
              setlocalLoadedActivityPropertyData(propertyLocal);
              setoriginalProcessData(propertyLocal);
            } else {
              setlocalLoadedActivityPropertyData(responseData);
              setoriginalProcessData(responseData);
            }
            setInitialTarget(targetId);
            dispatch(
              setWebservice({
                initialConn: targetId,
              })
            );
            setLocalLoadedProcessData(temp);
          } else {
            // code added on 6 July 2022 for BugId 111910
            let localActProperty = { ...res.data };
            let targetId = 0;
            localLoadedProcessData?.Connections?.forEach((conn) => {
              if (
                +conn.SourceId === +localActProperty?.ActivityProperty?.actId &&
                conn.Type === "D"
              ) {
                targetId = conn.TargetId;
              }
            });
            localActProperty.ActivityProperty = {
              ...localActProperty?.ActivityProperty,
              targetId: targetId + "",
              // code added on 6 July 2022 for BugId 110924
              oldPrimaryAct: localActProperty?.ActivityProperty?.primaryAct
                ? localActProperty.ActivityProperty.primaryAct
                : "N",
            };
            setInitialTarget(targetId);
            dispatch(
              setWebservice({
                initialConn: targetId,
              })
            );
            setWebserviceFunc(localActProperty);
            setlocalLoadedActivityPropertyData(localActProperty);
            setoriginalProcessData(localActProperty);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTaskProperties = () => {
    setTabValue(0);
    setlocalLoadedActivityPropertyData(null);
    setoriginalProcessData(null);
    const axiosInstance = createInstance();
    axiosInstance
      .get(
        `${ENDPOINT_GET_TASK_PROPERTY}/${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}/${props.cellID}`
      )
      .then((res) => {
        if (res.status === 200) {
          if (res.data && res.data.length > 0) {
            let taskData = global.structuredClone(res.data[0]);
            if (!!taskData.taskGenPropInfo.bTaskFormView) {
              taskData.taskGenPropInfo.taskFormId =
                localLoadedProcessData.ProcessDefId + "";
            }
            setlocalLoadedActivityPropertyData(
              global.structuredClone(taskData)
            );
            setoriginalProcessData(global.structuredClone(taskData));
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const saveTaskProperties = async (calledFrom) => {
    let newTaskData = { ...localLoadedActivityPropertyData };
    if (props.cellType === getSelectedCellType("TASKTEMPLATE")) {
      newTaskData = {
        ...newTaskData,
        m_arrTaskTemplateVarList:
          newTaskData?.taskGenPropInfo?.taskTemplateInfo
            ?.m_arrTaskTemplateVarList,
        m_bGlobalTemplate:
          newTaskData?.taskGenPropInfo?.taskTemplateInfo?.m_bGlobalTemplate,
        m_bGlobalTemplateFormCreated:
          newTaskData?.taskGenPropInfo?.taskTemplateInfo
            ?.m_bGlobalTemplateFormCreated,
        m_bCustomFormAssoc:
          newTaskData?.taskGenPropInfo?.taskTemplateInfo?.m_bCustomFormAssoc,
        m_strTemplateName:
          newTaskData?.taskGenPropInfo?.taskTemplateInfo?.m_strTemplateName,
        m_iTemplateId:
          newTaskData?.taskGenPropInfo?.taskTemplateInfo?.m_iTemplateId,
      };
      // code edited on 17 Nov 2022 for BugId 119098
      if (newTaskData?.m_bGlobalTemplate) {
        newTaskData.m_strStatus = "U";
      } else {
        newTaskData.m_strStatus = "I";
      }

      try {
        const response = await axios.post(
          SERVER_URL + `${ENDPOINT_UPDATE_GLOBAL_TEMPLATE}`,
          {
            ...newTaskData,
            processDefId: localLoadedProcessData.ProcessDefId,
            status: MODIFY_CONSTANT,
          }
        );
        if (response.data?.Status === 0) {
          // code added on 3 Oct 2022 for BugId 116521
          //to update task variables in open process call data
          const tempProcessData = JSON.parse(
            JSON.stringify(openProcessData.loadedData)
          );
          tempProcessData?.Tasks?.forEach((task, index) => {
            if (+props.cellID === task.TaskId) {
              let taskTempVar = [];
              newTaskData?.taskGenPropInfo?.taskTemplateInfo?.m_arrTaskTemplateVarList?.forEach(
                (taskVr) => {
                  taskTempVar.push({
                    ControlType: "",
                    DBLinking: taskVr.m_strDBLinking,
                    DisplayName: taskVr.m_strDisplayName,
                    OrderId: taskVr.m_iOrderId,
                    TemplateVariableId: taskVr.m_iTempVarId,
                    VariableName: taskVr.m_strVariableName,
                    VariableType: getVariableType(
                      `${taskVr.m_strVariableType}`
                    ),
                  });
                }
              );
              tempProcessData.Tasks[index].TaskTemplateVar = [...taskTempVar];
              tempProcessData.Tasks[index].TaskMode =
                newTaskData?.taskGenPropInfo?.m_strSubPrcType;
            }
          });
          setLocalLoadedProcessData(tempProcessData);
          const tempGT = JSON.parse(JSON.stringify(globalTemplates));
          tempGT?.map((gt, idx) => {
            if (gt?.m_strTemplateName === props.cellName) {
              tempGT[idx] = { ...newTaskData };
            }
          });
          dispatch(setGlobalTaskTemplates(tempGT));
          dispatch(setActivityPropertyToDefault());
          setIsModified(false);
          setsaveCancelDisabled(true);
          if (saveCancelStatus.CloseClicked) {
            props.setShowDrawer(false);
            props.selectedCell(
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            );
            props.selectedTask(null, null, null, null);
            setlocalLoadedActivityPropertyData(null);
            setoriginalProcessData(null);
            dispatch(
              setSave({
                CloseClicked: false,
                SaveClicked: false,
                SaveOnceClicked: false,
              })
            );
          } else {
            setoriginalProcessData(localLoadedActivityPropertyData);
            dispatch(
              setSave({
                SaveClicked: false,
                SaveOnceClicked: false,
              })
            );
          }
          dispatch(
            setToastDataFunc({
              message: response.data.Message || t("SavedSuccessfully"),
              severity: "success",
              open: true,
            })
          );
          if (calledFrom === "form") {
            saveCancelStatus.saveFormCallBack();
          }
        }
      } catch (error) {
        dispatch(
          setToastDataFunc({
            message: error?.response?.data?.message || t("serverError"),
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      if (
        newTaskData?.taskType !== 2 &&
        localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
          ?.m_arrTaskTemplateVarList?.length === 0
      ) {
        dispatch(
          setToastDataFunc({
            severity: "error",
            message: t("AddAtleastOneVariableInDataTab"), //Modified on 29/09/2023, bug_id:137344
            open: "true",
          })
        );
      } else if (
        !!newTaskData.taskGenPropInfo.bTaskFormView &&
        !newTaskData.taskGenPropInfo.hasOwnProperty("taskFormId") &&
        !saveCancelStatus.SaveFormEnabled
      ) {
        dispatch(
          setToastDataFunc({
            severity: "error",
            message: t("PleaseAddNewForm"),
            open: "true",
          })
        );
      } else {
        if (
          newTaskData.taskGenPropInfo.taskTemplateInfo.m_strModifedStatus ===
          "N"
        ) {
          newTaskData.taskGenPropInfo.taskTemplateInfo.m_strModifedStatus = "C";
        }
        newTaskData.taskGenPropInfo.taskTemplateInfo.m_arrTaskTemplateVarList =
          newTaskData?.taskGenPropInfo?.taskTemplateInfo?.m_arrTaskTemplateVarList?.map(
            (el) => {
              if (el.error) {
                delete el.error;
              }
              if (el.taskStatus) {
                delete el.taskStatus;
              }
              return el;
            }
          );
        try {
          const response = await axios.post(
            SERVER_URL + `${ENDPOINT_SAVE_TASK_PROPERTY}`,
            {
              ...newTaskData,
              processDefId: localLoadedProcessData.ProcessDefId,
              status: MODIFY_CONSTANT,
            }
          );
          if (response.data?.Status === 0) {
            toastHandler(
              localLoadedActivityPropertyData.taskType === 1
                ? t("TaskPropertiesSaved")
                : t("ProcessTaskPropertiesSaved"),
              "success"
            );
            // code added on 3 Oct 2022 for BugId 116521
            //to update task variables in open process call data
            const tempProcessData = JSON.parse(
              JSON.stringify(localLoadedProcessData)
            );
            tempProcessData?.Tasks?.forEach((task, index) => {
              if (+props.cellID === task.TaskId) {
                let taskTempVar = [];
                newTaskData?.taskGenPropInfo?.taskTemplateInfo?.m_arrTaskTemplateVarList?.forEach(
                  (taskVr) => {
                    taskTempVar.push({
                      ControlType: "",
                      DBLinking: taskVr.m_strDBLinking,
                      DisplayName: taskVr.m_strDisplayName,
                      OrderId: taskVr.m_iOrderId,
                      TemplateVariableId: taskVr.m_iTempVarId,
                      VariableName: taskVr.m_strVariableName,
                      VariableType: getVariableType(
                        `${taskVr.m_strVariableType}`
                      ),
                    });
                  }
                );
                tempProcessData.Tasks[index].TaskTemplateVar = [...taskTempVar];
                tempProcessData.Tasks[index].TaskMode =
                  newTaskData?.taskGenPropInfo?.m_strSubPrcType;
              }
            });
            setLocalLoadedProcessData(tempProcessData);
            dispatch(setOpenProcess({ loadedData: { ...tempProcessData } }));
            dispatch(setActivityPropertyToDefault());
            setIsModified(false);
            setoriginalProcessData(localLoadedActivityPropertyData);
            setsaveCancelDisabled(true);
            if (saveCancelStatus.CloseClicked) {
              props.setShowDrawer(false);
              props.selectedCell(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
              );
              props.selectedTask(null, null, null, null);
              dispatch(
                setSave({
                  CloseClicked: false,
                  SaveClicked: false,
                  SaveOnceClicked: false,
                })
              );
            } else {
              dispatch(
                setSave({
                  SaveClicked: false,
                  SaveOnceClicked: false,
                })
              );
            }
            if (calledFrom === "form") {
              saveCancelStatus.saveFormCallBack();
            }
          }
        } catch (error) {
          setToastDataFunc({
            message: error?.response?.data?.message || t("serverError"),
            severity: "error",
            open: true,
          });
        }
      }
    }
  };

  const handleDeleteGlobalTemplate = async () => {
    try {
      const inputPayload = {
        processDefId: localLoadedProcessData?.ProcessDefId,
        m_strTemplateName:
          localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
            ?.m_strTemplateName,
        m_iTemplateId:
          localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
            ?.m_iTemplateId,
        m_strStatus: DELETE_CONSTANT,
        m_arrTaskTemplateVarList:
          localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
            ?.m_arrTaskTemplateVarList,
      };
      const response = await axios.post(
        SERVER_URL + `${ENDPOINT_DELETE_GLOBAL_TEMPLATE}`,
        inputPayload
      );
      if (response.data.Status === 0) {
        toastHandler(response.data.Message, "success");
        //deleting global template from redux store as well
        const newGlobalTemplates = [...globalTemplates].filter(
          (item) => item.m_iTemplateId !== inputPayload.m_iTemplateId
        );
        dispatch(setGlobalTaskTemplates(newGlobalTemplates));
        dispatch(setActivityPropertyToDefault());
        setIsModified(false);
        setoriginalProcessData(null);
        setsaveCancelDisabled(true);
        props.setShowDrawer(false);
        props.selectedCell(
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        );
        props.selectedTask(null, null, null, null);
        dispatch(setSave({ CloseClicked: false }));
        setToastDataFunc({
          message: response.data.message || t("DeletedSuccessfully"),
          severity: "success",
          open: true,
        });
      }
    } catch (error) {
      setToastDataFunc({
        message: error?.response?.data?.message || t("serverError"),
        severity: "error",
        open: true,
      });
    }
  };

  const toastHandler = (message, severity) => {
    dispatch(
      setToastDataFunc({
        message: message,
        severity: severity,
        open: true,
      })
    );
  };

  const postDataForCallActivity = () => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (temp) {
      temp.ActivityProperty["processDefId"] =
        localLoadedProcessData.ProcessDefId;
      axios
        .post(SERVER_URL + ENDPOINT_SAVEPROPERTY, temp.ActivityProperty)
        .then((response) => {
          if (response?.data?.Status === 0) {
            toastHandler(response.data.Message, "success");
            // code added on 25 Oct 2022 for BugId 116751
            //to update primaryActivity flag in open process call data
            const tempProcessData = JSON.parse(
              JSON.stringify(openProcessData.loadedData)
            );
            const actId = temp.ActivityProperty.actId;
            tempProcessData?.MileStones.map((milestone) => {
              milestone.Activities.map((act) => {
                if (
                  act.ActivityId === actId &&
                  temp.ActivityProperty.primaryAct === "Y"
                ) {
                  act.PrimaryActivity = "Y";
                } else if (
                  act.ActivityId !== actId &&
                  temp.ActivityProperty.primaryAct === "Y"
                ) {
                  act.PrimaryActivity = "N";
                }
                if (act.ActivityId === actId) {
                  act.ImageName =
                    localLoadedActivityPropertyData?.ActivityProperty?.imageName;
                }
                if (
                  +act.ActivityType === 32 &&
                  +act.ActivitySubType === 1 &&
                  act.ActivityId === actId
                ) {
                  let taskAss = [];
                  Object.values(
                    localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                      ?.objPMWdeskTasks?.taskMap
                  )?.forEach((el) => {
                    taskAss.push(el?.taskTypeInfo?.taskId);
                  });
                  act.AssociatedTasks = [...taskAss];
                }
                if (
                  +act.ActivityType === 18 &&
                  +act.ActivitySubType === 1 &&
                  act.ActivityId === actId
                ) {
                  act.AssociatedProcess = {
                    Associated_ProcessDefId:
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedProcessDefId,
                    Associated_ProjectName: "",
                    Associated_VersionNo:
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedVersion,
                    Associated_ProcessName:
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedProcessName,
                  };
                }
                return act;
              });
              return milestone;
            });
            // code edited on 30 March 2023 for BugId 125991
            if (response?.data?.Connection) {
              const updatedCon = JSON.parse(
                JSON.stringify(response?.data?.Connection)
              );
              const newArr = updatedCon?.map((v) => ({
                ConnectionId: +v.ConnectionId,
                SourceId: +v.SourceId,
                TargetId: +v.TargetId,
                Type: v.Type,
                xLeft: v.xLeft ? v.xLeft : [], // code edited on 4 April 2023 for BugId 126201
                yTop: v.yTop ? v.yTop : [], // code edited on 4 April 2023 for BugId 126201
              }));
              tempProcessData.Connections = [...newArr];
            }

            // code commented for the issue - target workstep and connection is not updating, when saved from activity property
            /*if (
              webserviceVal.connChanged &&
              +webserviceVal.initialConn !==
                +localLoadedActivityPropertyData?.ActivityProperty?.targetId
            ) {
              targetWorkstepApi(tempProcessData);
            } else {
              setLocalLoadedProcessData(tempProcessData);
              dispatch(setOpenProcess({ loadedData: { ...tempProcessData } }));
            }*/
            setLocalLoadedProcessData(tempProcessData);
            dispatch(setOpenProcess({ loadedData: { ...tempProcessData } }));
            dispatch(setActivityPropertyToDefault());
            setIsModified(false);
            setsaveCancelDisabled(true);
            setWebserviceFunc(localLoadedActivityPropertyData);
            if (saveCancelStatus.CloseClicked) {
              props.setShowDrawer(false);
              props.selectedCell(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
              );
              props.selectedTask(null, null, null, null);
              // code edited on 15 Nov 2022 for BugId 114460
              dispatch(
                setSave({
                  CloseClicked: false,
                  SaveClicked: false,
                  SaveOnceClicked: false,
                })
              );
              setlocalLoadedActivityPropertyData(null);
              setoriginalProcessData(null);
            } else {
              setoriginalProcessData(localLoadedActivityPropertyData);
              // code edited on 15 Nov 2022 for BugId 114460
              dispatch(setSave({ SaveClicked: false, SaveOnceClicked: false }));
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const targetWorkstepApi = async (temp) => {
    let data = {};
    if (+localLoadedActivityPropertyData?.ActivityProperty?.targetId === 0) {
      temp?.Connections?.forEach((conn) => {
        if (+conn.SourceId === +props.cellID && +conn.TargetId === 0) {
          data = conn;
        }
      });
      if (checkIfParentSwimlaneCheckedOut(temp, props.cellLaneId)?.length > 0) {
        let pos = temp.Connections.map(function (e) {
          return e.SourceId;
        }).indexOf(+props.cellID);
        temp.Connections.splice(pos, 1);
        setLocalLoadedProcessData(temp);
        dispatch(setOpenProcess({ loadedData: { ...temp } }));
        dispatch(setWebservice({ connChanged: false }));
        setInitialTarget(0);
        dispatch(
          setWebservice({
            initialConn: 0,
          })
        );
      } else if (
        temp.ProcessType === PROCESSTYPE_LOCAL ||
        temp.ProcessType === PROCESSTYPE_LOCAL_CHECKED
      ) {
        let payload = {
          processDefId: temp?.ProcessDefId,
          processMode: temp?.ProcessType,
          connId: data.ConnectionId,
          connType: data.Type,
        };
        const res = await axios.post(
          SERVER_URL + ENDPOINT_DELETE_CONNECTION,
          payload
        );
        const resData = await res?.data;
        if (resData?.Status === 0) {
          let pos = temp.Connections.map(function (e) {
            return e.SourceId;
          }).indexOf(+props.cellID);
          temp.Connections.splice(pos, 1);
          setLocalLoadedProcessData(temp);
          dispatch(setOpenProcess({ loadedData: { ...temp } }));
          // code added on 5 August 2022 for BugId 113918
          dispatch(setWebservice({ connChanged: false }));
          // code added on 5 Dec 2022 for BugId 111141
          setInitialTarget(0);
          dispatch(
            setWebservice({
              initialConn: 0,
            })
          );
        }
      }
    } else {
      temp?.Connections?.forEach((conn) => {
        if (+conn.SourceId === +props.cellID) {
          data = conn;
        }
      });
      let payload = {
        processDefId: temp?.ProcessDefId,
        processMode: temp?.ProcessType,
        connId: data.ConnectionId,
        sourceId: data.SourceId,
        targetId: data.TargetId,
        connType: data.Type,
      };
      // code edited on 5 Dec 2022 for BugId 111141
      if (data.status !== "E") {
        if (
          checkIfParentSwimlaneCheckedOut(temp, props.cellLaneId)?.length > 0
        ) {
          setLocalLoadedProcessData(temp);
          dispatch(setOpenProcess({ loadedData: { ...temp } }));
          dispatch(setWebservice({ connChanged: false }));
          setInitialTarget(data.TargetId);
          dispatch(
            setWebservice({
              initialConn: data.TargetId,
            })
          );
        } else if (
          temp.ProcessType === PROCESSTYPE_LOCAL ||
          temp.ProcessType === PROCESSTYPE_LOCAL_CHECKED
        ) {
          const res = await axios.post(
            SERVER_URL + ENDPOINT_ADD_CONNECTION,
            payload
          );
          const resData = await res.data;
          if (resData?.Status === 0) {
            setLocalLoadedProcessData(temp);
            dispatch(setOpenProcess({ loadedData: { ...temp } }));
            // code added on 5 August 2022 for BugId 113918
            dispatch(setWebservice({ connChanged: false }));
            // code added on 5 Dec 2022 for BugId 111141
            setInitialTarget(data.TargetId);
            dispatch(
              setWebservice({
                initialConn: data.TargetId,
              })
            );
            return 0;
          }
        }
      } else {
        if (
          checkIfParentSwimlaneCheckedOut(temp, props.cellLaneId)?.length > 0
        ) {
          setLocalLoadedProcessData(temp);
          dispatch(setOpenProcess({ loadedData: { ...temp } }));
          dispatch(setWebservice({ connChanged: false }));
          setInitialTarget(data.TargetId);
          dispatch(
            setWebservice({
              initialConn: data.TargetId,
            })
          );
        } else if (
          temp.ProcessType === PROCESSTYPE_LOCAL ||
          temp.ProcessType === PROCESSTYPE_LOCAL_CHECKED
        ) {
          const res = await axios.post(
            SERVER_URL + ENDPOINT_MODIFY_CONNECTION,
            payload
          );
          const resData = await res.data;
          if (resData?.Status === 0) {
            setLocalLoadedProcessData(temp);
            dispatch(setOpenProcess({ loadedData: { ...temp } }));
            // code added on 5 August 2022 for BugId 113918
            dispatch(setWebservice({ connChanged: false }));
            // code added on 5 Dec 2022 for BugId 111141
            setInitialTarget(data.TargetId);
            dispatch(
              setWebservice({
                initialConn: data.TargetId,
              })
            );
            return 0;
          }
        }
      }
    }
  };

  const handleSaveChanges = async (calledFrom) => {
    setShowConfirmationAlert(false);
    setShowFormEnableAlert(false);
    // code edited on 15 Nov 2022 for BugId 114460
    dispatch(setSave({ SaveClicked: true, SaveOnceClicked: true }));
    let errorTabs = await handleTabError();
    if (errorTabs.length === 0) {
      if (
        props.cellType === getSelectedCellType("TASK") ||
        props.cellType === getSelectedCellType("TASKTEMPLATE")
      ) {
        saveTaskProperties(calledFrom);
      } else {
        if (
          checkIfParentSwimlaneCheckedOut(
            localLoadedProcessData,
            props.cellLaneId
          )?.length > 0
        ) {
          // code edited on 27 Dec 2022 for BugId 120991
          let processData = global.structuredClone(openProcessData.loadedData);
          const actId =
            localLoadedActivityPropertyData?.ActivityProperty?.actId;
          // added on 14/10/23 for BugId 138932
          let mileWidth = 0,
            isLaneFound = false,
            laneHeight = 0;

          processData.Lanes?.forEach((lane) => {
            if (lane.LaneId === props.cellLaneId) {
              isLaneFound = true;
            }
            if (!isLaneFound) {
              if ((!caseEnabled && lane.LaneId !== -99) || caseEnabled) {
                laneHeight = laneHeight + +lane.Height;
              }
            }
          });
          // till here BugId 138932

          //to update primaryActivity flag in open process call data
          processData.MileStones = processData?.MileStones.map(
            (milestone, mileIndex) => {
              let activities = milestone.Activities.map((act) => {
                if (
                  act.ActivityId === actId &&
                  localLoadedActivityPropertyData?.ActivityProperty
                    ?.primaryAct === "Y"
                ) {
                  act.PrimaryActivity = "Y";
                } else if (
                  act.ActivityId !== actId &&
                  localLoadedActivityPropertyData?.ActivityProperty
                    ?.primaryAct === "Y"
                ) {
                  act.PrimaryActivity = "N";
                }

                if (act.ActivityId === actId) {
                  act.ImageName =
                    localLoadedActivityPropertyData?.ActivityProperty?.imageName;
                  if (act.Properties) {
                    act.Properties.ActivityProperty =
                      localLoadedActivityPropertyData?.ActivityProperty;
                  } else {
                    // code edited on 15 Feb 2023 for BugId 123799
                    act = {
                      ...act,
                      Properties: {
                        ...localLoadedActivityPropertyData,
                      },
                    };
                  }
                  // added on 14/10/23 for BugId 138932
                  if (act.status !== "I") {
                    act.newXLeft = act.newXLeft
                      ? act.newXLeft
                      : mileIndex === 0
                      ? act.xLeftLoc
                      : +mileWidth + +act.xLeftLoc;
                    act.newYTop = act.newYTop ? act.newYTop : +act.yTopLoc;
                  }
                  // till here BugId 138932
                }
                if (
                  +act.ActivityType === 32 &&
                  +act.ActivitySubType === 1 &&
                  act.ActivityId === actId
                ) {
                  let taskAss = [];
                  Object.values(
                    localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                      ?.objPMWdeskTasks?.taskMap
                  )?.forEach((el) => {
                    taskAss.push(el?.taskTypeInfo?.taskId);
                  });
                  act.AssociatedTasks = [...taskAss];
                }
                if (
                  +act.ActivityType === 18 &&
                  +act.ActivitySubType === 1 &&
                  act.ActivityId === actId
                ) {
                  act.AssociatedProcess = {
                    Associated_ProcessDefId:
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedProcessDefId,
                    Associated_ProjectName: "",
                    Associated_VersionNo:
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedVersion,
                    Associated_ProcessName:
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedProcessName,
                  };
                }
                return act;
              });
              // added on 14/10/23 for BugId 138932
              mileWidth = mileWidth + +milestone.Width;
              // till here BugId 138932
              return { ...milestone, Activities: activities };
            }
          );

          let newConnections = [];
          processData?.Connections?.forEach((conn) => {
            if (!conn.removedByRule && !conn.removedByOptions) {
              newConnections.push(conn);
            }
          });
          processData.Connections = [...newConnections];
          if (
            webserviceVal.connChanged &&
            +webserviceVal.initialConn !==
              +localLoadedActivityPropertyData?.ActivityProperty?.targetId
          ) {
            targetWorkstepApi(processData);
          } else {
            setLocalLoadedProcessData(processData);
            dispatch(setOpenProcess({ loadedData: { ...processData } }));
          }

          setWebserviceFunc(localLoadedActivityPropertyData);
          if (saveCancelStatus.CloseClicked) {
            props.setShowDrawer(false);
            props.selectedCell(
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            );
            props.selectedTask(null, null, null, null);
            // code edited on 15 Nov 2022 for BugId 114460
            dispatch(
              setSave({
                CloseClicked: false,
                SaveClicked: false,
                SaveOnceClicked: false,
              })
            );
            setlocalLoadedActivityPropertyData(null);
            setoriginalProcessData(null);
          } else {
            setoriginalProcessData(localLoadedActivityPropertyData);
            // code edited on 15 Nov 2022 for BugId 114460
            dispatch(setSave({ SaveClicked: false, SaveOnceClicked: false }));
          }
          dispatch(setActivityPropertyToDefault());
          setIsModified(false);
          setsaveCancelDisabled(true);
        } else if (
          localLoadedProcessData.ProcessType !== PROCESSTYPE_LOCAL &&
          props.cellType === getSelectedCellType("ACTIVITY") &&
          props.cellCheckedOut === "Y"
        ) {
          dispatch(
            setCheckoutActEdited({
              isCheckoutActEdited: true,
              checkedActProp: localLoadedActivityPropertyData,
              actCheckedId: props.cellID,
              actCheckedName: props.cellName,
            })
          );
          dispatch(setActivityPropertyToDefault());
          setIsModified(false);
          setsaveCancelDisabled(true);
          setWebserviceFunc(localLoadedActivityPropertyData);
          if (saveCancelStatus.CloseClicked) {
            props.setShowDrawer(false);
            props.selectedCell(
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            );
            props.selectedTask(null, null, null, null);
            dispatch(
              setSave({
                CloseClicked: false,
                SaveClicked: false,
                SaveOnceClicked: false,
              })
            );
            setlocalLoadedActivityPropertyData(null);
            setoriginalProcessData(null);
          } else {
            setoriginalProcessData(localLoadedActivityPropertyData);
            dispatch(setSave({ SaveClicked: false, SaveOnceClicked: false }));
          }
        } else if (
          localLoadedProcessData.ProcessType === PROCESSTYPE_LOCAL ||
          localLoadedProcessData.ProcessType === PROCESSTYPE_LOCAL_CHECKED
        ) {
          postDataForCallActivity();
        }
      }
      dispatch(setWebservice({ webserviceChanged: false }));
    } else {
      let isErrorOnSameScreen = true;
      let defaultTab = null;
      tabsForActivity?.forEach((el, index) => {
        if (index === tabValue && !errorTabs.includes(el.label)) {
          isErrorOnSameScreen = false;
        }
        if (errorTabs[0] === el.label) {
          defaultTab = index;
        }
      });
      // move to first error tab in properties, only when error is not present on the opened tab
      if (!isErrorOnSameScreen) {
        setTabValue(defaultTab);
      }
    }
  };

  const handleCancelChanges = () => {
    setIsModified(false);
    setShowConfirmationAlert(false);
    setTabsWithError([]);
    dispatch(setWebservice({ webserviceChanged: false }));
    dispatch(setWebservice({ connChanged: false }));
    setlocalLoadedActivityPropertyData(null);

    let tempLocal = JSON.parse(JSON.stringify(openProcessData.loadedData));
    // code edited on 22 April 2023 for BugId 127420 - regression>>connection>>connection is getting removed when done changes to actions in Task property
    if (
      props.cellType !== getSelectedCellType("TASK") &&
      props.cellType !== getSelectedCellType("TASKTEMPLATE")
    ) {
      tempLocal?.Connections?.forEach((conn, index) => {
        // remove connections created while adding rule
        // code added on 25 Oct 2022 for BugId 116751
        if (conn.addedByRule || conn.addedByOptions) {
          tempLocal.Connections.splice(index, 1);
        }
        if (conn.removedByRule) {
          delete tempLocal.Connections[index].removedByRule;
        }
        if (conn.removedByOptions) {
          delete tempLocal.Connections[index].removedByOptions;
        }
        // revert the new connection added
        else if (initialTarget === 0) {
          if (conn.SourceId === props.cellID) {
            tempLocal.Connections.splice(index, 1);
          }
        }
        // revert the connection deleted or modified
        else if (conn.SourceId === props.cellID) {
          tempLocal.Connections[index].TargetId = initialTarget;
        }
      });
      if (
        (+props.cellActivityType === 40 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 23 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 24 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 25 && +props.cellActivitySubType === 1) ||
        (+props.cellActivityType === 22 && +props.cellActivitySubType === 1)
      ) {
        tempLocal?.MileStones?.forEach((mile, index) => {
          mile.Activities?.forEach((act, actIdx) => {
            if (+act.ActivityId === +props.cellID) {
              tempLocal.MileStones[index].Activities[actIdx].ActivityType =
                initialWebservice;
            }
          });
        });
      }
    }
    setLocalLoadedProcessData(tempLocal);
    dispatch(setOpenProcess({ loadedData: { ...tempLocal } }));
    dispatch(
      setSave({
        SaveClicked: false,
        CancelClicked: true,
        SaveOnceClicked: false,
      })
    );
    dispatch(setActivityPropertyToDefault());
    setsaveCancelDisabled(true);
    if (saveCancelStatus.CloseClicked) {
      props.setShowDrawer(false);
      props.selectedCell(null, null, null, null, null, null, null, null, null);
      props.selectedTask(null, null, null, null);
      dispatch(setSave({ CloseClicked: false }));
      setlocalLoadedActivityPropertyData(null);
      setoriginalProcessData(null);
    } else {
      setlocalLoadedActivityPropertyData(
        global.structuredClone(originalProcessData)
      );
    }
  };

  const validateQueryFunc = async (ActProp) => {
    let temp = { ...ActProp };

    let isValid;
    const postData = {
      query: temp?.ActivityProperty?.searchInfo?.m_strFilterString,
    };

    await axios
      .post(`${SERVER_URL}${ENDPOINT_VALIDATE_QUERY}`, postData)
      .then((res) => {
        isValid = res?.data?.valid;
      });

    return isValid;
  };
  const handleTabError = async () => {
    let temp = [];
    let tempAllTabStatus = JSON.parse(JSON.stringify(allTabStatus));
    //code changes in case of DMS and OMS activity saving
    const activityType =
      localLoadedActivityPropertyData?.ActivityProperty?.actType;
    const activitySubType =
      localLoadedActivityPropertyData?.ActivityProperty?.actSubType;
    if (activityType && (activityType === 33 || activityType === 10)) {
      //checking if property data contains any authCred/password
      if (activityType === 33 && activitySubType === 1) {
        if (
          !localLoadedActivityPropertyData?.ActivityProperty?.ccmTemplateInfo
            ?.authCred
        ) {
          toastHandler(t("ConnectOMSBeforeChanges"), "error"); //added translations for arabic on 21-09-2023 for bug ID:137515
          tempAllTabStatus.templates.hasError = true;
        }
      } else if (activityType === 10 && activitySubType === 4) {
        if (
          !localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
            ?.authCred
        ) {
          toastHandler(t("ConnectBeforeChanges"), "error");
          tempAllTabStatus.archive.hasError = true;
        }
      }
    } else if (activityType === 11 && activitySubType === 1) {
      //code changes for Bug 134368 - regression>>query workstep>>getting error while clicking on search variable
      const isQueryValid = localLoadedActivityPropertyData?.ActivityProperty
        ?.searchInfo?.m_strFilterString
        ? await validateQueryFunc(localLoadedActivityPropertyData)
        : true;
      if (!isQueryValid) {
        toastHandler(t("EnterValidQueryError"), "error");
        tempAllTabStatus.searchVariables.hasError = true;
      }
    }
    Object.keys(tempAllTabStatus).forEach((tab) => {
      if (tempAllTabStatus[tab].hasError) {
        temp.push(tab);
      }
    });
    setTabsWithError(temp);
    return temp;
  };

  const toolTipLabels = tabsForActivity?.map((item, index) => {
    return (
      <Tooltip title={t(item.toolTip)} placement="left">
        {item.icon ? (
          <img
            src={
              index === tabValue && item.icon_enabled
                ? item.icon_enabled
                : item.icon
            }
            alt={t("stop")}
            id={`pmweb_${ReplaceSpaceToUnderScore(t(item.label))}`}
            style={{
              height: "auto",
              width: "1.75rem",
              backgroundColor: tabsWithError.includes(item.label)
                ? "red"
                : null,
              transform:
                direction === RTL_DIRECTION && item.label != "sap"
                  ? "scaleX(-1)"
                  : null,
            }}
          />
        ) : (
          <StopIcon
            style={{
              color: "#A19882",
              height: "1.8rem",
              width: "1.8rem",
              backgroundColor: tabsWithError.includes(item.label)
                ? "red"
                : null,
            }}
          />
        )}
      </Tooltip>
    );
  });

  useEffect(() => {
    const updateWindowDimensions = () => {
      dispatch(setWindowInnerHeight(window.innerHeight));
    };
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const list = () => (
    <div
      className="list"
      style={{
        /* code edited on 6 July 2023 for issue - save and discard button hide issue in 
        case of tablet(landscape mode)*/
        height: `calc(${windowInnerHeight}px - ${headerHeight} - 9.5rem)`,
      }}
    >
      <Tabs
        direction={direction}
        tabStyling="properties_TabStyling"
        orientation="vertical"
        tabContainer="tabContainer"
        tabType={
          isDrawerExpanded
            ? "mainTab_properties_expandedView"
            : "mainTab_properties"
        }
        tabContentStyle={
          props.isDrawerExpanded &&
          ((+props.cellActivityType === 18 &&
            +props.cellActivitySubType === 1) ||
            props.cellTaskType === TaskType.processTask)
            ? "properties_mainTabContentStyle_Expanded"
            : "properties_mainTabContentStyle"
        }
        tabBarStyle={
          isDrawerExpanded
            ? "properties_mainTabBarStyle_expandedView"
            : "properties_mainTabBarStyle"
        }
        oneTabStyle="properties_mainOneTabStyle"
        TabNames={toolTipLabels}
        TabElement={tabComponents}
        defaultTabValue={tabValue}
        setValue={setTabValue}
        calledFrom="Properties"
      />
    </div>
  );

  const handleSaveAsGlobalTemplate = () => {
    const taskData = { ...localLoadedActivityPropertyData };
    if (
      taskData?.taskGenPropInfo?.bTaskFormView &&
      !taskData?.taskGenPropInfo?.taskFormId
    ) {
      setShowGlobalAlert(true);
    } else {
      setIsSavingAsGlobalTemp(true);
    }
  };

  const handleCloseGlobalTempModal = () => {
    setIsSavingAsGlobalTemp(false);
  };

  const handleCheckInActPropRevert = () => {
    dispatch(
      setCheckoutActEdited({
        isCheckoutActEdited: false,
        checkedActProp: {},
        actCheckedId: null,
        actCheckedName: null,
      })
    );
    getActProperty();
    setShowCheckedInAlert(false);
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      dispatch(setSave({ CloseClicked: true }));
    }
  };

  return (
    <div>
      <Drawer
        tabIndex={0}
        onKeyDown={handleKeyDown}
        classes={{
          paper: classes.paper,
          root: classes.root, // code added on 5 April 2023 for BugId 112610
        }}
        // code added on 5 April 2023 for BugId 112610
        hideBackdrop={true}
        anchor={direction === RTL_DIRECTION ? "left" : "right"}
        // code edited on 31 Oct 2022 for BugId 117792
        open={
          showCheckedInAlert
            ? false
            : (props.cellType === getSelectedCellType("TASK") ||
                props.cellType === getSelectedCellType("TASKTEMPLATE") ||
                props.cellType === getSelectedCellType("ACTIVITY")) &&
              !isEmbeddedSubprocess
            ? props.showDrawer
            : false
        }
      >
        <CommonTabHeader
          activityType={props.cellActivityType}
          activitySubType={props.cellActivitySubType}
          cellName={props.cellName}
          cellType={props.cellType}
          selectedActivityIcon={selectedActivityIcon}
          cellCheckedOut={props.cellCheckedOut}
          cellLaneId={props.cellLaneId}
        />
        <hr style={{ opacity: "0.5", width: "100%" }} />
        {list()}
        <hr style={{ opacity: "0.5", width: "100%" }} />
        <div
          className={
            direction === RTL_DIRECTION
              ? "propertiesFooterButtons_rtl"
              : "propertiesFooterButtons"
          }
          disabled={isReadOnly}
        >
          {/**
           * Bug 124934 - Global Task Template>>not able to delete Global Task Template in collapsed mode
           * Reason-> the delete button was hidden in collapse mode.
           * Resolution-> showing delete button in collapse mode.
           * author=asloob_ali
           */}
          {!isReadOnly &&
          props.cellType === getSelectedCellType("TASKTEMPLATE") &&
          props.cellTaskType === TaskType.globalTask &&
          localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
            ?.m_bGlobalTemplate ? (
            <button
              id="pmweb_propertiesGlobalTempDeleteButton"
              className={"propertiesGlobalTempDeleteButton"}
              onClick={handleDeleteGlobalTemplate}
              style={{
                marginLeft: direction === RTL_DIRECTION ? "" : "auto",
                marginRight: direction === RTL_DIRECTION ? "auto" : "",
              }}
            >
              {t("delete")}
            </button>
          ) : null}
          {!isReadOnly && (
            <button
              id="pmweb_propertiesDiscardButton"
              disabled={saveCancelDisabled}
              onClick={handleCancelChanges}
              className={
                saveCancelDisabled
                  ? "properties_disabledButton"
                  : "properties_cancelButton"
              }
            >
              {t("discard")}
            </button>
          )}
          {!isReadOnly &&
          props.cellType === getSelectedCellType("TASK") &&
          props.cellTaskType === TaskType.globalTask &&
          localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
            ?.m_bGlobalTemplate === false ? (
            <button
              id="pmweb_propertiesGlobalTempButton"
              className={"propertiesGlobalTempButton"}
              onClick={handleSaveAsGlobalTemplate}
            >
              {t("SaveAsGlobalTemplate")}
            </button>
          ) : null}
          {!isReadOnly && (
            <button
              id="pmweb_propertiesSaveButton"
              disabled={saveCancelDisabled}
              onClick={handleSaveChanges}
              className={
                saveCancelDisabled
                  ? "properties_disabledButton"
                  : "properties_saveButton"
              }
            >
              {t("saveChanges")}
            </button>
          )}
        </div>
        {showConfirmationAlert ? (
          <Modal
            show={showConfirmationAlert}
            backDropStyle={{ backgroundColor: "transparent" }}
            style={{
              top: "40%",
              left: "40%",
              width: "327px",
              padding: "0",
              zIndex: "1500",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
            }}
            modalClosed={() => setShowConfirmationAlert(false)}
            children={
              <PropertiesSaveAlert
                setShowConfirmationAlert={setShowConfirmationAlert}
                saveChangesFunc={handleSaveChanges}
                discardChangesFunc={handleCancelChanges}
              />
            }
          />
        ) : null}
        {isSavingAsGlobalTemp && (
          <SaveAsGlobalTaskTemplateModal
            isOpen={isSavingAsGlobalTemp}
            handleClose={handleCloseGlobalTempModal}
          />
        )}
      </Drawer>
      {showCheckedInAlert ? (
        <Modal
          show={showCheckedInAlert}
          style={{
            top: "40%",
            left: "35%",
            width: "30%",
            padding: "0",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          children={
            <CheckInActivityValidation
              discardChangesFunc={() => {
                setShowCheckedInAlert(false);
                props.setShowDrawer(false);
              }}
              saveChangesFunc={handleCheckInActPropRevert}
              actName={CheckedAct.actCheckedName}
            />
          }
        />
      ) : null}
      {showFormEnableAlert ? (
        <Modal
          show={showFormEnableAlert}
          backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            top: "40%",
            left: "40%",
            width: "327px",
            padding: "0",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          modalClosed={() => setShowFormEnableAlert(false)}
          children={
            <SaveFormModal
              setShowFormEnableAlert={setShowFormEnableAlert}
              saveChangesFunc={handleSaveChanges}
              discardChangesFunc={handleCancelChanges}
            />
          }
        />
      ) : null}

      {showGlobalAlert ? (
        <Modal
          show={showGlobalAlert}
          backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            top: "40%",
            left: "40%",
            width: "327px",
            padding: "0",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          modalClosed={() => setShowGlobalAlert(false)}
          children={
            <GlobalTaskAlert
              setShowGlobalAlert={setShowGlobalAlert}
              setIsSavingAsGlobalTemp={setIsSavingAsGlobalTemp}
            />
          }
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellTaskType: state.selectedCellReducer.selectedTaskType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setShowDrawer: (flag) => dispatch(actionCreators.showDrawer(flag)),
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
        actionCreators_selection.selectedCell(
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
    selectedTask: (id, name, taskType, type) =>
      dispatch(actionCreators_selection.selectedTask(id, name, taskType, type)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesTab);
