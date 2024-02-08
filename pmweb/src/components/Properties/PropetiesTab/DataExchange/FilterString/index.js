import React, { useEffect } from "react";
import clsx from "clsx";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { MenuItem } from "@material-ui/core";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import { decode_utf8 } from "../../../../../utility/UTF8EncodeDecoder";

function FilterString(props) {
  let { t } = useTranslation();
  const {
    selectedOp,
    operationType,
    isNested,
    filterStrDataExchgTable,
    setFilterStrDataExchgTable,
    filterStringData,
    addFilterStringHandler,
    cancelFilterStringHandler,
    deleteFilterStringHandler,
    filterStringValue,
    filterStringHandler,
    listOfComplexTables,
    setFilterStringValue,
    multiSelectedTableNames,
    isReadOnly,
  } = props;
  const disabled =
    filterStrDataExchgTable === "" || decode_utf8(filterStringValue) === "";

  // Function that runs when the value of selectedOp changes.
  useEffect(() => {
    setFilterStrDataExchgTable("");
  }, [selectedOp]);

  return (
    <div>
      <p className={styles.subHeader}>{t("filterString")}</p>
      {isNested && (
        <div className={clsx(styles.flexColumn, styles.complexTableMargin)}>
          <div className={styles.flexRow}>
            {operationType === "1" ? (
              <p className={styles.fieldTitle}>{t("dataExchangeTable")}</p>
            ) : (
              <p className={styles.fieldTitle}>{t("complexTable")}</p>
            )}
            <span className={styles.asterisk}>*</span>
          </div>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="FS_Data_Exchg_Dropdown"
            className={styles.dropdown}
            value={filterStrDataExchgTable}
            onChange={(event) => setFilterStrDataExchgTable(event.target.value)}
            isNotMandatory={true}
          >
            {operationType === "1"
              ? multiSelectedTableNames?.map((element) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      value={element.TableName}
                      key={element.TableName}
                    >
                      {element.TableName}
                    </MenuItem>
                  );
                })
              : listOfComplexTables?.map((element) => {
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
      )}
      <div className={styles.flexRow}>
        <textarea
          id="FS_Textarea"
          aria-label="Filter string"
          value={decode_utf8(filterStringValue)}
          disabled={isReadOnly}
          onBlur={(event) => {
            filterStringHandler(event.target.value);
          }}
          onChange={(event) => {
            setFilterStringValue(event.target.value);
          }}
          placeholder={t("writeHerePlaceholder")}
          className={styles.filterStringInput}
        />
        {isNested && (
          <div className={clsx(styles.flexRow, styles.buttonsDiv)}>
            <button
              id="FS_Cancel_Filter_string_data"
              onClick={cancelFilterStringHandler}
              className={clsx(
                clsx(styles.cancelBtn, isReadOnly && styles.disabledBtnStyles),
                isReadOnly && styles.disabledBtnStyles
              )}
              disabled={isReadOnly}
            >
              {t("cancel")}
            </button>
            <button
              id="FS_Add_Filter_string_data"
              disabled={isReadOnly || disabled}
              onClick={addFilterStringHandler}
              className={clsx(
                styles.addBtn,
                (disabled || isReadOnly) && styles.disabledBtnStyles
              )}
            >
              {t("add")}
            </button>
          </div>
        )}
      </div>

      {isNested && (
        <div className={styles.filterStringEnclosingDiv}>
          <div className={styles.filterDataHeader}>
            <div className={styles.flexRow}>
              {operationType === "1" ? (
                <p
                  className={clsx(
                    styles.headers,
                    styles.filterStringDataExchgTable
                  )}
                >
                  {t("dataExchangeTable")}
                </p>
              ) : (
                <p
                  className={clsx(
                    styles.headers,
                    styles.filterStringDataExchgTable
                  )}
                >
                  {t("complexTable")}
                </p>
              )}

              <p
                className={clsx(styles.headers, styles.filterStringTableHeader)}
              >
                {t("filterStringPascalCase")}
              </p>
            </div>
            <div
              className={clsx(
                styles.flexColumn,
                styles.filterStringDataMainDiv
              )}
            >
              {filterStringData?.length > 0 &&
                filterStringData?.map((element, index) => {
                  return (
                    <div className={styles.filterStringDataDiv}>
                      <div className={styles.flexRow}>
                        <p
                          className={clsx(
                            styles.headers,
                            styles.filterStringDataExchgTable,
                            styles.filterStringValueDataFont
                          )}
                        >
                          {element.m_sTableName}
                        </p>
                        <p
                          className={clsx(
                            styles.headers,
                            styles.filterStringTableHeader,
                            styles.filterStringValueDataFont
                          )}
                        >
                          {operationType === "1"
                            ? decode_utf8(element.m_sFilterStrImpNested)
                            : decode_utf8(element.m_sFilterStrExpNested)}
                        </p>
                        {!isReadOnly && (
                          <DeleteOutlinedIcon
                            id={`FS_Delete_Filter_String_Data_${index}`}
                            onClick={() => deleteFilterStringHandler(index)}
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
      )}
    </div>
  );
}

export default FilterString;
