import React, { useState, useEffect, useRef } from "react";
import { MenuItem, Radio, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import clsx from "clsx";
import { getVariableType } from "../../../../../../utility/ProcessSettings/Triggers/getVariableType";
import Modal from "../../../../../../UI/Modal/Modal";
import MappingDataModal from "../MappingDataModal";
import {
  ERROR_MANDATORY,
  EXPORT_PRIMARY_CONSTRAINT_TYPE,
  EXPORT_UNIQUE_CONSTRAINT_TYPE,
  ERROR_INCORRECT_VALUE,
  RTL_DIRECTION,
  SPACE,
} from "../../../../../../Constants/appConstants";
import CustomizedDropdown from "../../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import TextInput from "../../../../../../UI/Components_With_ErrrorHandling/InputField";
import { FieldValidations } from "../../../../../../utility/FieldValidations/fieldValidations";
import { CustomInputBase } from "../TableDataStrip";
import { isSQLKeywordFunc } from "../../../../../../utility/ReservedSQLKeywordsCheckerFunction";
import MappingIcon from "../../../../../../assets/MappingIcon.svg";
import arabicStyles from "./ArabicStyles.module.css";

function InputFieldsStrip(props) {
  let { t } = useTranslation();
  const {
    setValue,
    mappingDetails,
    inputBaseValue,
    inputBaseHandler,
    dropdownValue,
    dropdownHandler,
    dropdownOptions,
    closeInputStrip,
    radioTypeValue,
    radioTypeHandler,
    addHandler,
    documentList,
    variablesList,
    secondInputBase,
    secondInputBaseHandler,
    checkDisabled,
    isReadOnly,
  } = props;
  const direction = `${t("HTML_DIR")}`;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConstraintsEnabled, setIsConstraintsEnabled] = useState(false);

  const [errorDetails, setErrorDetails] = useState({});
  const columnNameInput = useRef();
  const primaryKeyRef = useRef();
  const uniqueKeyRef = useRef();

  useEffect(() => {
    if (inputBaseValue?.trim() === "") {
      setErrorDetails({
        ...errorDetails,
        columnName: {
          errorMessage: "",
          severity: "",
          errorType: "",
        },
      });
    }
  }, [inputBaseValue]);

  // Function that gets called when the user clicks on add button.
  const addHandlerFunc = (value) => {
    if (inputBaseValue?.trim() === "") {
      setErrorDetails({
        ...errorDetails,
        columnName: {
          errorMessage: t("mandatoryFieldStatement"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      });
    } else if (isSQLKeywordFunc(inputBaseValue?.trim())) {
      setErrorDetails({
        columnName: {
          errorMessage:
            t("this") +
            SPACE +
            t("fieldNameSmall") +
            SPACE +
            t("reservedSQLKeywordMessage"),
          severity: "error",
          errorType: ERROR_INCORRECT_VALUE,
        },
      });
    } else {
      setErrorDetails({
        ...errorDetails,
        columnName: {
          errorMessage: "",
          severity: "",
          errorType: "",
        },
      });
    }
    if (
      inputBaseValue?.trim() !== "" &&
      !isSQLKeywordFunc(inputBaseValue?.trim())
    ) {
      addHandler(value);
    }
  };

  // Commented code on 31-10-23 for Bug 132050
  // Function that runs when the dropdownValue value changes.
  // useEffect(() => {
  //   if (variablesList?.length > 1) {
  //     let tempList = [];
  //     let varList = variablesList;
  //     variablesList?.forEach((element) => {
  //       if (
  //         element.VariableType === COMPLEX_VARTYPE &&
  //         element.VariableScope === "I" &&
  //         element.ExtObjectId > 1
  //       ) {
  //         tempList = getComplex(element);
  //         varList = varList?.concat(tempList);
  //         varList = varList?.filter((element) => element.VariableType !== "11");
  //       }
  //     });

  //     if (dropdownValue === "4") {
  //       let filteredArr = varList?.filter(
  //         (element) =>
  //           element.VariableScope === "C" ||
  //           (element.VariableScope !== "C" &&
  //             (element.VariableType === "3" || element.VariableType === "4"))
  //       );
  //       setFilteredVariables(filteredArr);
  //     } else if (dropdownValue === "10") {
  //       setFilteredVariables([...varList]);
  //     } else {
  //       const filteredArr = varList?.filter(
  //         (element) =>
  //           element.VariableScope === "C" ||
  //           (element.VariableScope !== "C" &&
  //             element.VariableType === dropdownValue)
  //       );
  //       setFilteredVariables([...filteredArr]);
  //     }
  //   }
  // }, [dropdownValue]);
  // Till here for Bug 132050

  // Function that runs when the user selects a type from the dropdown.
  const onSelectType = (value) => {
    dropdownHandler(value);
    switch (value) {
      case "10":
        secondInputBaseHandler({
          precision: "0",
          length: "50",
        });
        break;
      case "6":
        secondInputBaseHandler({
          precision: "2",
          length: "15",
        });
        break;
      case "3":
        secondInputBaseHandler({
          precision: "0",
          length: "2",
        });
        break;
      case "4":
        secondInputBaseHandler({
          precision: "0",
          length: "4",
        });
        break;
      case "8":
        secondInputBaseHandler({
          precision: "0",
          length: "8",
        });
        break;
    }
  };

  return (
    <div className={styles.inputFieldsMainDiv}>
      <div style={{ width: "15%" }}>
        <TextInput
          autoFocus={true}
          inlineErrorStyles={styles.inlineErrorStyle}
          readOnlyCondition={isReadOnly}
          inputValue={inputBaseValue}
          classTag={styles.inputBase}
          onChangeEvent={(event) => inputBaseHandler(event.target.value)}
          name="columnName"
          idTag="pmweb_InputFieldsStrip_ColumnName"
          errorStatement={errorDetails?.columnName?.errorMessage}
          errorSeverity={errorDetails?.columnName?.severity}
          errorType={errorDetails?.columnName?.errorType}
          inlineError={true}
          inputRef={columnNameInput}
          onKeyPress={(e) => {
            FieldValidations(e, 151, columnNameInput.current, 50);
          }}
        />
      </div>
      <div style={{ width: "15%" }}>
        <CustomizedDropdown
          id="pmweb_InputFieldsStrip_TypeSelect"
          className={styles.typeInput}
          value={dropdownValue}
          onChange={(event) => onSelectType(event.target.value)}
          disabled={isReadOnly}
        >
          {dropdownOptions?.map((d) => {
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
          id="pmweb_InputFieldsStrip_ConstraintsCheckbox"
          size="small"
          checked={isConstraintsEnabled}
          disabled={isReadOnly}
          onChange={() =>
            setIsConstraintsEnabled((prevData) => {
              if (prevData) {
                radioTypeHandler("");
              } else {
                radioTypeHandler(EXPORT_PRIMARY_CONSTRAINT_TYPE);
              }
              return !prevData;
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsConstraintsEnabled((prevData) => {
                if (prevData) {
                  radioTypeHandler("");
                } else {
                  radioTypeHandler(EXPORT_PRIMARY_CONSTRAINT_TYPE);
                }
                return !prevData;
              });
              e.stopPropagation();
            }
          }}
        />
        <p className={styles.constraintsText}>{t("constraints")}</p>
        <Radio
          id="pmweb_InputFieldsStrip_PrimaryConstraintRadio"
          checked={radioTypeValue === EXPORT_PRIMARY_CONSTRAINT_TYPE}
          onChange={(event) => radioTypeHandler(event.target.value)}
          value={EXPORT_PRIMARY_CONSTRAINT_TYPE}
          size="small"
          disabled={!isConstraintsEnabled || isReadOnly}
          ref={primaryKeyRef}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              primaryKeyRef.current.click();
            }
          }}
        />
        <p
          className={clsx(
            styles.constraintsText,
            (!isConstraintsEnabled || isReadOnly) && styles.disabledTextColor
          )}
        >
          {t("primaryKey")}
        </p>
        <Radio
          id="pmweb_InputFieldsStrip_UniqueConstraintRadio"
          checked={radioTypeValue === EXPORT_UNIQUE_CONSTRAINT_TYPE}
          onChange={(event) => radioTypeHandler(event.target.value)}
          value={EXPORT_UNIQUE_CONSTRAINT_TYPE}
          size="small"
          disabled={!isConstraintsEnabled || isReadOnly}
          ref={uniqueKeyRef}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              uniqueKeyRef.current.click();
            }
          }}
        />
        <p
          className={clsx(
            styles.constraintsText,
            (!isConstraintsEnabled || isReadOnly) && styles.disabledTextColor
          )}
        >
          {t("uniqueKey")}
        </p>
      </div>
      <div className={styles.flexRow} style={{ width: "15%" }}>
        <CustomInputBase
          id="pmweb_InputFieldsStrip_SecondInputBase"
          type="number"
          variant="outlined"
          className={styles.lengthData}
          onChange={(event) =>
            secondInputBaseHandler((prevData) => {
              return { ...prevData, length: event.target.value };
            })
          }
          value={secondInputBase.length}
          disabled={checkDisabled(dropdownValue) || isReadOnly}
        />
        {dropdownValue === "6" ? (
          <div className={styles.flexRow}>
            <p
              className={styles.precisionText}
              style={{
                margin:
                  direction === RTL_DIRECTION && "  margin: 16px 10px 5px 0px",
              }}
            >
              {t("precision")}:
            </p>
            <CustomInputBase
              id="pmweb_InputFieldsStrip_ThirdInputBase"
              type="number"
              variant="outlined"
              className={clsx(
                styles.lengthData,
                direction === RTL_DIRECTION
                  ? arabicStyles.precisionInput
                  : styles.precisionInput
              )}
              onChange={(event) =>
                secondInputBaseHandler((prevData) => {
                  return { ...prevData, precision: event.target.value };
                })
              }
              value={secondInputBase.precision}
              disabled={isReadOnly}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.buttonsDiv}>
        <img
          tabIndex={0}
          src={MappingIcon}
          id="pmweb_InputFieldsStrip_MoreOptionsIcon"
          onClick={() => setIsModalOpen(true)}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.moreOptionsInput
              : styles.moreOptionsInput
          }
          alt="Map"
          fontSize="small"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsModalOpen(true);
              e.stopPropagation();
            }
          }}
        />

        <button
          id="pmweb_InputFieldsStrip_CloseInputStrip"
          onClick={closeInputStrip}
          disabled={isReadOnly}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.cancelBtn
              : styles.cancelBtn
          }
        >
          <span>{t("cancel")}</span>
        </button>

        <button
          id="pmweb_InputFieldsStrip_AddFieldBtn"
          disabled={isReadOnly}
          onClick={() => addHandlerFunc(isConstraintsEnabled)}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.addButton
              : styles.addButton
          }
        >
          <span className={styles.addButtonText}>{t("add")}</span>
        </button>
        {/* {!isReadOnly && (
          <ClearOutlinedIcon
            id="export_input_strip_close_strip"
            onClick={closeInputStrip}
            className={styles.closeInputStrip}
          />
        )} */}
      </div>
      {isModalOpen && (
        <Modal
          show={isModalOpen}
          // modalClosed={() => setIsModalOpen(false)} //Commented as per requirement for Bug 116642
          style={{
            // width: "28%",
            //modified for bug_id: 138217 on 26-9-2023
            height: "350px",
            // left: "35%",
            top: "27%",
            padding: "0px",
          }}
        >
          <MappingDataModal
            setValue={setValue}
            isOpen={isModalOpen}
            handleClose={() => setIsModalOpen(false)}
            documentList={documentList}
            variablesList={variablesList}
            mappingDetails={mappingDetails}
            isReadOnly={isReadOnly}
            fieldType={dropdownValue}
          />
        </Modal>
      )}
    </div>
  );
}

export default InputFieldsStrip;
