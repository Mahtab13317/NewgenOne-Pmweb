import React, { useState, useEffect } from "react";
import "./index.css";
import { Tab, Tabs } from "@material-ui/core";
import { TabPanel } from "../../../ProcessSettings";
import ReusableOneMap from "./reusableOneMap";
import { store, useGlobalState } from "state-pool";
import { useDispatch, connect } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  DATE_VARIABLE_TYPE,
  SHORT_DATE_VARIABLE_TYPE,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField";

function Mapping(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const { value, setValue, isReadOnly } = props;
  const [forwardMappingList, setForwardMappingList] = useState([]);
  const [reverseMappingList, setReverseMappingList] = useState([]);
  const [reverseDropdownOptions, setReverseDropdownOptions] = useState([]);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [timeOutValue, setTimeOutValue] = useState(null);
  const [variablesListForDropDown, setVariablesListForDropDown] = useState([]);

  const checkForModifyRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item) => {
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

  const checkForVarRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item, i) => {
        if (+item?.processVarInfo?.variableId === +data.VariableId) {
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
    localLoadedActivityPropertyData?.ActivityProperty?.restFullInfo?.assocMethodList?.forEach(
      (el) => {
        if (el.methodIndex == props.methodClicked.id) {
          setTimeOutValue(el.timeoutInterval);
        }
      }
    );
  }, [localLoadedActivityPropertyData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleTimeOutChange = (event) => {
    setTimeOutValue(event.target.value);
    let temp = localLoadedActivityPropertyData;
    temp.ActivityProperty.restFullInfo.assocMethodList?.map((el) => {
      if (el.methodIndex == props.methodClicked.id) {
        el.timeoutInterval = event.target.value;
      }
    });
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Restful]: {
          isModified: true,
          hasError: false,
        },
      })
    );
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
    let selectedMethod;
    let tempForwardList = [];
    let tempReverseList = [];
    let reverseList = [];
    let tempReverseArr = [
      {
        DataStructureId: "0",
        ParamIndex: "10000",
        ParamName: "Fault",
        ParamScope: "O",
        ParamType: "3",
        Unbounded: "N",
      },
      {
        DataStructureId: "0",
        ParamIndex: "10001",
        ParamName: "FaultDesc",
        ParamScope: "O",
        ParamType: "10",
        Unbounded: "N",
      },
    ];

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
      if (list.MethodName === props.methodClicked.method) {
        selectedMethod = list;
      }
    });

    localLoadedProcessData?.Variable?.forEach((item, i) => {
      if (
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
    selectedMethod?.InputParameters?.PrimitiveComplexType?.forEach((param) => {
      if (param.ParamType === "11") {
        CreateParamKey(
          param.ParamName,
          param.DataStructureId,
          tempForwardList,
          param
        );
      } else {
        tempForwardList.push({
          fieldName: param.ParamName,
          fieldDataStructID: param.DataStructureId,
          fieldType: param.ParamType,
          selectedVar: null,
        });
      }
    });

    selectedMethod?.RequestBodyParameters?.NestedReqComplexType?.forEach(
      (param) => {
        if (param.ParamType === "11") {
          CreateParamKey(
            param.ParamName,
            param.DataStructureId,
            tempForwardList,
            param
          );
        } else {
          tempForwardList.push({
            fieldName: param.ParamName,
            fieldDataStructID: param.DataStructureId,
            fieldType: param.ParamType,
            selectedVar: null,
          });
        }
      }
    );

    selectedMethod?.ResponseBodyParameters?.NestedResComplexType?.forEach(
      (param) => {
        if (param.ParamType === "11") {
          CreateParamKey(
            param.ParamName,
            param.DataStructureId,
            tempReverseList,
            param
          );
        } else {
          tempReverseList.push({
            fieldName: param.ParamName,
            fieldDataStructID: param.DataStructureId,
            selectedVar: null,
            fieldType: param.ParamType,
          });
        }
      }
    );

    tempReverseArr?.forEach((param) => {
      tempReverseList.push({
        fieldName: param.ParamName,
        fieldDataStructID: param.DataStructureId,
        selectedVar: null,
        fieldType: param.ParamType,
      });
    });

    props.combinations?.map((one) => {
      if (props.methodClicked.id == one.methodIndex) {
        one?.mappingInfoList?.forEach((el) => {
          if (el.mappingType === "F") {
            tempForwardList?.forEach((param, index) => {
              if (el.dataStructureId == param.fieldDataStructID) {
                let selectedVar = getVarName(el.varName, variablesList);
                tempForwardList[index].selectedVar = selectedVar;
              }
            });
          } else if (el.mappingType === "R") {
            tempReverseList?.forEach((param) => {
              if (
                (+el.dataStructureId === +param.fieldDataStructID &&
                  el.dataStructureId !== "0") ||
                (el.dataStructureId === "0" &&
                  el.parameterName === param.fieldName)
              ) {
                reverseList?.forEach((list, indexOne) => {
                  if (list.fieldName.VariableName == el.varName) {
                    reverseList[indexOne].selectedVar = param;
                  }
                });
              }
            });
          }
        });
      }
    });
    setForwardMappingList(tempForwardList);
    setReverseMappingList(reverseList);
    setReverseDropdownOptions(tempReverseList);
    setVariablesListForDropDown(variablesList);
  }, [props.completeList, props.methodClicked, props.combinations]);

  const CreateParamKey = (
    parentKey,
    parentIndex,
    arrayList,
    selectedMethod
  ) => {
    selectedMethod?.Member?.forEach((ds) => {
      if (+parentIndex === +ds.ParentID && ds.ParamType !== "11") {
        arrayList.push({
          fieldName: `${parentKey}.${ds.ParamName}`,
          fieldDataStructID: ds.DataStructureId,
          fieldType: ds.ParamType,
          selectedVar: null,
        });
      } else if (+parentIndex === +ds.ParentID && ds.ParamType === "11") {
        CreateParamKey(
          `${parentKey}.${ds.ParamName}`,
          ds.DataStructureId,
          arrayList,
          ds
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
    let tempArr = [...temp.ActivityProperty.restFullInfo.assocMethodList];
    let indexValue = null;
    tempArr?.forEach((arr, index) => {
      if (+props.methodClicked.id === +arr.methodIndex) {
        indexValue = index;
      }
    });
    let forwardArr = temp?.ActivityProperty?.restFullInfo?.assocMethodList[
      indexValue
    ]?.mappingInfoList
      ? [
          ...temp.ActivityProperty.restFullInfo.assocMethodList[indexValue]
            .mappingInfoList,
        ]
      : [];
    let doExists = false;
    let idx = null;
    forwardArr?.forEach((arr, index) => {
      //code edited on 19 Aug 2022 for BugId 114451
      if (
        ((+arr.dataStructureId !== 0 &&
          +arr.dataStructureId === +list.fieldDataStructID) ||
          (+arr.dataStructureId === 0 &&
            arr.parameterName === list.fieldName)) &&
        arr.mappingType === "F"
      ) {
        doExists = true;
        idx = index;
      }
    });
    if (doExists) {
      temp.ActivityProperty.restFullInfo.assocMethodList[
        indexValue
      ].mappingInfoList[idx] = {
        check: true,
        dataStructureId: list.fieldDataStructID,
        mappingType: "F",
        parameterDataType: list.fieldType,
        parameterName: list.fieldName,
        unbounded: "N",
        varFieldId: selectedValue.VarFieldId,
        varName: selectedValue.VariableName,
        varScope: selectedValue.VariableScope,
        variableId: selectedValue.VariableId,
      };
    } else {
      temp?.ActivityProperty?.restFullInfo?.assocMethodList[indexValue]
        ?.mappingInfoList
        ? temp.ActivityProperty.restFullInfo.assocMethodList[
            indexValue
          ].mappingInfoList.push({
            check: true,
            dataStructureId: list.fieldDataStructID,
            mappingType: "F",
            parameterDataType: list.fieldType,
            parameterName: list.fieldName,
            unbounded: "N",
            varFieldId: selectedValue.VarFieldId,
            varName: selectedValue.VariableName,
            varScope: selectedValue.VariableScope,
            variableId: selectedValue.VariableId,
          })
        : (temp.ActivityProperty.restFullInfo.assocMethodList[indexValue] = {
            ...temp.ActivityProperty.restFullInfo.assocMethodList[indexValue],
            mappingInfoList: [
              {
                check: true,
                dataStructureId: list.fieldDataStructID,
                mappingType: "F",
                parameterDataType: list.fieldType,
                parameterName: list.fieldName,
                unbounded: "N",
                varFieldId: selectedValue.VarFieldId,
                varName: selectedValue.VariableName,
                varScope: selectedValue.VariableScope,
                variableId: selectedValue.VariableId,
              },
            ],
          });
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Restful]: {
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
        if (el.fieldName.VariableName == list.fieldName.VariableName) {
          tempList[index].selectedVar = selectedValue;
        }
      });
      return tempList;
    });
    let temp = { ...localLoadedActivityPropertyData };
    let tempArr = [...temp.ActivityProperty.restFullInfo.assocMethodList];
    let indexValue = null;
    tempArr?.forEach((arr, index) => {
      if (props.methodClicked.id == arr.methodIndex) {
        indexValue = index;
      }
    });
    let ReverseArr = temp?.ActivityProperty?.restFullInfo?.assocMethodList[
      indexValue
    ]?.mappingInfoList
      ? [
          ...temp.ActivityProperty.restFullInfo.assocMethodList[indexValue]
            .mappingInfoList,
        ]
      : [];
    let doExists = false;
    let idx = null;
    ReverseArr?.forEach((arr, index) => {
      //code edited on 19 Aug 2022 for BugId 114451
      //code edited on 27 Dec 2022 for BugId 121116
      if (
        +arr.variableId === +list.fieldName.VariableId &&
        +arr.varFieldId === +list.fieldName.VarFieldId &&
        arr.mappingType === "R"
      ) {
        doExists = true;
        idx = index;
      }
    });

    if (doExists) {
      temp.ActivityProperty.restFullInfo.assocMethodList[
        indexValue
      ].mappingInfoList[idx] = {
        check: true,
        dataStructureId: selectedValue.fieldDataStructID,
        mappingType: "R",
        parameterDataType: selectedValue.fieldType,
        parameterName: selectedValue.fieldName,
        unbounded: "N",
        varFieldId: list.fieldName.VarFieldId,
        varName: list.fieldName.VariableName,
        varScope: list.fieldName.VariableScope,
        variableId: list.fieldName.VariableId,
      };
    } else {
      temp?.ActivityProperty?.restFullInfo?.assocMethodList[indexValue]
        ?.mappingInfoList
        ? temp.ActivityProperty.restFullInfo.assocMethodList[
            indexValue
          ].mappingInfoList.push({
            check: true,
            dataStructureId: selectedValue.fieldDataStructID,
            mappingType: "R",
            parameterDataType: selectedValue.fieldType,
            parameterName: selectedValue.fieldName,
            unbounded: "N",
            varFieldId: list.fieldName.VarFieldId,
            varName: list.fieldName.VariableName,
            varScope: list.fieldName.VariableScope,
            variableId: list.fieldName.VariableId,
          })
        : (temp.ActivityProperty.restFullInfo.assocMethodList[indexValue] = {
            ...temp.ActivityProperty.restFullInfo.assocMethodList[indexValue],
            mappingInfoList: [
              {
                check: true,
                dataStructureId: selectedValue.fieldDataStructID,
                mappingType: "R",
                parameterDataType: selectedValue.fieldType,
                parameterName: selectedValue.fieldName,
                unbounded: "N",
                varFieldId: list.fieldName.VarFieldId,
                varName: list.fieldName.VariableName,
                varScope: list.fieldName.VariableScope,
                variableId: list.fieldName.VariableId,
              },
            ],
          });
    }

    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Restful]: {
          isModified: true,
          hasError: false,
        },
      })
    );
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

  return (
    <div style={{ padding: "1rem 1vw 0", width: "50%" }}>
      <div>
        <p style={{ fontSize: "var(--base_text_font_size)", color: "#886F6F" }}>
          {t("TimeOut")}
          <span className="starIcon">*</span>
        </p>
        <TextInput
          type="number"
          readOnlyCondition={isReadOnly}
          inputValue={timeOutValue}
          idTag="pmweb_restful_mapping_timeOutWebservice"
          onChangeEvent={(e) => handleTimeOutChange(e)}
          style={{ height: "2.5rem" }}
        />
      </div>
      <div className="webS_props_tabStyles ">
        <Tabs
          value={value}
          onChange={handleChange}
          TabIndicatorProps={{ style: { background: "#0072C5" } }}
        >
          <Tab
            className={value === 0 && "tabLabel"}
            id="pmweb_restful_forwardMapping"
            label={
              <p>
                {t("forwardMapping")} <span className="starIcon">*</span>
              </p>
            }
            tabIndex={0}
          />
          <Tab
            className={value === 1 && "tabLabel"}
            id="pmweb_restful_reverseMapping"
            label={
              <p>
                {t("reverseMapping")} <span className="starIcon">*</span>
              </p>
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
                // marginRight: "0.375rem",
              }}
            >
              <div
                style={{
                  // height: "var(--line_height)",
                  flex: "1",
                  backgroundColor: "#F4F4F4",
                  // marginRight: "30px",
                  marginInlineEnd: "1vw",
                  fontSize: "var(--base_text_font_size)",
                  padding: "7px",
                  fontWeight: "600",
                }}
              >
                {t("RESTInputParameters")}
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
            <div style={{ height: "16.5rem", overflow: "auto" }}>
              {forwardMappingList?.map((list, index) => {
                return (
                  <ReusableOneMap
                    mapField={list.fieldName}
                    varField={list.selectedVar}
                    dropDownOptions={getVarListByType(
                      variablesListForDropDown,
                      list
                    )}
                    dropDownKey="VariableName"
                    handleFieldMapping={(val) =>
                      handleForwardFieldMapping(val, list)
                    }
                    isReadOnly={isReadOnly}
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
                marginTop: "20px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  // height: "var(--line_height)",
                  flex: "1",
                  backgroundColor: "#F4F4F4",
                  // marginRight: "30px",
                  marginInlineEnd: "1vw",
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
                {t("RESTOutputParameters")}
              </div>
            </div>
            <div style={{ height: "16.5rem", overflow: "auto" }}>
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
                    dropDownKey="fieldName"
                    handleFieldMapping={(val) =>
                      handleReverseFieldMapping(val, list)
                    }
                    isReadOnly={isReadOnly}
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
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(Mapping);
