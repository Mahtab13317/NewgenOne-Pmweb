import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { Tab, Tabs } from "@material-ui/core";
import Mapping from "./Mapping";
import { TabPanel } from "../../../../../ProcessSettings";
import {
  CONSTANT,
  FORWARD_MAPPING,
  REVERSE_MAPPING,
  RTL_DIRECTION,
  SPACE,
} from "../../../../../../Constants/appConstants";
import CloseIcon from "@material-ui/icons/Close";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../../../redux-store/slices/ToastDataHandlerSlice";
// import { isEqual } from "lodash";

function ParameterMappingModal(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    index,
    isRuleBeingCreated,
    dropdownOptions,
    functionSelected,
    functionMethodIndex, //not required for now.
    functionOptions,
    parameterMapping,
    setLocalRuleData,
    handleClose,
    setIsRuleBeingModified,
  } = props;
  const direction = `${t("HTML_DIR")}`;
  const [value, setValue] = useState(0); // State to store the value of selected tab.
  const [previousMappingData, setPreviousMappingData] = useState([]); // State to store previous mapping data for cancelling changes.
  const [allMappingData, setAllMappingData] = useState([]); // All mapping data (Both for forward and reverse mapping)
  const [listOfParameters, setListOfParameters] = useState([]); // State that stores the list of parameters for the selected functions to be used while reverse mapping.
  const [isNoParameterFunction, setIsNoParameterFunction] = useState(false);
  // const [isDataChanged, setIsDataChanged] = useState(false); //Not required for now.
  const [showError, setShowError] = useState(false);

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Function that runs when the either of functionOptions or functionSelected or parameterMapping changes.
  useEffect(() => {
    let dataArray = [];
    let parametersArray = [];
    let methodIndex = "";
    let params = [];
    let tempArr = [];

    setValue(0);

    // For parameters and method index
    functionOptions?.forEach((element) => {
      if (element.methodIndex === functionSelected) {
        parametersArray = element.parameters;
        methodIndex = element.methodIndex;
        if (parametersArray?.length === 0) {
          setIsNoParameterFunction(true);
        } else {
          setIsNoParameterFunction(false);
        }
      }
    });

    // For forward mapping
    parametersArray?.forEach((element) => {
      const tempObj = {
        dataStructId: element.DataStructureId,
        methodIndex_1: methodIndex,
        paramIndex: element.ParamIndex,
        mapType_1: FORWARD_MAPPING,
        mapField: "",
        mapFieldType: "",
        mapVarFieldId: "",
        mapVariableId: "",
        ParamName: element.ParamName,
        ParamType: element.ParamType,
      };
      dataArray.push(tempObj);
      const paramObj = {
        paramIndex: element.ParamIndex,
        paramName: element.ParamName,
      };
      params.push(paramObj);
    });

    // For reverse mapping
    dropdownOptions
      ?.filter((element) => element.VariableScope !== "C")
      .forEach((element) => {
        const tempObj = {
          dataStructId: "0",
          methodIndex_1: methodIndex,
          paramIndex: "",
          mapType_1: REVERSE_MAPPING,
          mapField: element.VariableName,
          mapFieldType: element.VariableScope,
          mapVarFieldId: element.VarFieldId,
          mapVariableId: element.VariableId,
          ParamName: element.VariableName,
          ParamType: element.VariableType,
        };
        dataArray.push(tempObj);
      });

    tempArr = JSON.parse(JSON.stringify(dataArray));
    setListOfParameters(params);
    setAllMappingData(dataArray);
    if (
      parameterMapping &&
      parameterMapping?.length > 0 &&
      dataArray?.length > 0
    ) {
      fillMappingValues(dataArray);
    } else {
      tempArr = JSON.parse(JSON.stringify(dataArray));
      setPreviousMappingData(tempArr);
    }
  }, [functionOptions, functionSelected, parameterMapping]);

  // Function that runs when the parameterMapping data is present and is used to fill values of mapping after fetching.
  const fillMappingValues = (dataArr) => {
    let tempArr = JSON.parse(JSON.stringify(dataArr));

    parameterMapping?.forEach((element) => {
      tempArr?.forEach((elem) => {
        if (
          element.mapType_1 === FORWARD_MAPPING &&
          elem.mapType_1 === FORWARD_MAPPING
        ) {
          if (element.paramIndex === elem.paramIndex) {
            elem.mapField = element.mapField;
            elem.mapFieldType = element.mapFieldType;
            elem.mapVarFieldId = element.mapVarFieldId;
            elem.mapVariableId = element.mapVariableId;
          }
        }
      });
    });

    parameterMapping?.forEach((element) => {
      tempArr?.forEach((elem) => {
        if (
          element.mapType_1 === REVERSE_MAPPING &&
          elem.mapType_1 === REVERSE_MAPPING
        ) {
          if (element.mapField === elem.mapField) {
            elem.paramIndex = element.paramIndex;
          }
        }
      });
    });
    setPreviousMappingData(tempArr);
    setAllMappingData(tempArr);
  };

  // Function that runs when the user clicks on cancel button.
  const cancelChanges = () => {
    setAllMappingData(() => {
      let temp = [...previousMappingData];
      return temp;
    });
    handleClose();
  };

  const validateData = (tempMappingData) => {
    let isValid = true,
      param1 = null;
    tempMappingData?.forEach((element) => {
      if (
        element.mapType_1 === FORWARD_MAPPING &&
        element.mapField === CONSTANT &&
        isValid
      ) {
        isValid = false;
        param1 = element.ParamName;
      }
    });
    return [isValid, param1];
  };

  // Function that runs when the user clicks on save button.
  const handleSave = () => {
    let [isValid, param1] = validateData(allMappingData);
    if (isValid) {
      let finalArr = [];
      allMappingData?.forEach((element) => {
        if (element.mapType_1 === FORWARD_MAPPING && element.mapField !== "") {
          finalArr.push(element);
        } else if (
          element.mapType_1 === REVERSE_MAPPING &&
          element.paramIndex !== ""
        ) {
          finalArr.push(element);
        }
      });

      setLocalRuleData((prevData) => {
        let temp = { ...prevData };
        temp.ruleOpList[index].paramMappingList = finalArr;
        return temp;
      });

      if (isRuleBeingCreated === false) {
        setIsRuleBeingModified(true);
      }
      handleClose();
    } else {
      dispatch(
        setToastDataFunc({
          message: t("PleaseDefineMappingFor") + SPACE + param1,
          severity: "error",
          open: true,
        })
      );
    }
    setShowError(!isValid);
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleModalKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSave();
    } else if (e.keyCode === 27) {
      handleClose();
      e.stopPropagation();
    }
  };

  // Function that runs when the handleModalKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleModalKeyDown);
    return () => document.removeEventListener("keydown", handleModalKeyDown);
  }, [handleModalKeyDown]);

  return (
    <div className={clsx(styles.flexColumn, styles.mainDiv)}>
      <div className={clsx(styles.flexRow, styles.mappingModalHeader)}>
        <p className={styles.parameterMappingHeading}>
          {t("parameterMapping")}
          {SPACE}
          {isNoParameterFunction
            ? `-
          ${SPACE}${t("reverse")}`
            : ""}
        </p>
        <CloseIcon
          id="pmweb_AO_MappingModal_CloseIconBtn"
          tabIndex={0}
          onClick={handleClose}
          className={styles.closeIcon}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleClose();
              e.stopPropagation();
            }
          }}
        />
      </div>
      <div style={{ borderTop: "1px solid #D3D3D3" }}>
        {isNoParameterFunction ? (
          <div className={styles.flexColumn}>
            <p className={styles.noForwardMappingText}>
              {t("noForwardMapping")}
            </p>
            <Mapping
              isForwardMapping={false}
              allMappingData={allMappingData.filter(
                (element) =>
                  /*code edited on 21 July 2023 for BugId 132939 - Entry Settings: no option to add 
                  constant value in dropdown on Mapping window under call operation. */
                  element.mapType_1 === REVERSE_MAPPING &&
                  element.mapFieldType !== "F"
              )} // All data for reverse mapping.
              setAllMappingData={setAllMappingData} // Setter function for all mapping data.
              dropdownOptions={dropdownOptions} // List of variables.
              listOfParameters={listOfParameters}
              showError={showError}
            />
          </div>
        ) : (
          <div>
            <Tabs
              value={value}
              onChange={handleChange}
              className={styles.dataModelTabHeader}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleChange();
                  e.stopPropagation();
                }
              }}
            >
              <Tab
                id="pmweb_AO_MappingModal_ForwardMapping"
                className={styles.dataModelTab}
                label={t("forwardMapping")}
                tabIndex={0}
              />
              <Tab
                id="pmweb_AO_MappingModal_ReverseMapping"
                className={styles.dataModelTab}
                label={t("reverseMapping")}
                tabIndex={0}
              />
            </Tabs>
            <div>
              <TabPanel value={value} index={0}>
                <Mapping
                  isForwardMapping={true}
                  allMappingData={allMappingData.filter(
                    (element) => element.mapType_1 === FORWARD_MAPPING
                  )} // All data for forward mapping.
                  setAllMappingData={setAllMappingData} // Setter function for all mapping data.
                  dropdownOptions={dropdownOptions} // List of variables.
                  showError={showError}
                />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Mapping
                  isForwardMapping={false}
                  allMappingData={allMappingData.filter(
                    (element) =>
                      /*code edited on 21 July 2023 for BugId 132939 - Entry Settings: no option to 
                      add constant value in dropdown on Mapping window under call operation. */
                      element.mapType_1 === REVERSE_MAPPING &&
                      element.mapFieldType !== "F"
                  )} // All data for reverse mapping.
                  setAllMappingData={setAllMappingData} // Setter function for all mapping data.
                  dropdownOptions={dropdownOptions} // List of variables.
                  listOfParameters={listOfParameters}
                  showError={showError}
                />
              </TabPanel>
            </div>
          </div>
        )}
      </div>
      <div className={styles.buttonsDiv}>
        <div
          className={
            direction === RTL_DIRECTION ? arabicStyles.buttons : styles.buttons
          }
        >
          <button
            id="pmweb_AO_MappingModal_CancelBtn"
            // disabled={isDataChanged}
            className={styles.cancelButton}
            onClick={cancelChanges}
          >
            {t("cancel")}
          </button>
          <button
            id="pmweb_AO_MappingModal_SaveBtn"
            // disabled={isDataChanged}
            className={styles.saveButton}
            onClick={handleSave}
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParameterMappingModal;
