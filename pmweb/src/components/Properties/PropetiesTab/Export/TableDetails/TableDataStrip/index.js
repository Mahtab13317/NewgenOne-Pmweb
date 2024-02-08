import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  InputBase,
  MenuItem,
  Radio,
  Checkbox,
  withStyles,
} from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CustomizedDropdown from "../../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import MappingModal from "../MappingModal";
import {
  EXPORT_EXISTING_TABLE_TYPE,
  EXPORT_PRIMARY_CONSTRAINT_TYPE,
  EXPORT_UNIQUE_CONSTRAINT_TYPE,
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../../../Constants/appConstants";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import clsx from "clsx";
import { typeDropdownOptions } from ".././DropdownOptions";
import { FieldValidations } from "../../../../../../utility/FieldValidations/fieldValidations";
import { useDispatch, useSelector } from "react-redux";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../../../redux-store/slices/ActivityPropertyChangeSlice";

export const CustomInputBase = withStyles({
  input: {
    height: "100%",
  },
})((props) => <InputBase {...props} />);

function TableDataStrip(props) {
  let { t } = useTranslation();
  const {
    activityData,
    isReadOnly,
    fieldName,
    fieldType,
    attribute,
    index,
    handleFieldNameChange,
    checkFieldNameOnBlur,
    handleFieldTypeChange,
    handleAttributeChange,
    handleDeleteField,
    setActivityData,
    documentList,
    variablesList,
    getVariableType,
    precision,
    length,
    handleFieldLength,
    checkLengthOnBlur,
    handleFieldPrecision,
    checkPrecisionOnBlur,
    checkDisabled,
    setGlobalData,
    tableType,
  } = props;
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const [constraintType, setConstraintType] = useState(
    EXPORT_PRIMARY_CONSTRAINT_TYPE
  );
  const [isConstraintsEnabled, setIsConstraintsEnabled] = useState(false);
  const [previousDataFields, setPreviousDataFields] = useState({});
  const [previousColumnName, setPreviousColumnName] = useState("");
  const [previousLengthValue, setPreviousLengthValue] = useState("");
  const [previousPrecisionValue, setPreviousPrecisionValue] = useState("");
  const columnNameRef = useRef();

  // Function that runs when the user changes the constraint type field.
  const handleConstraintType = (event) => {
    if (isConstraintsEnabled) {
      setConstraintType(event.target.value);
      handleAttributeChange(event.target.value, index);
    }
  };

  // Function that runs when the attribute value changes.
  useEffect(() => {
    if (attribute) {
      setConstraintType(attribute);
      setIsConstraintsEnabled(true);
    }
  }, [attribute]);

  // Function that runs when the constraint checbox is clicked.
  const handleConstraintCheckbox = () => {
    let prevValue = false;
    setIsConstraintsEnabled((prevData) => {
      prevValue = prevData;
      return !prevData;
    });
    if (prevValue) {
      setConstraintType("");
      handleAttributeChange("", index);
    } else {
      handleAttributeChange(EXPORT_PRIMARY_CONSTRAINT_TYPE, index);
      setConstraintType(EXPORT_PRIMARY_CONSTRAINT_TYPE);
    }
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Export]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.Export]?.hasError,
        },
      })
    );
  };

  return (
    <div>
      <div id="table_details_div" className={styles.fieldDataDiv}>
        <div style={{ width: "15%" }}>
          <InputBase
            disabled={isReadOnly || tableType === EXPORT_EXISTING_TABLE_TYPE}
            id={`pmweb_TableDataStrip_FieldNameInput${index}`}
            variant="outlined"
            className={styles.inputBaseData}
            onFocus={() => {
              // if (!tableType === EXPORT_EXISTING_TABLE_TYPE) {
              setPreviousColumnName(fieldName);
              setPreviousDataFields(JSON.parse(JSON.stringify(activityData)));
              // }
            }}
            onBlur={(event) => {
              // if (!tableType === EXPORT_EXISTING_TABLE_TYPE) {
              setTimeout(
                checkFieldNameOnBlur(
                  event,
                  index,
                  previousColumnName,
                  previousDataFields
                ),
                500
              );
              // }
            }}
            onChange={(event) => handleFieldNameChange(event, index)}
            value={fieldName}
            inputRef={columnNameRef}
            onKeyPress={(e) => {
              FieldValidations(e, 151, columnNameRef.current, 50);
            }}
          />
        </div>
        <div style={{ width: "15%" }}>
          <CustomizedDropdown
            disabled={isReadOnly}
            id={`pmweb_TableDataStrip_FieldTypeDropdown${index}`}
            className={styles.typeInputData}
            value={fieldType}
            onChange={(event) => handleFieldTypeChange(event, index)}
            isNotMandatory={true}
          >
            {typeDropdownOptions?.map((d) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.menuItemStyles
                      : styles.menuItemStyles
                  }
                  value={d}
                >
                  {getVariableType(d)}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </div>
        <div
          className={styles.constraintsRadioDiv}
          style={{ width: "30%", minWidth: "22rem" }}
        >
          <Checkbox
            id={`pmweb_TableDataStrip_ConstraintsCheckbox${index}`}
            size="small"
            checked={isConstraintsEnabled}
            onChange={handleConstraintCheckbox}
          />
          <p className={styles.constraintsText}>{t("constraints")}</p>
          <Radio
            id={`pmweb_TableDataStrip_PrimaryRadio${index}`}
            checked={constraintType === EXPORT_PRIMARY_CONSTRAINT_TYPE}
            onChange={handleConstraintType}
            value={EXPORT_PRIMARY_CONSTRAINT_TYPE}
            size="small"
            disabled={!isConstraintsEnabled}
          />
          <p
            className={clsx(
              styles.constraintsText,
              !isConstraintsEnabled && styles.disabledTextColor
            )}
          >
            {t("primaryKey")}
          </p>
          <Radio
            id={`pmweb_TableDataStrip_UniqueRadio${index}`}
            checked={constraintType === EXPORT_UNIQUE_CONSTRAINT_TYPE}
            onChange={handleConstraintType}
            value={EXPORT_UNIQUE_CONSTRAINT_TYPE}
            size="small"
            disabled={!isConstraintsEnabled}
          />
          <p
            className={clsx(
              styles.constraintsText,
              !isConstraintsEnabled && styles.disabledTextColor
            )}
          >
            {t("uniqueKey")}
          </p>
        </div>
        <div className={styles.flexRow} style={{ width: "15%" }}>
          <CustomInputBase
            id={`pmweb_TableDataStrip_Input2${index}`}
            type="number"
            variant="outlined"
            className={clsx(styles.lengthData, styles.lengthInput)}
            onFocus={() => setPreviousLengthValue(length)}
            onBlur={(event) =>
              checkLengthOnBlur(
                event,
                index,
                fieldType,
                previousLengthValue,
                precision
              )
            }
            onChange={(event) => handleFieldLength(event, index)}
            value={length}
            disabled={checkDisabled(fieldType)}
          />
          {fieldType === "6" ? (
            <div className={styles.flexRow}>
              <p
                className={styles.precisionText}
                style={{
                  margin: direction === RTL_DIRECTION && "10px 10px 5px 5px",
                }}
              >
                {t("precision")}:
              </p>
              <CustomInputBase
                id={`pmweb_TableDataStrip_Input3${index}`}
                type="number"
                variant="outlined"
                className={clsx(
                  styles.lengthData,
                  direction === RTL_DIRECTION
                    ? arabicStyles.precisionInput
                    : styles.precisionInput
                )}
                onFocus={() => setPreviousPrecisionValue(precision)}
                onBlur={(event) =>
                  checkPrecisionOnBlur(
                    event,
                    index,
                    fieldType,
                    length,
                    previousPrecisionValue
                  )
                }
                onChange={(event) => handleFieldPrecision(event, index)}
                value={precision}
              />
            </div>
          ) : null}
        </div>
        <MappingModal
          index={index}
          fieldName={fieldName}
          activityData={activityData}
          setActivityData={setActivityData}
          isReadOnly={isReadOnly}
          documentList={documentList}
          variablesList={variablesList}
          setGlobalData={setGlobalData}
          fieldType={fieldType}
        />
        {!isReadOnly ? (
          <DeleteOutlinedIcon
            id={`pmweb_TableDataStrip_DeleteField${index}`}
            tabIndex={0}
            onClick={() => handleDeleteField(fieldName, index)}
            className={styles.deleteIcon}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleDeleteField(fieldName, index);
                e.stopPropagation();
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default TableDataStrip;
