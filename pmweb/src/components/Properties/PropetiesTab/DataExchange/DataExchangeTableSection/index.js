import React, { useEffect } from "react";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { MenuItem } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import styles from "./index.module.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { SPACE } from "../../../../../Constants/appConstants";

function DataExchangeTableSection(props) {
  let { t } = useTranslation();
  const {
    selectedOp,
    dataExchgTableSectnData,
    deleteDataExchgTableSecHandler,
    parentDataExchgTable,
    setParentDataExchgTable,
    parentTableColumn,
    setParentTableColumn,
    childDataExchgTable,
    setChildDataExchgTable,
    childTableColumn,
    setChildTableColumn,
    parentTableColumnList,
    filteredChildColumnList,
    multiSelectedTableNames,
    addDataExchgTableSecHandler,
    cancelHandler,
    isReadOnly,
  } = props;
  const disabled =
    parentDataExchgTable === "" ||
    parentTableColumn === "" ||
    childDataExchgTable === "" ||
    childTableColumn === "";

  // Function that runs when the value of selectedOp changes.
  useEffect(() => {
    setParentDataExchgTable("");
    setParentTableColumn("");
    setChildDataExchgTable("");
    setChildTableColumn("");
  }, [selectedOp]);

  return (
    <div>
      <p className={styles.subHeader}>{t("dataExchangeTableSection")}</p>
      <div className={clsx(styles.flexRow, styles.dataExchgTableSectionDiv)}>
        <div className={styles.flexColumn}>
          <div className={styles.flexRow}>
            <p
              className={clsx(
                styles.fieldTitle,
                styles.dataExchgTableNameWidth
              )}
            >
              {t("parent")}
              {SPACE}
              {t("dataExchangeTable")}
            </p>
            <span className={clsx(styles.asterisk, styles.asteriskMargin)}>
              *
            </span>
          </div>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="TS_Parent_Data_Exchg_Dropdown"
            className={styles.dropdown}
            value={parentDataExchgTable}
            onChange={(event) => setParentDataExchgTable(event.target.value)}
            isNotMandatory={true}
          >
            {multiSelectedTableNames?.map((element) => {
              return (
                <MenuItem
                  className={styles.menuItemStyles}
                  value={element.TableName}
                  key={element.TableName}
                >
                  {element.TableName}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </div>
        <div className={styles.flexColumn}>
          <div className={clsx(styles.flexRow, styles.alignMarginTop)}>
            <p className={styles.fieldTitle}>{t("columns")}</p>
            <span className={clsx(styles.asterisk, styles.asteriskMargin)}>
              *
            </span>
          </div>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="TS_Parent_Data_Exchg_Column_Dropdown"
            className={styles.dropdown}
            value={parentTableColumn}
            onChange={(event) => setParentTableColumn(event.target.value)}
            isNotMandatory={true}
          >
            {parentTableColumnList?.map((element) => {
              return (
                <MenuItem
                  className={styles.menuItemStyles}
                  value={element.Name}
                  key={element.Name}
                >
                  {element.Name}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </div>
        <div className={styles.flexColumn}>
          <p
            className={clsx(styles.fieldTitle, styles.dataExchgTableNameWidth)}
          >
            {t("child")}
            {SPACE}
            {t("dataExchangeTable")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="TS_Child_Data_Exchg_Table_Dropdown"
            className={styles.dropdown}
            value={childDataExchgTable}
            onChange={(event) => setChildDataExchgTable(event.target.value)}
            isNotMandatory={true}
          >
            {multiSelectedTableNames?.map((element) => {
              return (
                <MenuItem
                  className={styles.menuItemStyles}
                  value={element.TableName}
                  key={element.TableName}
                >
                  {element.TableName}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </div>
        <div className={styles.flexColumn}>
          <div className={clsx(styles.flexRow, styles.alignMarginTop)}>
            <p className={styles.fieldTitle}>{t("columns")}</p>
            <span className={styles.asterisk}>*</span>
          </div>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="TS_Child_Data_Exchg_Table_Column_Dropdown"
            className={styles.dropdown}
            value={childTableColumn}
            onChange={(event) => setChildTableColumn(event.target.value)}
            isNotMandatory={true}
          >
            {filteredChildColumnList?.map((element) => {
              return (
                <MenuItem
                  className={styles.menuItemStyles}
                  value={element.Name}
                  key={element.Name}
                >
                  {element.Name}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </div>
        <button
          id="TS_Cancel_Table_Section_Data"
          onClick={cancelHandler}
          className={clsx(
            styles.cancelBtn,
            isReadOnly && styles.disabledBtnStyles
          )}
          disabled={isReadOnly}
        >
          {t("cancel")}
        </button>
        <button
          id="TS_Add_Table_Section_Data"
          disabled={disabled || isReadOnly}
          onClick={addDataExchgTableSecHandler}
          className={clsx(
            styles.addBtn,
            (disabled || isReadOnly) && styles.disabledBtnStyles
          )}
        >
          {t("add")}
        </button>
      </div>
      <div className={styles.tableSectionEnclosingDiv}>
        <div className={styles.tableRelationHeader}>
          <div className={styles.flexRow}>
            <p
              className={clsx(
                styles.headers,
                styles.parentDataExchgTableHeaderImport
              )}
            >
              {t("dataExchangeTable")}
            </p>
            <p className={clsx(styles.headers, styles.column1Import)}>
              {t("column")}
            </p>
            <p
              className={clsx(styles.headers, styles.childDataExchgTableImport)}
            >
              {t("dataExchangeTable")}
            </p>
            <p className={clsx(styles.headers, styles.column2Import)}>
              {t("column")}
            </p>
          </div>
          <div
            className={clsx(styles.flexColumn, styles.tableSectionDataMainDiv)}
          >
            {dataExchgTableSectnData?.map((element, index) => {
              return (
                <div className={styles.tableSectionDataDiv}>
                  <div className={styles.flexRow}>
                    <p
                      className={clsx(
                        styles.headers,
                        styles.parentDataExchgTableHeaderImport,
                        styles.mappingValueDataFont
                      )}
                    >
                      {element.m_sSelecteddataExTable1}
                    </p>
                    <p
                      className={clsx(
                        styles.headers,
                        styles.column1Import,
                        styles.mappingValueDataFont
                      )}
                    >
                      {element.m_sSelecteddataExCol1}
                    </p>
                    <p
                      className={clsx(
                        styles.headers,
                        styles.childDataExchgTableImport,
                        styles.mappingValueDataFont
                      )}
                    >
                      {element.m_sSelecteddataExTable2}
                    </p>
                    <p
                      className={clsx(
                        styles.headers,
                        styles.column2Import,
                        styles.mappingValueDataFont
                      )}
                    >
                      {element.m_sSelecteddataExCol2}
                    </p>
                    {!isReadOnly && (
                      <DeleteOutlinedIcon
                        id={`TS_Delete_Table_Section_Data_${index}`}
                        onClick={() => deleteDataExchgTableSecHandler(index)}
                        className={styles.deleteIcon}
                      />
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

export default DataExchangeTableSection;
