// #BugID - 116875
// #BugDescription - Added type for numeric input field validation and added class to show the proper design.
// #BugID - 116877
// #BugDescription - Masked value was not working properly so changed the implementation using multiselect component.

import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import { InputBase, MenuItem, Checkbox, Divider } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  getFileTypes,
  getFieldTypes,
  getFieldMoveType,
} from "../../../../../utility/PropertiesTab/Export";
import {
  EXPORT_CSV_FILE_TYPE,
  EXPORT_TEXT_FILE_TYPE,
  EXPORT_DAT_FILE_TYPE,
  EXPORT_RES_FILE_TYPE,
  EXPORT_FIXED_LENGTH_FIELD_TYPE,
  EXPORT_VARIABLE_LENGTH_FIELD_TYPE,
  EXPORT_DAILY_FILE_MOVE,
  EXPORT_WEEKLY_FILE_MOVE,
  EXPORT_MONTHLY_FILE_MOVE,
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import TextInput from "../../../../../UI/Components_With_ErrrorHandling/InputField";
import clsx from "clsx";
import "./index.css";
import arabicStyles from "./ArabicStyles.module.css";
import MultiSelect from "../../../../../UI/MultiSelect";

function FileDetails(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const { data, fields, isReadOnly, setActivityData } = props;
  const [firstFieldName, setFirstFieldName] = useState("");
  const [secondFieldName, setSecondFieldName] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [orderBy, setOrderBy] = useState(fields && fields[0]);
  const [fileType, setFileType] = useState("");
  const [fieldType, setFieldType] = useState("1");
  const [fileMoveInterval, setFileMoveInterval] = useState("");
  const [sleepTime, setSleepTime] = useState("");
  const [maskedValue, setMaskedValue] = useState("");
  const [fieldSeparator, setFieldSeparator] = useState("");
  const [recordNo, setRecordNo] = useState("");
  const [isHeaderEnabled, setIsHeaderEnabled] = useState(false);
  const [headerString, setHeaderString] = useState("");
  const [footerString, setFooterString] = useState("");
  const fileTypes = [
    EXPORT_CSV_FILE_TYPE,
    EXPORT_TEXT_FILE_TYPE,
    EXPORT_DAT_FILE_TYPE,
    EXPORT_RES_FILE_TYPE,
  ];
  const fieldTypes = [
    EXPORT_FIXED_LENGTH_FIELD_TYPE,
    EXPORT_VARIABLE_LENGTH_FIELD_TYPE,
  ];
  const fileMoveIntervals = [
    EXPORT_DAILY_FILE_MOVE,
    EXPORT_WEEKLY_FILE_MOVE,
    EXPORT_MONTHLY_FILE_MOVE,
  ];

  // Function that runs when data parameter changes.
  useEffect(() => {
    if (data) {
      setCsvFileName(data.csvFileName);
      setFilePath(data.filePath);
      setOrderBy(data.orderBy);
      setFileType(data.fileType);
      setFieldType(data.csvType === "" ? "1" : data.csvType);
      setFileMoveInterval(data.fileExpiryTrig);
      setSleepTime(data.sleepTime);
      setMaskedValue(data.maskedValue);
      setFieldSeparator(data.fieldSep);
      setRecordNo(data.noOfRecord);
      setIsHeaderEnabled(data.generateHeader);
      setHeaderString(data.headerString);
      setFooterString(data.footerString);
    }
  }, [data]);

  // Function that sets the file info data.
  const setFileInfoData = (key, value) => {
    setActivityData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp.fileInfo[key] = value;
      if (key === "orderBy") {
        if (value !== "") {
          temp.fileInfo["m_bOrderBy"] = true;
        } else {
          temp.fileInfo["m_bOrderBy"] = false;
        }
      }
      return temp;
    });
  };

  // Function that runs when the user changes the csv file name value.
  const handleCsvFileName = (value) => {
    setCsvFileName(value);
    setFileInfoData("csvFileName", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the file path value.
  const handleFilePath = (value) => {
    setFilePath(value);
    setFileInfoData("filePath", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user clicks on the + icon to add a csv file name.
  const handleAddCsvFileName = () => {
    if (firstFieldName !== "") {
      const updatedFileName = csvFileName.concat(`&<${firstFieldName}>&`);
      setCsvFileName(updatedFileName);
      setFileInfoData("csvFileName", updatedFileName);
      enableSaveChangesButton();
    }
  };

  // Function that runs when the user clicks on the + icon to add file path.
  const handleAddFilePath = () => {
    if (secondFieldName !== "") {
      const updatedPathName = filePath.concat(`&<${secondFieldName}>&`);
      setFilePath(updatedPathName);
      setFileInfoData("filePath", updatedPathName);
    }
  };

  // Function that runs when the user changes the order by value.
  const handleOrderBy = (value) => {
    setOrderBy(value);
    setFileInfoData("orderBy", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the file type value.
  const handleFileType = (value) => {
    setFileType(value);
    setFileInfoData("fileType", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the field type value.
  const handleFieldType = (value) => {
    setFieldType(value);
    setFileInfoData("csvType", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the field separator value.
  const handleFieldSeparator = (value) => {
    setFieldSeparator(value);
    setFileInfoData("fieldSep", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the file move interval value.
  const handleFileMoveInterval = (value) => {
    setFileMoveInterval(value);
    setFileInfoData("fileExpiryTrig", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the record no. value.
  const handleRecordNo = (value) => {
    setRecordNo(value);
    setFileInfoData("noOfRecord", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the sleep time value.
  const handleSleepTime = (value) => {
    setSleepTime(value);
    setFileInfoData("sleepTime", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the header checkbox value.
  const handleIsHeaderEnabled = (value) => {
    setIsHeaderEnabled(value);
    setFileInfoData("generateHeader", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes header string value.
  const handleHeaderString = (value) => {
    setHeaderString(value);
    setFileInfoData("headerString", value);
    enableSaveChangesButton();
  };

  // Function that runs when the user changes the footer string value.
  const handleFooterString = (value) => {
    setFooterString(value);
    setFileInfoData("footerString", value);
    enableSaveChangesButton();
  };

  // Function that enables the save changes button on changes.
  const enableSaveChangesButton = () => {
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Export]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.Export]?.hasError,
        },
      })
    );
  };

  // Function that returns the array of objects with fieldName and id as keys for the fieldsArray passed as parameter.
  const getMaskedValueOptions = (fieldsArray) => {
    let tempArr = [];
    fieldsArray?.forEach((element, index) => {
      if (element.fieldName !== "") {
        const obj = { fieldName: element, id: index };
        tempArr.push(obj);
      }
    });
    return tempArr;
  };

  // Function that returns the value of different field names in an array of object.
  const getMaskedValuesFromExportData = () => {
    let tempArr = [];
    if (maskedValue !== "") {
      tempArr = maskedValue.split(",");
    }
    return getMaskedValueOptions(tempArr);
  };

  // Function that returns the string value for saving in maskedValue state and for API.
  const getMaskedValueStringForSaving = (maskedValueArray) => {
    let tempArr = [];
    maskedValueArray?.forEach((element) => {
      tempArr.push(element.fieldName);
    });
    return tempArr.join(",");
  };

  return (
    <div
      // Modified on 20-09-23 for Bug 137003
      className={
        direction === RTL_DIRECTION ? arabicStyles.mainDiv : styles.mainDiv
      }
      // Till here for Bug 137003
    >
      <div className={clsx(styles.flexRow, styles.divHeight)}>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("fieldName")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="pmweb_FileDetails_FirstFieldName"
            className={styles.dropdownInput}
            value={firstFieldName}
            onChange={(event) => setFirstFieldName(event.target.value)}
            isNotMandatory={true}
          >
            {fields &&
              fields.map((d) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    value={d}
                  >
                    {d}
                  </MenuItem>
                );
              })}
          </CustomizedDropdown>
        </div>
        <div className={styles.flexColumn}>
          {!isReadOnly ? (
            <button
              id="pmweb_FileDetails_AddCSVFileNameBtn"
              onClick={handleAddCsvFileName}
              className={styles.addIcon}
            >
              {t("add")}
            </button>
          ) : null}
        </div>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <div className={styles.flexRow}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldTitle
                  : styles.fieldTitle,
                styles.fieldName
              )}
            >
              {t("csvFileName")}
            </p>
            <span className={styles.asterisk}>*</span>
          </div>
          <TextInput
            inputValue={csvFileName}
            classTag={styles.inputBaseData}
            onChangeEvent={(event) => handleCsvFileName(event.target.value)}
            name="csvFileName"
            idTag="pmweb_FileDetails_CSVNameInput"
            errorStatement={t("mandatoryFieldStatement")}
            errorSeverity={"error"}
            errorType={0}
            inlineError={true}
            readOnlyCondition={isReadOnly}
          />
        </div>
        <div className={styles.flexColumn}>
          <Divider orientation="vertical" className={styles.fieldDivider} />
        </div>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("fieldName")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="pmweb_FileDetails_SecondFieldName"
            className={styles.dropdownInput}
            value={secondFieldName}
            onChange={(event) => setSecondFieldName(event.target.value)}
            isNotMandatory={true}
          >
            {fields &&
              fields.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
          </CustomizedDropdown>
        </div>
        <div className={styles.flexColumn}>
          {!isReadOnly ? (
            <button
              id="pmweb_FileDetails_AddFilePathBtn"
              onClick={handleAddFilePath}
              className={styles.addIcon}
            >
              {t("add")}
            </button>
          ) : null}
        </div>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <div className={styles.flexRow}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldTitle
                  : styles.fieldTitle,
                styles.fieldName
              )}
            >
              {t("filePath")}
            </p>
            <span className={styles.asterisk}>*</span>
          </div>
          <TextInput
            inputValue={filePath}
            classTag={styles.inputBaseData}
            onChangeEvent={(event) => handleFilePath(event.target.value)}
            name="filePath"
            idTag="pmweb_FileDetails_FilePathInput"
            errorStatement={t("mandatoryFieldStatement")}
            errorSeverity={"error"}
            errorType={0}
            inlineError={true}
            readOnlyCondition={isReadOnly}
          />
        </div>
      </div>
      <div className={clsx(styles.flexRow, styles.divHeight)}>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("orderBy")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="pmweb_FileDetails_OrderByDropdown"
            className={styles.dropdownInput}
            value={orderBy}
            onChange={(event) => handleOrderBy(event.target.value)}
            isNotMandatory={true}
          >
            {fields &&
              fields.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
          </CustomizedDropdown>
        </div>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("fileType")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="pmweb_FileDetails_FileTypeDropdown"
            className={styles.dropdownInput}
            value={fileType}
            onChange={(event) => handleFileType(event.target.value)}
            isNotMandatory={true}
          >
            {fileTypes &&
              fileTypes.map((d) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    value={d}
                  >
                    {t(getFileTypes(d))}
                  </MenuItem>
                );
              })}
          </CustomizedDropdown>
        </div>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <label
            htmlFor="pmweb_FileDetails_MaskedValLabel"
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("maskedValue")}
          </label>
          <MultiSelect
            disabled={isReadOnly}
            completeList={getMaskedValueOptions(fields)}
            labelKey="fieldName"
            indexKey="id"
            associatedList={getMaskedValuesFromExportData()}
            handleAssociatedList={(val) => {
              setMaskedValue(getMaskedValueStringForSaving(val));
              setFileInfoData(
                "maskedValue",
                getMaskedValueStringForSaving(val)
              );
              enableSaveChangesButton();
            }}
            placeholder={t("selectMaskedValueFields")}
            noDataLabel={t("noFieldsFound")}
            selectAllStr={t("selectAllFieldNames")}
            id="pmweb_FileDetails_MaskedValue"
            style={{ width: "28vw" }}
            selectAllOption={true}
            inputId={"pmweb_FileDetails_MaskedValLabel"}
          />
        </div>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("fieldType")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="pmweb_FileDetails_FieldTypeDropdown"
            className={styles.dropdownInput}
            value={fieldType}
            onChange={(event) => handleFieldType(event.target.value)}
            isNotMandatory={true}
          >
            {fieldTypes &&
              fieldTypes.map((d) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    value={d}
                  >
                    {t(getFieldTypes(d))}
                  </MenuItem>
                );
              })}
          </CustomizedDropdown>
        </div>
      </div>
      <div className={clsx(styles.flexRow, styles.divHeight)}>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <div className={styles.flexRow}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldTitle
                  : styles.fieldTitle,
                styles.fieldName
              )}
            >
              {t("fieldSeparator")}
            </p>
            <span className={styles.asterisk}>*</span>
          </div>
          <TextInput
            maxLength={1}
            inputValue={fieldSeparator}
            classTag={styles.inputBaseData}
            onChangeEvent={(event) => handleFieldSeparator(event.target.value)}
            name="fieldSeparator"
            idTag="pmweb_FileDetails_FieldSeparatorInput"
            errorStatement={t("mandatoryFieldStatement")}
            errorSeverity={"error"}
            errorType={6}
            inlineError={true}
            readOnlyCondition={isReadOnly}
          />
        </div>

        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("fileMove")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="pmweb_FileDetails_FileMoveDropdown"
            className={styles.dropdownInput}
            value={fileMoveInterval}
            onChange={(event) => handleFileMoveInterval(event.target.value)}
            isNotMandatory={true}
          >
            {fileMoveIntervals &&
              fileMoveIntervals.map((d) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    value={d}
                  >
                    {t(getFieldMoveType(d))}
                  </MenuItem>
                );
              })}
          </CustomizedDropdown>
        </div>

        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <div className={styles.flexRow}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldTitle
                  : styles.fieldTitle,
                styles.fieldName
              )}
            >
              {t("recordNumber")}
            </p>
            <span className={styles.asterisk}>*</span>
          </div>

          {/* <InputBase
            disabled={isReadOnly}
            id="file_details_record_number_input"
            variant="outlined"
            className={styles.inputBaseData}
            onChange={(event) => setRecordNo(event.target.value)}
            value={recordNo}
          /> */}
          <TextInput
            inputValue={recordNo}
            classTag={styles.inputBaseData}
            onChangeEvent={(event) => handleRecordNo(event.target.value)}
            name="recordNo"
            idTag="file_details_record_number_input"
            errorStatement={t("mandatoryFieldStatement")}
            errorSeverity={"error"}
            errorType={0}
            inlineError={true}
            type="number"
            readOnlyCondition={isReadOnly}
          />
        </div>

        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("sleepTime")}
          </p>
          <InputBase
            disabled={isReadOnly}
            inputProps={{
              "aria-label": "Sleep Time",
            }}
            id="file_details_sleep_time_input"
            type="number"
            variant="outlined"
            className={styles.inputBaseData}
            onChange={(event) => handleSleepTime(event.target.value)}
            value={sleepTime}
          />
        </div>

        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <div className={styles.flexRow}>
            <Checkbox
              disabled={isReadOnly}
              id="file_details_header_checkbox"
              inputProps={{
                "aria-label": "Generate Header",
              }}
              className={styles.orderByCheckBox}
              checked={isHeaderEnabled}
              size="small"
              onChange={() => handleIsHeaderEnabled(!isHeaderEnabled)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleIsHeaderEnabled(!isHeaderEnabled);
                  e.stopPropagation();
                }
              }}
            />
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldTitle
                  : styles.fieldTitle,
                styles.generateHeader
              )}
            >
              {t("generateHeader")}
            </p>
          </div>
        </div>
      </div>

      <div className={clsx(styles.flexRow, styles.divHeight)}>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("headerString")}
          </p>
          <InputBase
            disabled={isReadOnly}
            id="file_details_header_string_input"
            variant="outlined"
            className={styles.inputBaseData}
            onChange={(event) => handleHeaderString(event.target.value)}
            value={headerString}
          />
        </div>
        <div className={clsx(styles.subDiv, styles.flexColumn)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              styles.fieldName
            )}
          >
            {t("footerString")}
          </p>
          <InputBase
            disabled={isReadOnly}
            id="file_details_footer_string_input"
            inputProps={{
              "aria-label": "Footer String",
            }}
            variant="outlined"
            className={styles.inputBaseData}
            onChange={(event) => handleFooterString(event.target.value)}
            value={footerString}
          />
        </div>
      </div>
    </div>
  );
}

export default FileDetails;
