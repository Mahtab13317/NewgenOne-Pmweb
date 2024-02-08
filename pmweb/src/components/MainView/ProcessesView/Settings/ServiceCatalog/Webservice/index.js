import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import Filter from "../../../../../../assets/Tiles/Filter.svg";
import SearchComponent from "../../../../../../UI/Search Component/index";
import Tab from "../../../../../../UI/Tab/Tab";
import { useTranslation } from "react-i18next";
import "../index.css";
import WebServiceDefinition from "./Definition/Definition";
import ProcessAssociation from "./ProcessAssociation";
import { Grid, Typography } from "@material-ui/core";
import {
  DEFAULT_GLOBAL_ID,
  ENDPOINT_GET_WEBSERVICE,
  GLOBAL_SCOPE,
  LOCAL_SCOPE,
  SERVER_URL,
  WEBSERVICE_SOAP,
  WEBSERVICE_REST,
  STATE_ADDED,
  STATE_EDITED,
  STATE_CREATED,
  ENDPOINT_SAVE_WEBSERVICE,
  DELETE_CONSTANT,
  ADD_CONSTANT,
  MODIFY_CONSTANT,
  RTL_DIRECTION,
  ENDPOINT_PROCESS_ASSOCIATION,
  DEFAULT_GLOBAL_TYPE,
  ENDPOINT_SAVE_REST_WEBSERVICE,
  BASIC_AUTH,
  TOKEN_BASED_AUTH,
  ERROR_MANDATORY,
  ERROR_INCORRECT_FORMAT,
  DOMAIN_DROPDOWN,
  APP_HEADER_HEIGHT,
} from "../../../../../../Constants/appConstants";
import WebserviceList from "./WebserviceList";
import axios from "axios";
import { connect, useDispatch, useSelector } from "react-redux";
import { setToastDataFunc } from "../../../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
} from "@material-ui/core";
import {
  getAuthenticationType,
  getMaxMemDS,
  getMemberMap,
} from "../../../../../../utility/ServiceCatalog/Webservice";
import Modal from "../../../../../../UI/Modal/Modal";
import ObjectDependencies from "../../../../../../UI/ObjectDependencyModal";
import { store, useGlobalState } from "state-pool";
import NoWebServiceScreen from "./NoWebServiceScreen";
import DeleteWebserviceModal from "./DeleteModal";
import { validateRegex } from "../../../../../../validators/validator";
import { containsText } from "../../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { useMediaQuery } from "@material-ui/core";

function Webservice(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [webServiceList, setWebServiceList] = useState([]);
  const [spinner, setspinner] = useState(true);
  const [selected, setSelected] = useState(null);
  const [processAssociation, setProcessAssociation] = useState(null);
  const [changedSelection, setChangedSelection] = useState(null);
  const [error, setError] = useState({});
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  //code added on 16 June 2022 for BugId 110949
  const [maxSoapCount, setMaxSoapCount] = useState(0);
  const [maxRestCount, setMaxRestCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredWebserviceList, setFilteredWebserviceList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    SOAP: false,
    REST: false,
    BPM: false,
    ECM: false,
    CCM: false,
    BRMS: false,
    SAP: false,
    AI_CLOUD: false,
  });
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  console.log("InnerHeight", windowInnerHeight);
  const CheckedRefSoap = useRef();
  const CheckedRefRest = useRef();
  const CheckedRefEl = useRef([]);
  // const smallScreen =  useMediaQuery("(max-width: 999px");
  const subMainTabElements = [
    <WebServiceDefinition
      {...props}
      selected={selected}
      setChangedSelection={setChangedSelection}
      setSelected={setSelected}
      error={error}
      setError={setError}
      isScreenReadOnly={
        (props.scope !== GLOBAL_SCOPE &&
          ((selected?.webserviceType === WEBSERVICE_SOAP &&
            selected?.MethodType === GLOBAL_SCOPE) ||
            (selected?.webserviceType === WEBSERVICE_REST &&
              selected?.RestScopeType === GLOBAL_SCOPE))) ||
        props.isReadOnly
      }
      scope={props?.scope}
    />,
    <ProcessAssociation {...props} processAssociation={processAssociation} />,
  ];
  const subMainTabLabels = [t("definition"), t("ProcessAssociation")];
  const smallScreen = useMediaQuery("(max-width:1282px)");
  const smallScreen2 = useMediaQuery("(max-width:810px)");
  const smallScreen3 = useMediaQuery("(max-width: 999px");
  useEffect(() => {
    // code edited on 7 Nov 2022 for BugId 116221
    if (
      (props.scope !== GLOBAL_SCOPE && localLoadedProcessData?.ProcessDefId) ||
      props.scope === GLOBAL_SCOPE
    ) {
      axios
        .get(
          SERVER_URL +
            ENDPOINT_GET_WEBSERVICE +
            `${
              props.scope === GLOBAL_SCOPE
                ? DEFAULT_GLOBAL_ID
                : localLoadedProcessData?.ProcessDefId
            }`
        )
        .then((res) => {
          if (res.data.Status === 0) {
            setspinner(false);
            let methods = { ...res.data.Methods };
            let totalMethods = [];
            methods?.Webservice?.forEach((val) => {
              totalMethods.push({
                ...val,
                webserviceType: WEBSERVICE_SOAP,
                status: STATE_ADDED,
              });
            });
            methods?.RESTMethods?.forEach((val) => {
              totalMethods.push({
                ...val,
                webserviceType: WEBSERVICE_REST,
                status: STATE_ADDED,
              });
            });
            setWebServiceList(totalMethods);
            setFilteredWebserviceList(totalMethods);
            //code added on 16 June 2022 for BugId 110949
            setMaxSoapCount(methods.MaxSOAPGlblMethodIndex);
            setMaxRestCount(methods.MaxRestMethodIndex);
            if (totalMethods?.length > 0 && !selected) {
              selectionFunc(totalMethods[0]);
            }
          } else {
            setspinner(false);
            dispatch(
              setToastDataFunc({
                message: `${res.data.Message}`,
                severity: "error",
                open: true,
              })
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    setspinner(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  const addNewWebservice = () => {
    let temp = [...webServiceList];
    let indexVal;
    //to remove existing temporary webservice from list, before adding new temporary webservice
    temp?.forEach((webS, index) => {
      if (webS.status && webS.status === STATE_CREATED) {
        indexVal = index;
      }
    });
    if (indexVal >= 0) {
      temp.splice(indexVal, 1);
    }
    temp.splice(0, 0, {
      AliasName: t("newWebservice"),
      webserviceType: WEBSERVICE_SOAP,
      status: STATE_CREATED,
    });
    setSelected(temp[0]);
    setWebServiceList(temp);
    // code added on 6 Dec 2022 for BugId 111015
    applyFilterFunc(temp);
    // code added on 14 Nov 2022 for BugId 110816
    setError({});
  };

  const cancelAddWebservice = () => {
    let temp = [...webServiceList];
    temp.splice(0, 1);
    setSelected(temp[0]);
    setWebServiceList(temp);
    // code added on 6 Dec 2022 for BugId 111015
    applyFilterFunc(temp);
  };

  const cancelEditWebservice = () => {
    let tempSelected = null;
    webServiceList.forEach((item) => {
      if (+item.MethodIndex === +selected.MethodIndex) {
        tempSelected = {
          ...item,
          webserviceType: selected.webserviceType,
          status: STATE_ADDED,
        };
      }
    });
    setSelected(tempSelected);
  };

  const validateSOAP = (status) => {
    let hasError = false;
    if (status === ADD_CONSTANT) {
      // code added on 14 Nov 2022 for BugId 110816
      if (
        !changedSelection?.wsdl_url ||
        changedSelection?.wsdl_url?.trim() === ""
      ) {
        setError({
          wsdl_url: {
            statement: t("PleaseEnter") + " " + t("WSDLPath"),
            severity: "error",
            errorType: ERROR_MANDATORY,
          },
        });
        hasError = true;
      } else if (
        // Modified on 20-09-23 for Bug 137828
        !validateRegex(changedSelection.wsdl_url?.toLowerCase(), `\\?wsdl$`)
        // Till here for Bug 137828
      ) {
        setError({
          wsdl_url: {
            statement: t("WSDL_URL") + " " + t("isIncorrect"),
            severity: "error",
            errorType: ERROR_INCORRECT_FORMAT,
          },
        });
        hasError = true;
      } else {
        //code added on 25 July 2022 for BugId 112018
        webServiceList
          ?.filter(
            (el) =>
              el.webserviceType === WEBSERVICE_SOAP && el.status === STATE_ADDED
          )
          ?.forEach((item) => {
            if (item.MethodName === changedSelection.methodName.methodName) {
              if (item.AppName === changedSelection.webServiceName) {
                dispatch(
                  setToastDataFunc({
                    message: `${t("MethodAlreadyRegistered")}`,
                    severity: "error",
                    open: true,
                  })
                );
                hasError = true;
              }
            }
          });
      }
    }
    return !hasError;
  };

  const validateREST = () => {
    let errorObj = {},
      hasError = false;

    if (
      !changedSelection?.methodName ||
      changedSelection?.methodName?.trim() === ""
    ) {
      errorObj = {
        ...errorObj,
        methodName: {
          statement: t("PleaseEnter") + " " + t("method") + " " + t("name"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
      hasError = true;
    }
    if (
      !changedSelection?.baseUri ||
      changedSelection?.baseUri?.trim() === ""
    ) {
      errorObj = {
        ...errorObj,
        baseUri: {
          statement: t("PleaseEnter") + " " + t("BaseURI"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
      hasError = true;
    }

    if (hasError) {
      setError({ ...errorObj });
    }
    return !hasError;
  };

  const getSOAPJSON = (statusConstant) => {
    let methodIndex;
    //code added on 16 June 2022 for BugId 110949
    if (selected?.status === STATE_CREATED) {
      if (props.scope === GLOBAL_SCOPE) {
        methodIndex = +maxSoapCount + 1;
      } else {
        methodIndex = +localLoadedProcessData.MaxMethodIndex + 1;
      }
    } else {
      methodIndex = selected.MethodIndex;
    }
    let dataStructureList = changedSelection?.methodName?.dataStructure?.map(
      (ds) => {
        return {
          structName: ds.Name,
          dataStructureId: ds.DataStructureId,
          structType: ds.Type,
          parentIndex: ds.ParentIndex,
          className: ds.ClassName,
          unbounded: ds.Unbounded,
        };
      }
    );
    let paramList = changedSelection?.methodName?.param?.map((pl) => {
      return {
        paramName: pl.ParamName,
        paramType: pl.ParamType,
        paramIndex: pl.ParamIndex,
        unbounded: pl.Unbounded,
        dataStructureId: pl.DataStructureId,
        paramScope: pl.ParamScope,
      };
    });
    return [
      {
        m_strSOAPGlblFlag: props.scope,
        methodName: changedSelection.methodName.methodName,
        methodIndex: methodIndex,
        returnType: changedSelection.methodName.returnType,
        appName: changedSelection.webServiceName,
        appType: changedSelection.methodName.appType,
        wsdlLocation: changedSelection.wsdl_url,
        aliasName: changedSelection.alias,
        selectedDomain: changedSelection.domain,
        wsDescription: changedSelection.description,
        dataStructureList: dataStructureList,
        paramList: paramList,
        status: statusConstant,
      },
    ];
  };

  const getSOAPObject = (json) => {
    return {
      AliasName: changedSelection.alias,
      AppName: changedSelection.webServiceName,
      AppType: changedSelection.methodName.appType,
      DataStructure: changedSelection?.methodName.dataStructure,
      Description: changedSelection.description,
      Domain: changedSelection.domain,
      MethodIndex: json.wsMethodList[0].methodIndex,
      MethodName: changedSelection.methodName.methodName,
      MethodType: props.scope,
      Parameter: changedSelection?.methodName.param,
      ReturnType: changedSelection.methodName.returnType,
      WSDLLocation: changedSelection.wsdl_url,
    };
  };

  const getRESTJSON = (statusConstant) => {
    let methodIndex,
      parametersMap = {},
      reqBodyMap = {},
      resBodyMap = {},
      authDataList = [];
    //code added on 16 June 2022 for BugId 110949
    if (selected?.status === STATE_CREATED) {
      if (props.scope === GLOBAL_SCOPE) {
        methodIndex = +maxRestCount + 1;
      } else {
        methodIndex = +localLoadedProcessData.MaxRestMethodIndex + 1;
      }
    } else {
      methodIndex = selected.MethodIndex;
    }
    changedSelection?.InputParameters?.forEach((el) => {
      parametersMap = {
        ...parametersMap,
        [el.ParamName]: {
          typeName: el.ParamName,
          m_iDataStructureId: el.DataStructureId,
          m_iParentTypeId: el.ParentID,
          sPramScope: el.ParamScope,
          extTypeId: el.ParamType,
          m_sUnbounded: el.Unbounded,
        },
      };
    });

    changedSelection?.ReqBodyParameters?.forEach((el) => {
      reqBodyMap = {
        ...reqBodyMap,
        [el.ParamName]: {
          typeName: el.ParamName,
          m_iDataStructureId: el.DataStructureId,
          m_iParentTypeId: el.ParentID,
          sPramScope: el.ParamScope,
          extTypeId: el.ParamType,
          m_sUnbounded: el.Unbounded,
          m_sIsNested: el.IsNested,
          memberMap: getMemberMap(el?.Member),
        },
      };
    });

    changedSelection?.ResBodyParameters?.forEach((el) => {
      resBodyMap = {
        ...resBodyMap,
        [el.ParamName]: {
          typeName: el.ParamName,
          m_iDataStructureId: el.DataStructureId,
          m_iParentTypeId: el.ParentID,
          sPramScope: el.ParamScope,
          extTypeId: el.ParamType,
          m_sUnbounded: el.Unbounded,
          m_sIsNested: el.IsNested,
          memberMap: getMemberMap(el?.Member),
        },
      };
    });

    authDataList = changedSelection?.dataList?.map((el) => {
      return {
        m_sParamName: el.ParamName,
        m_sParamScope: el.style,
        m_sParamType: el.mappedType,
        m_sDeffaultVal: el.Value,
      };
    });

    // code edited on 1 Nov 2022 for BugId 111880
    return statusConstant === DELETE_CONSTANT
      ? methodIndex
      : [
          {
            m_strRESTMethodScope: props.scope,
            m_strBaseUri: changedSelection.baseUri,
            m_sMethodName: changedSelection.methodName,
            m_strResourcePath: changedSelection.resourcePath,
            m_strSelectedOperationType: changedSelection.operationType,
            m_strRequestMediaType: changedSelection.reqMediaType,
            m_strResponseMediaType: changedSelection.resMediaType,
            m_strAuthenticationType: getAuthenticationType(
              changedSelection.authType
            ),
            m_sAuthUserName:
              changedSelection.authType === BASIC_AUTH
                ? changedSelection.username
                : null,
            m_sAuthCred:
              changedSelection.authType === BASIC_AUTH
                ? // modified on 31/10/23 for checkmarx -- client privacy violation
                  // changedSelection.password
                  changedSelection.authCred
                : null,
            m_strAuthURL:
              changedSelection.authType === TOKEN_BASED_AUTH
                ? changedSelection.authUrl
                : null,
            m_strAuthOperationType:
              changedSelection.authType === TOKEN_BASED_AUTH
                ? changedSelection.authOperation
                : null,
            m_strAuthRequestMediaType:
              changedSelection.authType === TOKEN_BASED_AUTH
                ? changedSelection.reqType
                : null,
            m_strAuthResponseMediaType:
              changedSelection.authType === TOKEN_BASED_AUTH
                ? changedSelection.resType
                : null,
            m_arrAuthDataList:
              changedSelection.authType === TOKEN_BASED_AUTH
                ? authDataList
                : null,
            m_iMethodIndex: methodIndex,
            aliasName: changedSelection.alias,
            selectedDomain: changedSelection.domain,
            wsDescription: changedSelection.description,
            m_bBRMSEnabled: changedSelection.brmsEnabled,
            m_strPrxyEnabled: changedSelection.proxyEnabled ? "Y" : "N",
            primitiveNestedMap: parametersMap,
            reqParamNestedMap: reqBodyMap,
            respParamNestedMap: resBodyMap,
            operation: statusConstant,
            //restCreationMode: changedSelection.restCreationMode
          },
        ];
  };

  const getRESTObj = (json) => {
    let maxDataId = 0;
    // code added on 1 Dec 2022 for BugId 119996 and edited on 13 June 2023
    maxDataId = getMaxMemDS(changedSelection?.InputParameters, maxDataId);
    maxDataId = getMaxMemDS(changedSelection?.ReqBodyParameters, maxDataId);
    maxDataId = getMaxMemDS(changedSelection?.ResBodyParameters, maxDataId);
    return {
      AliasName: changedSelection.alias,
      Description: changedSelection.description,
      Domain: changedSelection.domain,
      MethodIndex: json.wsRESTMethodList[0].m_iMethodIndex, // code edited on 29 Nov 2022 for BugId 111880
      AuthenticationType: getAuthenticationType(changedSelection.authType),
      UserName:
        changedSelection.authType === BASIC_AUTH
          ? changedSelection.username
          : null,
      // modified on 05/12/23 for checkmarx -- client privacy violation
      // Password:
      AuthCred:
        changedSelection.authType === BASIC_AUTH
          ? // modified on 31/10/23 for checkmarx -- client privacy violation
            // changedSelection.password
            changedSelection.authCred
          : null,
      AuthorizationURL:
        changedSelection.authType === TOKEN_BASED_AUTH
          ? changedSelection.authUrl
          : null,
      AuthOperationType:
        changedSelection.authType === TOKEN_BASED_AUTH
          ? changedSelection.authOperation
          : null,
      RequestType:
        changedSelection.authType === TOKEN_BASED_AUTH
          ? changedSelection.reqType
          : null,
      ResponseType:
        changedSelection.authType === TOKEN_BASED_AUTH
          ? changedSelection.resType
          : null,
      ParamMapping:
        changedSelection.authType === TOKEN_BASED_AUTH
          ? changedSelection.dataList
          : null,
      BRMSEnabled: changedSelection.brmsEnabled,
      BaseURI: changedSelection.baseUri,
      InputParameters: {
        PrimitiveComplexType: changedSelection?.InputParameters
          ? [...changedSelection.InputParameters]
          : [],
      },
      MethodName: changedSelection.methodName,
      OperationType: changedSelection.operationType,
      ProxyEnabled: changedSelection.proxyEnabled ? "Y" : "N",
      RequestBodyParameters: {
        NestedReqComplexType: changedSelection?.ReqBodyParameters
          ? [...changedSelection.ReqBodyParameters]
          : [],
      },
      RequestMediaType: changedSelection.reqMediaType,
      ResourcePath: changedSelection.resourcePath,
      ResponseBodyParameters: {
        NestedResComplexType: changedSelection?.ResBodyParameters
          ? [...changedSelection.ResBodyParameters]
          : [],
      },
      ResponseMediaType: changedSelection.resMediaType,
      RestCreationMode: changedSelection.restCreationMode,
      MaxDataStructId: maxDataId, // code added on 1 Dec 2022 for BugId 119996
      RestScopeType: props.scope,
    };
  };

  const checkDependencies = () => {
    if (processAssociation?.length === 0) {
      return true;
    } else {
      setShowDeleteModal(false);
      setShowDependencyModal(true);
      return false;
    }
  };

  const handleWebservice = (statusConstant) => {
    let isValid = null;
    isValid =
      statusConstant === DELETE_CONSTANT
        ? checkDependencies()
        : changedSelection.webserviceType === WEBSERVICE_SOAP
        ? validateSOAP(statusConstant)
        : validateREST();
    if (isValid) {
      let json = {};
      if (changedSelection.webserviceType === WEBSERVICE_SOAP) {
        json = {
          processDefId: `${
            props.scope === GLOBAL_SCOPE
              ? DEFAULT_GLOBAL_ID
              : props.openProcessID
          }`,
          wsMethodList: getSOAPJSON(statusConstant),
        };
      } else {
        // code edited on 1 Nov 2022 for BugId 111880
        json =
          statusConstant === DELETE_CONSTANT
            ? {
                processDefId: `${
                  props.scope === GLOBAL_SCOPE
                    ? DEFAULT_GLOBAL_ID
                    : props.openProcessID
                }`,
                m_strDeletedRestMethodIndexs: getRESTJSON(statusConstant),
              }
            : {
                processDefId: `${
                  props.scope === GLOBAL_SCOPE
                    ? DEFAULT_GLOBAL_ID
                    : props.openProcessID
                }`,
                wsRESTMethodList: getRESTJSON(statusConstant),
              };
      }
      axios
        .post(
          SERVER_URL +
            `${
              changedSelection.webserviceType === WEBSERVICE_SOAP
                ? ENDPOINT_SAVE_WEBSERVICE
                : ENDPOINT_SAVE_REST_WEBSERVICE
            }`,
          json
        )
        .then((res) => {
          if (res.data.Status === 0) {
            let tempWebService = [...webServiceList];
            if (statusConstant === ADD_CONSTANT) {
              let newObj =
                changedSelection.webserviceType === WEBSERVICE_SOAP
                  ? getSOAPObject(json)
                  : getRESTObj(json);
              // code edited on 14 Dec 2022 for BugId 120431
              newObj = {
                ...newObj,
                MethodIndex:
                  changedSelection.webserviceType === WEBSERVICE_SOAP
                    ? newObj.MethodIndex
                    : res.data.MethodIndex,
              };
              tempWebService[0] = {
                ...newObj,
                webserviceType: changedSelection.webserviceType,
                status: STATE_ADDED,
              };
              setSelected((prev) => {
                let temp = { ...prev, ...newObj };
                temp.status = STATE_ADDED;
                temp.webserviceType = changedSelection.webserviceType;
                return temp;
              });
              //code added on 16 June 2022 for BugId 110949
              if (changedSelection.webserviceType === WEBSERVICE_SOAP) {
                if (props.scope === GLOBAL_SCOPE) {
                  setMaxSoapCount((prev) => {
                    return prev + 1;
                  });
                } else {
                  let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
                  temp.MaxMethodIndex = temp.MaxMethodIndex + 1;
                  setlocalLoadedProcessData(temp);
                }
              } else {
                // code edited on 14 Dec 2022 for BugId 120431
                if (props.scope === GLOBAL_SCOPE) {
                  setMaxRestCount(res.data.MethodIndex);
                } else {
                  let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
                  temp.MaxRestMethodIndex = res.data.MethodIndex;
                  setlocalLoadedProcessData(temp);
                }
              }
              // code added on 1 Dec 2022 for BugId 111101
              dispatch(
                setToastDataFunc({
                  message: t("webserviceAdded"),
                  severity: "success",
                  open: true,
                })
              );
            } else if (statusConstant === DELETE_CONSTANT) {
              webServiceList.forEach((element) => {
                if (element.MethodIndex === selected.MethodIndex) {
                  tempWebService.splice(tempWebService.indexOf(element), 1);
                }
              });
              // code added on 21 June 2022 for BugId 111023
              if (tempWebService?.length > 0) {
                setSelected(tempWebService[0]);
              } else {
                setSelected(null);
              }
              dispatch(
                setToastDataFunc({
                  message: t("webserviceDeleted"),
                  severity: "success",
                  open: true,
                })
              );
            } else if (statusConstant === MODIFY_CONSTANT) {
              let newObj =
                changedSelection.webserviceType === WEBSERVICE_SOAP
                  ? getSOAPObject(json)
                  : getRESTObj(json);
              webServiceList.forEach((element, index) => {
                if (element.MethodIndex === selected.MethodIndex) {
                  tempWebService[index] = {
                    ...newObj,
                    webserviceType: changedSelection.webserviceType,
                    status: STATE_ADDED,
                  };
                }
              });
              setSelected((prev) => {
                let temp = { ...prev, ...newObj };
                temp.status = STATE_ADDED;
                return temp;
              });
              // code added on 1 Dec 2022 for BugId 111101
              dispatch(
                setToastDataFunc({
                  message: t("webserviceModified"),
                  severity: "success",
                  open: true,
                })
              );
            }
            setWebServiceList(tempWebService);
            // code added on 6 Dec 2022 for BugId 111015
            applyFilterFunc(tempWebService);
          }
        });
    }
  };

  const selectionFunc = (item) => {
    setSelected(item);
    if (item.status !== STATE_CREATED) {
      // code edited on 24 Jan 2023 for BugId 122659
      let payload = {
        processId:
          props.scope === GLOBAL_SCOPE
            ? DEFAULT_GLOBAL_ID
            : localLoadedProcessData?.ProcessDefId,
        processType:
          props.scope === GLOBAL_SCOPE
            ? DEFAULT_GLOBAL_TYPE
            : localLoadedProcessData?.ProcessType,
        objectName: item.MethodName,
        objectId: item.MethodIndex,
        wsType: item.webserviceType === WEBSERVICE_SOAP ? "Soap" : "Rest",
        deviceType: "D",
      };
      axios
        .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
        .then((res) => {
          if (res.data.Status === 0) {
            setProcessAssociation(res.data.Validations);
          }
        });
    } else {
      setProcessAssociation([]);
    }
  };

  const filterFunc = (checked, name) => {
    setFilters((prev) => {
      return { ...prev, [name]: checked };
    });
  };

  // code added on 6 Dec 2022 for BugId 111015
  const applyFilterFunc = (webList) => {
    let tempList = [...webList];
    let filterCount = Object.keys(filters)?.filter(
      (el) => filters[el] === true
    )?.length;
    if (filterCount > 0) {
      if (filters["SOAP"] && !filters["REST"]) {
        tempList = tempList?.filter(
          (el) =>
            el.webserviceType === WEBSERVICE_SOAP || el.status === STATE_CREATED
        );
      }
      if (filters["REST"] && !filters["SOAP"]) {
        tempList = tempList?.filter(
          (el) =>
            el.webserviceType === WEBSERVICE_REST || el.status === STATE_CREATED
        );
      }

      if (
        filters["BPM"] ||
        filters["ECM"] ||
        filters["CCM"] ||
        filters["BRMS"] ||
        filters["SAP"] ||
        filters["AI_CLOUD"]
      ) {
        tempList = tempList?.filter(
          (el) => filters[el.Domain] === true || el.status === STATE_CREATED
        );
      }
    }

    setFilteredWebserviceList(tempList);
    setFilterCount(filterCount);
    setShowFilters(false);
  };

  // code added on 6 Dec 2022 for BugId 111014
  const filteredRows = filteredWebserviceList?.filter(
    (el) =>
      containsText(el.AliasName, searchTerm) ||
      containsText(el.MethodName, searchTerm) ||
      el.status === STATE_CREATED
  );

  return (
    <div
      className={styles.mainWrappingDiv}
      style={
        props.scope === LOCAL_SCOPE
          ? props.callLocation === "webServicePropTab"
            ? { ...props.style, height: "68vh" }
            : { ...props.style, height: "84.84vh" }
          : { ...props.style }
      }
    >
      {spinner ? (
        <CircularProgress
          style={
            direction === RTL_DIRECTION
              ? { marginTop: "30vh", marginRight: "50%" }
              : { marginTop: "30vh", marginLeft: "50%" }
          }
        />
      ) : (
        <React.Fragment>
          {webServiceList?.length > 0 ? (
            <React.Fragment>
              {/* Changes on 07-09-2023 to resolve he bug Id 134119 */}
              <div
                className={styles.mainDiv}
                style={
                  props.scope === LOCAL_SCOPE
                    ? {
                        height: `${
                          props.callLocation === "webServicePropTab"
                            ? "60vh"
                            : // Changes to resolve the bug Id 134119
                            smallScreen2
                            ? "73vh"
                            : smallScreen
                            ? "63vh"
                            : "71vh"
                        }`,
                      }
                    : {
                        // changes added for bug_id: 134226
                        height: smallScreen3
                          ? `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 11.7rem)`
                          : `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 8.2rem)`,
                      }
                }
              >
                <Grid
                  container
                  xs={12}
                  spacing={1}
                  justifyContent="space-between"
                >
                  <Grid item xs={6} md={5}>
                    <div className={styles.listDiv}>
                      <div className={styles.listHeader}>
                        <p
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.listHeading
                              : styles.listHeading
                          }
                        >
                          {t("webService")} {t("List")}
                        </p>
                        {!props.isReadOnly && (
                          <>
                            <span
                              style={{ display: "none" }}
                              id="AddBtn"
                            ></span>
                            <button
                              className={styles.secondaryBtn}
                              onClick={addNewWebservice}
                              id="pmweb_webS_addNewBtn"
                              role="button"
                              aria-label="Add New Webservice Button"
                              aria-aria-describedby="AddBtn"
                            >
                              {t("addWithPlusIcon")} {t("New")}
                            </button>
                          </>
                        )}
                      </div>
                      <div className={styles.searchHeader}>
                        <div style={{ flex: "1" }}>
                          <SearchComponent
                            width="90%"
                            height="var(--line_height)"
                            onSearchChange={(val) => setSearchTerm(val)}
                            clearSearchResult={() => setSearchTerm("")}
                          />
                        </div>
                        <div className="relative">
                          <img
                            alt="filter"
                            src={Filter}
                            id="pmweb_webS_List_filter"
                            className={styles.filterIcon}
                            onClick={() => setShowFilters(true)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setShowFilters(true);
                                e.stopPropagation();
                              }
                            }}
                          />
                          {/*code added on 6 Dec 2022 for BugId 111015 */}
                          {filterCount > 0 && (
                            <span className={styles.filterCount}>
                              {filterCount}
                            </span>
                          )}
                          {/*code added on 6 Dec 2022 for BugId 111015 */}
                          {showFilters && (
                            <div
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.filterDiv
                                  : styles.filterDiv
                              }
                            >
                              <div className={styles.filterDivHeader}>
                                <span className={styles.filterHeading}>
                                  {t("Filters")}
                                </span>
                                {Object.keys(filters)?.filter(
                                  (el) => filters[el] === true
                                )?.length > 0 && (
                                  <span
                                    className={styles.filterClearBtn}
                                    onClick={() => {
                                      setFilters({
                                        SOAP: false,
                                        REST: false,
                                        BPM: false,
                                        ECM: false,
                                        CCM: false,
                                        BRMS: false,
                                        SAP: false,
                                        AI_CLOUD: false,
                                      });
                                    }}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        setFilters({
                                          SOAP: false,
                                          REST: false,
                                          BPM: false,
                                          ECM: false,
                                          CCM: false,
                                          BRMS: false,
                                          SAP: false,
                                          AI_CLOUD: false,
                                        });
                                        e.stopPropagation();
                                      }
                                    }}
                                    id="pmweb_webS_List_filter_clear"
                                  >
                                    {t("clear")}
                                  </span>
                                )}
                              </div>
                              <div
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.filterMainBody
                                    : styles.filterMainBody
                                }
                              >
                                <label>{t("webServiceType")}</label>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={filters["SOAP"]}
                                      ref={CheckedRefSoap}
                                      onChange={(e) => {
                                        filterFunc(e.target.checked, "SOAP");
                                      }}
                                      onKeyUp={(e) => {
                                        if (e.key === "Enter") {
                                          CheckedRefSoap.current.click();
                                          e.stopPropagation();
                                        }
                                      }}
                                      id="pmweb_webS_List_filter_SOAP"
                                    />
                                  }
                                  className={`${
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.webS_radioButton
                                      : styles.webS_radioButton
                                  } block`}
                                  label={t("SOAP")}
                                  style={{ marginTop: "0.25rem" }}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={filters["REST"]}
                                      onChange={(e) => {
                                        filterFunc(e.target.checked, "REST");
                                      }}
                                      id="pmweb_webS_List_filter_REST"
                                      ref={CheckedRefRest}
                                      onKeyUp={(e) => {
                                        if (e.key === "Enter") {
                                          CheckedRefRest.current.click();
                                          e.stopPropagation();
                                        }
                                      }}
                                    />
                                  }
                                  className={`${
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.webS_radioButton
                                      : styles.webS_radioButton
                                  } block`}
                                  label={t("REST")}
                                  style={{ marginTop: "0.25rem" }}
                                />
                                <label style={{ marginTop: "0.75rem" }}>
                                  {t("DomainType")}
                                </label>
                                {DOMAIN_DROPDOWN?.map((el, index) => {
                                  return (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={filters[el]}
                                          onChange={(e) => {
                                            filterFunc(e.target.checked, el);
                                          }}
                                          id={`pmweb_webS_List_filter_${el}`}
                                          ref={(item) =>
                                            (CheckedRefEl.current[index] = item)
                                          }
                                          tabIndex={0}
                                          onKeyUp={(e) => {
                                            if (e.key === "Enter") {
                                              CheckedRefEl.current[
                                                index
                                              ].click();
                                              // filterFunc(e.target.checked , el);
                                              e.stopPropagation();
                                            }
                                          }}
                                        />
                                      }
                                      className={`${
                                        direction === RTL_DIRECTION
                                          ? arabicStyles.webS_radioButton
                                          : styles.webS_radioButton
                                      } block`}
                                      label={t(el)}
                                      style={{ marginTop: "0.25rem" }}
                                    />
                                  );
                                })}
                              </div>
                              <div
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.filterDivFooter
                                    : styles.filterDivFooter
                                }
                              >
                                <button
                                  className={styles.filterCancelBtn}
                                  onClick={() => {
                                    setShowFilters(false);
                                  }}
                                  id="pmweb_webS_List_filter_Cancel"
                                >
                                  {t("cancel")}
                                </button>
                                <button
                                  className={styles.filterApplyBtn}
                                  onClick={() =>
                                    applyFilterFunc(webServiceList)
                                  }
                                  id="pmweb_webS_List_filter_Apply"
                                >
                                  {t("apply")}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {filteredRows?.length > 0 ? (
                        <WebserviceList
                          list={filteredRows} // code added on 6 Dec 2022 for BugId 111015
                          selected={selected}
                          selectionFunc={selectionFunc}
                          scope={props.scope}
                          callLocation={props.callLocation}
                        />
                      ) : webServiceList?.length > 0 ? (
                        // changes to resolve the bug Id 139635
                        <Typography style={{ padding: "0 0.75vw 0" }}>
                          {t("noSearchResult")}
                        </Typography> //Code Added For Bug 135965  We have added typography and give padding to align text properly
                      ) : null}
                    </div>
                  </Grid>
                  <Grid item xs={6} md={7}>
                    <div className={styles.formDiv}>
                      <Tab
                        tabType={`${styles.subMainTab} subMainTab_sc`}
                        tabBarStyle={styles.subMainTabBarStyle}
                        oneTabStyle={`${
                          direction === RTL_DIRECTION
                            ? arabicStyles.subMainOneTabStyle
                            : styles.subMainOneTabStyle
                        } subMainOneTabStyle_sc`}
                        tabContentStyle={
                          direction === RTL_DIRECTION
                            ? arabicStyles.subMainTabContentStyle
                            : styles.subMainTabContentStyle
                        }
                        TabNames={subMainTabLabels}
                        TabElement={subMainTabElements}
                      />
                    </div>
                  </Grid>
                </Grid>
              </div>
              {console.log(
                "@@@",
                "WEBSERVICE DATA",
                selected,
                "props",
                props.scope
              )}
              {props.scope === GLOBAL_SCOPE ||
              (props.scope !== GLOBAL_SCOPE &&
                ((selected?.webserviceType === WEBSERVICE_SOAP &&
                  selected?.MethodType !== GLOBAL_SCOPE) ||
                  (selected?.webserviceType === WEBSERVICE_REST &&
                    selected?.RestScopeType !== GLOBAL_SCOPE)) &&
                !props.isReadOnly) ? (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.footer
                      : styles.footer
                  }
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      display: "flex",
                    }}
                  >
                    {selected?.status === STATE_ADDED ? (
                      <button
                        className={`${styles.cancelBtn} ${styles.pd025}`}
                        onClick={() => setShowDeleteModal(true)}
                        id="pmweb_webS_deleteBtn"
                      >
                        {t("delete")}
                      </button>
                    ) : selected?.status === STATE_EDITED ? (
                      <React.Fragment>
                        <button
                          className={`${styles.cancelBtn} ${styles.pd025}`}
                          onClick={cancelEditWebservice}
                          id="pmweb_webS_discardBtn"
                        >
                          {t("discard")}
                        </button>
                        <button
                          className={`${styles.primaryBtn} ${styles.pd025}`}
                          onClick={() => handleWebservice(MODIFY_CONSTANT)}
                          id="pmweb_webS_saveChangeBtn"
                        >
                          {t("saveChanges")}
                        </button>
                      </React.Fragment>
                    ) : selected?.status === STATE_CREATED ? (
                      <React.Fragment>
                        <button
                          className={`${styles.cancelBtn} ${styles.pd025}`}
                          onClick={cancelAddWebservice}
                          id="pmweb_webS_discardAddBtn"
                        >
                          {t("discard")}
                        </button>
                        <button
                          className={`${styles.primaryBtn} ${styles.pd025}`}
                          onClick={() => handleWebservice(ADD_CONSTANT)}
                          id="pmweb_webS_addBtn"
                        >
                          {t("addWebservice")}
                        </button>
                      </React.Fragment>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.footer
                      : styles.footer
                  }
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      display: "flex",
                    }}
                  >
                    <button
                      className={`${styles.cancelBtn} ${styles.pd025}`}
                      id="pmweb_webS_deleteBtn"
                      style={{ opacity: "0" }} //Modified on 07/09/2023, bug_id:135971
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ) : (
            <NoWebServiceScreen addNewWebservice={addNewWebservice} />
          )}
        </React.Fragment>
      )}
      {showDependencyModal ? (
        <Modal
          show={showDependencyModal}
          style={{
            width: "45vw",
            left: "28%",
            top: "21.5%",
            padding: "0px",
          }}
          modalClosed={() => setShowDependencyModal(false)}
          children={
            <ObjectDependencies
              {...props}
              processAssociation={processAssociation}
              cancelFunc={() => setShowDependencyModal(false)}
            />
          }
        />
      ) : null}
      {showDeleteModal ? (
        <Modal
          show={showDeleteModal}
          style={{
            width: "30vw",
            left: "37%",
            top: "35%",
            padding: "0",
          }}
          modalClosed={() => setShowDeleteModal(false)}
          children={
            <DeleteWebserviceModal
              deleteFunc={() => {
                setShowDeleteModal(false);
                handleWebservice(DELETE_CONSTANT);
              }}
              setModalClosed={() => setShowDeleteModal(false)}
              elemToBeDeleted={changedSelection.alias}
            />
          }
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps)(Webservice);
