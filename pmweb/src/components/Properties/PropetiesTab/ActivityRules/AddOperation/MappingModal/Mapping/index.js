import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Icon, MenuItem } from "@material-ui/core";
import CustomizedDropdown from "../../../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import Boolean_Icon from "../../../../../../../assets/DataModalIcons/DM_Boolean.svg";
import IntegerIcon from "../../../../../../../assets/DataModalIcons/DM_Integer.svg";
import FloatIcon from "../../../../../../../assets/DataModalIcons/DM_Float.svg";
import DateIcon from "../../../../../../../assets/DataModalIcons/DM_Date.svg";
import StringIcon from "../../../../../../../assets/DataModalIcons/DM_String.svg";
import LongIcon from "../../../../../../../assets/DataModalIcons/DM_Long.svg";
import { getVariableByName } from "../../../../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import { shortenRuleStatement } from "../../../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LightTooltip } from "../../../../../../../UI/StyledTooltip";
import {
  CONSTANT,
  FORWARD_MAPPING,
  REVERSE_MAPPING,
  RTL_DIRECTION,
} from "../../../../../../../Constants/appConstants";

// Component for showing mapping fields and data.
function MappingData(props) {
  let { t } = useTranslation();
  const {
    isForwardMapping,
    setAllMappingData,
    dropdownOptions,
    paramName,
    paramType,
    mappedFieldValue,
    mapFieldType,
    variableIcons,
    listOfParameters,
    index,
    showError,
  } = props;
  const direction = `${t("HTML_DIR")}`;
  const [mappedVariable, setMappedVariable] = useState("DropDownDefaultValue");
  const [filteredDropdownOptions, setFilteredDropdownOptions] = useState([]);
  const [constField, setConstField] = useState(false);
  const faultValues = [
    { paramIndex: "-998", paramName: "FaultId" },
    { paramIndex: "-999", paramName: "FaultDesc" },
  ];

  // Function that runs when either dropdown options change or param type changes.
  useEffect(() => {
    if (isForwardMapping) {
      if (dropdownOptions) {
        let filteredOptions = [];
        if (paramType === "3") {
          filteredOptions = dropdownOptions?.filter(
            (element) =>
              element.VariableType === "3" ||
              element.VariableType === "4" ||
              element.VariableScope === "F"
          );
        } else {
          filteredOptions = dropdownOptions?.filter(
            (element) =>
              element.VariableType === paramType ||
              element.VariableScope === "F"
          );
        }
        setFilteredDropdownOptions(filteredOptions);
      }
    } else {
      let tempArr = [...listOfParameters, ...faultValues];
      setFilteredDropdownOptions(tempArr);
    }
  }, [dropdownOptions, paramType]);

  // Function that runs when the mappedFieldValue value changes.
  useEffect(() => {
    if (mappedFieldValue) {
      if (mappedFieldValue === "") {
        setMappedVariable("DropDownDefaultValue");
      } else {
        setMappedVariable(mappedFieldValue);
      }
      /*code added on 21 July 2023 for BugId 132939 - Entry Settings: no option to 
      add constant value in dropdown on Mapping window under call operation. */
      if (isForwardMapping && mapFieldType === "C") {
        setConstField(true);
      } else {
        setConstField(false);
      }
    }
  }, [mappedFieldValue, mapFieldType, paramName]);

  // Function to get Variable icon according to the variable type of parameter or variable.
  const getVariableIcon = (varType) => {
    let varIcon;
    variableIcons?.forEach((element) => {
      if (element.value === varType) {
        varIcon = element.icon;
      }
    });

    return varIcon;
  };

  // Function that handles dropdown value change
  const handleDropdownChange = (event, isDropdownConst) => {
    const { value } = event.target;
    setMappedVariable(value);
    if (isForwardMapping) {
      setAllMappingData((prevData) => {
        let temp = [...prevData];
        let mappingIndex;
        temp.forEach((element, ind) => {
          if (
            element.mapType_1 === FORWARD_MAPPING &&
            element.ParamName === paramName
          ) {
            mappingIndex = ind;
          }
        });
        /*code added on 21 July 2023 for BugId 132939 - Entry Settings: no option to 
        add constant value in dropdown on Mapping window under call operation. */
        if (value === "DropDownDefaultValue") {
          temp[mappingIndex].mapField = "";
        } else {
          temp[mappingIndex].mapField = value;
          temp[mappingIndex].mapFieldType = isDropdownConst
            ? "C"
            : getVariableByName(value, filteredDropdownOptions)?.VariableScope;
          temp[mappingIndex].mapVarFieldId =
            getVariableByName(value, filteredDropdownOptions)?.VarFieldId ===
              undefined || isDropdownConst
              ? "0"
              : getVariableByName(value, filteredDropdownOptions)?.VarFieldId;
          temp[mappingIndex].mapVariableId =
            getVariableByName(value, filteredDropdownOptions)?.VariableId ===
              undefined || isDropdownConst
              ? "0"
              : getVariableByName(value, filteredDropdownOptions)?.VariableId;
        }
        return temp;
      });
    } else {
      setAllMappingData((prevData) => {
        let temp = [...prevData];
        let mappingIndex;
        temp.forEach((element, ind) => {
          if (
            element.mapType_1 === REVERSE_MAPPING &&
            element.ParamName === paramName
          ) {
            mappingIndex = ind;
          }
        });
        /*code added on 21 July 2023 for BugId 132939 - Entry Settings: no option to 
        add constant value in dropdown on Mapping window under call operation. */
        if (value === "DropDownDefaultValue") {
          temp[mappingIndex].paramIndex = "";
        } else {
          temp[mappingIndex].paramIndex = value;
        }
        return temp;
      });
    }
  };

  return (
    <div
      className={clsx(
        styles.flexRow,
        styles.width,
        styles.mappingDataSingleRow
      )}
    >
      <div className={clsx(styles.flexRow, styles.firstfieldDataDiv)}>
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginLeft: "21%",
          }}
        >
          <img
            style={{ height: "100%" }}
            src={getVariableIcon(paramType)}
            alt="Param Name"
          />
        </Icon>
        <LightTooltip
          id="pmweb_parameter_Tooltip"
          arrow={true}
          enterDelay={500}
          placement="right-end"
          title={paramName}
        >
          <p className={styles.parameterText}>
            {shortenRuleStatement(paramName, 12)}
          </p>
        </LightTooltip>
      </div>
      <p className={styles.equals}>=</p>
      <CustomizedDropdown
        id={`pmweb_Mapping_MappedVariable_Dropdown_${index}`}
        className={styles.typeDropdown}
        relativeStyle={{
          flex: "1",
          marginInlineEnd: "1.5vw",
        }}
        style={{
          border:
            isForwardMapping && showError && mappedVariable === CONSTANT
              ? "1px solid #b52a2a"
              : "1px solid #c4c4c4",
        }}
        value={mappedVariable}
        onChange={(event, isConstant) =>
          handleDropdownChange(event, isConstant)
        }
        isNotMandatory={true}
        /*code added on 21 July 2023 for BugId 132939 - Entry Settings: no option to 
        add constant value in dropdown on Mapping window under call operation. */
        showConstValue={isForwardMapping}
        isConstant={constField}
        setIsConstant={(val) => setConstField(val)}
        constType={paramType}
      >
        {filteredDropdownOptions?.map((element) => {
          return (
            <MenuItem
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.menuItemStyles
                  : styles.menuItemStyles
              }
              key={isForwardMapping ? element.VariableName : element.paramIndex}
              value={
                isForwardMapping ? element.VariableName : element.paramIndex
              }
            >
              {isForwardMapping ? (
                <LightTooltip
                  id="pmweb_parameter_Tooltip"
                  arrow={true}
                  enterDelay={500}
                  placement="bottom-start"
                  title={element.VariableName}
                >
                  <span>{shortenRuleStatement(element.VariableName, 12)}</span>
                </LightTooltip>
              ) : (
                <LightTooltip
                  id="pmweb_parameter_Tooltip"
                  arrow={true}
                  enterDelay={500}
                  placement="bottom-start"
                  title={element.paramName}
                >
                  <span>{shortenRuleStatement(element.paramName, 12)}</span>
                </LightTooltip>
              )}
            </MenuItem>
          );
        })}
      </CustomizedDropdown>
    </div>
  );
}

function Mapping(props) {
  let { t } = useTranslation();
  const {
    isForwardMapping,
    allMappingData,
    setAllMappingData,
    dropdownOptions,
    listOfParameters,
    showError,
  } = props;

  const [variableIcons, setVariableIcons] = useState([]);

  useEffect(() => {
    const tempObj = [
      { value: "3", label: "Integer", icon: IntegerIcon },
      { value: "4", label: "Long", icon: LongIcon },
      { value: "6", label: "Float", icon: FloatIcon },
      { value: "8", label: "Date", icon: DateIcon },
      { value: "10", label: "Text", icon: StringIcon },
      { value: "12", label: "Boolean", icon: Boolean_Icon },
    ];
    setVariableIcons(tempObj);
  }, []);

  return (
    <div>
      <div className={clsx(styles.flexRow, styles.fwdMappingHeadersDiv)}>
        <div className={styles.parameterHeading}>
          {isForwardMapping ? (
            <p className={styles.headingText}>{t("Parameters")}</p>
          ) : (
            <p className={styles.headingText}>{t("Variables")}</p>
          )}
        </div>
        <div className={styles.equals}></div>
        <div className={styles.parameterRevHeading}>
          {isForwardMapping ? (
            <p className={styles.headingText}>{t("Variables")}</p>
          ) : (
            <p className={styles.headingText}>{t("Parameters")}</p>
          )}
        </div>
      </div>
      <div className={styles.dataDiv}>
        {allMappingData?.map((element, index) => {
          return (
            <div className={styles.flexRow}>
              <MappingData
                isForwardMapping={isForwardMapping}
                setAllMappingData={setAllMappingData}
                dropdownOptions={dropdownOptions}
                paramName={element.ParamName}
                paramType={element.ParamType}
                mappedFieldValue={
                  isForwardMapping ? element.mapField : element.paramIndex
                }
                mapFieldType={element.mapFieldType}
                variableIcons={variableIcons}
                listOfParameters={listOfParameters}
                index={index}
                showError={showError}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Mapping;
