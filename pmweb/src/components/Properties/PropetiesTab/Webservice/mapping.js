// Changes made to fix Bug 111083 - webservice -> no validation message for webservice and the fields should have a mandatory mark as given in design
// #BugID - 115280
// #BugDescription - Added validation for JMS/SOAP target.

import React, { useState, useEffect } from "react";
import { MenuItem } from "@material-ui/core";
import "./index.css";
import { Tab, Tabs } from "@material-ui/core";
import { TabPanel } from "../../../ProcessSettings";
import ReusableOneMap from "./reusableOneMap";
import { store, useGlobalState } from "state-pool";
import { useDispatch, useSelector } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  DATE_VARIABLE_TYPE,
  RTL_DIRECTION,
  SHORT_DATE_VARIABLE_TYPE,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { connect } from "react-redux";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField/index.js";
import { OpenProcessSliceValue } from "../../../../redux-store/slices/OpenProcessSlice";
import { useTranslation } from "react-i18next";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useRef } from "react";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { getIncorrectLenErrMsg } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function Mapping(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  //code added on 22 Aug 2022 for BugId 112019
  const { value, setValue, isReadOnly } = props;
  const openProcessData = useSelector(OpenProcessSliceValue);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [invocationType, setInvocationType] = useState(null);
  const [forwardMappingList, setForwardMappingList] = useState([]);
  const [reverseMappingList, setReverseMappingList] = useState([]);
  const [reverseDropdownOptions, setReverseDropdownOptions] = useState([]);
  const [dropDownActivities, setDropDownActivities] = useState([]);
  const [selectedDropDownActivity, setSelectedDropDownActivity] =
    useState(null);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [timeOutValue, setTimeOutValue] = useState(null);
  const [variablesListForDropDown, setVariablesListForDropDown] = useState([]);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const timeRef = useRef();

  useEffect(() => {
    let temp = [];
    let tempOpenProcess = JSON.parse(
      JSON.stringify(openProcessData.loadedData)
    );
    tempOpenProcess?.MileStones?.forEach((mile) => {
      mile?.Activities?.forEach((activity) => {
        if (
          (+activity.ActivityType === 21 && +activity.ActivitySubType === 1) ||
          (+activity.ActivityType === 23 && +activity.ActivitySubType === 1) ||
          (+activity.ActivityType === 24 && +activity.ActivitySubType === 1) ||
          (+activity.ActivityType === 25 && +activity.ActivitySubType === 1)
        ) {
          temp.push(activity);
        }
      });
    });
    setDropDownActivities(temp);
  }, [openProcessData.loadedData]);

  const checkForModifyRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item, i) => {
        if (item?.processVarInfo?.variableId === data.VariableId) {
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

  useEffect(() => {
    localLoadedActivityPropertyData?.ActivityProperty?.webserviceInfo?.objWebServiceDataInfo?.forEach(
      (el) => {
        if (+el.methodIndex === +props.serviceNameClicked.id) {
          setTimeOutValue(el.timeoutInterval);
        }
      }
    );
  }, [localLoadedActivityPropertyData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleTimeOutChange = (event) => {
    //Modified on 28/09/2023, bug_id:135963
    const numbers = /^[0-9]+$/;
    if (event.target.value != "") {
      if (event.target.value.match(numbers)) {
        if (event.target.value.length > 3) {
          dispatch(
            setToastDataFunc({
              message: getIncorrectLenErrMsg("TimeOut", 3, t),
              severity: "error",
              open: true,
            })
          );
        } else {
          setTimeOutValue(event.target.value);
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.webService]: {
                isModified: true,
                hasError: false,
              },
            })
          );

          // code edited on 30 August 2022 for BugId 113881
          let temp = JSON.parse(
            JSON.stringify(localLoadedActivityPropertyData)
          );
          temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo.map(
            (el) => {
              if (el.methodIndex == props.serviceNameClicked.id) {
                el.timeoutInterval = event.target.value;
              }
            }
          );
          setlocalLoadedActivityPropertyData(temp);
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: `${t("numericValMsg")}`,
            severity: "error",
            open: true,
          })
        );

        event.preventDefault();
      }
    } else {
      setTimeOutValue(event.target.value);
    }

    //till here for bug_id:135963

    /*  setTimeOutValue(event.target.value);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.webService]: {
          isModified: true,
          hasError: false,
        },
      })
    );

    // code edited on 30 August 2022 for BugId 113881
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo.map((el) => {
      if (el.methodIndex == props.serviceNameClicked.id) {
        el.timeoutInterval = event.target.value;
      }
    });
    setlocalLoadedActivityPropertyData(temp); */
  };

  const getVarName = (variableName, varList) => {
    let variable;
    varList?.forEach((content) => {
      if (content.VariableName === variableName) {
        variable = content;
      }
    });
    return variable;
  };

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

  useEffect(() => {
    let forwardInputParams = [];
    let reverseInputParams = [];
    let selectedWebService;
    let tempForwardList = [];
    let tempReverseList = [];
    let reverseList = [];

    let variablesList = [];
    localLoadedProcessData?.Variable?.forEach((item) => {
      if (item.VariableType === "11") {
        let tempList = getComplex(item);
        tempList?.forEach((el) => {
          variablesList.push(el);
        });
      } else {
        variablesList.push(item);
      }
    });

    props?.completeList?.forEach((list) => {
      if (
        list.AppName === props.serviceNameClicked.webservice &&
        list.MethodName === props.serviceNameClicked.method
      ) {
        selectedWebService = list;
      }
    });
    forwardInputParams = selectedWebService?.Parameter?.filter(
      (el) => el.ParamScope === "I"
    );

    reverseInputParams = selectedWebService?.Parameter?.filter(
      (el) => el.ParamScope === "O" || el.ParamScope === "R"
    );

    localLoadedProcessData?.Variable?.forEach((item, i) => {
      if (
        item.VariableScope === "M" ||
        item.VariableScope === "S" ||
        (item.VariableScope === "U" && checkForModifyRights(item)) ||
        (item.VariableScope === "I" && checkForModifyRights(item))
      ) {
        if (item.VariableType === "11") {
          let tempList = getComplex(item);
          tempList?.forEach((el) => {
            reverseList.push({
              fieldName: el,
              fieldDataStructID: null,
              selectedVar: null,
            });
          });
        } else {
          reverseList.push({
            fieldName: item,
            fieldDataStructID: null,
            selectedVar: null,
          });
        }
      }
    });

    forwardInputParams?.forEach((param) => {
      if (+param.ParamType === 11) {
        CreateParamKey(
          param.ParamName,
          param.DataStructureId,
          param.ParamIndex,
          tempForwardList,
          selectedWebService
        );
      } else {
        tempForwardList.push({
          fieldName: param.ParamName,
          fieldDataStructID: param.DataStructureId,
          fieldType: param.ParamType,
          fieldIndex: param.ParamIndex,
          selectedVar: null,
        });
      }
    });

    reverseInputParams?.forEach((param) => {
      if (+param.ParamType === 11) {
        CreateParamKey(
          param.ParamName,
          param.DataStructureId,
          param.ParamIndex,
          tempReverseList,
          selectedWebService
        );
      } else {
        tempReverseList.push({
          fieldName: param.ParamName,
          fieldDataStructID:
            +param.DataStructureId === 0
              ? param.ParamIndex
              : param.DataStructureId,
          selectedVar: null,
          fieldType: param.ParamType,
          fieldIndex: param.ParamIndex,
        });
      }
    });

    props.combinations?.forEach((one) => {
      if (
        one.webserviceName === props.serviceNameClicked.webservice &&
        props.serviceNameClicked.method === one.methodName
      ) {
        one?.fwdParamMapList?.forEach((el) => {
          tempForwardList?.forEach((param, index) => {
            if (+el.dataStructId === +param.fieldDataStructID) {
              let selectedVar = getVarName(el.mapField, variablesList); //Modified on 05/11/2023, bug_id:140353
              //let selectedVar = getVarName(el.selectedVar, variablesList);
              tempForwardList[index].selectedVar = selectedVar;
            }
          });
        });
        one?.revParamMapList?.forEach((el) => {
          tempReverseList?.forEach((param, index) => {
            if (
              +el.dataStructId === +param.fieldDataStructID ||
              (+el.dataStructId === 0 &&
                +el.paramIndex === +param.fieldDataStructID)
            ) {
              reverseList?.forEach((list, indexOne) => {
                if (list.fieldName.VariableName === el.mapField) {
                  reverseList[indexOne].selectedVar = param;
                }
              });
            }
          });
        });
        setInvocationType(one.invocationType);
        setSelectedDropDownActivity(one.asynchActId);
      }
    });

    //  setForwardMappingList(tempForwardList);
    setForwardMappingList(tempForwardList);
    setReverseMappingList(reverseList);
    setReverseDropdownOptions(tempReverseList);
    setVariablesListForDropDown(variablesList);
  }, [props.completeList, props.serviceNameClicked, props.combinations]);

  const CreateParamKey = (
    parentKey,
    parentIndex,
    paramIndex,
    arrayList,
    selectedWebService
  ) => {
    selectedWebService?.DataStructure?.forEach((ds) => {
      if (+parentIndex === +ds.ParentIndex && +ds.Type !== 11) {
        arrayList.push({
          fieldName: `${parentKey}.${ds.Name}`,
          fieldDataStructID: ds.DataStructureId,
          fieldIndex: paramIndex,
          selectedVar: null,
          fieldType: ds.Type,
        });
      } else if (+parentIndex === +ds.ParentIndex && +ds.Type === 11) {
        CreateParamKey(
          `${parentKey}.${ds.Name}`,
          ds.DataStructureId,
          paramIndex,
          arrayList,
          selectedWebService // code edited on 13 July 2023 for BugId 132275
        );
      }
    });
  };

  const handleForwardFieldMapping = (selectedValue, list) => {
    setForwardMappingList((prev) => {
      let tempList = [...prev];
      tempList.forEach((el, index) => {
        if (+el.fieldDataStructID === +list.fieldDataStructID) {
          tempList[index].selectedVar = selectedValue;
        }
      });
      return tempList;
    });
    let temp = { ...localLoadedActivityPropertyData };
    let tempArr = [
      ...temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo,
    ];
    let indexValue = null;
    tempArr?.forEach((arr, index) => {
      if (
        arr.webserviceName === props.serviceNameClicked.webservice &&
        props.serviceNameClicked.method === arr.methodName
      ) {
        indexValue = index;
      }
    });
    let forwardArr = temp?.ActivityProperty?.webserviceInfo
      ?.objWebServiceDataInfo[indexValue]?.fwdParamMapList
      ? [
          ...temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
            indexValue
          ].fwdParamMapList,
        ]
      : [];
    let doExists = false;
    let idx = null;
    forwardArr?.forEach((arr, index) => {
      if (arr.dataStructId === list.fieldDataStructID) {
        doExists = true;
        idx = index;
      }
    });

    // code edited on 30 August 2022 for BugId 113882
    if (doExists && selectedValue !== "") {
      temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
        indexValue
      ].fwdParamMapList[idx] = {
        bParamSelected: true,
        dataStructId: list.fieldDataStructID,
        mapField: selectedValue.VariableName,
        mapFieldType: selectedValue.VariableScope,
        mapVarFieldId: selectedValue.VarFieldId,
        mapVariableId: selectedValue.VariableId,
        paramIndex: list.fieldIndex,
        selectedVar: list.fieldName,
      };
    }
    // code edited on 30 August 2022 for BugId 113882
    else if (doExists && selectedValue === "") {
      temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
        indexValue
      ].fwdParamMapList.splice(idx, 1);
    } else {
      temp?.ActivityProperty?.webserviceInfo?.objWebServiceDataInfo[indexValue]
        ?.fwdParamMapList
        ? temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
            indexValue
          ].fwdParamMapList.push({
            bParamSelected: true,
            dataStructId: list.fieldDataStructID,
            mapField: selectedValue.VariableName,
            mapFieldType: selectedValue.VariableScope,
            mapVarFieldId: selectedValue.VarFieldId,
            mapVariableId: selectedValue.VariableId,
            paramIndex: list.fieldIndex,
            selectedVar: list.fieldName,
          })
        : (temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
            indexValue
          ] = {
            ...temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
              indexValue
            ],
            fwdParamMapList: [
              {
                bParamSelected: true,
                dataStructId: list.fieldDataStructID,
                mapField: selectedValue.VariableName,
                mapFieldType: selectedValue.VariableScope,
                mapVarFieldId: selectedValue.VarFieldId,
                mapVariableId: selectedValue.VariableId,
                paramIndex: list.fieldIndex,
                selectedVar: list.fieldName,
              },
            ],
          });
    }
    setlocalLoadedActivityPropertyData(temp);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.webService]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const handleReverseFieldMapping = (selectedValue, list) => {
    setReverseMappingList((prev) => {
      let tempList = [...prev];
      tempList.forEach((el, index) => {
        if (el.fieldName.VariableName === list.fieldName.VariableName) {
          tempList[index].selectedVar = selectedValue;
        }
      });
      return tempList;
    });
    let temp = { ...localLoadedActivityPropertyData };
    let tempArr = [
      ...temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo,
    ];
    let indexValue = null;
    tempArr?.forEach((arr, index) => {
      if (
        arr.webserviceName === props.serviceNameClicked.webservice &&
        props.serviceNameClicked.method === arr.methodName
      ) {
        indexValue = index;
      }
    });
    let ReverseArr = temp?.ActivityProperty?.webserviceInfo
      ?.objWebServiceDataInfo[indexValue]?.revParamMapList
      ? [
          ...temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
            indexValue
          ].revParamMapList,
        ]
      : [];
    let doExists = false;
    let idx = null;
    ReverseArr?.forEach((arr, index) => {
      if (arr.mapVariableId === list.fieldName.VariableId) {
        doExists = true;
        idx = index;
      }
    });

    // code edited on 30 August 2022 for BugId 113882
    if (doExists && selectedValue !== "") {
      temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
        indexValue
      ].revParamMapList[idx] = {
        bParamSelected: true,
        dataStructId: selectedValue.fieldDataStructID,
        mapField: list.fieldName.VariableName,
        mapFieldType: list.fieldName.VariableScope,
        mapVarFieldId: list.fieldName.VarFieldId,
        mapVariableId: list.fieldName.VariableId,
        paramIndex: selectedValue.fieldIndex,
        selectedVar: selectedValue.fieldName,
      };
    }
    // code edited on 30 August 2022 for BugId 113882
    else if (doExists && selectedValue === "") {
      temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
        indexValue
      ].revParamMapList.splice(idx, 1);
    } else {
      temp?.ActivityProperty?.webserviceInfo?.objWebServiceDataInfo[indexValue]
        ?.revParamMapList
        ? temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
            indexValue
          ].revParamMapList.push({
            bParamSelected: true,
            dataStructId: selectedValue.fieldDataStructID,
            mapField: list.fieldName.VariableName,
            mapFieldType: list.fieldName.VariableScope,
            mapVarFieldId: list.fieldName.VarFieldId,
            mapVariableId: list.fieldName.VariableId,
            paramIndex: selectedValue.fieldIndex,
            selectedVar: selectedValue.fieldName,
          })
        : (temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
            indexValue
          ] = {
            ...temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo[
              indexValue
            ],
            revParamMapList: [
              {
                bParamSelected: true,
                dataStructId: selectedValue.fieldDataStructID,
                mapField: list.fieldName.VariableName,
                mapFieldType: list.fieldName.VariableScope,
                mapVarFieldId: list.fieldName.VarFieldId,
                mapVariableId: list.fieldName.VariableId,
                paramIndex: selectedValue.fieldIndex,
                selectedVar: selectedValue.fieldName,
              },
            ],
          });
    }

    setlocalLoadedActivityPropertyData(temp);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.webService]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const handleInvocationTypeChange = (e) => {
    setInvocationType(e.target.value);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.webService]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    // code edited on 30 August 2022 for BugId 113881
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo =
      temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo.map((el) => {
        if (+el.methodIndex === +props.serviceNameClicked.id) {
          el.invocationType = e.target.value;
        }
        return el;
      });
    setlocalLoadedActivityPropertyData(temp);
  };

  const getVarListByType = (varList, item) => {
    let varType = item?.fieldType;
    let list = [];
    varList?.forEach((el) => {
      if (
        el.VariableScope === "M" ||
        el.VariableScope === "S" ||
        (el.VariableScope === "U" && checkForVarRights(el)) ||
        (el.VariableScope === "I" && checkForVarRights(el))
      ) {
        let type = el.VariableType;
        if (+varType === DATE_VARIABLE_TYPE) {
          if (
            +type === DATE_VARIABLE_TYPE ||
            +type === SHORT_DATE_VARIABLE_TYPE
          ) {
            list.push(el);
          }
        } else {
          if (varType === type) {
            list.push(el);
          }
        }
      }
    });
    return list;
  };

  const getRevVarListByType = (varList, item) => {
    let varType = item.fieldName.VariableType;
    let list = [];
    varList?.forEach((el) => {
      let type = el.fieldType;
      if (+varType === DATE_VARIABLE_TYPE) {
        if (
          +type === DATE_VARIABLE_TYPE ||
          +type === SHORT_DATE_VARIABLE_TYPE
        ) {
          list.push(el);
        }
      } else {
        if (varType === type) {
          list.push(el);
        }
      }
    });
    return list;
  };

  const handleSoapJMS = (e) => {
    setSelectedDropDownActivity(e.target.value);
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.webserviceInfo.objWebServiceDataInfo.map((el) => {
      if (el.methodIndex == props.serviceNameClicked.id) {
        el.asynchActId = e.target.value;
      }
    });
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.webService]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  return (
    <div style={{ padding: "1rem 1vw 0", width: "50%" }}>
      <div
        style={{
          display: "flex",
          // alignItems: "center",
          gap: "1vw",
        }}
      >
        <div style={{ flex: "1" }}>
          <p
            style={{ fontSize: "var(--base_text_font_size)", color: "#886F6F" }}
          >
            {t("InvocationType")}
          </p>
          {/* <Select
            className="select_webService_mapping"
            onChange={(e) => handleInvocationTypeChange(e)}
            value={invocationType}
            style={{
              fontSize: "var(--base_text_font_size)",
              minWidth: "10vw",
            }}
            disabled={isReadOnly}
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
          >
            <MenuItem
              style={{
                fontSize: "var(--base_text_font_size)",
                padding: "4px",
              }}
              value="F"
            >
              {t("FireAndForget")}
            </MenuItem>
            <MenuItem
              style={{
                fontSize: "var(--base_text_font_size)",
                padding: "4px",
              }}
              value="A"
            >
              {t("Asynchronous")}
            </MenuItem>
            <MenuItem
              style={{
                fontSize: "var(--base_text_font_size)",
                padding: "4px",
              }}
              value="S"
            >
              {t("Synchronous")}
            </MenuItem>
          </Select> */}
          <CustomizedDropdown
            isNotMandatory={true}
            id="pmweb_webService_mapping_InvocationType"
            variant="outlined"
            className="select_webService_mapping"
            ariaLabel="select_webService_mapping"
            onChange={(e) => handleInvocationTypeChange(e)}
            value={invocationType}
            style={{
              fontSize: "var(--base_text_font_size)",
              minWidth: "10vw",
            }}
            disabled={isReadOnly}
          >
            <MenuItem
              style={{
                fontSize: "var(--base_text_font_size)",
                padding: "4px",
                justifyContent: direction === RTL_DIRECTION ? "end" : null,
              }}
              value="F"
            >
              {t("FireAndForget")}
            </MenuItem>
            <MenuItem
              style={{
                fontSize: "var(--base_text_font_size)",
                padding: "4px",
                justifyContent: direction === RTL_DIRECTION ? "end" : null,
              }}
              value="A"
            >
              {t("Asynchronous")}
            </MenuItem>
            <MenuItem
              style={{
                fontSize: "var(--base_text_font_size)",
                padding: "4px",
                justifyContent: direction === RTL_DIRECTION ? "end" : null,
              }}
              value="S"
            >
              {t("Synchronous")}
            </MenuItem>
          </CustomizedDropdown>
        </div>
        {invocationType === "A" ? (
          <div style={{ flex: "1" }}>
            <p
              style={{
                fontSize: "var(--base_text_font_size)",
                color: "#886F6F",
              }}
            >
              {t("JMS/SOAPTarget")}
              <span className="starIcon">*</span>
            </p>
            {/* <Select
              className="select_webService_mapping"
              onChange={handleSoapJMS}
              value={selectedDropDownActivity}
              style={{
                fontSize: "var(--base_text_font_size)",
              }}
              disabled={isReadOnly}
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
            >
              {dropDownActivities?.map((activity) => {
                return (
                  <MenuItem
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      padding: "4px",
                    }}
                    value={activity.ActivityId}
                  >
                    {activity.ActivityName}
                  </MenuItem>
                );
              })}
            </Select> */}
            <CustomizedDropdown
              variant="outlined"
              idTag="pmweb_webservice_mapping_JMS/SOAPTarget"
              isMandatory={true}
              ariaLabel="select_webService_mapping"
              className="select_webService_mapping"
              onChange={handleSoapJMS}
              value={selectedDropDownActivity}
              style={{
                fontSize: "var(--base_text_font_size)",
              }}
              disabled={isReadOnly}
            >
              {dropDownActivities?.map((activity) => {
                return (
                  <MenuItem
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      padding: "4px",
                      justifyContent:
                        direction === RTL_DIRECTION ? "end" : null,
                    }}
                    value={activity.ActivityId}
                  >
                    {activity.ActivityName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
        ) : null}
        <div style={{ flex: `${invocationType === "A" ? "0.5" : "1.55"}` }}>
          <p
            style={{ fontSize: "var(--base_text_font_size)", color: "#886F6F" }}
          >
            {t("TimeOut")}
            <span className="starIcon">*</span>
          </p>
          <TextInput
            type="text"
            readOnlyCondition={isReadOnly}
            inputValue={timeOutValue}
            idTag="pmweb_webService_mapping_timeOutWebservice"
            onChangeEvent={(e) => handleTimeOutChange(e)}
            //Added on 07/09/2023, bug_id:135963
            inputRef={timeRef}
            /*errorStatement={showTimeError?.statement}
            errorSeverity={showTimeError?.severity}
            errorType={showTimeError?.errorType}
            inlineError={true}*/
            InputProps={{
              inputProps: {
                max: 99,
                min: 0,
              },
            }}
            onKeyPress={(e) => FieldValidations(e, 130, timeRef.current, 30)}
            //till here for bug_id:135963
          />
        </div>
      </div>
      <div className="webS_props_tabStyles ">
        <Tabs
          value={value}
          onChange={handleChange}
          TabIndicatorProps={{ style: { background: "#0072C5" } }}
        >
          <Tab
            className={value === 0 && "tabLabel"}
            label={
              <p>
                {t("forwardMapping")} <span className="starIcon">*</span>
              </p>
            }
            tabIndex={0}
          />{" "}
          <Tab
            className={value === 1 && "tabLabel"}
            label={
              invocationType === "F" ? (
                <p>{t("reverseMapping")}</p>
              ) : (
                <p>
                  {t("reverseMapping")} <span className="starIcon">*</span>
                </p>
              )
            }
            tabIndex={0}
          />
        </Tabs>
      </div>
      <div className="tabPanelStyles">
        <TabPanel value={value} index={0}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                marginTop: "1rem",
                marginBottom: "0.5rem",
                marginRight: "0.375rem",
                gap: "2vw",
              }}
            >
              <div
                style={{
                  // height: "var(--line_height)",
                  flex: "1",
                  backgroundColor: "#F4F4F4",
                  fontSize: "var(--base_text_font_size)",
                  padding: "7px",
                  fontWeight: "600",
                }}
              >
                {t("SOAPInputParameters")}
              </div>
              <div
                style={{
                  // height: "var(--line_height)",
                  flex: "1",
                  backgroundColor: "#F4F4F4",
                  fontSize: "var(--base_text_font_size)",
                  padding: "7px",
                  fontWeight: "600",
                }}
              >
                {t("CurrentProcessVariable(s)")}
              </div>
            </div>
            <div
              style={{
                height: `calc((${windowInnerHeight}px - ${headerHeight}) - 24rem)`,
                overflow: "auto",
              }}
            >
              {forwardMappingList?.map((list, index) => {
                return (
                  <ReusableOneMap
                    mapField={list.fieldName}
                    varField={list.selectedVar}
                    dropDownOptions={getVarListByType(
                      variablesListForDropDown,
                      list
                    )}
                    isReadOnly={isReadOnly}
                    dropDownKey="VariableName"
                    handleFieldMapping={(val) =>
                      handleForwardFieldMapping(val, list)
                    }
                  />
                );
              })}
            </div>
          </div>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                marginTop: "1rem",
                marginBottom: "0.5rem",
                marginRight: "0.375rem",
                gap: "2vw",
              }}
            >
              <div
                style={{
                  // height: "var(--line_height)",
                  flex: "1",
                  backgroundColor: "#F4F4F4",
                  fontSize: "var(--base_text_font_size)",
                  padding: "7px",
                  fontWeight: "600",
                }}
              >
                {t("CurrentProcessVariable(s)")}
              </div>
              <div
                style={{
                  // height: "var(--line_height)",
                  flex: "1",
                  backgroundColor: "#F4F4F4",
                  fontSize: "var(--base_text_font_size)",
                  padding: "7px",
                  fontWeight: "600",
                }}
              >
                {t("SOAPOutputParameters")}
              </div>
            </div>
            <div
              style={{
                height: `calc((${windowInnerHeight}px - ${headerHeight}) - 24rem)`,
                overflow: "auto",
              }}
            >
              {reverseMappingList?.map((list, index) => {
                return (
                  <ReusableOneMap
                    mapField={
                      list.fieldName.processVarInfo
                        ? list.fieldName.processVarInfo.varName
                        : list.fieldName.VariableName
                    }
                    varField={list.selectedVar}
                    dropDownOptions={getRevVarListByType(
                      reverseDropdownOptions,
                      list
                    )}
                    isReadOnly={isReadOnly}
                    dropDownKey="fieldName"
                    handleFieldMapping={(val) =>
                      handleReverseFieldMapping(val, list)
                    }
                    invocationType={invocationType}
                  />
                );
              })}
            </div>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(Mapping);
