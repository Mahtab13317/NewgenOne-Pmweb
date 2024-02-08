import React, { useEffect } from "react";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import styles from "./index.module.css";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import { MenuItem } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { SPACE } from "../../../../../Constants/appConstants";

function MappingValues(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const {
    selectedOp,
    operationType,
    isComplex,
    filteredVariables,
    selectedVariableName,
    setSelectedVariableName,
    mappingDataExchgTable,
    setMappingDataExchgTable,
    selectedMappingColumn,
    setSelectedMappingColumn,
    dataExchgTableList,
    filteredMappingColumnList,
    mappingData,
    addMappingHandler,
    deleteMappingHandler,
    cancelMappingHandler,
    isNested,
    mappingColumnList,
    filteredExptVarList,
    varListForComplex,
    multiSelectedTableNames,
    isReadOnly,
  } = props;
  const disabled =
    selectedVariableName === "" ||
    mappingDataExchgTable === "" ||
    selectedMappingColumn === "";

  // Function that runs when the value of selectedOp changes.
  useEffect(() => {
    setSelectedVariableName("");
    setMappingDataExchgTable("");
    setSelectedMappingColumn("");
  }, [selectedOp]);

  // Function that returns the JSX for variable name dropdown.
  const getVariableNameDropdown = () => {
    return (
      <div className={styles.flexColumn}>
        <div className={styles.flexRow}>
          <p className={styles.fieldTitle}>{t("variableName")}</p>
          <span className={styles.asterisk}>*</span>
        </div>
        <CustomizedDropdown
          disabled={isReadOnly}
          id="MV_Variable_Dropdown"
          className={styles.dropdown}
          value={selectedVariableName}
          onChange={(event) => setSelectedVariableName(event.target.value)}
          isNotMandatory={true}
        >
          {isComplex &&
            varListForComplex?.map((element) => {
              return (
                <MenuItem
                  className={styles.menuItemStyles}
                  value={element.VariableName}
                  key={element.VariableName}
                  style={{ direction: direction }}
                >
                  {element.VariableName}
                </MenuItem>
              );
            })}

          {!isComplex && operationType === "1"
            ? filteredVariables
                .filter((element) => element.VariableScope !== "I")
                ?.map((element) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      value={element.VariableName}
                      key={element.VariableName}
                      style={{ direction: direction }}
                    >
                      {element.VariableName}
                    </MenuItem>
                  );
                })
            : filteredExptVarList?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    value={element.VariableName}
                    key={element.VariableName}
                    style={{ direction: direction }}
                  >
                    {element.VariableName}
                  </MenuItem>
                );
              })}
        </CustomizedDropdown>
      </div>
    );
  };

  // Function that returns the JSX for data exchange table dropdown.
  const getDataExchgTableDropdown = () => {
    return (
      <div className={styles.flexColumn}>
        <p className={styles.fieldTitle}>
          {t("dataExchange")}
          {SPACE} {t("table")}
        </p>
        <CustomizedDropdown
          disabled={isReadOnly}
          id="MV_Data_Exchg_Table_Dropdown"
          className={styles.dropdown}
          value={mappingDataExchgTable}
          onChange={(event) => setMappingDataExchgTable(event.target.value)}
          isNotMandatory={true}
        >
          {!isNested
            ? dataExchgTableList?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    value={element.TableName}
                    key={element.TableName}
                    style={{ direction: direction }}
                  >
                    {element.TableName}
                  </MenuItem>
                );
              })
            : multiSelectedTableNames?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    value={element.TableName}
                    key={element.TableName}
                    style={{ direction: direction }}
                  >
                    {element.TableName}
                  </MenuItem>
                );
              })}
        </CustomizedDropdown>
      </div>
    );
  };

  // Function that returns the JSX for data exchange table column dropdown.
  const getDataExchgColumnDropdown = () => {
    return (
      <div className={styles.flexColumn}>
        <div className={styles.flexRow}>
          <p className={styles.fieldTitle}>{t("columns")}</p>
          <span className={styles.asterisk}>*</span>
        </div>
        <CustomizedDropdown
          disabled={isReadOnly}
          id="MV_Data_Exchg_Table_Column_Dropdown"
          className={styles.dropdown}
          value={selectedMappingColumn}
          onChange={(event) => setSelectedMappingColumn(event.target.value)}
          isNotMandatory={true}
        >
          {operationType === "1"
            ? filteredMappingColumnList?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    value={element.Name}
                    key={element.Name}
                    style={{ direction: direction }}
                  >
                    {element.Name}
                  </MenuItem>
                );
              })
            : mappingColumnList?.map((element) => {
                return (
                  <MenuItem
                    className={styles.menuItemStyles}
                    value={element.Name}
                    key={element.Name}
                    style={{ direction: direction }}
                  >
                    {element.Name}
                  </MenuItem>
                );
              })}
        </CustomizedDropdown>
      </div>
    );
  };

  // Function that returns the JSX for header and data for mapping values.
  const getMappingTableHeaderAndData = (name, className) => {
    return <p className={className}>{name}</p>;
  };

  return (
    <div>
      <p className={styles.subHeader}>{t("mappingValues")}</p>
      <div className={clsx(styles.flexRow, styles.mappingInputDiv)}>
        {operationType === "2" ? (
          <div className={styles.flexRow}>
            {getDataExchgTableDropdown()}
            {getDataExchgColumnDropdown()}
            {getVariableNameDropdown()}
          </div>
        ) : (
          <div className={styles.flexRow}>
            {getVariableNameDropdown()}
            {getDataExchgTableDropdown()}
            {getDataExchgColumnDropdown()}
          </div>
        )}
        <button
          id="MV_Cancel_Mapping_Btn"
          onClick={cancelMappingHandler}
          className={clsx(
            styles.cancelBtn,
            isReadOnly && styles.disabledBtnStyles
          )}
          disabled={isReadOnly}
        >
          {t("cancel")}
        </button>
        <button
          id="MV_Add_Mapping_Btn"
          onClick={addMappingHandler}
          disabled={disabled || isReadOnly}
          className={clsx(
            styles.addBtn,
            (disabled || isReadOnly) && styles.disabledBtnStyles
          )}
        >
          {t("add")}
        </button>
      </div>
      <div className={styles.mappingDataEnclosingDiv}>
        <div className={styles.mappingDataHeader}>
          <div className={styles.flexRow}>
            {operationType === "1" ? (
              <>
                <div className={clsx(styles.flexRow, styles.tableContainer)}>
                  {getMappingTableHeaderAndData(
                    t("processVariable"),
                    clsx(styles.headers, styles.processVariablesHeaderImport)
                  )}
                  {getMappingTableHeaderAndData(
                    t("type"),
                    clsx(styles.headers, styles.typeHeaderImport)
                  )}
                  {getMappingTableHeaderAndData(
                    t("dataExchangeTable"),
                    clsx(styles.headers, styles.dataExchgImport)
                  )}
                  {getMappingTableHeaderAndData(
                    t("columns"),
                    clsx(styles.headers, styles.columnsImport)
                  )}
                  <p className={styles.action}></p>
                </div>
              </>
            ) : (
              <div className={clsx(styles.flexRow, styles.tableContainer)}>
                {getMappingTableHeaderAndData(
                  t("dataExchangeTable"),
                  clsx(styles.headers, styles.dataExchgExport)
                )}
                {getMappingTableHeaderAndData(
                  t("columns"),
                  clsx(styles.headers, styles.columnsExport)
                )}
                {getMappingTableHeaderAndData(
                  t("processVariable"),
                  clsx(styles.headers, styles.processVariablesHeaderExport)
                )}
                {getMappingTableHeaderAndData(
                  t("type"),
                  clsx(styles.headers, styles.typeHeaderExport)
                )}
                <p className={styles.action}></p>
              </div>
            )}
          </div>
          <div className={clsx(styles.flexColumn, styles.mappingDataMainDiv)}>
            {mappingData?.map((element, index) => {
              return (
                <div className={styles.mappingDataDiv}>
                  <div className={styles.flexRow}>
                    {operationType === "1" ? (
                      <div
                        className={clsx(styles.flexRow, styles.tableContainer)}
                      >
                        {getMappingTableHeaderAndData(
                          element.processVarName,
                          clsx(
                            styles.headers,
                            styles.processVariablesHeaderImport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getMappingTableHeaderAndData(
                          element.processVarType,
                          clsx(
                            styles.headers,
                            styles.typeHeaderImport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getMappingTableHeaderAndData(
                          element.selectedEntityName,
                          clsx(
                            styles.headers,
                            styles.dataExchgImport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getMappingTableHeaderAndData(
                          element.selectedEntityValue,
                          clsx(
                            styles.headers,
                            styles.columnsImport,
                            styles.mappingValueDataFont
                          )
                        )}
                        <p className={styles.action}>
                          {!isReadOnly && (
                            <DeleteOutlinedIcon
                              id={`MV_Delete_MappingBtn_${index}`}
                              onClick={() => deleteMappingHandler(index)}
                              className={styles.deleteIcon}
                            />
                          )}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={clsx(styles.flexRow, styles.tableContainer)}
                      >
                        {getMappingTableHeaderAndData(
                          element.selectedEntityName,
                          clsx(
                            styles.headers,
                            styles.dataExchgExport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getMappingTableHeaderAndData(
                          element.selectedEntityValue,
                          clsx(
                            styles.headers,
                            styles.columnsExport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getMappingTableHeaderAndData(
                          element.processVarName,
                          clsx(
                            styles.headers,
                            styles.processVariablesHeaderExport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getMappingTableHeaderAndData(
                          element.processVarType,
                          clsx(
                            styles.headers,
                            styles.typeHeaderExport,
                            styles.mappingValueDataFont
                          )
                        )}
                        <p className={styles.action}>
                          {!isReadOnly && (
                            <DeleteOutlinedIcon
                              id={`MV_Delete_MappingBtn_${index}`}
                              onClick={() => deleteMappingHandler(index)}
                              className={styles.deleteIcon}
                            />
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MappingValues;
