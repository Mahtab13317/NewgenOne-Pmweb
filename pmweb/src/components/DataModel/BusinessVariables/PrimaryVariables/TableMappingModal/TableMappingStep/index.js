import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import MultiLineSelect from "../../../../../../UI/MultiLineSelect";
import { RTL_DIRECTION } from "../../../../../../Constants/appConstants";

function TableMappingStep(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { childTableName, aliasName, columnData, mappingDataField } = props;
  const [selectedDataField, setSelectedDataField] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);

  console.log('ASDF_2nd',columnData);

  const dropdownComponentStyles = {
    dataFieldDropdownLtr: styles.dataFieldDropdown,
    dataFieldDropdownRtl: arabicStyles.dataFieldDropdown,
    menuItemStylesLtr: styles.menuItemStyles,
    menuItemStylesRtl: arabicStyles.menuItemStyles,
    dropdownDataLtr: styles.dropdownData,
    dropdownDataRtl: arabicStyles.dropdownData,
    dropdownSubTextLtr: styles.dropdownSubText,
    dropdownSubTextRtl: arabicStyles.dropdownSubText,
  };

  // Function that gets called when the component is loaded.
  useEffect(() => {
    setSelectedDataField(mappingDataField);
    let temp=[];
    columnData.forEach((element) => {
      let newObj = {
        aliasName: element.Name,
        dataField: element.Name,
      };
      temp.push(newObj);
    });
    setDropdownOptions(temp);
  }, []);

  // Function that handles the change in data field dropdown.
  const handleDropdownChange = (event) => {
    setSelectedDataField(event.target.value);
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.tableNameDiv}>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.mappingTable
              : styles.mappingTable
          }
        >
          {t("tableUsedForMapping")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.tableName
              : styles.tableName
          }
        >
          {childTableName}
        </p>
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.headingDiv
            : styles.headingDiv
        }
      >
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.queueVariable
              : styles.queueVariable
          }
        >
          {t("queueVariable")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.dataField
              : styles.dataField
          }
        >
          {t("dataField")}
        </p>
      </div>
      <div className={styles.dataDiv}>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.queueVariableData
              : styles.queueVariableData
          }
        >
          {aliasName}
        </p>

        <MultiLineSelect
          selectedDataField={selectedDataField}
          setSelectedDataField={setSelectedDataField}
          componentStyles={dropdownComponentStyles}
          handleDropdownChange={handleDropdownChange}
          dropdownOptions={dropdownOptions}
        />
      </div>
    </div>
  );
}

export default TableMappingStep;
