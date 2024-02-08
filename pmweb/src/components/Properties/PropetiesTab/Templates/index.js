// Changes made to solve Bug 111948 - OMS Adapter -> should have validation if connection is not establishing
// #BugID - 111152
// #BugDescription - save button has been disabled while disconnecting the oms details and it will enable only when template is selected.
// #Date - 31 October 2022
// #BugID - 122885
// #BugDescription - Saving issue after mapping has been resolved
import React, { useState, useEffect, useRef } from "react";
import "../../Properties.css";
import { useTranslation } from "react-i18next";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import CircularProgress from "@material-ui/core/CircularProgress";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import axios from "axios";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import MultiSelectWithSearchInput from "../../../../UI/MultiSelectWithSearchInput/index.js";
import {
  ENDPOINT_CONNECT_CABINET,
  ENDPOINT_DISCONNECT_CABINET,
  ENDPOINT_DOWNLOAD_ASSOCIATED_TEMPLATE,
  ENDPOINT_GET_CABINET,
  ENDPOINT_GET_CABINET_TEMPLATE,
  ENDPOINT_MAP_TEMPLATE,
  ERROR_INCORRECT_FORMAT,
  ERROR_MANDATORY,
  ERROR_RANGE,
  propertiesLabel,
  RTL_DIRECTION,
  SERVER_URL,
  SYNCHRONOUS,
} from "../../../../Constants/appConstants.js";
import { IconButton, MenuItem, Select } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import CloseIcon from "@material-ui/icons/Close";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField/index.js";
import MappingModal from "./MappingModal/index.js";
import Modal from "../../../../UI/Modal/Modal.js";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import emptyStatePic from "../../../../assets/ProcessView/EmptyState.svg";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import "./index.css";
import TemplatePropertiesScreen from "./TemplateProperties.js";
import PropertiesModal from "./PropertiesModal.js";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import encryptMessage from "../../../../utility/RSAEncypt";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import DOMPurify from "dompurify";
import {
  PMWEB_REGEX,
  validateRegex,
  REGEX,
} from "../../../../validators/validator";

function TemplateProperties(props) {
  // Added on 31-01-24 for Bug 141572
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  // Till here for Bug 141572
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [spinner, setspinner] = useState(true);
  const [hideConnectBtn, setHideConnectBtn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connectData, setConnectData] = useState({
    protocolType: "http",
  });
  const [category, setCategory] = useState(null);
  const [cabinetList, setCabinetList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [associatedList, setAssociatedList] = useState([]);
  const [associatedTemplateList, setAssociatedTemplateList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showMappingModal, setShowMappingModal] = useState(null);
  const [schemaList, setSchemaList] = useState([]);
  const [error, setError] = useState({});
  const [regexStr, setRegexStr] = useState(REGEX.AllChars);
  const [isValidIP, setIsValidIP] = useState(false);
  const [isValidDomain, setIsValidDomain] = useState(false);
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo || // modified on 05/09/2023 for BugId 136103
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );
  const ipRef = useRef();
  const portRef = useRef();
  const [disablePortId, setDisablePortId] = useState(false);

  const TemplateTooltip = withStyles(() => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      font: "normal normal normal 12px/17px Open Sans",
      letterSpacing: "0px",
      color: "#000000",
      zIndex: "100",
      transform: "translate3d(0px, -0.125rem, 0px) !important",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  useEffect(() => {
    setConnected(false);
    if (saveCancelStatus.SaveOnceClicked) {
      let isValidObj = validateFunc();

      if (!isValidObj.isValid) {
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneForwardMapping")} : ${
              isValidObj.templateName
            } [${t("Version")}:${(+isValidObj.templateVersion).toFixed(1)}]`,
            severity: "error",
            open: true,
          })
        );
      } else {
        // Modified on 31-01-24 for Bug 141572
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.templates]: {
              isModified: allTabStatus[propertiesLabel.templates]?.isModified,
              hasError: false,
            },
          })
        );
        // Till here for Bug 141572
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked]);

  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status === 0) {
      setspinner(false);
    }
    if (localLoadedActivityPropertyData?.ActivityProperty?.ccmTemplateInfo) {
      let tempInfo =
        localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo;
      setConnectData({
        ...connectData,
        ipAddress: tempInfo.appServerIP,
        //Bug 126914
        protocolType: tempInfo?.appServerType ? tempInfo.appServerType : "http",
        // tempInfo.appServerPort.trim() !== ""
        //   ? tempInfo.appServerType
        //   : "http",
        portId:
          tempInfo.appServerPort.trim() !== "" ? +tempInfo.appServerPort : "",
        cabinet: tempInfo.cabinetName,
        username: tempInfo.userName,
      });
      //set the IsValidId and IsValidDomain
      if (tempInfo?.appServerIP !== "") {
        if (validateRegex(tempInfo?.appServerIP, PMWEB_REGEX.IpAddressIpV4)) {
          setIsValidIP(true);
        } else {
          setIsValidDomain(true);
        }
      } else {
        let errorObj = null;
        errorObj = {
          ...errorObj,
          ipAddress: {
            statement: t("PleaseEnter") + " " + t("IpAddress"),
            severity: "error",
            errorType: ERROR_MANDATORY,
          },
        };
        setError({ ...error, ...errorObj });
      }
      let assocTempList = [];
      tempInfo.associatedList?.forEach((el) => {
        assocTempList.push({
          CategoryName: el.categoryName,
          CommunicationGroupName: el.commGroupName,
          Description: el.description,
          ParameterMatch: "",
          ProductName: el.productName,
          ReportName: el.reportName,
          ReportVersions: el.version,
          Timeout: el.timeOutInterval,
          DocType: el.reverseDocName,
          FwdVarMapping: el.arrFwdVarMapping,
        });
      });
      setAssociatedTemplateList(assocTempList);
    }
    let isValidObj = {};
    isValidObj = validateFunc();
    if (isValidObj && !isValidObj.isValid) {
      // Modified on 31-01-24 for Bug 141572
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.templates]: {
            isModified: allTabStatus[propertiesLabel.templates]?.isModified,
            hasError: true,
          },
        })
      );
      // Till here for Bug 141572
    } else {
      // Modified on 31-01-24 for Bug 141572
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.templates]: {
            isModified: allTabStatus[propertiesLabel.templates]?.isModified,
            hasError: false,
          },
        })
      );
      // Till here for Bug 141572
    }
  }, [localLoadedActivityPropertyData]);

  useEffect(() => {
    let tempList = [];
    associatedTemplateList?.forEach((el) => {
      tempList.push(el.ProductName);
    });
    setAssociatedList(tempList);
  }, [associatedTemplateList]);

  const validateFunc = () => {
    let isValid = true;
    let invalidTemplate = null;
    let newAssList = localLoadedActivityPropertyData?.ActivityProperty
      ?.ccmTemplateInfo?.associatedList
      ? [
          ...localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo
            .associatedList,
        ]
      : [];
    newAssList?.forEach((el) => {
      if (!el.arrFwdVarMapping) {
        isValid = false;
        invalidTemplate = el;
      } else {
        let minMapping = false;
        el.arrFwdVarMapping.forEach((ele) => {
          if (ele.mappedName) {
            minMapping = true;
          }
        });
        if (!minMapping) {
          isValid = false;
          invalidTemplate = el;
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
        templateName: invalidTemplate.productName,
        templateVersion: invalidTemplate.version,
      };
    }
  };
  function containNumberWithDotOnly(input) {
    return validateRegex(input, REGEX.NumDot);
  }

  function validPortNumber(input) {
    //if negative
    if (Math.sign(input) === -1) return false;
    //if not valid Integer Positive range
    if (validateRegex(input, REGEX.IntegerPositive)) {
      if (input >= 0 && input <= 65535) return true;
    }
    return false;
  }
  const onChange = (e) => {
    //Bug135517 : Added Validations
    let errorObj = null;
    let type =
      e.target.name === "ipAddress"
        ? containNumberWithDotOnly(e.target.value) ||
          e.target.value.trim() === ""
          ? "IpAddress"
          : !validateRegex(e.target.value, PMWEB_REGEX.IpAddressIpV4)
          ? "DomainName"
          : null
        : e.target.name === "portId"
        ? "portId"
        : null;

    let val = e.target.value;

    switch (type) {
      case "IpAddress": {
        if (val.trim() === "") {
          errorObj = {
            ...errorObj,
            ipAddress: {
              statement: t("PleaseEnter") + " " + t("IpAddress"),
              severity: "error",
              errorType: ERROR_MANDATORY,
            },
          };
          setIsValidIP(false);
        } else if (!validateRegex(val, PMWEB_REGEX.IpAddressIpV4)) {
          errorObj = {
            ...errorObj,
            ipAddress: {
              statement: t("Invalid") + " " + t("IpAddress"),
              severity: "error",
              errorType: ERROR_INCORRECT_FORMAT,
            },
          };
          setRegexStr(PMWEB_REGEX.IpAddressIpV4);
          setIsValidIP(false);
        }
        //if valid IpAddress
        else {
          if (connectData?.portId == "") {
            errorObj = {
              ...errorObj,
              portId: {
                statement: t("PleaseEnter") + " " + t("ValidPortNumber"),
                severity: "error",
                errorType: ERROR_MANDATORY,
              },
            };
          }
          setRegexStr(REGEX.AllChars);
          setIsValidIP(true);
        }
        setIsValidDomain(false);
        setDisablePortId(false);
        break;
      }
      case "DomainName": {
        if (!validateRegex(val, PMWEB_REGEX.DomainName)) {
          errorObj = {
            ...errorObj,
            ipAddress: {
              statement: t("Invalid") + " " + t("domainName"),
              severity: "error",
              errorType: ERROR_INCORRECT_FORMAT,
            },
          };
          setRegexStr(PMWEB_REGEX.DomainName);
          setIsValidDomain(false);
          setIsValidIP(false);
        }
        //If valid Domain
        else {
          if (connectData?.portId == "") {
            if (error.hasOwnProperty("portId")) {
              delete error["portId"];
            }
          }
          setDisablePortId(true);
          setRegexStr(REGEX.AllChars);
          setIsValidDomain(true);
          setIsValidIP(false);
        }
        break;
      }
      case "portId": {
        val = val.trim();
        //limit of port is 5 characters
        if (val.length > 5) {
          val = val.slice(0, 5);
        }

        //PortId was typed after IpAddress
        if (isValidIP) {
          if (val == "") {
            errorObj = {
              ...errorObj,
              portId: {
                statement: t("PleaseEnter") + " " + t("ValidPortNumber"),
                severity: "error",
                errorType: ERROR_MANDATORY,
              },
            };
          } else if (!validPortNumber(val)) {
            errorObj = {
              ...errorObj,
              portId: {
                statement: t("PleaseEnter") + " " + t("ValidPortNumber"),
                severity: "error",
                errorType: ERROR_MANDATORY,
              },
            };
            //clear the Invalid value of the PortID
            val = "";
          }
        }
        //PortId was typed after Domain Name
        else if (isValidDomain) {
          if (val == "") {
            if (error.hasOwnProperty("portId")) {
              delete error["portId"];
            }
          }
        }
        //PortId was typed first
        else if (!validPortNumber(val)) {
          errorObj = {
            ...errorObj,
            portId: {
              statement: t("PleaseEnter") + " " + t("ValidPortNumber"),
              severity: "error",
              errorType: ERROR_MANDATORY,
            },
          };
          //clear the Invalid value of the PortID
          val = "";
        }

        break;
      }
      //if no cases match
      default: {
        setRegexStr(REGEX.AllChars);
        break;
      }
    }
    setError({ ...error, ...errorObj });
    setConnectData({ ...connectData, [e.target.name]: val });
  };

  const getCabinetFunc = () => {
    let mandatoryFieldsFilled = true;
    let errorObj = {};
    if (
      !connectData.ipAddress ||
      connectData.ipAddress === null ||
      connectData.ipAddress?.trim() === ""
    ) {
      mandatoryFieldsFilled = false;
      errorObj = {
        ...errorObj,
        ipAddress: {
          statement: t("PleaseEnter") + " " + t("IpAddress"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    if (
      connectData.portId &&
      (connectData.portId < 0 || connectData.portId > 65535)
    ) {
      errorObj = {
        ...errorObj,
        portId: {
          statement: t("PleaseEnter") + " " + t("ValidPortNumber"),
          severity: "error",
          errorType: ERROR_RANGE,
        },
      };
    }
    if (mandatoryFieldsFilled) {
      let json = {
        appServerIP: connectData.ipAddress,
        appServerPort: connectData.portId,
        appServerType: connectData.protocolType,
      };
      axios.post(SERVER_URL + ENDPOINT_GET_CABINET, json).then((res) => {
        if (res.data.Status === 0) {
          setError({});
          let tempList = [...res.data.Cabinets];
          setCabinetList(tempList);
          if (tempList?.length > 0 && !connectData.cabinetName) {
            setConnectData({
              ...connectData,
              cabinet: tempList[0].CabinetName,
            });
          }
          setHideConnectBtn(false);
        } else {
          dispatch(
            setToastDataFunc({
              message: `${t("UnabletoFetchCabinetList")}`,
              severity: "error",
              open: true,
            })
          );
        }
      });
    } else {
      setError({ ...error, ...errorObj });
    }
  };

  const connectFunc = () => {
    let mandatoryFieldsFilled = true;
    let errorObj = {};
    if (!connectData.username || connectData.username === "") {
      mandatoryFieldsFilled = false;
      errorObj = {
        ...errorObj,
        username: {
          statement: t("PleaseEnter") + " " + t("Username"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    if (!connectData.password || connectData.password === "") {
      mandatoryFieldsFilled = false;
      errorObj = {
        ...errorObj,
        password: {
          statement: t("PleaseEnter") + " " + t("Password"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    if (mandatoryFieldsFilled) {
      let json = {
        appServerIP: connectData.ipAddress,
        appServerPort: connectData.portId,
        appServerType: connectData.protocolType,
        userName: connectData.username,
        authCred: encryptMessage(connectData.password),
        cabinetName: connectData.cabinet,
        m_strActivityID: localLoadedActivityPropertyData.ActivityProperty.actId,
      };
      axios.post(SERVER_URL + ENDPOINT_CONNECT_CABINET, json).then((res) => {
        if (res?.data?.Status === 0) {
          setError({});
          let tempList = [...res.data.Category];
          if (tempList?.length > 1) {
            getTemplateForCategory(-1);
          } else if (tempList?.length === 1) {
            getTemplateForCategory(tempList[0].CategoryName);
          }
          setCategoryList(tempList);
          setConnected(true);
          /* dispatch(
            setActivityPropertyChange({
              [propertiesLabel.templates]: {
                isModified: true,
                hasError: false,
              },
            })
          ); */
        } /* 
         //Modified on 22/01/2024 for bug_id:141575
        else {
          dispatch(
            setToastDataFunc({
              message: res?.data?.Message,
              severity: "error",
              open: true,
            })
          );
        } */
        //till here for bug_id:141575
      });
    } else {
      setError({ ...error, ...errorObj });
    }
  };

  const disconnectFunc = () => {
    let json = {
      appServerIP: connectData.ipAddress,
      appServerPort: connectData.portId,
      appServerType: connectData.protocolType,
      cabinetName: connectData.cabinet,
      m_strActivityID: localLoadedActivityPropertyData.ActivityProperty.actId,
    };
    axios.post(SERVER_URL + ENDPOINT_DISCONNECT_CABINET, json).then((res) => {
      if (res.data.Status === 0) {
        setConnected(false);
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.templates]: {
              isModified: false,
              hasError: false,
            },
          })
        );
      }
    });
  };

  const getTemplateForCategory = (value) => {
    setCategory(value);
    let json = {
      appServerIP: connectData.ipAddress,
      appServerPort: connectData.portId,
      appServerType: connectData.protocolType,
      cabinetName: connectData.cabinet,
      m_strSearchCateg: value,
    };
    axios.post(SERVER_URL + ENDPOINT_GET_CABINET_TEMPLATE, json).then((res) => {
      if (res.data.Status === 0) {
        setTemplateList(res.data.Data);
      } else {
        setTemplateList([]);
      }
    });
  };

  const removeTemplateFromList = (index, item) => {
    let tempNewList = [...associatedTemplateList];
    if (index === null) {
      let indVal = null;
      tempNewList?.forEach((el, index1) => {
        if (el.ProductName === item.ProductName) {
          indVal = index1;
        }
      });
      tempNewList.splice(indVal, 1);
    } else {
      tempNewList.splice(index, 1);
    }
    setAssociatedTemplateList(tempNewList);
    if (selectedTemplate && item.ProductName === selectedTemplate.ProductName) {
      setSelectedTemplate(null);
    }
    let temp = { ...localLoadedActivityPropertyData };
    let tempList = localLoadedActivityPropertyData.ActivityProperty
      .ccmTemplateInfo.associatedList
      ? [
          ...localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo
            .associatedList,
        ]
      : [];
    let indexVal = null;
    tempList?.forEach((el, index2) => {
      if (el.productName === item.ProductName) {
        indexVal = index2;
      }
    });
    tempList.splice(indexVal, 1);
    localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo = {
      ...localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo,
      associatedList: tempList,
      appServerIP: connectData.ipAddress,
      appServerPort: connectData.portId + "",
      appServerType: connectData.protocolType,
      cabinetName: connectData.cabinet,
      userName: connectData.username,
      // code added on 13 Feb 2023 for BugId 123281
      // authCred: connectData.password,
      authCred: encryptMessage(connectData.password),
    };
    setlocalLoadedActivityPropertyData(temp);
    // Added on 31-01-24 for Bug 141572
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.templates]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.templates]?.hasError,
        },
      })
    );
    // Till here for Bug 141572
  };

  const mapTemplate = (template) => {
    const json = {
      appServerIP: connectData.ipAddress,
      appServerPort: connectData.portId,
      appServerType: connectData.protocolType,
      cabinetName: connectData.cabinet,
      m_strSelectedProdName: template.ProductName,
      m_sSelectedVers: template.ReportVersions,
    };
    axios.post(SERVER_URL + ENDPOINT_MAP_TEMPLATE, json).then((res) => {
      if (res.data.Status === 0) {
        setSchemaList(res.data.Schema);
        setShowMappingModal(template);
      }
    });
  };

  const saveMappingDetailsFunc = (updatedTemplate) => {
    let temp = { ...localLoadedActivityPropertyData };
    let tempList = localLoadedActivityPropertyData.ActivityProperty
      .ccmTemplateInfo.associatedList
      ? [
          ...localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo
            .associatedList,
        ]
      : [];
    tempList.forEach((el) => {
      if (el.productName === updatedTemplate.ProductName) {
        el.arrFwdVarMapping = updatedTemplate.FwdVarMapping;
        el.reverseDocName = updatedTemplate.DocType;
        el.timeOutInterval = updatedTemplate.Timeout;
      }
    });
    localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo = {
      ...localLoadedActivityPropertyData.ActivityProperty.ccmTemplateInfo,
      associatedList: tempList,
      appServerIP: connectData.ipAddress,
      appServerPort: connectData.portId + "",
      appServerType: connectData.protocolType,
      cabinetName: connectData.cabinet,
      userName: connectData.username,
      // code added on 13 Feb 2023 for BugId 123281
      // authCred: connectData.password,
      authCred: encryptMessage(connectData.password),
    };
    // Added on 31-01-24 for Bug 141572
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.templates]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.templates]?.hasError,
        },
      })
    );
    // Till here for Bug 141572
    setlocalLoadedActivityPropertyData(temp);
  };

  const setAssociatedTemplateListFunc = (list, type, item) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let tempList = temp.ActivityProperty.ccmTemplateInfo.associatedList
      ? JSON.parse(
          JSON.stringify(temp.ActivityProperty.ccmTemplateInfo.associatedList)
        )
      : [];
    if (type === 0) {
      //type 0 is to add new templates to associated template list
      let newList = JSON.parse(JSON.stringify(associatedTemplateList));
      list?.forEach((el) => {
        if (!associatedList.includes(el.ProductName)) {
          newList.push(el);
        }
      });
      setAssociatedTemplateList(newList);
      tempList.push({
        timeOutInterval: item.Timeout ? item.Timeout : 0,
        reportName: item.ReportName,
        reverseDocName: item?.DocType ? item.DocType : "",
        invocType: SYNCHRONOUS,
        description: item.Description,
        arrFwdVarMapping: item.FwdVarMapping,
        commGroupName: item.CommunicationGroupName,
        categoryName: item.CategoryName,
        version: item.ReportVersions,
        productName: item.ProductName,
      });
    } else if (type === 1) {
      //type 1 is to delete some templates from associated template list
      let newList = [];
      associatedTemplateList?.forEach((el) => {
        if (item.ProductName !== el.ProductName) {
          newList.push(el);
        }
      });
      setAssociatedTemplateList(newList);
      let indexVal = null;
      tempList?.forEach((el, index) => {
        if (el.productName === item.ProductName) {
          indexVal = index;
        }
      });
      tempList.splice(indexVal, 1);
    }
    temp.ActivityProperty.ccmTemplateInfo = {
      associatedList: [...tempList],
      appServerIP: connectData.ipAddress,
      appServerPort: connectData.portId + "",
      appServerType: connectData.protocolType,
      cabinetName: connectData.cabinet,
      userName: connectData.username,
      // code added on 13 Feb 2023 for BugId 123281
      // authCred: connectData.password,
      authCred: encryptMessage(connectData.password),
    };
    // Added on 31-01-24 for Bug 141572
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.templates]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.templates]?.hasError,
        },
      })
    );
    // Till here for Bug 141572
    setlocalLoadedActivityPropertyData(temp);
  };

  const downloadTemplate = (template) => {
    axios({
      url:
        SERVER_URL +
        ENDPOINT_DOWNLOAD_ASSOCIATED_TEMPLATE +
        `${template.ProductName}/${template.ReportVersions}`, //your url
      method: "GET",
      responseType: "blob", // important
    }).then((res) => {
      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: res.headers["content-type"],
        })
      );
      let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      let matches = filenameRegex.exec(res.headers["content-disposition"]);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", matches[1].replace(/['"]/g, "")); //or any other extension
      // document.body.appendChild(link);
      // link.click();
      const sanitizedHref = DOMPurify.sanitize(link.href);
      link.href = sanitizedHref;
      link.click();
    });
  };

  function disableCabinetBtn() {
    if (
      isValidIP &&
      connectData.portId != "" &&
      validPortNumber(connectData.portId)
    ) {
      return false;
    } else if (isValidDomain) {
      return false;
    } else {
      return true;
    }
  }

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <div className="flexColumn">
        {spinner ? (
          <CircularProgress
            style={
              direction === RTL_DIRECTION
                ? { marginTop: "30vh", marginRight: "40%" }
                : { marginTop: "30vh", marginLeft: "40%" }
            }
          />
        ) : (
          <div
            className={`${styles.mainDiv} ${
              props.isDrawerExpanded
                ? styles.expandedView
                : styles.collapsedView
            }`}
            style={{ direction: `${direction}` }}
          >
            <div className={styles.cabinetDiv}>
              <p className={styles.divHeading}>{t("O2MsDetails")}</p>
              <div className={styles.cabinetBodyDiv}>
                <label
                  className={styles.templatePropLabel}
                  htmlFor="protocolType_Label"
                >
                  {t("ProtocolType")}
                </label>
                <Select
                  label={`${connectData.protocolType}`}
                  className={`templatePropSelect ${styles.templatePropSelect}`}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                  inputProps={{
                    readOnly: connected || isReadOnly,
                    "aria-label": "protocolType",
                    id: "protocolType_Label",
                  }}
                  style={{ backgroundColor: connected ? "#f8f8f8" : "#fff" }}
                  name="protocolType"
                  value={connectData.protocolType}
                  onChange={onChange}
                  id="pmweb_oms_protocolType"
                >
                  {["http", "https"].map((option) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.templateDropdownData
                            : styles.templateDropdownData
                        }
                        value={option}
                      >
                        {option}
                      </MenuItem>
                    );
                  })}
                </Select>
                <label className={styles.templatePropLabel}>
                  {t("domainName")} / {t("IpAddress")}
                  <span
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.starIcon
                        : styles.starIcon
                    }
                  >
                    *
                  </span>
                </label>
                <TextInput
                  ariaLabel={"ipAddress"}
                  inputValue={connectData?.ipAddress}
                  classTag={styles.templatePropInput}
                  onChangeEvent={onChange}
                  readOnlyCondition={connected || isReadOnly}
                  name="ipAddress"
                  idTag="pmweb_oms_ipAddress"
                  errorStatement={error?.ipAddress?.statement}
                  errorSeverity={error?.ipAddress?.severity}
                  errorType={error?.ipAddress?.errorType}
                  inlineError={true}
                  inputRef={ipRef}
                  regexStr={regexStr}
                  onKeyPress={(e) =>
                    FieldValidations(e, 10, ipRef.current, 100)
                  }
                />

                <label className={styles.templatePropLabel}>
                  {t("PortId")}
                </label>
                {/*code updated on 15 September 2022 for BugId 112903*/}
                <TextInput
                  ariaLabel={"PortId"}
                  inputValue={connectData?.portId}
                  classTag={styles.templatePropInput}
                  onChangeEvent={onChange}
                  readOnlyCondition={connected || isReadOnly || disablePortId}
                  //type="number" //Bug 139764: Commented type="number", issue was coming if e8080 etc was pasted,
                  // e.target.value comes as "" since it was invalid value
                  name="portId"
                  idTag="pmweb_oms_portId"
                  rangeVal={{ start: 0, end: 65535 }}
                  errorStatement={error?.portId?.statement}
                  errorSeverity={error?.portId?.severity}
                  errorType={error?.portId?.errorType}
                  inlineError={true}
                  inputRef={portRef}
                  onKeyPress={(e) =>
                    FieldValidations(e, 131, portRef.current, 5)
                  }
                />
                {hideConnectBtn ? (
                  <button
                    onClick={getCabinetFunc}
                    id="pmweb_oms_cabinetButton"
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.getCabinetBtn
                        : isReadOnly
                        ? styles.disabledBtn
                        : styles.getCabinetBtn
                    }
                    disabled={isReadOnly || disableCabinetBtn()}
                  >
                    {t("GetCabinets")}
                  </button>
                ) : (
                  <div>
                    <label
                      className={styles.templatePropLabel}
                      aria-label="Cabinet"
                      htmlFor="pmweb_oms_cabinet"
                    >
                      {t("Cabinet")}
                    </label>
                    <Select
                      aria-label="Cabinet"
                      className={`templatePropSelect ${styles.templatePropSelect}`}
                      MenuProps={{
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                        getContentAnchorEl: null,
                      }}
                      inputProps={{
                        readOnly: connected || isReadOnly,
                        "aria-label": "Cabinet",
                        id: "pmweb_oms_cabinet",
                      }}
                      style={{
                        backgroundColor: connected ? "#f8f8f8" : "#fff",
                      }}
                      name="cabinet"
                      value={connectData.cabinet}
                      onChange={onChange}
                      id="pmweb_oms_cabinet"
                    >
                      {cabinetList?.map((option) => {
                        return (
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.templateDropdownData
                                : styles.templateDropdownData
                            }
                            value={option.CabinetName}
                          >
                            {option.CabinetName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <label className={styles.templatePropLabel}>
                      {t("Username")}
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.starIcon
                            : styles.starIcon
                        }
                      >
                        *
                      </span>
                    </label>
                    <TextInput
                      ariaLabel={"username"}
                      inputValue={connectData?.username}
                      classTag={styles.templatePropInput}
                      onChangeEvent={onChange}
                      readOnlyCondition={connected || isReadOnly}
                      name="username"
                      idTag="pmweb_oms_username"
                      errorStatement={error?.username?.statement}
                      errorSeverity={error?.username?.severity}
                      errorType={error?.username?.errorType}
                      inlineError={true}
                    />
                    <label className={styles.templatePropLabel}>
                      {t("Password")}
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.starIcon
                            : styles.starIcon
                        }
                      >
                        *
                      </span>
                    </label>
                    <TextInput
                      ariaLabel={"password"}
                      inputValue={connectData?.password}
                      classTag={styles.templatePropInput}
                      onChangeEvent={onChange}
                      readOnlyCondition={connected || isReadOnly}
                      name="password"
                      type="password"
                      idTag="pmweb_oms_password"
                      errorStatement={error?.password?.statement}
                      errorSeverity={error?.password?.severity}
                      errorType={error?.password?.errorType}
                      inlineError={true}
                    />
                    {connected ? (
                      <button
                        onClick={disconnectFunc}
                        id="pmweb_oms_disconnectButton"
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.disconnectBtn
                            : styles.disconnectBtn
                        }
                      >
                        {t("Disconnect")}
                      </button>
                    ) : (
                      <button
                        onClick={connectFunc}
                        id="pmweb_oms_connectButton"
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.getCabinetBtn
                            : isReadOnly
                            ? styles.disabledBtn
                            : styles.getCabinetBtn
                        }
                        disabled={isReadOnly}
                      >
                        {t("Connect")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.templateList
                  : styles.templateList
              }
            >
              <p className={styles.divHeading}>{t("SelectTemplate(s)")}</p>
              <label
                className={styles.templatePropLabel}
                htmlFor="pmweb_oms_template"
              >
                {t("Category")}
              </label>
              <Select
                className={`templatePropSelect ${styles.templatePropSelect}`}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                inputProps={{
                  readOnly: !connected || isReadOnly,
                  id: "pmweb_oms_template",
                  "aria-label": "Category",
                }}
                style={{ backgroundColor: !connected ? "#f8f8f8" : "#fff" }}
                name="Category"
                value={category}
                onChange={(e) => getTemplateForCategory(e.target.value)}
                id="pmweb_oms_template"
              >
                {categoryList?.length > 1 ? (
                  <MenuItem
                    id={"selectMenu"}
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.templateDropdownData
                        : styles.templateDropdownData
                    }
                    value={-1}
                  >
                    {t("All")}
                  </MenuItem>
                ) : null}
                {categoryList?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.templateDropdownData
                          : styles.templateDropdownData
                      }
                      value={option.CategoryName}
                    >
                      {option.CategoryName}
                    </MenuItem>
                  );
                })}
              </Select>
              <label className={styles.templatePropLabel} aria-label="Template">
                {t("Template")}
              </label>
              <MultiSelectWithSearchInput
                aria-label="Template"
                optionList={templateList}
                selectedOptionList={associatedList}
                optionRenderKey="ProductName"
                showTags={false}
                getSelectedItems={setAssociatedTemplateListFunc}
                isDisabled={!connected || isReadOnly}
              />
              {associatedTemplateList?.length > 0 ? (
                <React.Fragment>
                  <p className={styles.nextDivHeading}>
                    {t("AssociatedTemplates")}
                  </p>
                  <div className={styles.associatedTemplateDiv}>
                    {associatedTemplateList.map((el, index) => {
                      return (
                        <div
                          className={
                            selectedTemplate?.ProductName === el.ProductName
                              ? styles.selectedTempDiv
                              : styles.associatedTempDiv
                          }
                        >
                          <span
                            className={styles.tempName}
                            onClick={() => setSelectedTemplate(el)}
                            id={`pmweb_oms_associatedTemplateList_${index}`}
                            tabIndex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                setSelectedTemplate(el);
                                e.stopPropagation();
                              }
                            }}
                          >
                            {el.ProductName}
                          </span>
                          <span className={styles.tempIconsDiv}>
                            <TemplateTooltip
                              arrow
                              title={
                                !connected
                                  ? t("mappingError")
                                  : t("viewMapping")
                              }
                              placement={"bottom"}
                            >
                              {/* <IconButton
                                size={"small"}
                                disableFocusRipple
                                disableRipple
                                disableTouchRipple
                                
                              > */}
                              <SwapHorizIcon
                                className={styles.downloadIcon}
                                style={{
                                  cursor: !connected ? "default" : "pointer",
                                }}
                                onClick={() => {
                                  if (connected) {
                                    mapTemplate(el);
                                  }
                                }}
                                tabIndex={0}
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    if (connected) {
                                      mapTemplate(el);
                                    }
                                    e.stopPropagation();
                                  }
                                }}
                                id="pmweb_oms_mapTemplate"
                              />
                              {/* </IconButton> */}
                            </TemplateTooltip>
                            <TemplateTooltip
                              arrow
                              title={
                                !connected ? t("downloadError") : t("download")
                              }
                              placement={"bottom"}
                            >
                              {/* <IconButton
                                disableFocusRipple
                                disableRipple
                                disableTouchRipple
                                
                              > */}
                              <GetAppIcon
                                className={styles.downloadIcon}
                                style={{
                                  cursor: !connected ? "default" : "pointer",
                                }}
                                onClick={() => {
                                  if (connected) {
                                    downloadTemplate(el);
                                  }
                                }}
                                tabIndex={0}
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    if (connected) {
                                      downloadTemplate(el);
                                    }
                                    e.stopPropagation();
                                  }
                                }}
                                id="pmweb_oms_download"
                              />
                              {/* </IconButton> */}
                            </TemplateTooltip>
                            {!isReadOnly && (
                              <TemplateTooltip
                                arrow
                                title={"Delete"}
                                placement={"bottom"}
                              >
                                <DeleteIcon
                                  className={styles.downloadIcon}
                                  aria-label="Delete Button"
                                  onClick={() =>
                                    removeTemplateFromList(index, el)
                                  }
                                  tabIndex={0}
                                  onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                      removeTemplateFromList(index, el);
                                      e.stopPropagation();
                                    }
                                  }}
                                  id="pmweb_oms_remove"
                                />
                              </TemplateTooltip>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ) : null}
            </div>
            {props.isDrawerExpanded ? (
              <div
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.templateDetails
                    : styles.templateDetails
                }
              >
                {selectedTemplate ? (
                  <React.Fragment>
                    <p className={styles.selectedDiv}>
                      <span className={styles.subDivHeading}>
                        {selectedTemplate.ProductName} - {t("Properties")}
                      </span>
                      <span className={styles.selectedIconsDiv}>
                        <TemplateTooltip
                          arrow
                          title={
                            !connected ? t("downloadError") : t("download")
                          }
                          placement={"bottom"}
                        >
                          <IconButton
                            className={styles.expandViewIcon}
                            style={{
                              cursor: !connected ? "default" : "pointer",
                            }}
                            onClick={() => downloadTemplate(selectedTemplate)}
                            id="pmweb_oms_appIcon"
                            tabIndex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                downloadTemplate(selectedTemplate);
                                e.stopPropagation();
                              }
                            }}
                          >
                            <GetAppIcon />
                          </IconButton>
                        </TemplateTooltip>
                        {!isReadOnly && (
                          <TemplateTooltip
                            arrow
                            title={"Delete"}
                            placement={"bottom"}
                          >
                            <IconButton
                              className={styles.expandViewIcon}
                              onClick={() =>
                                removeTemplateFromList(null, selectedTemplate)
                              }
                              tabIndex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  removeTemplateFromList(
                                    null,
                                    selectedTemplate
                                  );
                                  e.stopPropagation();
                                }
                              }}
                              id="pmweb_oms_templateList_removeIcon"
                            >
                              <DeleteIcon aria-label="Delete Button" />
                            </IconButton>
                          </TemplateTooltip>
                        )}
                        <TemplateTooltip
                          arrow
                          title={"Close"}
                          placement={"bottom"}
                        >
                          <IconButton
                            inputProps={{ "aria-label": "Close Button" }}
                            className={styles.expandViewIcon}
                            onClick={() => setSelectedTemplate(null)}
                            id="pmweb_oms_selectedTemplateNull"
                            tabIndex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                setSelectedTemplate(null);
                                e.stopPropagation();
                              }
                            }}
                          >
                            <CloseIcon aria-label="Close Button" />
                          </IconButton>
                        </TemplateTooltip>
                      </span>
                    </p>
                    <TemplatePropertiesScreen
                      selectedTemplate={selectedTemplate}
                      disabled={isReadOnly}
                    />
                  </React.Fragment>
                ) : (
                  <div className={styles.noSelectedTemplateScreen}>
                    <img
                      src={emptyStatePic}
                      alt={t("noOMS_TemplateSelected")}
                    />
                    <p className={styles.noTemplateSelectedString}>
                      {t("noOMS_TemplateSelected")}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
        {showMappingModal !== null ? (
          <Modal
            show={showMappingModal !== null}
            style={{
              width: window.innerWidth < 800 ? "53vw" : "50vw",
              left: "24%",
              top: "26%",
              padding: "0",
            }}
            children={
              <MappingModal
                schemaList={schemaList}
                template={showMappingModal}
                cancelFunc={() => setShowMappingModal(null)}
                okFunc={saveMappingDetailsFunc}
                isReadOnly={isReadOnly}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    setShowMappingModal(null);
                    e.stopPropagation();
                  }
                }}
              />
            }
          />
        ) : null}
        {!props.isDrawerExpanded && selectedTemplate ? (
          <Modal
            show={!props.isDrawerExpanded && selectedTemplate}
            style={{
              width: "50vw",
              left: "24%",
              top: "21.5%",
              padding: "0",
            }}
            modalClosed={() => setSelectedTemplate(null)}
            children={
              <PropertiesModal
                selectedTemplate={selectedTemplate}
                okFunc={() => setSelectedTemplate(null)}
                cancelFunc={() => setSelectedTemplate(null)}
                isReadOnly={isReadOnly}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    setSelectedTemplate(null);
                    e.stopPropagation();
                  }
                }}
              />
            }
          />
        ) : null}
      </div>
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
export default connect(mapStateToProps, null)(TemplateProperties);
