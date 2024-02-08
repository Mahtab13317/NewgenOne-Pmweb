import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import styles from "./index.module.css";
import { Select, MenuItem } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  COMPLEX_VARTYPE,
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants.js";
import arabicStyles from "./ArabicStyles.module.css";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  getComplex,
  getVarDetails,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function Input(props) {
  let { t } = useTranslation();
  const { isReadOnly } = props;
  const direction = `${t("HTML_DIR")}`;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [inputList, setinputList] = useState([]);
  const [selectedVariable, setselectedVariable] = useState([]);
  const [mappedData, setMappedData] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.m_objPMSAPAdapterInfo
      ?.m_arrSAPInputParamMapInfo
  );
  const [variableList, setVariableList] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let temp = [];
    let selVar = [];
    /*  props?.sapOutput[0]?.ParameterDetails.map((val) => {
      if (val.ParameterType === "I") {
        temp.push(val);
        selVar.push({ name: "0", paramName: "0" });
      }
    }); */
    const complexData = props?.sapOutput[0]?.ComplexParamType;
    props?.sapOutput[0]?.ParameterDetails.filter(
      (d) => d.ParameterType == "I"
    ).map((val) => {
      //temp.push(val);
      if (val.Type == "11") {
        complexData
          .filter((d) => d.ParamParentName == val.Name)
          .map((data) => {
            temp.push(data);
            selVar.push({ name: "0", paramName: "0" });
          });
      } else {
        temp.push(val);
        selVar.push({ name: "0", paramName: "0" });
      }
    });
    setinputList(temp);

    if (props?.sapOutput[0]?.FunctionID == props?.changeFunction) {
      temp.forEach((data, i) => {
        for (var obj in mappedData) {
          if (mappedData[obj].paramName == data.Name) {
            selVar[i].name = mappedData[obj].selectedVar;
            selVar[i].paramName = mappedData[obj].paramName;
          }
        }
      });
    }
    setselectedVariable(selVar);

    let tempVarList = [];

    props?.processVarDropdown?.forEach((_var) => {
      if (_var.VariableType === COMPLEX_VARTYPE) {
        let tempList = getComplex(_var);
        tempList?.forEach((el) => {
          tempVarList.push(el);
        });
      } else {
        tempVarList.push(_var);
      }
    });

    setVariableList(tempVarList);
  }, [props?.sapOutput]);

  const getFilterList = (index, val) => {
    let filterProcess = "";

    filterProcess = variableList?.filter((d) => d.VariableType == val.Type);

    let tempProcessList = [...filterProcess];

    return tempProcessList;
  };

  const changeVariable = (e, index, param) => {
    let data = [...selectedVariable];
    data[index].name = e.target.value;
    data[index].paramName = param;
    setselectedVariable(data);

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPInputParamMapInfo =
      [];

    let changedVar = selectedVariable?.filter((d) => d.name != "0");

    if (changedVar?.length > 0) {
      changedVar?.map((data, i) => {
        inputList?.map((item, j) => {
          if (item.Name == data.paramName) {
            const tempVar = {
              bConstantVal: false,
              chkInputSelected: false,
              chkOutputSelected: false,
              dataStructureId: "0",
              disableMapped: true,
              displayName: "",
              enableinput: false,
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

            tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_arrSAPInputParamMapInfo.push(
              tempVar
            );
          }
        });
      });
    }

    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.sap]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <React.Fragment>
      <div>
        <div
          className="row"
          style={{
            marginTop: "1rem",
            padding: "0.5rem 0",
            backgroundColor: "#F8F8F8",
          }}
        >
          <p className={styles.headerLabel1}>{t("importParameters")}</p>
          <p className={styles.headerLabel}>{t("parentName")}</p>
          <p className={styles.headerLabel}>{t("processvariable(s)")}</p>
        </div>
        <div className={`${styles.scroll} ${styles.tabSection}`}>
          {inputList &&
            inputList?.map((val, i) => {
              return (
                <div className={styles.tableRow}>
                  <p className={styles.tableLabel1}>{val.Name}</p>
                  <p className={styles.tableLabel}>
                    {val?.ParamParentName ? val.ParamParentName : "-"}
                  </p>
                  <div className={styles.tableLabel}>
                    {/* <Select
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
                      style={{
                        width: "8rem",
                        border: ".5px solid #c4c4c4",
                        background: "white",
                      }}
                      disabled={isReadOnly}
                      key={i}
                      value={selectedVariable[i].name}
                      onChange={(e) => {
                        changeVariable(e, i, val.Name);
                      }}
                      id="pmweb_SAPAdapter_Input_ProcessVar"
                    >
                      {getFilterList(i, val)?.map((option) => {
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
                      disabled={isReadOnly}
                      key={i}
                      value={selectedVariable[i].name}
                      onChange={(e) => {
                        changeVariable(e, i, val.Name);
                      }}
                      id="pmweb_SAPAdapter_Input_ProcessVar"
                      width="100%"
                      className={styles.dataDropdown}
                      style={{
                        width: "50%",
                      }}
                    >
                      {getFilterList(i, val)?.map((option) => {
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
        </div>
      </div>
    </React.Fragment>
  );
}

export default Input;
