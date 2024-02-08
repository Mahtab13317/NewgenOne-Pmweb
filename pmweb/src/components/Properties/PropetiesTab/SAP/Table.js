import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import styles from "./index.module.css";
import { MenuItem, Checkbox } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  COMPLEX_VARTYPE,
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants.js";
import arabicStyles from "./ArabicStyles.module.css";
import { getVarDetails } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";

function Table(props) {
  let { t } = useTranslation();
  const { isReadOnly } = props;
  const direction = `${t("HTML_DIR")}`;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [tableList, setTableList] = useState([]);

  const [selectedVal, setSelectedVal] = useState([]);
  const [mappedData, setMappedData] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.m_objPMSAPAdapterInfo
      ?.m_arrSAPTableParamMapInfo
  );
  const [checkInput, setCheckInput] = useState(null);
  const [checkOutput, setCheckOutput] = useState(null);
  const [variableList, setVariableList] = useState(null);
  const dispatch = useDispatch();
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const allTabStatus = useSelector(ActivityPropertyChangeValue);

  useEffect(() => {
    let temp = [];
    let selVar = [];
    let input = [];
    let output = [];

    props?.sapOutput[0]?.ParameterDetails.map((val) => {
      if (val.ParameterType === "T") {
        temp.push(val);
        selVar.push({ name: "0", paramName: "0" });
        input.push(false);
        output.push(false);
      }
    });

    setTableList(temp);

    if (props?.sapOutput[0]?.FunctionID == props?.changeFunction) {
      temp.forEach((data, i) => {
        for (var obj in mappedData) {
          if (mappedData[obj].paramName == data.Name) {
            selVar[i].name = mappedData[obj].selectedVar;
            selVar[i].paramName = mappedData[obj].paramName;
            /*  input[i] = mappedData[obj].enableinput;
            output[i] = mappedData[obj].enableoutput; */
            input[i] = mappedData[obj].chkInputSelected;
            output[i] = mappedData[obj].chkOutputSelected;
          }
        }
      });
    }

    setSelectedVal(selVar);
    setCheckInput(input);
    setCheckOutput(output);

    let tempVarList = [...props?.processVarDropdown];

    setVariableList(tempVarList);
  }, [props.sapOutput]);

  let compareTwoArrayOfObjects = (
    first_array_of_objects,
    second_array_of_objects
  ) => {
    return (
      first_array_of_objects.length === second_array_of_objects.length &&
      first_array_of_objects.every((element_1) =>
        second_array_of_objects.some((element_2) =>
          Object.keys(element_1).every(
            (key) => element_1[key] === element_2[key]
          )
        )
      )
    );
  };

  //Check the lists of mapped complex variable in sap fucntion table
  const checkMapData = (data) => {
    let isValid = false;
    let tempVar = [];
    let tempMapping = [];
    const complexData = props?.sapOutput[0]?.ComplexParamType;
    const filterData = complexData.filter(
      (d) =>
        d.ParamParentName === data.SystemDefinedName ||
        d.ParamParentName === data.SystemDefinedName.toUpperCase()
    );

    filterData.forEach((item, i) => {
      tempVar.push({
        // VarFieldId: item.Index,
        VariableName: item.Name,
        VariableType: item.Type,
        Unbounded: item.Unbounded,
      });
    });

    data?.RelationAndMapping?.Mappings?.Mapping.forEach((el, i) => {
      tempMapping.push({
        // VarFieldId: el.VarFieldId,
        VariableName: el.VariableName.toUpperCase(),
        VariableType: el.VariableType,
        Unbounded: el.Unbounded,
      });
    });

    return compareTwoArrayOfObjects(tempVar, tempMapping);
  };

  //Fucntion to show the variables in process variable dropdown corresponding to the parameters
  const getFilterList = (index, val) => {
    let filterProcess = "";

    filterProcess = variableList?.filter((d) => d.VariableType == val.Type);
    //filterProcess=[...variableList]
    let tempVarList = [];

    filterProcess?.forEach((_var, i) => {
      if (
        _var.VariableType === COMPLEX_VARTYPE &&
        (_var.SystemDefinedName === val.Name ||
          _var.SystemDefinedName === val.Name.toLowerCase()) &&
        _var.Unbounded === "Y"
      ) {
        //  let tempList = getComplex(_var);
        let mapData = checkMapData(_var);
        if (mapData) {
          tempVarList.push(_var);
        }

        /* tempList?.forEach((el) => {
          
          tempVarList.push(_var);
        }); */
      }
    });

    let tempProcessList = [...tempVarList];

    return tempProcessList;
  };

  //Function to map the variable corresponding to parameters
  const changeVariable = (e, index, param) => {
    let data = [...selectedVal];
    // data[index] = e.target.value;
    data[index].name = e.target.value;
    data[index].paramName = param;
    setSelectedVal(data);

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPTableParamMapInfo =
      [];

    let changedVar = selectedVal?.filter((d) => d.name != "0");

    if (changedVar?.length > 0) {
      changedVar?.map((data, i) => {
        tableList?.map((item, j) => {
          if (item.Name == data.paramName) {
            const tempVar = {
              bConstantVal: false,
              chkInputSelected: checkInput[j],
              chkOutputSelected: checkOutput[j],
              dataStructureId: "0",
              disableMapped: true,
              displayName: "",
              enableinput: checkInput[j],
              enableoutput: checkOutput[j],
              m_arrMapVariables: [],
              m_objPMSAPStructureInfo: {
                structureName: item.Name,
                structureId: 0,
              },
              optional: null,
              paramIndex: item.Index,
              paramName: item.Name,
              paramParentName: "",
              paramSelected: true,
              paramType: null,
              paramTypeName: null,
              parameterType: null,
              selectedVar: data.name,
              selectedVarScope: getVarDetails(variableList, data.name)
                .VariableScope,
              selectedVariableId: getVarDetails(variableList, data.name)
                .VariableId,
              selectedVarFieldId: getVarDetails(variableList, data.name)
                .VarFieldId,
              strSelectedConstName: "",
              unbounded: null,
            };

            tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPTableParamMapInfo.push(
              tempVar
            );
          }
        });
      });
    }

    setlocalLoadedActivityPropertyData(tempLocalState);
  };

  //function to check input checkbox and setting the data in table array of SAP
  const inputCheck = (e, index, paramIndex, val) => {
    let input = [...checkInput];
    let output = [...checkOutput];
    input[index] = e.target.checked;
    output[index] = false;
    setCheckInput(input);
    setCheckOutput(output);

    const checker = input.every((v) => v === false);

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPTableParamMapInfo =
      [];

    if (checkInput?.length > 0 && !checker) {
      checkInput?.map((data, i) => {
        tableList?.map((item, j) => {
          if (item.Name == val.Name) {
            const tempVar = {
              bConstantVal: false,
              chkInputSelected: input[i],
              chkOutputSelected: false,
              dataStructureId: "0",
              disableMapped: true,
              displayName: "",
              enableinput: input[i],
              enableoutput: false,
              m_arrMapVariables: [],
              m_objPMSAPStructureInfo: {
                structureName: item.Name,
                structureId: 0,
              },
              optional: null,
              paramIndex: item.Index,
              paramName: item.Name,
              paramParentName: "",
              paramSelected: true,
              paramType: null,
              paramTypeName: null,
              parameterType: null,
              selectedVar: selectedVal[i]?.name,
              selectedVarScope: getVarDetails(variableList, selectedVal[i].name)
                .VariableScope,
              selectedVariableId: getVarDetails(
                variableList,
                selectedVal[i].name
              ).VariableId,
              selectedVarFieldId: getVarDetails(
                variableList,
                selectedVal[i].name
              ).VarFieldId,
              strSelectedConstName: "",
              unbounded: null,
            };

            tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPTableParamMapInfo.push(
              tempVar
            );
          }
        });
      });
    }
    setlocalLoadedActivityPropertyData(tempLocalState);
  };

  //function to check output checkbox and setting the data in table array of SAP
  const outputCheck = (e, index, paramIndex, val) => {
    let output = [...checkOutput];
    let input = [...checkInput];
    output[index] = e.target.checked;
    input[index] = false;
    setCheckOutput(output);
    setCheckInput(input);

    const checker = output.every((v) => v === false);

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPTableParamMapInfo =
      [];

    if (checkOutput?.length > 0 && !checker) {
      checkOutput?.map((data, i) => {
        tableList?.map((item, j) => {
          if (item.Name == val.Name) {
            const tempVar = {
              bConstantVal: false,
              chkInputSelected: false,
              chkOutputSelected: output[i],
              dataStructureId: "0",
              disableMapped: true,
              displayName: "",
              enableinput: false,
              enableoutput: true,
              m_arrMapVariables: [],
              m_objPMSAPStructureInfo: {
                structureName: item.Name,
                structureId: 0,
              },
              optional: null,
              paramIndex: item.Index,
              paramName: item.Name,
              paramParentName: "",
              paramSelected: true,
              paramType: null,
              paramTypeName: null,
              parameterType: null,
              selectedVar: selectedVal[i].name,
              selectedVarScope: getVarDetails(variableList, selectedVal[i].name)
                .VariableScope,
              selectedVariableId: getVarDetails(
                variableList,
                selectedVal[i].name
              ).VariableId,
              selectedVarFieldId: getVarDetails(
                variableList,
                selectedVal[i].name
              ).VarFieldId,
              strSelectedConstName: "",
              unbounded: null,
            };

            tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPTableParamMapInfo.push(
              tempVar
            );
          }
        });
      });
    }
    setlocalLoadedActivityPropertyData(tempLocalState);
  };

  //Fucntion to validate the data
  //Added on 12/09/2023, bug_id:136200
  const validateData = (checkedData) => {
    let flag = true;
    checkedData?.map((data, i) => {
      if (data && selectedVal[i]?.name === "0") {
        flag = false;
      }
    });
    return flag;
  };
  //till here for bug_id:136200

  //fucntion to check validation and save changes
  //Added on 12/09/2023, bug_id:136200
  useEffect(() => {
    let isValid = true;
    const isInputEmpty = checkInput?.every((v) => v === false);
    const isOutputEmpty = checkOutput?.every((v) => v === false);
    if (isInputEmpty && isOutputEmpty) {
      isValid = true;
    } else {
      isValid = validateData(!isInputEmpty ? checkInput : checkOutput);
    }

    if (!isValid) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.sap]: { isModified: true, hasError: true },
        })
      );
      if (saveCancelStatus.SaveOnceClicked) {
        dispatch(
          setToastDataFunc({
            message: t("MapVarForCheckedParams"),
            severity: "error",
            open: true,
          })
        );
        dispatch(setSave({ SaveClicked: false }));
      }
    } else {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.sap]: {
            isModified: allTabStatus[propertiesLabel.sap].isModified,
            hasError: false,
          },
        })
      );
    }
  }, [saveCancelStatus.SaveClicked, localLoadedActivityPropertyData]);
  //till here for bug_id:136200

  return (
    <React.Fragment>
      <div
        className="row"
        style={{
          marginTop: "1rem",
          padding: "0.5rem 0",
          backgroundColor: "#F8F8F8",
        }}
      >
        <p className={styles.headerLabel1}>{t("tableParameter")}</p>
        <p className={styles.headerLabel}>{t("Input")}</p>
        <p className={styles.headerLabel}>{t("output")}</p>
        <p className={styles.headerLabel}>{t("processvariable(s)")}</p>
      </div>
      {tableList?.map((data, i) => {
        return (
          <div className="row">
            <p className={styles.tableLabel1}>{data.Name}</p>
            <div className={styles.tableLabel}>
              <Checkbox
                checked={checkInput[i]}
                disabled={isReadOnly}
                onChange={(e) => {
                  inputCheck(e, i, data.Index, data);
                }}
                style={{
                  height: "14px",
                  width: "14px",
                }}
              />
            </div>
            <div className={styles.tableLabel}>
              <Checkbox
                checked={checkOutput[i]}
                disabled={isReadOnly}
                onChange={(e) => outputCheck(e, i, data.Index, data)}
                style={{
                  height: "14px",
                  width: "14px",
                }}
              />
            </div>
            <div className={styles.tableLabel}>
              {/*  <Select
                className={styles.dataDropdown}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  style: {
                    maxHeight: 400,
                  },
                  getContentAnchorEl: null,
                }}
                disabled={isReadOnly}
                style={{ width: "8rem", border: ".5px solid #c4c4c4" }}
                value={selectedVal[i].name}
                onChange={(e) => {
                  changeVariable(e, i, data.Name);
                }}
                id="ruleParam1Dropdown"
              >
                {getFilterList(i, data)?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.VariableName}
                    >
                      {option.VariableName}
                    </MenuItem>
                  );
                })}
              </Select> */}

              <CustomizedDropdown
                key={i}
                id="pmweb_SAPAdapter_Table_ProcessVar"
                disabled={isReadOnly}
                style={{
                  width: "8rem",
                  border: ".5px solid #c4c4c4",
                  width: "50%",
                }}
                value={selectedVal[i].name}
                onChange={(e) => {
                  changeVariable(e, i, data.Name);
                }}
                className={styles.dataDropdown}
              >
                {getFilterList(i, data)?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.VariableName}
                    >
                      {option.VariableName}
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown>
            </div>
          </div>
        );
      })}
    </React.Fragment>
  );
}

export default Table;
