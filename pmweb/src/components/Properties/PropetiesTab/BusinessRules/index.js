// #BugID - 112016(Save changes button is not working)
//Date:7th July 2022
// #BugDescription - Handled the checks for submitting the save changes button.

import React, { useState, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  Button,
  Box,
  makeStyles,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import Tab from "@material-ui/core/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import { useTranslation } from "react-i18next";
import {
  ENDPOINT_GET_RULE_MEMBER_LIST,
  ENDPOINT_REST_PACKAGE,
  RTL_DIRECTION,
  ENDPOINT_RULE_FLOW_VERSION,
  ENDPOINT_RULE_PACKAGE_VERSION,
  SERVER_URL,
  propertiesLabel,
  COMPLEX_VARTYPE,
  DATE_VARIABLE_TYPE,
  SHORT_DATE_VARIABLE_TYPE,
  headerHeight,
} from "../../../../Constants/appConstants";
import "./index.css";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import DeleteIcon from "@material-ui/icons/Delete";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import Toast from "../../../../UI/ErrorToast";
import {
  getVarTypeAndIsArray,
  isReadOnlyFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import TabsHeading from "../../../../UI/TabsHeading";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import clsx from "clsx";
import styles from "./index.module.css";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { useRef } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#f6f5f5",
  },
  tab: {
    marginRight: "45px",
    padding: "0px",
    fontSize: "20px",
    color: "black",
    minWidth: "0px",
    minHeight: "2.5rem",
    height: "19px",
  },
  tabs: {
    minHeight: "0",
  },
  selectedTab: {
    color: "var(--selected_tab_color)",
    fontWeight: "600 !important",
  },
  tabPanelRoot: {
    padding: "1rem 0.5vw",
  },
}));

function BusinessRules(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let dispatch = useDispatch();
  const classes = useStyles();
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [ruleFlow, setRuleFlow] = useState({ id: "", name: "" });
  const [ruleVersion, setRuleVersion] = useState("");
  const [rulePackage, setRulePackage] = useState({ id: "", name: "" });
  const [packageVersion, setPackageVersion] = useState("");
  const [mapping, setMapping] = useState(false);
  const [ruleFlowItems, setRuleFlowItems] = useState([]);
  const [rulePackageItems, setrulePackageItems] = useState([]);
  const [flowVersionItems, setRuleVersionItem] = useState([]);
  const [packageVersionItems, setPackageVersionItem] = useState([]);
  const [associateList, setAssociateList] = useState([]);
  const [mappedSelectedRule, setMappedSelectedRule] = useState("");
  const [mappedSelectedRuleVersion, setMappedSelectedRuleVersion] =
    useState("");
  const [serviceType, setServiceType] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.m_objBusinessRule?.m_bIsRestService.toString()
  );
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState({ severity: "", msg: "" });
  const timeslot = [];
  const [defaultTime, setDefaultTime] = useState("10");
  const [brtProcess, setBrtProcess] = useState([]);
  const [brtFwdInputs, setFwdBrtInputs] = useState([]);
  const [revInputs, setRevInputs] = useState([]);
  const [brtRevInputs, setBrtRevInputs] = useState([]);
  const [value, setValue] = React.useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [mappingLoader, setMappingLoader] = useState(true);
  const soapRef = useRef();
  const restRef = useRef();
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
    // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  for (let i = 0; i < 100; i++) {
    timeslot.push(i);
  }

  // code added on 15 Nov 2022 for BugId 114460
  useEffect(() => {
    if (saveCancelStatus.SaveOnceClicked) {
      let isValidObj = validateFunc();
      if (!isValidObj.isValid && isValidObj.type === "FW") {
        dispatch(
          setToastDataFunc({
            message:
              `${t("PleaseDefineAtleastOneForwardMapping")}` +
              " " +
              `${t("for")}` +
              " " +
              `${isValidObj.ruleName}`,
            severity: "error",
            open: true,
          })
        );
        dispatch(setSave({ SaveClicked: false }));
      } else if (!isValidObj.isValid && isValidObj.type === "RW") {
        dispatch(
          setToastDataFunc({
            message:
              `${t("PleaseDefineAtleastOneReverseMapping")}` +
              " " +
              `${t("for")}` +
              " " +
              `${isValidObj.ruleName}`,
            severity: "error",
            open: true,
          })
        );
        dispatch(setSave({ SaveClicked: false }));
      }
    }
  }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    const mappedData =
      localLoadedActivityPropertyData?.ActivityProperty?.m_objBusinessRule
        ?.m_arrAssocBRMSRuleSetList;
    axios
      .get(
        SERVER_URL +
          ENDPOINT_REST_PACKAGE +
          `?restService=${serviceType == "true"}`
      )
      .then((response) => {
        setRuleFlowItems(
          response.data?.m_arrBRMSRuleFlowList?.map((item) => ({
            id: item.m_strRSetId,
            value: item.m_strRSetName,
          }))
        );
        setrulePackageItems(
          response?.data.m_arrBRMSRuleSetList?.map((item) => ({
            id: item.m_strRSetId,
            value: item.m_strRSetName,
          }))
        );
        setAssociateList(
          mappedData.map((item, i) => ({
            id: getId(
              item.m_strRSetName,
              item.m_strRuleType == "F"
                ? response.data.m_arrBRMSRuleFlowList
                : response.data.m_arrBRMSRuleSetList
            ),
            name: item.m_strRSetName,
            version: item.m_strRSetVersion,
            type: item.m_strRuleType,
            time: item.m_strTimeOutInterval,
            mapInfo: item.m_arrMappingInfo,
          }))
        );
        setRuleFlow({ id: "", name: "" });
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });

    let tempVarList = [];
    localLoadedProcessData?.Variable?.forEach((_var) => {
      if (_var.VariableType === COMPLEX_VARTYPE) {
        let tempList = getComplex(_var);
        tempList?.forEach((el) => {
          tempVarList.push(el);
        });
      } else {
        tempVarList.push(_var);
      }
    });
    setBrtProcess(tempVarList);
  }, []);

  // code added on 15 Nov 2022 for BugId 114460
  useEffect(() => {
    let isValidObj = {};
    isValidObj = validateFunc();
    if (isValidObj && !isValidObj.isValid) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.businessRule]: { isModified: true, hasError: true },
        })
      );
    }
  }, [localLoadedActivityPropertyData]);

  //function for data association
  function associateData(type) {
    /*code updated on 21 September 2022 for BugId 113883*/
    let data;
    if (type == "ruleflow") {
      if (ruleFlow.id == "" && ruleFlow.name == "") {
        setIsError(true);
        setErrorMsg({
          msg: t("toolbox.businessRules.errormsg1"),
          severity: "error",
        });
        return false;
      }

      if (!ruleVersion || ruleVersion == "") {
        setIsError(true);
        setErrorMsg({
          msg: t("toolbox.businessRules.selectVerRF"),
          severity: "error",
        });
        return false;
      }

      data = {
        id: ruleFlow.id,
        name: ruleFlow.name,
        version: ruleVersion === "Version Free" ? "0.0" : ruleVersion, // code edited on 15 Nov 2022 for BugId 114460
        type: t("toolbox.businessRules.ruleflow"),
        time: "10",
        mapInfo: null,
      };
    } else {
      if (rulePackage.id == "" && rulePackage.name == "") {
        setIsError(true);
        setErrorMsg({
          msg: t("toolbox.businessRules.errormsg2"),
          severity: "error",
        });
        return false;
      }

      if (!packageVersion || packageVersion == "") {
        setIsError(true);
        setErrorMsg({
          msg: t("toolbox.businessRules.selectVerRP"),
          severity: "error",
        });
        return false;
      }

      data = {
        id: rulePackage.id,
        name: rulePackage.name,
        version: packageVersion === "Version Free" ? "0.0" : packageVersion, // code edited on 15 Nov 2022 for BugId 114460
        type: t("toolbox.businessRules.rulepackage"),
        time: "10",
        mapInfo: null,
      };
    }
    var isStack = false;
    associateList?.forEach((item) => {
      if (item.name == data.name && item.version == data.version) {
        isStack = true;
      }
    });
    if (isStack == true) {
      setIsError(true);
      // Changes on 25-09-2023 to resolve the bug Id 137576
      setErrorMsg({
        msg: `${t("this")} ${data.name} ${t("andversion")} ${data.version} ${t(
          "arealreadymapped"
        )}`,
        severity: "error",
      });
      return false;
    } else {
      setAssociateList([...associateList, data]);
      let tempLocalState = JSON.parse(
        JSON.stringify(localLoadedActivityPropertyData)
      );
      let lastIndex =
        localLoadedActivityPropertyData?.ActivityProperty?.m_objBusinessRule
          ?.m_arrAssocBRMSRuleSetList.length;
      const nameVersion = data.name + "(" + data.version + ")";
      const activityData = {
        m_arrMappingInfo: [],
        m_bSelectRow: false,
        m_iRSetOrder: lastIndex + 1,
        m_strRSetId: data.id,
        m_strRSetName: data.name,
        m_strRSetNameWithVersion: nameVersion,
        m_strRSetVersion: data.version,
        m_strRuleType: data.type,
        m_strTimeOutInterval: "0",
        m_strVersionTitle: nameVersion,
      };
      tempLocalState?.ActivityProperty?.m_objBusinessRule?.m_arrAssocBRMSRuleSetList.push(
        activityData
      );
      setlocalLoadedActivityPropertyData(tempLocalState);
      // code edited on 15 Nov 2022 for BugId 114460
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.businessRule]: { isModified: true, hasError: true },
        })
      );
    }
  }

  const getComplex = (variable) => {
    let varList = [];
    let varRelationMapArr = variable?.RelationAndMapping
      ? variable.RelationAndMapping
      : variable["Relation&Mapping"];
    varRelationMapArr?.Mappings?.Mapping?.forEach((el) => {
      if (el.VariableType === "11") {
        let tempList = getComplex(el);
        tempList.forEach((ell) => {
          varList.push({
            ...ell,
            SystemDefinedName: `${variable.VariableName}.${ell.VariableName}`,
            VariableName: `${variable.VariableName}.${ell.VariableName}`,
          });
        });
      } else {
        varList.push({
          DefaultValue: "",
          ExtObjectId: el.ExtObjectId ? el.ExtObjectId : variable.ExtObjectId,
          SystemDefinedName: `${variable.VariableName}.${el.VariableName}`,
          Unbounded: el.Unbounded,
          VarFieldId: el.VarFieldId,
          VarPrecision: el.VarPrecision,
          VariableId: el.VariableId,
          VariableLength: el.VariableLength,
          VariableName: `${variable.VariableName}.${el.VariableName}`,
          VariableScope: el.VariableScope
            ? el.VariableScope
            : variable.VariableScope,
          VariableType: el.VariableType,
        });
      }
    });

    return varList;
  };

  function mapData(id, version, type, mapInfo, time, name) {
    setMappedSelectedRule(name);
    // code added on 15 Nov 2022 for BugId 114460
    setMappedSelectedRuleVersion(version === "Version Free" ? "0.0" : version);
    setMapping(true);
    setDefaultTime(time);
    let fwdInfo, revInfo;
    if (mapInfo == null) {
      fwdInfo = null;
      revInfo = null;
    } else {
      fwdInfo = mapInfo?.filter((data) => data.m_strMappingType == "F");
      revInfo = mapInfo?.filter((data) => data.m_strMappingType == "R");
    }

    // code edited on 22 August 2022 for BugId 114460
    const postData = {
      ruleSetNo: id,
      ruleSetVersionId: version === "Version Free" ? "0.0" : version,
      ruleType: type,
    };

    axios
      .post(SERVER_URL + ENDPOINT_GET_RULE_MEMBER_LIST, postData)
      .then((res) => {
        //code edited on 19 Aug 2022 for BugId 114416
        const fwdList = res?.data?.m_arrFwdMappingList;
        setFwdBrtInputs(
          fwdList?.map((item, i) => ({
            input: item.m_strParameterName,
            fullName: item.m_strParemterFullName,
            process: "",
            type: item.m_strParameterDataType,
            varType: getVarTypeAndIsArray(item.m_strVarDataType).variableType,
            varFieldId: item.m_strVarFieldId,
            varId: item.m_strVariableId,
            name: item.m_strVarName,
            parentIsArray: item.m_strParentIsArray,
            unbounded: getVarTypeAndIsArray(item.m_strVarDataType).isArray,
            info:
              fwdInfo != null
                ? fwdInfo?.some(
                    (data) =>
                      data.m_strParameterDataType ==
                        item.m_strParameterDataType &&
                      data.m_strParameterName == item.m_strParameterName
                  )
                : null,
          }))
        );

        //code edited on 19 Aug 2022 for BugId 114416
        const revList = res?.data?.m_arrRvrMappingList;
        setRevInputs(
          revList?.map((item, i) => ({
            input: item.m_strParameterName,
            fullName: item.m_strParemterFullName,
            process: "",
            type: item.m_strParameterDataType,
            varType: getVarTypeAndIsArray(item.m_strVarDataType).variableType,
            varFieldId: item.m_strVarFieldId,
            varId: item.m_strVariableId,
            name: item.m_strVarName,
            parentIsArray: item.m_strParentIsArray,
            unbounded: getVarTypeAndIsArray(item.m_strVarDataType).isArray,
            info:
              fwdInfo != null
                ? fwdInfo?.some(
                    (data) =>
                      data.m_strParameterDataType ==
                        item.m_strParameterDataType &&
                      data.m_strParameterName == item.m_strParameterName
                  )
                : null,
          }))
        );

        //code updated on 6 July 2022 for BugId 111907
        let tempRevVarLIst = [];
        localLoadedProcessData?.Variable?.forEach((item, i) => {
          if (
            (item.VariableScope === "U" && checkForModifyRights(item)) ||
            (item.VariableScope === "I" && checkForModifyRights(item))
          ) {
            if (item.VariableType === "11") {
              let tempList = getComplex(item);
              tempList?.forEach((el) => {
                tempRevVarLIst.push(el);
              });
            } else {
              tempRevVarLIst.push(item);
            }
          }
        });
        setBrtRevInputs(tempRevVarLIst);
        setMappingLoader(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const checkForModifyRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item, i) => {
        if (+item?.processVarInfo?.variableId === +data.VariableId) {
          if (
            item?.m_strFetchedRights === "O" ||
            item?.m_strFetchedRights === "A"
          ) {
            temp = true;
          }
        }
      }
    );
    return temp;
  };

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };

  function changeRuleFlow(e) {
    var item = ruleFlowItems?.find((item) => item.id === e.target.value);
    setRuleFlow({ id: e.target.value, name: item.value });
    /*code edited on 21 July 2023 for BugId 132885 - Version list is not getting populated when 
    rule flow and rule package is deployed as rest service. */
    axios
      .get(
        SERVER_URL +
          ENDPOINT_RULE_FLOW_VERSION +
          `?m_strSelectedRuleSetId=${e.target.value}&m_bIsRestService=${
            serviceType === "true"
          }`
      )
      .then(function (response) {
        setRuleVersion(response?.data?.versions[0]);
        setRuleVersionItem(
          response?.data?.versions?.map((data) => ({
            label: data,
            value: data,
          }))
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function changeRulePackage(e) {
    var item = rulePackageItems?.find((item) => item.id === e.target.value);
    setRulePackage({ id: e.target.value, name: item.value });
    /*code edited on 21 July 2023 for BugId 132885 - Version list is not getting populated when 
    rule flow and rule package is deployed as rest service. */
    axios
      .get(
        SERVER_URL +
          ENDPOINT_RULE_PACKAGE_VERSION +
          `?m_strSelectedRuleSetId=${e.target.value}&m_bIsRestService=${
            serviceType === "true"
          }`
      )
      .then(function (response) {
        setPackageVersion(response.data.versions[0]);
        setPackageVersionItem(
          response?.data?.versions?.map((data) => ({
            label: data,
            value: data,
          }))
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const getId = (name, arr) => {
    const ruleList = [...arr];
    const rule = ruleList?.find((data) => data.m_strRSetName == name);
    if (rule) {
      return rule.m_strRSetId;
    } else {
      return null;
    }
  };

  function deleteData(id, version, i) {
    setMapping(false);
    // code edited on 15 Nov 2022 for BugId 114460
    let temp = [...associateList];
    temp = temp?.filter((item) => item.id !== id || item.version !== version);
    setAssociateList(temp);
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempLocalState?.ActivityProperty?.m_objBusinessRule?.m_arrAssocBRMSRuleSetList?.splice(
      i,
      1
    );
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.businessRule]: { isModified: true, hasError: false },
      })
    );
  }

  /*code updated on 6 July 2022 for BugId 111907*/
  const getFilteredVarList = (item) => {
    let temp = [];

    brtProcess.forEach((_var) => {
      if (
        _var.VariableScope === "M" ||
        _var.VariableScope === "S" ||
        (_var.VariableScope === "U" && checkForVarRights(_var)) ||
        (_var.VariableScope === "I" && checkForVarRights(_var))
      ) {
        // code added on 2 Jan 2023 for BugId 121349
        if (+item.varType === 30) {
          if (
            (+_var.VariableType === 4 || +_var.VariableType === 6) &&
            _var.Unbounded == item.unbounded
          ) {
            temp.push(_var);
          }
        } else if (+item.varType === DATE_VARIABLE_TYPE) {
          if (
            (+_var.VariableType === DATE_VARIABLE_TYPE ||
              +_var.VariableType === SHORT_DATE_VARIABLE_TYPE) &&
            _var.Unbounded == item.unbounded
          ) {
            temp.push(_var);
          }
        } else if (
          _var.VariableType == item.varType &&
          _var.Unbounded == item.unbounded
        ) {
          temp.push(_var);
        }
      }
    });
    return temp;
  };

  /*code added on 6 July 2022 for BugId 111907*/
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

  const getSelectedMappingData = (item) => {
    let temp = "0";
    localLoadedActivityPropertyData?.ActivityProperty?.m_objBusinessRule?.m_arrAssocBRMSRuleSetList?.forEach(
      (ruleName) => {
        // code edited on 15 Nov 2022 for BugId 114460
        if (
          ruleName.m_strRSetName === mappedSelectedRule &&
          ruleName.m_strRSetVersion === mappedSelectedRuleVersion
        ) {
          ruleName?.m_arrMappingInfo
            ?.filter((d) => d.m_strMappingType === "F")
            .forEach((rule) => {
              if (item.input == rule.m_strParameterName) {
                temp = rule.m_strVarName;
              }
            });
        }
      }
    );

    return temp;
  };

  const getRevMapId = (id) => {
    let temp = {};
    brtProcess?.forEach((item) => {
      if (item.VariableName == id) {
        temp = item;
      }
    });

    return temp;
  };

  const getFilteredInputList = (id, fieldId) => {
    let allInput = "";
    let type = "";
    let unbounded = "";
    brtProcess?.forEach((item) => {
      if (item.VariableId == id && item.VarFieldId == fieldId) {
        type = item.VariableType;
        unbounded = item.Unbounded;
      }
    });
    allInput = revInputs?.filter((data) => {
      // code added on 4 Jan 2023 for BugId 121349
      if (+type === 4 || +type === 6) {
        if (
          (data.type == type || +data.type === 30) &&
          data.unbounded == unbounded
        ) {
          return data;
        }
      } else if (+type === DATE_VARIABLE_TYPE) {
        if (
          (+data.type === DATE_VARIABLE_TYPE ||
            +data.type === SHORT_DATE_VARIABLE_TYPE) &&
          data.unbounded == unbounded
        ) {
          return data;
        }
      } else if (data.type == type && data.unbounded == unbounded) {
        return data;
      }
    });
    return allInput;
  };

  const getSelectedOutputData = (varName) => {
    let temp = "0";
    localLoadedActivityPropertyData?.ActivityProperty?.m_objBusinessRule?.m_arrAssocBRMSRuleSetList?.forEach(
      (ruleName) => {
        // code edited on 15 Nov 2022 for BugId 114460
        if (
          ruleName.m_strRSetName === mappedSelectedRule &&
          ruleName.m_strRSetVersion === mappedSelectedRuleVersion
        ) {
          ruleName?.m_arrMappingInfo
            ?.filter((d) => d.m_strMappingType === "R")
            .forEach((rule) => {
              if (rule.m_strVarName === varName) {
                temp = rule.m_strParameterName;
              }
            });
        }
      }
    );
    return temp;
  };

  /*code updated on 7th July 2022 for BugId 112016*/
  const selectedOutputVal = (value, item, mapType) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp?.ActivityProperty?.m_objBusinessRule?.m_arrAssocBRMSRuleSetList?.map(
      (ruleName) => {
        // code edited on 15 Nov 2022 for BugId 114460
        if (
          ruleName.m_strRSetName === mappedSelectedRule &&
          ruleName.m_strRSetVersion === mappedSelectedRuleVersion
        ) {
          if (
            Array.isArray(ruleName.m_arrMappingInfo) &&
            ruleName.m_arrMappingInfo.length > 0
          ) {
            let isFExist = false,
              fIndex = null;
            let isRExist = false,
              rIndex = null;
            ruleName?.m_arrMappingInfo?.map((rule, index) => {
              if (mapType === "F") {
                if (
                  rule.m_strParameterName === item.input &&
                  rule.m_strMappingType === mapType
                ) {
                  fIndex = index;
                  isFExist = true;
                }
              } else if (mapType === "R") {
                if (
                  rule.m_strVarName === item.VariableName &&
                  rule.m_strMappingType === mapType
                ) {
                  rIndex = index;
                  isRExist = true;
                }
              }
            });
            if (mapType === "F") {
              if (isFExist) {
                if (value === "0") {
                  ruleName.m_arrMappingInfo.splice(fIndex, 1);
                } else {
                  ruleName.m_arrMappingInfo[fIndex].m_strVariableId =
                    getRevMapId(value).VariableId;
                  ruleName.m_arrMappingInfo[fIndex].m_strVarName = value;
                  ruleName.m_arrMappingInfo[fIndex].m_strVarScope =
                    getRevMapId(value).VariableScope;
                  ruleName.m_arrMappingInfo[fIndex].m_strVarFieldId =
                    getRevMapId(value).VarFieldId;
                }
              } else {
                if (value !== "0") {
                  ruleName.m_arrMappingInfo.push({
                    m_arrMappingList: [],
                    m_bChk: true,
                    m_bConstantFlag: false,
                    m_bDisableFlag: true,
                    m_strConstValue: "",
                    m_strEntityArgType: "",
                    m_strMappingType: "F",
                    m_strParameterDataType: item.varType,
                    m_strParameterName: item.input,
                    m_strParemterFullName: item.fullName,
                    m_strParentIsArray: item.parentIsArray,
                    m_strUnbounded: item.unbounded,
                    m_strVarDataType: getRevMapId(value).VariableType,
                    m_strVarFieldId: getRevMapId(value).VarFieldId,
                    m_strVarName: value,
                    m_strVarScope: getRevMapId(value).VariableScope,
                    m_strVariableId: getRevMapId(value).VariableId,
                  });
                }
              }
            } else if (mapType === "R") {
              if (isRExist) {
                if (value === "0") {
                  ruleName.m_arrMappingInfo.splice(rIndex, 1);
                } else {
                  ruleName.m_arrMappingInfo[rIndex].m_strParameterName = value;
                }
              } else {
                if (value !== "0") {
                  let fullName = "";
                  /*code edited on 21 July 2023 for BugId 132885 - Version list is not getting populated when 
                  rule flow and rule package is deployed as rest service. */
                  revInputs?.forEach((el) => {
                    if (el.input === value) {
                      fullName = el.fullName;
                    }
                  });
                  ruleName.m_arrMappingInfo.push({
                    m_arrMappingList: [],
                    m_bChk: true,
                    m_bConstantFlag: false,
                    m_bDisableFlag: true,
                    m_strConstValue: "",
                    m_strEntityArgType: "",
                    m_strMappingType: "R",
                    m_strParameterDataType: getRevMapId(item.VariableName)
                      .VariableType,
                    m_strParameterName: value,
                    m_strParemterFullName: fullName,
                    m_strParentIsArray: "R",
                    m_strUnbounded: getRevMapId(item.VariableName).Unbounded,
                    m_strVarDataType: getRevMapId(item.VariableName).VariableType,
                    m_strVarFieldId: getRevMapId(item.VariableName).VarFieldId,
                    m_strVarName: item.VariableName,
                    m_strVarScope: getRevMapId(item.VariableName).VariableScope,
                    m_strVariableId: getRevMapId(item.VariableName).VariableId,
                  });
                }
              }
            }
          } else {
            if (value !== "0") {
              if (mapType === "F") {
                ruleName.m_arrMappingInfo.push({
                  m_arrMappingList: [],
                  m_bChk: true,
                  m_bConstantFlag: false,
                  m_bDisableFlag: true,
                  m_strConstValue: "",
                  m_strEntityArgType: "",
                  m_strMappingType: "F",
                  m_strParameterDataType: item.varType,
                  m_strParameterName: item.input,
                  m_strParemterFullName: item.fullName,
                  m_strParentIsArray: item.parentIsArray,
                  m_strUnbounded: item.unbounded,
                  m_strVarDataType: getRevMapId(value).VariableType,
                  m_strVarFieldId: getRevMapId(value).VarFieldId,
                  m_strVarName: value,
                  m_strVarScope: getRevMapId(value).VariableScope,
                  m_strVariableId: getRevMapId(value).VariableId,
                });
              } else {
                let fullName = "";
                /*code edited on 21 July 2023 for BugId 132885 - Version list is not getting populated when 
                  rule flow and rule package is deployed as rest service. */
                revInputs?.forEach((el) => {
                  if (el.input === value) {
                    fullName = el.fullName;
                  }
                });
                ruleName.m_arrMappingInfo.push({
                  m_arrMappingList: [],
                  m_bChk: true,
                  m_bConstantFlag: false,
                  m_bDisableFlag: true,
                  m_strConstValue: "",
                  m_strEntityArgType: "",
                  m_strMappingType: "R",
                  m_strParameterDataType: getRevMapId(item.VariableName)
                    .VariableType,
                  m_strParameterName: value,
                  m_strParemterFullName: fullName,
                  m_strParentIsArray: "R",
                  m_strUnbounded: getRevMapId(item.VariableName).Unbounded,
                  m_strVarDataType: getRevMapId(item.VariableName).VariableType,
                  m_strVarFieldId: getRevMapId(item.VariableName).VarFieldId,
                  m_strVarName: item.VariableName,
                  m_strVarScope: getRevMapId(item.VariableName).VariableScope,
                  m_strVariableId: getRevMapId(item.VariableName).VariableId,
                });
              }
            }
          }
        }
      }
    );
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.businessRule]: { isModified: true, hasError: false },
      })
    );
  };

  const changeService = (e) => {
    setServiceType(e.target.value);
    /*code edited on 21 July 2023 for BugId 132885 - Version list is not getting populated when 
    rule flow and rule package is deployed as rest service. */
    let url =
      SERVER_URL + ENDPOINT_REST_PACKAGE + `?restService=${e.target.value}`;
    axios
      .get(url)
      .then(function (response) {
        setRuleFlowItems(
          response?.data?.m_arrBRMSRuleFlowList?.map((item) => ({
            id: item.m_strRSetId,
            value: item.m_strRSetName,
          }))
        );
        setrulePackageItems(
          response?.data?.m_arrBRMSRuleSetList?.map((item) => ({
            id: item.m_strRSetId,
            value: item.m_strRSetName,
          }))
        );
      })
      .catch(function (error) {
        console.log(error);
      });

    setAssociateList([]);
    setMapping(false);
    setRuleFlow({ id: "", name: "" });
    setRuleVersion("");
    setRulePackage({ id: "", name: "" });
    setPackageVersion("");
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempLocalState.ActivityProperty.m_objBusinessRule.m_bIsRestService =
      e.target.value;
    tempLocalState.ActivityProperty.m_objBusinessRule.m_arrAssocBRMSRuleSetList =
      [];
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.businessRule]: { isModified: true, hasError: false },
      })
    );
  };

  const setTime = (val, name, version) => {
    setDefaultTime(val);

    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempLocalState?.ActivityProperty?.m_objBusinessRule?.m_arrAssocBRMSRuleSetList?.forEach(
      (data, i) => {
        // code edited on 15 Nov 2022 for BugId 114460
        if (data.m_strRSetName === name && data.m_strRSetVersion === version) {
          tempLocalState.ActivityProperty.m_objBusinessRule.m_arrAssocBRMSRuleSetList[
            i
          ].m_strTimeOutInterval = val;
        }
      }
    );
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.businessRule]: { isModified: true, hasError: false },
      })
    );
  };

  // code edited on 15 Nov 2022 for BugId 114460
  const validateFunc = () => {
    let isValid = true;
    let type = null;
    let ruleName = null;
    let newAssociateList = localLoadedActivityPropertyData?.ActivityProperty
      ?.m_objBusinessRule?.m_arrAssocBRMSRuleSetList
      ? [
          ...localLoadedActivityPropertyData.ActivityProperty.m_objBusinessRule
            .m_arrAssocBRMSRuleSetList,
        ]
      : [];
    newAssociateList?.forEach((el) => {
      if (isValid) {
        if (el.m_arrMappingInfo && el.m_arrMappingInfo.length > 0) {
          let minFwdMapping = false,
            minRevMapping = false;
          el.m_arrMappingInfo?.forEach((ele) => {
            if (ele.m_strMappingType === "F") {
              minFwdMapping = true;
            }
            if (ele.m_strMappingType === "R") {
              minRevMapping = true;
            }
          });
          if (!minFwdMapping) {
            isValid = false;
            type = "FW";
            ruleName = el.m_strRSetName;
          } else if (!minRevMapping) {
            isValid = false;
            type = "RW";
            ruleName = el.m_strRSetName;
          }
        } else {
          isValid = false;
          type = "FW";
          ruleName = el.m_strRSetName;
        }
      }
    });
    if (isValid) {
      return {
        isValid: true,
      };
    } else {
      return {
        isValid: false,
        type: type,
        ruleName: ruleName,
      };
    }
  };

  return (
    <>
      {isLoading ? (
        <div>
          <CircularProgress className="circular-progress" />
        </div>
      ) : (
        <div>
          {isError ? (
            <Toast
              open={isError != false}
              closeToast={() => setIsError(false)}
              message={errorMsg.msg}
              severity={errorMsg.severity}
            />
          ) : null}
          <div
            className="brtContainer"
            style={{
              height: `calc((${windowInnerHeight}px - ${headerHeight}) - 8.75rem)`,
              overflow: "hidden",
            }}
          >
            <TabsHeading heading={props?.heading} />
            <div
              style={
                mapping ? { display: "flex", width: "100%" } : { width: "100%" }
              }
            >
              <div
                className={
                  mapping
                    ? props.isDrawerExpanded
                      ? "brtLeftDivExp"
                      : "brtLeftDiv"
                    : ""
                }
              >
                <div className="radio-group">
                  <RadioGroup
                    row
                    aria-label="demo-radio-buttons-group-label"
                    value={serviceType}
                    name="row-radio-buttons-group"
                    onChange={changeService}
                    id="pmweb_BusinessRules_servicetype_radiogroup"
                  >
                    <FormControlLabel
                      value="false"
                      disabled={isReadOnly}
                      classes={{
                        label: styles.radioButton,
                        root: styles.radioBtnRoot,
                      }}
                      control={<Radio size="small" tabIndex={-1} />}
                      label={t("toolbox.businessRules.soapServiceLabel")}
                      id="pmweb_BusinessRules_servicetype_soapservicelabel"
                      tabIndex={0}
                      ref={soapRef}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          soapRef.current.click();
                          e.stopPropagation();
                        }
                      }}
                    />
                    <FormControlLabel
                      value="true"
                      disabled={isReadOnly}
                      classes={{
                        label: styles.radioButton,
                        root: styles.radioBtnRoot,
                      }}
                      control={<Radio size="small" tabIndex={-1} />}
                      label={t("toolbox.businessRules.restServiceLabel")}
                      id="pmweb_BusinessRules_servicetype_restservicelabel"
                      tabIndex={0}
                      ref={restRef}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          restRef.current.click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </RadioGroup>
                </div>
                {ruleFlowItems.length === 0 || rulePackageItems.length === 0 ? (
                  <Box
                    className="flex-container"
                    style={{ padding: "0.5rem 0.5vw" }}
                  >
                    <div>
                      <InfoOutlinedIcon
                        style={{ width: "1.25rem", height: "1.5rem" }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "var(--base_text_font_size)",
                      }}
                    >
                      {ruleFlowItems.length === 0 &&
                      rulePackageItems.length === 0 ? (
                        <>{t("ruleFlowAndPackageNoRights")}</>
                      ) : ruleFlowItems.length === 0 ? (
                        <>{t("ruleFlowNoRights")}</>
                      ) : (
                        <>{t("rulePackageNoRights")}</>
                      )}
                    </div>
                  </Box>
                ) : null}

                <Box
                  className={`flex-container ${
                    props.isDrawerExpanded
                      ? !mapping
                        ? "noMapExpand"
                        : "mapExpand"
                      : "mapCollapse"
                  }`}
                >
                  <Grid container xs={12} justifyContent="space-between">
                    <Grid item xs={5}>
                      <div className="flex-item">
                        <p
                          style={{
                            fontSize: " var(--base_text_font_size)",
                            fontWeight: "500",
                            color: "#000",
                          }}
                        >
                          {t("toolbox.businessRules.ruleFlowName")}
                          <span className="required">*</span>
                        </p>
                        <CustomizedDropdown
                          value={ruleFlow.id}
                          onChange={changeRuleFlow}
                          id="pmweb_businessRule_ruleflow_dropdown"
                          isNotMandatory={true}
                          disabled={isReadOnly || ruleFlowItems.length === 0}
                          ariaDescription="Rule Flow Name Dropdown"
                          //Resolved bug no. 111905
                          // style={!props.isDrawerExpanded ? { width: "8.5vw" } : ""}
                          style={{ display: "flex" }}
                        >
                          {ruleFlowItems?.map((item, i) => (
                            <MenuItem
                              value={item.id}
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.menuItemArabic
                                  : styles.menuItem
                              }
                            >
                              {item.value}
                            </MenuItem>
                          ))}
                        </CustomizedDropdown>
                      </div>
                    </Grid>
                    <Grid item xs={4}>
                      <div className="flex-item">
                        <p
                          style={{
                            fontSize: " var(--base_text_font_size)",
                            fontWeight: "500",
                            color: "#000",
                          }}
                        >
                          {props.isDrawerExpanded
                            ? t("toolbox.businessRules.verNum")
                            : t("toolbox.businessRules.version")}
                          <span className="required">*</span>
                        </p>

                        <CustomizedDropdown
                          value={ruleVersion}
                          onChange={(e) => {
                            setRuleVersion(e.target.value);
                          }}
                          displayEmpty
                          id="pmweb_BusinessRule_ruleversion_dropdown"
                          ariaDescription="Rule Version No. Dropdown"
                          isNotMandatory={true}
                          disabled={isReadOnly || ruleFlowItems.length === 0}
                          style={{ display: "flex" }}
                        >
                          {flowVersionItems?.map((item, i) => (
                            <MenuItem
                              value={item.value}
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.menuItemArabic
                                  : styles.menuItem
                              }
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </CustomizedDropdown>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <div className="flex-item">
                        <Button
                          style={{
                            border: "1px solid var(--button_color)",
                            color: "var(--button_color)",
                            top: "12px",
                          }}
                          className="associateBtn"
                          disabled={isReadOnly || ruleFlowItems.length === 0}
                          onClick={() => {
                            associateData("ruleflow");
                          }}
                          id="pmweb_BusinessRule_Ruleflow_Associate_Button"
                        >
                          {t("toolbox.businessRules.associate")}
                        </Button>
                      </div>
                    </Grid>
                  </Grid>
                </Box>
                <Box
                  className={`flex-container ${
                    props.isDrawerExpanded
                      ? !mapping
                        ? "noMapExpand"
                        : "mapExpand"
                      : "mapCollapse"
                  }`}
                >
                  <Grid container xs={12} justifyContent="space-between">
                    <Grid item xs={5}>
                      <div className="flex-item">
                        <p
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            fontWeight: "500",
                            color: "#000",
                          }}
                        >
                          {t("toolbox.businessRules.rulePackageName")}
                          <span className="required">*</span>
                        </p>
                        <CustomizedDropdown
                          value={rulePackage.id}
                          onChange={changeRulePackage}
                          displayEmpty
                          id="pmweb_BusinessRule_RulePackage_Dropdown"
                          ariaDescription="Rule Package Name Dropdown"
                          isNotMandatory={true}
                          disabled={isReadOnly || rulePackageItems.length === 0}
                          style={{ display: "flex" }}
                        >
                          {rulePackageItems?.map((item, i) => (
                            <MenuItem
                              value={item.id}
                              selected
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.menuItemArabic
                                  : styles.menuItem
                              }
                            >
                              {item.value}
                            </MenuItem>
                          ))}
                        </CustomizedDropdown>
                      </div>
                    </Grid>
                    <Grid item xs={4}>
                      <div className="flex-item">
                        <p
                          style={{
                            fontSize: " var(--base_text_font_size)",
                            fontWeight: "500",
                            color: "#000",
                          }}
                        >
                          {props.isDrawerExpanded
                            ? t("toolbox.businessRules.verNum")
                            : t("toolbox.businessRules.version")}
                          <span className="required">*</span>
                        </p>

                        <CustomizedDropdown
                          value={packageVersion}
                          onChange={(e) => {
                            setPackageVersion(e.target.value);
                          }}
                          id="pmweb_BusinessRule_PackageVersion_Dropdown"
                          ariaDescription="Package Version No. Dropdown"
                          isNotMandatory={true}
                          disabled={isReadOnly || rulePackageItems.length === 0}
                          style={{ display: "flex" }}
                        >
                          {packageVersionItems?.map((item, i) => (
                            <MenuItem
                              value={item.value}
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.menuItemArabic
                                  : styles.menuItem
                              }
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </CustomizedDropdown>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <div className="flex-item collapseBtnContainer">
                        <Button
                          disabled={isReadOnly || rulePackageItems.length === 0}
                          style={{
                            border: "1px solid var(--button_color)",
                            color: "var(--button_color)",
                            top: "12px",
                          }}
                          className="associateBtn"
                          onClick={() => {
                            associateData("rulepackage");
                          }}
                          id="pmweb_BusinessRule_rulepackage_Associate_Button"
                        >
                          {t("toolbox.businessRules.associate")}
                        </Button>
                      </div>
                    </Grid>
                  </Grid>
                </Box>

                <Box style={{ marginTop: "1.5rem" }} className="label-heading">
                  <h4>{t("toolbox.businessRules.associatePackageFlow")}</h4>
                </Box>

                <Box sx={{ m: 2 }} className="associate-list">
                  <table
                    className={
                      direction === RTL_DIRECTION
                        ? "associate-tbl-expand"
                        : "associate-tbl"
                    }
                    style={{
                      width:
                        mapping || !props.isDrawerExpanded ? "100%" : "70%",
                    }}
                    direction
                  >
                    <tr>
                      <th>{t("toolbox.businessRules.name")}</th>
                      <th>{t("toolbox.businessRules.version")}</th>
                      <th>{t("toolbox.businessRules.type")}</th>
                      {props.isDrawerExpanded ? <th></th> : ""}
                    </tr>
                    {associateList?.map((item, i) => (
                      <tr key={i}>
                        <td align="center">{item.name}</td>
                        <td align="center">
                          {item.version === "0.0"
                            ? "Version Free"
                            : item.version}
                        </td>
                        <td align="center">
                          {item.type === "P"
                            ? t("toolbox.businessRules.rulePackage")
                            : t("toolbox.businessRules.ruleFlow")}
                        </td>
                        {props.isDrawerExpanded ? (
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                              }}
                            >
                              <LightTooltip
                                id={`pmweb_BusinessRule_RuleDelete_lighttooltip${i}`}
                                arrow={true}
                                placement="bottom"
                                title={"View mapping"}
                              >
                                <CompareArrowsIcon
                                  onClick={() => {
                                    mapData(
                                      item.id,
                                      item.version,
                                      item.type,
                                      item.mapInfo,
                                      item.time,
                                      item.name
                                    );
                                  }}
                                  className={styles.iconDimensions}
                                  id={`pmweb_BusinessRule_Viewmapping_ComapreArrowIcon${i}`}
                                  tabIndex={0}
                                  onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                      mapData(
                                        item.id,
                                        item.version,
                                        item.type,
                                        item.mapInfo,
                                        item.time,
                                        item.name
                                      );
                                      e.stopPropagation();
                                    }
                                  }}
                                />
                              </LightTooltip>
                              {!isReadOnly && (
                                <LightTooltip
                                  id={`pmweb_BusinessRule_Delete_lighttooltip${i}`}
                                  arrow={true}
                                  placement="bottom"
                                  title={"Delete"}
                                >
                                  <DeleteIcon
                                    onClick={() => {
                                      deleteData(item.id, item.version, i);
                                    }}
                                    className={clsx(
                                      styles.iconDimensions,
                                      styles.deleteIconColor
                                    )}
                                    id={`pmweb_BusinessRule_DeleteIcon${i}`}
                                    tabIndex={0}
                                    onKeyUp={(e) => {
                                      if (e.key === "Enter") {
                                        deleteData(item.id, item.version, i);
                                        e.stopPropagation();
                                      }
                                    }}
                                  />
                                </LightTooltip>
                              )}
                            </div>
                          </td>
                        ) : (
                          ""
                        )}
                      </tr>
                    ))}
                  </table>
                </Box>
              </div>
              {mapping && (
                <div
                  className="mappingContainer"
                  style={{
                    display: props.isDrawerExpanded ? "block" : "none",
                  }}
                >
                  <Box className="mapping-tbl-container">
                    <table className="mapping-tbl">
                      <tr>
                        <thead>
                          <th>{t("toolbox.businessRules.invocation")}</th>
                          <th>
                            {t("toolbox.businessRules.timeout")}
                            <span className="required">*</span>
                          </th>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{t("toolbox.businessRules.sync")}</td>
                            <td>
                              <CustomizedDropdown
                                id="demo-select-small"
                                value={defaultTime}
                                onChange={(e) => {
                                  setTime(
                                    e.target.value,
                                    mappedSelectedRule,
                                    mappedSelectedRuleVersion
                                  );
                                }}
                                isNotMandatory={true}
                                disabled={isReadOnly}
                                style={{ display: "flex" }}
                              >
                                {timeslot?.map((item, i) => (
                                  <MenuItem
                                    value={item}
                                    className={
                                      direction === RTL_DIRECTION
                                        ? styles.menuItemArabic
                                        : styles.menuItem
                                    }
                                  >
                                    {item +
                                      " " +
                                      t("toolbox.businessRules.sec")}
                                  </MenuItem>
                                ))}
                              </CustomizedDropdown>
                            </td>
                          </tr>
                        </tbody>
                      </tr>
                    </table>
                  </Box>
                  {mappingLoader ? (
                    <div>
                      <CircularProgress className="circular-progress" />
                    </div>
                  ) : (
                    <Box className="mappingTab" sx={{ width: "100%" }}>
                      <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                          <TabList
                            onChange={handleChange}
                            className="tabList"
                            style={{ margin: "0 0.5vw" }}
                            id="pmweb_BusinessRule_Mappingtab_tablist"
                          >
                            <Tab
                              label={
                                <React.Fragment>
                                  {t("toolbox.businessRules.forwardMapping")}
                                  <span
                                    style={{
                                      fontSize: "1rem",
                                      color: "red",
                                      marginInlineStart: "0.25vw",
                                    }}
                                  >
                                    *
                                  </span>
                                </React.Fragment>
                              }
                              className="tab"
                              classes={{
                                root: classes.tab,
                                selected: classes.selectedTab,
                              }}
                              value="1"
                              tabIndex={0}
                            />
                            <Tab
                              label={
                                <React.Fragment>
                                  {t("toolbox.businessRules.reverseMapping")}
                                  <span
                                    style={{
                                      fontSize: "1rem",
                                      color: "red",
                                      marginInlineStart: "0.25vw",
                                    }}
                                  >
                                    *
                                  </span>
                                </React.Fragment>
                              }
                              className="tab"
                              classes={{
                                root: classes.tab,
                                selected: classes.selectedTab,
                              }}
                              value="2"
                              tabIndex={0}
                            />
                          </TabList>
                        </Box>
                        <TabPanel
                          value="1"
                          classes={{ root: classes.tabPanelRoot }}
                        >
                          <TableContainer
                            component={Paper}
                            className="mapped-tbl-container"
                          >
                            <Table
                              aria-label="simple table"
                              className="mapped-table"
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell className="mapped-table-header">
                                    {t("toolbox.businessRules.BRInput")}
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell className="mapped-table-header">
                                    {t("toolbox.businessRules.curProcessVar")}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {brtFwdInputs?.map((item, i) => (
                                  <TableRow>
                                    <TableCell className="mapped-table-cell">
                                      <p className="brtInputRules">
                                        {item.input}
                                      </p>
                                    </TableCell>
                                    <TableCell
                                      className="mapped-table-cell"
                                      style={{ textAlign: "center" }}
                                    >
                                      =
                                    </TableCell>
                                    <TableCell className="mapped-table-cell">
                                      <CustomizedDropdown
                                        value={getSelectedMappingData(item)}
                                        id={`pmweb_BusinessRule_selectedmappingdata${i}`}
                                        onChange={(e) => {
                                          selectedOutputVal(
                                            e.target.value,
                                            item,
                                            "F"
                                          );
                                        }}
                                        isNotMandatory={true}
                                        disabled={isReadOnly}
                                        style={{ display: "flex" }}
                                      >
                                        <MenuItem
                                          value="0"
                                          className={
                                            direction === RTL_DIRECTION
                                              ? styles.menuItemArabic
                                              : styles.menuItem
                                          }
                                        >
                                          {t("toolbox.businessRules.selVar")}
                                        </MenuItem>

                                        {getFilteredVarList(item)?.map(
                                          (process, j) => (
                                            <MenuItem
                                              value={process.VariableName}
                                              className={
                                                direction === RTL_DIRECTION
                                                  ? styles.menuItemArabic
                                                  : styles.menuItem
                                              }
                                            >
                                              {process.VariableName}
                                            </MenuItem>
                                          )
                                        )}
                                      </CustomizedDropdown>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </TabPanel>
                        <TabPanel
                          value="2"
                          classes={{ root: classes.tabPanelRoot }}
                        >
                          <TableContainer
                            component={Paper}
                            className="mapped-tbl-container"
                          >
                            <Table
                              aria-label="simple table"
                              className="mapped-table"
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell className="mapped-table-header">
                                    {t("toolbox.businessRules.curProcessVar")}
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell className="mapped-table-header">
                                    {t("toolbox.businessRules.BROutput")}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {brtRevInputs?.map((item, i) => (
                                  <TableRow>
                                    <TableCell className="mapped-table-cell">
                                      <p className="brtInputRules">
                                        {item.VariableName}
                                      </p>
                                    </TableCell>
                                    <TableCell
                                      className="mapped-table-cell"
                                      style={{ textAlign: "center" }}
                                    >
                                      =
                                    </TableCell>
                                    <TableCell className="mapped-table-cell">
                                      <CustomizedDropdown
                                        value={getSelectedOutputData(
                                          item?.VariableName
                                        )}
                                        id={`pmweb_BusinessRule_selectedoutputdata${i}`}
                                        onChange={(e) => {
                                          selectedOutputVal(
                                            e.target.value,
                                            item,
                                            "R"
                                          );
                                        }}
                                        labelId="demo-select-small"
                                        isNotMandatory={true}
                                        disabled={isReadOnly}
                                        style={{ display: "flex" }}
                                      >
                                        {
                                          <MenuItem
                                            value="0"
                                            className={
                                              direction === RTL_DIRECTION
                                                ? styles.menuItemArabic
                                                : styles.menuItem
                                            }
                                          >
                                            {t("toolbox.businessRules.selVar")}
                                          </MenuItem>
                                        }
                                        {getFilteredInputList(
                                          item?.VariableId,
                                          item?.VarFieldId
                                        )?.map((data, j) => (
                                          <MenuItem
                                            value={data?.input}
                                            className={
                                              direction === RTL_DIRECTION
                                                ? styles.menuItemArabic
                                                : styles.menuItem
                                            }
                                          >
                                            {data?.input}
                                          </MenuItem>
                                        ))}
                                      </CustomizedDropdown>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </TabPanel>
                      </TabContext>
                    </Box>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(BusinessRules);
