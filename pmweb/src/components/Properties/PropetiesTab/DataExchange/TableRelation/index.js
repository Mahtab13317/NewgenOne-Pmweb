// #BugID - 116700
// #BugDescription - Added check to avoid edge case.
import React, { useEffect } from "react";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { MenuItem } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import styles from "./index.module.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

function TableRelation(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const {
    selectedOp,
    operationType,
    selectedProcessTable,
    setSelectedProcessTable,
    column1Value,
    setColumn1Value,
    processTableColumnList,
    dataExchgTableList,
    selectedTRDataExchngTable,
    setSelectedTRDataExchngTable,
    filteredTRColumnList,
    column2Value,
    setColumn2Value,
    tableRelationData,
    addTableRelationHandler,
    cancelTableRelationHandler,
    deleteTableRelationHandler,
    isNested,
    multiSelectedTableNames,
    mappingColumnList,
    filteredProcessTableExptList,
    isReadOnly,
    tRDataExchgColumnList,
    listOfComplexTables,
    processTableList,
    isComplex,
  } = props;
  const disabled =
    selectedProcessTable === "" ||
    column1Value === "" ||
    selectedTRDataExchngTable === "" ||
    column2Value === "";

  // Function that runs when the value of selectedOp changes.
  useEffect(() => {
    setSelectedProcessTable("");
    setColumn1Value("");
    setSelectedTRDataExchngTable("");
    setColumn2Value("");
  }, [selectedOp]);

  // Function that returns the JSX for process table dropdown.
  const getProcessTableDropdown = () => {
    return (
      <div className={styles.flexColumn}>
        <div className={styles.flexRow}>
          <p className={styles.fieldTitle}>{t("processTable")}</p>
          <span className={styles.asterisk}>*</span>
        </div>

        <CustomizedDropdown
          disabled={isReadOnly}
          id="TR_Process_Table_Dropdown"
          className={styles.dropdown}
          value={selectedProcessTable}
          onChange={(event) => setSelectedProcessTable(event.target.value)}
          isNotMandatory={true}
        >
          {(isComplex ? listOfComplexTables : processTableList)?.map(
            (element) => {
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
            }
          )}
        </CustomizedDropdown>
      </div>
    );
  };

  // Function that returns the JSX for process table column dropdown.
  const getProcessTableColumnDropdown = () => {
    return (
      <div className={styles.flexColumn}>
        <div className={styles.flexRow}>
          <p className={styles.fieldTitle}>{t("columns")}</p>
          <span className={styles.asterisk}>*</span>
        </div>
        <CustomizedDropdown
          disabled={isReadOnly}
          id="TR_Process_Table_Column_Dropdown"
          className={styles.dropdown}
          value={column1Value}
          onChange={(event) => setColumn1Value(event.target.value)}
          isNotMandatory={true}
        >
          {operationType === "1"
            ? processTableColumnList?.map((element) => {
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
            : filteredProcessTableExptList?.map((element) => {
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

  // Function that returns the JSX for data exchange table dropdown.
  const getDataExchgTableDropdown = () => {
    return (
      <div className={styles.flexColumn}>
        <p className={styles.fieldTitle}>{t("dataExchangeTable")}</p>
        <CustomizedDropdown
          disabled={isReadOnly}
          id="TR_Data_Exchg_Table_Dropdown"
          className={styles.dropdown}
          value={selectedTRDataExchngTable}
          onChange={(event) => setSelectedTRDataExchngTable(event.target.value)}
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
  const getDataExchgTableColumnDropdown = () => {
    return (
      <div className={styles.flexColumn}>
        <div className={styles.flexRow}>
          <p className={styles.fieldTitle}>{t("columns")}</p>
          <span className={styles.asterisk}>*</span>
        </div>
        <CustomizedDropdown
          disabled={isReadOnly}
          id="TR_Data_Exchg_Table_Column_Dropdown"
          className={styles.dropdown}
          value={column2Value}
          onChange={(event) => setColumn2Value(event.target.value)}
          isNotMandatory={true}
        >
          {operationType === "1"
            ? filteredTRColumnList?.map((element) => {
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
            : tRDataExchgColumnList?.map((element) => {
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
  const getTableRelationHeaderAndData = (name, className) => {
    return <p className={className}>{name}</p>;
  };

  return (
    <div>
      <p className={styles.subHeader}>{t("tableRelation")}</p>
      <div className={clsx(styles.flexRow, styles.mappingInputDiv)}>
        {operationType === "1" ? (
          <div className={styles.flexRow}>
            {getProcessTableDropdown()}
            {getProcessTableColumnDropdown()}
            {getDataExchgTableDropdown()}
            {getDataExchgTableColumnDropdown()}
          </div>
        ) : (
          <div className={styles.flexRow}>
            {getDataExchgTableDropdown()}
            {getDataExchgTableColumnDropdown()}
            {getProcessTableDropdown()}
            {getProcessTableColumnDropdown()}
          </div>
        )}
        <button
          id="TR_Cancel_Relation_Btn"
          onClick={cancelTableRelationHandler}
          className={clsx(
            styles.cancelBtn,
            isReadOnly && styles.disabledBtnStyles
          )}
          disabled={isReadOnly}
        >
          {t("cancel")}
        </button>
        <button
          id="TR_Add_Relation_Btn"
          disabled={disabled || isReadOnly}
          onClick={addTableRelationHandler}
          className={clsx(
            styles.addBtn,
            (disabled || isReadOnly) && styles.disabledBtnStyles
          )}
        >
          {t("add")}
        </button>
      </div>
      <div className={styles.tableRelationEnclosingDiv}>
        <div className={styles.tableRelationHeader}>
          <div className={styles.flexRow}>
            {operationType === "1" ? (
              <div className={clsx(styles.flexRow, styles.tableContainer)}>
                {getTableRelationHeaderAndData(
                  t("processVariable"),
                  clsx(styles.headers, styles.processVariablesHeaderImport)
                )}
                {getTableRelationHeaderAndData(
                  t("column"),
                  clsx(styles.headers, styles.column1Import)
                )}
                {getTableRelationHeaderAndData(
                  t("dataExchangeTable"),
                  clsx(styles.headers, styles.dataExchgImport)
                )}
                {getTableRelationHeaderAndData(
                  t("column"),
                  clsx(styles.headers, styles.column2Import)
                )}
                <p className={styles.action}></p>
              </div>
            ) : (
              <div className={clsx(styles.flexRow, styles.tableContainer)}>
                {getTableRelationHeaderAndData(
                  t("dataExchangeTable"),
                  clsx(styles.headers, styles.dataExchgExport)
                )}
                {getTableRelationHeaderAndData(
                  t("column"),
                  clsx(styles.headers, styles.column2Import)
                )}
                {getTableRelationHeaderAndData(
                  t("processVariable"),
                  clsx(styles.headers, styles.processVariablesHeaderExport)
                )}
                {getTableRelationHeaderAndData(
                  t("column"),
                  clsx(styles.headers, styles.column1Import)
                )}
                <p className={styles.action}></p>
              </div>
            )}
          </div>
          <div
            className={clsx(styles.flexColumn, styles.tableRelationDataMainDiv)}
          >
            {tableRelationData?.map((element, index) => {
              return (
                <div className={styles.tableRelationDiv}>
                  <div className={styles.flexRow}>
                    {operationType === "1" ? (
                      <div
                        className={clsx(styles.flexRow, styles.tableContainer)}
                      >
                        {getTableRelationHeaderAndData(
                          element.m_strSelectedProcTable,
                          clsx(
                            styles.headers,
                            styles.processVariablesHeaderImport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getTableRelationHeaderAndData(
                          element.m_strSelectedProcColumn,
                          clsx(
                            styles.headers,
                            styles.column1Import,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getTableRelationHeaderAndData(
                          element.selectedEntityName,
                          clsx(
                            styles.headers,
                            styles.dataExchgImport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getTableRelationHeaderAndData(
                          element.selectedEntityValue,
                          clsx(
                            styles.headers,
                            styles.column2Import,
                            styles.mappingValueDataFont
                          )
                        )}
                        <p className={styles.action}>
                          {!isReadOnly && (
                            <DeleteOutlinedIcon
                              id={`TR_Delete_RelationBtn_${index}`}
                              onClick={() => deleteTableRelationHandler(index)}
                              className={styles.deleteIcon}
                            />
                          )}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={clsx(styles.flexRow, styles.tableContainer)}
                      >
                        {getTableRelationHeaderAndData(
                          element.selectedEntityName,
                          clsx(
                            styles.headers,
                            styles.dataExchgExport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getTableRelationHeaderAndData(
                          element.selectedEntityValue,
                          clsx(
                            styles.headers,
                            styles.column2Import,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getTableRelationHeaderAndData(
                          element.m_strSelectedProcTable,
                          clsx(
                            styles.headers,
                            styles.processVariablesHeaderExport,
                            styles.mappingValueDataFont
                          )
                        )}
                        {getTableRelationHeaderAndData(
                          element.m_strSelectedProcColumn,
                          clsx(
                            styles.headers,
                            styles.column1Import,
                            styles.mappingValueDataFont
                          )
                        )}
                        <p className={styles.action}>
                          {!isReadOnly && (
                            <DeleteOutlinedIcon
                              id={`TR_Delete_RelationBtn_${index}`}
                              onClick={() => deleteTableRelationHandler(index)}
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

export default TableRelation;
