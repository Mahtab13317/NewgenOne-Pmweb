import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { InputBase, Divider, Select, MenuItem } from "@material-ui/core";
import InputFieldsStrip from "../InputFieldsStrip";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { getVariableType } from "../../../../../../utility/ProcessSettings/Triggers/getVariableType";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import {
  RTL_DIRECTION,
  INSERTION_ORDER_ID,
  CONSTRAINT_TYPE_PRIMARY,
  MAP_ID,
} from "../../../../../../Constants/appConstants";
import { defaultColumnData } from "./ColumnAndDataMapping";

function TableDetailsStep(props) {
  const {
    aliasName,
    tableNameValue,
    setChildTableName,
    setChildVariableName,
    setColumnData,
    tableDetailColumnData,
    relationAndMapping,
  } = props;
  const foreignKeyOptions = ["3", "4"];
  const columnDropdownOptions = [
    "10",
    "6",
    "3",
    "4",
    "8",
    "12",
    "15",
    "16",
    "17",
    "18",
  ];
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [tableAliasName, setTableAliasName] = useState("");
  const [tableName, setTableName] = useState("");
  const [showInputFields, setShowInputFields] = useState(false);
  const [tableColumnDetails, setTableColumnDetails] =
    useState(defaultColumnData);
  const [columnAliasName, setColumnAliasName] = useState("");
  const [columnVariableType, setColumnVariableType] = useState("");
  const [columnDataField, setColumnDataField] = useState("");
  const [primaryKey, setPrimaryKey] = useState(false);
  const [foreignKeyColumnName, setForeignKeyColumnName] = useState("");

  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };

  // Function that runs when the component loads.
  useEffect(() => {
    let columnData = [];
    if (tableNameValue !== "") {
      setChildTableName(tableNameValue && tableNameValue.split(" ").join(""));
      setTableName(tableNameValue && tableNameValue.split(" ").join(""));
      setTableAliasName(tableNameValue);
    } else {
      setChildTableName(aliasName.split(" ").join(""));
      setTableName(aliasName.split(" ").join(""));
      setTableAliasName(aliasName);
    }
    if (tableDetailColumnData && tableDetailColumnData.length > 0) {
      const foreignKeyColumn =
        relationAndMapping && relationAndMapping.Relations[0].RKey;
      setForeignKeyColumnName(foreignKeyColumn);
      const [insertionOrderIdObj] = tableDetailColumnData?.filter((element) => {
        return element.Name === INSERTION_ORDER_ID;
      });
      columnData.push(insertionOrderIdObj);
      const [foreignKeyObj] = tableDetailColumnData?.filter((element) => {
        return element.Name === foreignKeyColumn;
      });
      columnData.push(foreignKeyObj);
      const remainingColumnData = tableDetailColumnData?.filter((element) => {
        return (
          element.Name !== INSERTION_ORDER_ID &&
          element.Name !== foreignKeyColumn
        );
      });
      remainingColumnData &&
        remainingColumnData.forEach((element) => {
          columnData.push(element);
        });
      setTableColumnDetails([...columnData]);
      console.log(
        "TM",
        "Column Data",
        tableDetailColumnData,
        relationAndMapping,
        columnData
      );
    }
    setColumnData([...columnData]);
  }, [tableDetailColumnData, tableNameValue]);

  // Function that handles the change in table alias name.
  const handleTableAliasName = (event) => {
    setTableAliasName(event.target.value);
  };

  // Function that handles the change in table name.
  const handleTableName = (event) => {
    setTableName(event.target.value);
    setChildTableName(event.target.value);
  };

  // Function that handles the change in column alias name.
  const handleColumnAliasName = (event, index) => {
    const temp = [...tableColumnDetails];
    temp[index].aliasName = event.target.value;
    setTableColumnDetails([...temp]);
    setColumnData([...temp]);
  };

  // Function that handles the change in variable type.
  const handleVariableType = (event, index) => {
    const temp = [...tableColumnDetails];
    temp[index].variableType = event.target.value;
    setTableColumnDetails([...temp]);
    setColumnData([...temp]);
  };

  // Function that handles the change in data field.
  const handleDataField = (event, index) => {
    const temp = [...tableColumnDetails];
    temp[index].dataField = event.target.value;
    setTableColumnDetails([...temp]);
    tableColumnDetails.forEach((element) => {
      if (element.Name === foreignKeyColumnName) {
        const dataField = element.Name;
        setChildVariableName(dataField);
      }
    });
    setColumnData([...temp]);
  };

  // Function that runs when a user deletes a column that he has previously made.
  const handleDeleteColumn = (index) => {
    const temp = [...tableColumnDetails];
    temp.splice(index, 1);
    setTableColumnDetails([...temp]);
  };

  // Fuction that runs when a user makes a primary key column non-primary.
  const handleRemovePrimaryKey = (index) => {
    const temp = [...tableColumnDetails];
    temp[index].Attribute = "";
    setTableColumnDetails([...temp]);
  };

  return (
    <div className={styles.tableDetailsMainDiv}>
      <div className={styles.tableDetailsDiv}>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.tableAliasName
              : styles.tableAliasName
          }
        >
          {t("aliasName")}
        </p>
        <InputBase
          id="table_details_table_alias_name"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.tableAliasNameInput
              : styles.tableAliasNameInput
          }
          autoFocus
          variant="outlined"
          onChange={handleTableAliasName}
          value={tableAliasName}
        />
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.tableName
              : styles.tableName
          }
        >
          {t("tableName")}
        </p>
        <InputBase
          id="table_details_table_name"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.tableNameInput
              : styles.tableNameInput
          }
          variant="outlined"
          onChange={handleTableName}
          value={tableName}
        />
        <button
          id="table_details_existing_table_button"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.existingTableButton
              : styles.existingTableButton
          }
        >
          <span className={styles.existingTableButtonText}>
            {t("selectAnExistingTable")}
          </span>
        </button>
      </div>

      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.headersDiv
            : styles.headersDiv
        }
      >
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.aliasName
              : styles.aliasName
          }
        >
          {t("aliasName")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION ? arabicStyles.type : styles.type
          }
        >
          {t("type")}
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
        <p
          className={
            direction === RTL_DIRECTION ? arabicStyles.role : styles.role
          }
        >
          {t("role")}
        </p>
        {!showInputFields ? (
          <button
            id="table_details_show_input_field"
            onClick={() => setShowInputFields(true)}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.addVariable
                : styles.addVariable
            }
          >
            <span className={styles.addVariableText}>{t("addVariable")}</span>
          </button>
        ) : null}
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.mandatoryFields
            : styles.mandatoryFields
        }
      >
        {showInputFields ? (
          <div className={styles.inputsDiv}>
            <InputFieldsStrip
              columnAliasName={columnAliasName}
              setColumnAliasName={setColumnAliasName}
              columnVariableType={columnVariableType}
              setColumnVariableType={setColumnVariableType}
              columnDataField={columnDataField}
              setColumnDataField={setColumnDataField}
              primaryKey={primaryKey}
              setPrimaryKey={setPrimaryKey}
              tableColumnDetails={tableColumnDetails}
              setTableColumnDetails={setTableColumnDetails}
              setColumnData={setColumnData}
              closeInputStrip={() => setShowInputFields(false)}
              columnDropdownOptions={columnDropdownOptions}
              getVariableType={getVariableType}
            />
          </div>
        ) : null}

        {tableColumnDetails &&
          tableColumnDetails.map((d, index) => {
            return (
              <div className={styles.predefinedFields}>
                <div className={styles.primaryKeyDetails}>
                  <InputBase
                    id="table_details_alias_name_input"
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.aliasNameDataInput
                        : styles.aliasNameDataInput
                    }
                    variant="outlined"
                    onChange={(event) => handleColumnAliasName(event, index)}
                    value={d.AliasName ? d.AliasName : d.Name}
                  />
                  {d.Name === INSERTION_ORDER_ID ? (
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.typeDataInput
                            : styles.typeDataInput
                        }
                      >
                        {getVariableType(d.Type)}
                      </p>
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataFieldInput
                            : styles.dataFieldInput
                        }
                      >
                        {d.Name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Select
                        id="table_details_variable_dropdown"
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.variableDropdown
                            : styles.variableDropdown
                        }
                        value={d.Type}
                        MenuProps={menuProps}
                        onChange={(event) => handleVariableType(event, index)}
                      >
                        {
                          // d.Name !== foreignKeyColumnName &&
                          // d.Name !== "insertionOrderId"
                          //   ?
                          columnDropdownOptions &&
                            columnDropdownOptions.map((element) => {
                              return (
                                <MenuItem
                                  className={
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.menuItemStyles
                                      : styles.menuItemStyles
                                  }
                                  value={element}
                                >
                                  {getVariableType(element)}
                                </MenuItem>
                              );
                            })
                          // : foreignKeyOptions &&
                          //   foreignKeyOptions.map((element) => {
                          //     return (
                          //       <MenuItem
                          //         className={
                          //           direction === RTL_DIRECTION
                          //             ? arabicStyles.menuItemStyles
                          //             : styles.menuItemStyles
                          //         }
                          //         value={element}
                          //       >
                          //         {getVariableType(element)}
                          //       </MenuItem>
                          //     );
                          //   })
                        }
                      </Select>
                      <InputBase
                        id="table_details_data_field_input"
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataFieldInputField
                            : styles.dataFieldInputField
                        }
                        variant="outlined"
                        onChange={(event) => handleDataField(event, index)}
                        value={d.Name}
                      />
                    </div>
                  )}
                  <div
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.tagsDiv
                        : styles.tagsDiv
                    }
                  >
                    {d.Name === INSERTION_ORDER_ID ? (
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.autoIncrementId
                            : styles.autoIncrementId
                        }
                      >
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.tagDiv
                              : styles.tagDiv
                          }
                        >
                          {t("autoIncrementID")}
                          <InfoOutlinedIcon
                            id="table_details_autoincrement_info_icon"
                            className={styles.autoIncrementInfoIcon}
                            fontSize="small"
                          />
                        </span>
                      </div>
                    ) : null}
                    {d.Attribute === CONSTRAINT_TYPE_PRIMARY ||
                    d.Name === INSERTION_ORDER_ID ? (
                      <div className={styles.primaryKey}>
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.tagDiv
                              : styles.tagDiv
                          }
                        >
                          {t("primaryKey")}
                          <InfoOutlinedIcon
                            id="table_details_primary_key_info_icon"
                            className={styles.primaryKeyInfoIcon}
                            fontSize="small"
                          />
                          {!d.Name === INSERTION_ORDER_ID &&
                          d.Attribute === CONSTRAINT_TYPE_PRIMARY ? (
                            <div className={styles.removePrimaryKey}>
                              <Divider orientation="vertical" />
                              <ClearOutlinedIcon
                                id="table_details_remove_primary_key"
                                onClick={() => handleRemovePrimaryKey(index)}
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.removePrimaryKeyIcon
                                    : styles.removePrimaryKeyIcon
                                }
                                fontSize="small"
                              />
                            </div>
                          ) : null}
                        </span>
                      </div>
                    ) : null}
                    {d.Name === foreignKeyColumnName || d.Name === MAP_ID ? (
                      <div className={styles.foreignKey}>
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.tagDiv
                              : styles.tagDiv
                          }
                        >
                          {t("foreignKey")}
                          <InfoOutlinedIcon
                            id="table_details_foreign_key_info_icon"
                            className={styles.foreignKeyInfoIcon}
                            fontSize="small"
                          />
                        </span>
                      </div>
                    ) : null}
                  </div>
                  {d.Name !== INSERTION_ORDER_ID ||
                  d.Name !== foreignKeyColumnName ||
                  d.Name !== MAP_ID ? (
                    <DeleteOutlinedIcon
                      id="table_details_delete_column"
                      onClick={() => handleDeleteColumn(index)}
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.deleteIcon
                          : styles.deleteIcon
                      }
                    />
                  ) : null}
                </div>
                <Divider />
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default TableDetailsStep;
