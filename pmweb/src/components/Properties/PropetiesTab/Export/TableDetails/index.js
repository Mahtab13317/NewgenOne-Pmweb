import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import clsx from "clsx";
import axios from "axios";
import { useTranslation } from "react-i18next";
import InputFieldsStrip from "./InputFieldsStrip";
import { useDispatch, useSelector } from "react-redux";
import { MenuItem, Radio } from "@material-ui/core";
import EmptyStateIcon from "../../../../../assets/ProcessView/EmptyState.svg";
import { getVariableType } from "../../../../../utility/ProcessSettings/Triggers/getVariableType";
import { dateDropdownOptions, typeDropdownOptions } from "./DropdownOptions";
import {
  EXPORT_DEFINED_TABLE_TYPE,
  EXPORT_EXISTING_TABLE_TYPE,
  propertiesLabel,
  SERVER_URL,
  ENDPOINT_GET_EXISTING_TABLES,
  ENDPOINT_GET_COLUMNS,
  RTL_DIRECTION,
  mandatoryColumns,
  FLOAT_VARIABLE_TYPE,
  STRING_VARIABLE_TYPE,
  SPACE,
} from "../../../../../Constants/appConstants";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import TextInput from "../../../../../UI/Components_With_ErrrorHandling/InputField";
import TableDataStrip from "./TableDataStrip";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { setSave } from "../../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import { store, useGlobalState } from "state-pool";
import { getVariableObject } from "../../../../../utility/abstarctView/getVarObjByName";
import { isSQLKeywordFunc } from "../../../../../utility/ReservedSQLKeywordsCheckerFunction";

function TableDetails(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const {
    openProcessType,
    localActivityPropertyData,
    openProcessID,
    fields,
    activityData,
    setFields,
    isReadOnly,
    documentList,
    variablesList,
    setActivityData,
    handleChange,
    setGlobalData,
    getOriginalActivityData,
    tableName,
    setTableName,
    error,
  } = props;
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const [showInputFields, setShowInputFields] = useState(false);
  const [dateFormat, setDateFormat] = useState("yyyy-MM-dd");
  const [tableType, setTableType] = useState(EXPORT_DEFINED_TABLE_TYPE);
  const [mappingDetails, setMappingDetails] = useState({
    alignment: "L",
    exportAllDocsFlag: "N",
    length: "0",
    mappedField: "",
    mappingType: "0",
    quoteflag: "N",
  });
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("10");
  const [constraintType, setConstraintType] = useState("");
  const [selectedExistingTable, setSelectedExistingTable] = useState("");
  const [existingTableData, setExistingTableData] = useState([]);
  const [typeLength, setTypeLength] = useState({
    length: "50",
    precision: "0",
  });

  const [clearFields, setClearFields] = useState(false);
  const [isExistingView, setIsExistingView] = useState(false);
  const [isUserMovingToExisting, setIsUserMovingToExisting] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const tableNameRef = useRef();
  const existingTableRef = useRef();
  const defineTableRef = useRef();

  // // Function that checks export save validation.
  // const checkExportSaveValidation = () => {
  //   let hasError = false;
  //   if (tableName === null || tableName.trim() === "") {
  //     setError({
  //       ...error,
  //       tableName: {
  //         statement: t("mandatoryFieldStatement"),
  //         severity: "error",
  //         errorType: ERROR_MANDATORY,
  //       },
  //     });
  //     dispatch(
  //       setActivityPropertyChange({
  //         [propertiesLabel.Export]: { isModified: true, hasError: true },
  //       })
  //     );
  //     hasError = true;
  //   }
  //   return hasError;
  // };

  // // Function that checks if the mapping data has atleast one mapped field for any mapped field.
  // const checkMappingData = () => {
  //   let hasAtleastOneMapping = false;
  //   const mappingDataArr = activityData.mappingList;
  //   mappingDataArr?.forEach((element) => {
  //     if (element.m_objExportMappedFieldInfo.mappedFieldName !== "") {
  //       hasAtleastOneMapping = true;
  //     }
  //   });
  //   return hasAtleastOneMapping;
  // };

  // Function that runs when the component loads.
  useEffect(() => {
    getExistingTableData();
  }, []);

  // Function that runs when the showInputFields value changes.
  useEffect(() => {
    if (!showInputFields) {
      setFieldName("");
    }
  }, [showInputFields]);

  // Function that checks if table name is already created or not.
  const isTableAlreadyCreated = (tableName) => {
    //  let isTableAlreadyPresent = false;
    /* for (let index = 0; index < existingTableData.length; index++) {
      if (existingTableData[index]?.TableName === tableName?.toLowerCase()) {
        isTableAlreadyPresent = true;
        break;
      }
    }*/

    //simplyfied above logic , changed it because of checkmarx issue
    const isTableAlreadyPresent = existingTableData.some(
      (item) => item.TableName?.toLowerCase() === tableName?.toLowerCase()
    );

    return isTableAlreadyPresent;
  };

  // Asynchronous function that runs when the component loads.
  useEffect(async () => {
    const exportData = localActivityPropertyData?.ActivityProperty?.exportInfo;
    if (existingTableData?.length > 0) {
      if (
        exportData?.tableName !== "" &&
        exportData?.tableName !== null &&
        isTableAlreadyCreated(exportData?.tableName)
      ) {
        setTableType(EXPORT_EXISTING_TABLE_TYPE);
        setSelectedExistingTable(exportData?.tableName);
      }
    }
  }, [existingTableData]);

  // Function that sets the table details value when they change.
  const setTableDetailsData = (key, value) => {
    setActivityData((prevData) => {
      let temp = JSON.parse(JSON.stringify(prevData));
      temp[key] = value;
      setGlobalData(temp);
      return temp;
    });
    // code added on 22 Nov 2022 for Bug 118739
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Export]: { isModified: true, hasError: false },
      })
    );
  };

  // Function that handles the table name changes.
  const tableNameHandler = (value) => {
    setTableName(value);
    setTableDetailsData("tableName", value);
  };

  // Function that handles the date format changes.
  const dateFormatHandler = (value) => {
    setDateFormat(value);
    setTableDetailsData("selDateFormat", value);
  };

  // Function to check if the variable type should have a disabled length or not.
  const checkDisabled = (value) => {
    if (value === "10" || value === "6") {
      return false;
    }
    return true;
  };

  // Function to fetch existing table data by making an API call.
  const getExistingTableData = () => {
    axios
      .get(
        SERVER_URL +
          ENDPOINT_GET_EXISTING_TABLES +
          `/${openProcessID}` +
          `/${openProcessType}`
      )
      .then((res) => {
        if (res?.status === 200) {
          setExistingTableData(res.data.Table);
        }
      })
      .catch((err) => console.log(err));
  };

  // Function that runs when the component loads.
  useEffect(() => {
    activityData?.fieldList?.forEach((element) => {
      fields.push(element.name);
    });
    let unique = fields.filter((it, i, ar) => ar.indexOf(it) === i);
    setFields([...unique]);
    if (activityData) {
      setTableName(activityData.tableName);
      setDateFormat(activityData.selDateFormat);
    }
  }, [activityData]);

  // Function that gets the max Order ID in data map array.
  const findMaxOrderId = () => {
    let maxId = 0;
    activityData &&
      activityData.mappingList.forEach((element) => {
        if (element.m_objExportMappedFieldInfo.orderID > maxId) {
          maxId = element.m_objExportMappedFieldInfo.orderID;
        }
      });
    return maxId;
  };

  // Function that checks if the table has all the mandatory columns for using or not.
  const checkMandatoryFieldsExistance = async (tableName) => {
    let isTableUsable = true;
    let columnData = [];
    let columnNames = [];

    const response = await axios.get(
      SERVER_URL +
        ENDPOINT_GET_COLUMNS +
        `/0` +
        `/${openProcessType}` +
        `/${tableName}`
    );
    if (response.data.Status === 0) {
      columnData = response?.data?.Column;
    }

    columnData?.forEach((element) => {
      columnNames.push(element.Name);
    });

    async function checkMandatoryColumns() {
      /* for (let index = 0; index < mandatoryColumns.length; index++) {
        if (!columnNames.includes(mandatoryColumns[index])) {
          isTableUsable = false;
        }
      }*/
      //changes done due to checkmarx issue
      isTableUsable = mandatoryColumns.every((item, index) =>
        columnNames.includes(mandatoryColumns[index])
      );
    }
    await checkMandatoryColumns();

    const newColumns = columnData.filter(
      (element) => !mandatoryColumns.includes(element.Name)
    );
    if (isTableUsable) {
      setTableDetailsData("tableName", tableName);
      let updatedKeysArr = [];
      newColumns?.forEach((element) => {
        const tempStr = element.Attribute.toLowerCase();
        let pascalCaseAttributeStr =
          tempStr.charAt(0).toUpperCase() + tempStr.slice(1);
        const obj = {
          attribute: pascalCaseAttributeStr,
          length: element.Length,
          name: element.Name,
          sPercision: "0",
          sTypeInt: element.Type,
          statusFlag: "G",
          type: getVariableType(element.Type).toUpperCase(),
        };
        updatedKeysArr.push(obj);
      });
      setActivityData((prevData) => {
        let temp = { ...prevData };
        temp.fieldList = updatedKeysArr;
        return temp;
      });
      let newMappedList = [];
      updatedKeysArr?.forEach((element, index) => {
        const tempObj = {
          m_objExportMappedFieldInfo: {
            alignment: "",
            docTypeId: "0",
            exportAllDocs: "N",
            extMethodIndex: "-1",
            fieldLength: "0",
            fieldName: element.name,
            mappedFieldName: "",
            orderID: `${index + 1}`,
            quoteflag: "N",
            varFieldId: "0",
            variableId: "0",
          },
        };
        newMappedList.push(tempObj);
      });
      setActivityData((prevData) => {
        let temp = { ...prevData };
        temp.mappingList = newMappedList;
        return temp;
      });
    }
    return isTableUsable;
  };

  // Function that handles the existing table dropdown field.
  const existingTableHandler = async (value) => {
    if (await checkMandatoryFieldsExistance(value)) {
      setSelectedExistingTable(value);
    } else {
      dispatch(
        setToastDataFunc({
          message: t("notAValidExportTableValidationMsg"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  // Function that checks if the field name already exists or not.
  const checkExistingFieldNames = (name, prevFields) => {
    let doesFieldNameExist = false;
    const prevFieldsObj = { ...prevFields };
    prevFieldsObj?.fieldList.forEach((element, index) => {
      if (element.name === name) {
        doesFieldNameExist = true;
      }
    });
    return doesFieldNameExist;
  };

  // Function that checks if the length and precision are correct or not according to the type of the field.
  const checkFieldLengthAndPrecision = (fieldType, length, precision) => {
    let isFieldValid = true;
    if (+fieldType === FLOAT_VARIABLE_TYPE) {
      if (+precision > +length) {
        dispatch(
          setToastDataFunc({
            message: t("precisonAndLengthValidation"),
            severity: "error",
            open: true,
          })
        );
        isFieldValid = false;
        return isFieldValid;
      } else {
        if (+length < 11 || +length > 38) {
          dispatch(
            setToastDataFunc({
              message: t("lengthValidation"),
              severity: "error",
              open: true,
            })
          );
          isFieldValid = false;
          return isFieldValid;
        }
      }
    } else if (+fieldType === STRING_VARIABLE_TYPE) {
      if (+length < 1 || +length > 255) {
        isFieldValid = false;
        dispatch(
          setToastDataFunc({
            message: t("lengthValString"),
            severity: "error",
            open: true,
          })
        );
        return isFieldValid;
      }
    }
    return isFieldValid;
  };

  // Function that runs when the user adds a new field.
  const handleAddField = (isConstraintsEnabled) => {
    if (fieldName.trim() !== "") {
      if (!checkExistingFieldNames(fieldName, activityData)) {
        if (
          checkFieldLengthAndPrecision(
            fieldType,
            typeLength.length,
            typeLength.precision
          )
        ) {
          const fieldListObj = {
            attribute: isConstraintsEnabled ? constraintType : "",
            length: typeLength.length,
            name: fieldName,
            sPercision: typeLength.precision,
            sTypeInt: fieldType,
            statusFlag: tableType === EXPORT_DEFINED_TABLE_TYPE ? "G" : "A",
            type: getVariableType(fieldType).toUpperCase(),
          };

          const maxId = +findMaxOrderId();
          let newObj = {
            orderID: `${maxId + 1}`,
            fieldName: fieldName,
            mappedFieldName: mappingDetails?.mappedField || "",
            fieldLength: mappingDetails?.length,
            quoteflag: mappingDetails?.quoteflag,
            extMethodIndex: "-1",
            alignment: mappingDetails?.alignment,
            exportAllDocs: mappingDetails?.exportAllDocsFlag,
            fwdMap: [],
            revMap: [],
          };

          if (+mappingDetails?.mappingType === 1) {
            let docId = "0";
            localLoadedProcessData?.DocumentTypeList?.map((el) => {
              if (el.DocName == mappingDetails?.mappedField) {
                docId = el.DocTypeId;
              }
            });
            newObj = {
              ...newObj,
              docTypeId: docId,
              variableId: "0",
              varFieldId: "0",
            };
          } else {
            newObj = {
              ...newObj,
              docTypeId: "0",
              variableId: mappingDetails?.mappedField
                ? getVariableObject(
                    localLoadedProcessData,
                    mappingDetails?.mappedField
                  ).VariableId
                : "0",
              varFieldId: mappingDetails?.mappedField
                ? getVariableObject(
                    localLoadedProcessData,
                    mappingDetails?.mappedField
                  ).VarFieldId
                : "0",
            };
          }

          const dataMapObj = {
            m_objExportMappedFieldInfo: {
              ...newObj,
            },
          };
          let temp = JSON.parse(JSON.stringify(activityData));
          temp.mappingList.push(dataMapObj);
          temp.fieldList.push(fieldListObj);
          let tempFields = [...fields];
          tempFields.push(fieldName);
          setFields(tempFields);
          setActivityData(temp);
          setGlobalData(temp);
          setFieldName("");
          setFieldType("10");
          setTypeLength({
            length: "50",
            precision: "0",
          });
          setConstraintType("");
          setMappingDetails({
            alignment: "L",
            exportAllDocsFlag: "N",
            length: "0",
            mappedField: "",
            mappingType: "0",
            quoteflag: "N",
          });
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.Export]: {
                isModified: true,
                hasError: allTabStatus[propertiesLabel.Export]?.hasError,
              },
            })
          );
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: t("sameFieldNameExistValidation"),
            severity: "error",
            open: true,
          })
        );
      }
    }
  };

  // Function to handle table type.
  const handleTableType = async (event) => {
    const { value } = event.target;
    setShowInputFields(false);
    setIsUserMovingToExisting(false);
    if (value === EXPORT_DEFINED_TABLE_TYPE) {
      setActivityData((prevData) => {
        let temp = { ...prevData };
        temp.fieldList = [];
        temp.mappingList = [];
        temp.tableName = "";
        return temp;
      });
    } else if (value === EXPORT_EXISTING_TABLE_TYPE) {
      const dataReturned = await getOriginalActivityData();
      const exportData = dataReturned?.data?.ActivityProperty?.exportInfo;
      setActivityData((prevData) => {
        let temp = { ...prevData };
        temp.fieldList = exportData?.fieldList;
        temp.mappingList = exportData?.mappingList;
        temp.selDateFormat = exportData?.selDateFormat;
        temp.tableName = exportData?.tableName;
        return temp;
      });
      setIsUserMovingToExisting(true);
    }
    setTableType(value);

    if (value === EXPORT_DEFINED_TABLE_TYPE) {
      setIsExistingView(false);
    } else {
      setIsExistingView(true);
    }
  };

  // Function that runs when the clearFields value changes.
  useEffect(async () => {
    if (
      clearFields &&
      tableType !== EXPORT_DEFINED_TABLE_TYPE &&
      !isUserMovingToExisting
    ) {
      const dataReturned = await getOriginalActivityData();
      const exportData = dataReturned?.data?.ActivityProperty?.exportInfo;
      const tableTypeValue =
        tableType === EXPORT_EXISTING_TABLE_TYPE
          ? EXPORT_DEFINED_TABLE_TYPE
          : EXPORT_EXISTING_TABLE_TYPE;
      setTableType(tableTypeValue);
      setActivityData((prevData) => {
        let temp = { ...prevData };
        temp.fieldList = exportData?.fieldList;
        temp.mappingList = exportData?.mappingList;
        temp.selDateFormat = exportData?.selDateFormat;
        temp.tableName =
          tableTypeValue === EXPORT_EXISTING_TABLE_TYPE
            ? ""
            : exportData?.tableName;
        return temp;
      });
      dispatch(setSave({ CloseClicked: false }));
      setClearFields(false);
    }
  }, [clearFields]);

  // Function that runs when the user changes the constraint type field.
  const handleConstraintType = (value) => {
    setConstraintType(value);
  };

  // Function that runs when the user changes the field name.
  const handleFieldNameChange = (event, index) => {
    let temp = { ...activityData };
    temp.fieldList[index].name = event.target.value;
    setActivityData(temp);
  };

  // Function that runs when the user clicks away from the field name.
  const checkFieldNameOnBlur = (event, index, prevValue, prevDataFields) => {
    if (
      prevValue !== event.target.value &&
      isSQLKeywordFunc(event.target.value?.trim())
    ) {
      let temp = { ...activityData };
      temp.fieldList[index].name = prevValue;
      setActivityData(temp);
      dispatch(
        setToastDataFunc({
          message:
            t("this") +
            SPACE +
            t("fieldNameSmall") +
            SPACE +
            t("reservedSQLKeywordMessage"),
          severity: "error",
          open: true,
        })
      );
    } else {
      if (
        prevValue !== event.target.value &&
        checkExistingFieldNames(event.target.value.trim(), prevDataFields)
      ) {
        let temp = { ...activityData };
        temp.fieldList[index].name = prevValue;
        setActivityData(temp);
        dispatch(
          setToastDataFunc({
            message: t("fieldNameExists"),
            severity: "error",
            open: true,
          })
        );
      } else {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.Export]: {
              isModified: true,
              hasError: allTabStatus[propertiesLabel.Export]?.hasError,
            },
          })
        );
      }
    }
  };

  // Function that runs when the user changes the field type.
  const handleFieldTypeChange = (event, index) => {
    let temp = { ...activityData };
    temp.fieldList[index].sTypeInt = event.target.value;
    setActivityData(temp);
  };

  // Function that runs when the user changes the constraint type.
  const handleAttributeChange = (value, index) => {
    let temp = JSON.parse(JSON.stringify(activityData));
    temp.fieldList[index].attribute = value;
    temp.fieldList[index].statusFlag = "M";
    setActivityData(temp);
    setGlobalData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Export]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.Export]?.hasError,
        },
      })
    );
  };

  // Function that runs when the user deletes a field.
  const handleDeleteField = (name, index) => {
    let temp = { ...activityData };
    const [removedElement] = temp.fieldList.splice(index, 1);
    const availableFieldNames = fields.filter((d) => d !== removedElement.name);
    setFields([...availableFieldNames]);
    setActivityData((prevData) => {
      let tempObj = { ...prevData };
      tempObj.mappingList.splice(index, 1);
      setGlobalData(tempObj);
      return tempObj;
    });
  };

  // Function that runs when the user changes the field length.
  const handleFieldLength = (event, index) => {
    let temp = { ...activityData };
    temp.fieldList[index].length = event.target.value;
    temp.fieldList[index].statusFlag = "M";
    setActivityData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Export]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.Export]?.hasError,
        },
      })
    );
  };

  // Function that runs when the user clicks away from the length text input and checks if the length is correct or not according to type of field.
  const checkLengthOnBlur = (event, index, type, prevLength, precision) => {
    if (!checkFieldLengthAndPrecision(type, event.target.value, precision)) {
      let temp = { ...activityData };
      temp.fieldList[index].length = prevLength;
      setActivityData(temp);
    }
  };

  // Function that runs when the user changes the field precision.
  const handleFieldPrecision = (event, index) => {
    let temp = { ...activityData };
    temp.fieldList[index].sPercision = event.target.value;
    setActivityData(temp);
  };

  // Function that runs when the user clicks away from the precision text input and checks if the precision is correct or not according to type of field.
  const checkPrecisionOnBlur = (event, index, type, length, prevPrecision) => {
    if (!checkFieldLengthAndPrecision(type, length, event.target.value)) {
      let temp = { ...activityData };
      temp.fieldList[index].sPercision = prevPrecision;
      setActivityData(temp);
    }
  };

  return (
    <div
      className={
        direction === RTL_DIRECTION ? arabicStyles.mainDiv : styles.mainDiv
      }
    >
      {/* <ConfirmationBox
        open={showConfirmationBox}
        handleClose={() => {
          setShowConfirmationBox(false);
          setClearFields(false);
        }}
        mainHeading={`Switching to ${
          !isExistingView
            ? EXPORT_DEFINED_TABLE_TYPE
            : EXPORT_EXISTING_TABLE_TYPE
        } view?`}
        message={`All unsaved fields and mappings will be cleared. Are you sure you want to switch to  ${
          !isExistingView
            ? EXPORT_DEFINED_TABLE_TYPE
            : EXPORT_EXISTING_TABLE_TYPE
        } table?`}
        okHandler={() => {
          setShowConfirmationBox(false);
          setClearFields(true);
        }}
      /> */}
      <div className={styles.tableTypeDiv}>
        <Radio
          tabIndex={0}
          disabled={isReadOnly}
          id="pmweb_TableDetails_ExistingTableRadio"
          checked={tableType === EXPORT_EXISTING_TABLE_TYPE}
          onChange={handleTableType}
          value={EXPORT_EXISTING_TABLE_TYPE}
          size="small"
          ref={existingTableRef}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              existingTableRef.current.click();
            }
          }}
          inputProps={{
            "aria-labelledby": "defineTableLabel",
          }}
        />
        <label id={"defineTableLabel"} className={styles.tableType}>
          {t("existingTable")}
        </label>
        <Radio
          tabIndex={0}
          disabled={isReadOnly}
          id="pmweb_TableDetails_DefinedTableRadio"
          checked={tableType === EXPORT_DEFINED_TABLE_TYPE}
          onChange={handleTableType}
          value={EXPORT_DEFINED_TABLE_TYPE}
          size="small"
          ref={defineTableRef}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              defineTableRef.current.click();
            }
          }}
          inputProps={{
            "aria-labelledby": "defineTableLabel",
          }}
        />
        <label id={"defineTableLabel"} className={styles.tableType}>
          {t("defineTable")}
        </label>
      </div>
      <div className={styles.flexRow}>
        <div className={styles.subDiv}>
          <div className={styles.flexRow}>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldTitle
                  : styles.fieldTitle
              }
            >
              {t("tableName")}
              <span
                className={clsx(
                  direction === RTL_DIRECTION
                    ? arabicStyles.asterisk
                    : styles.asterisk,
                  styles.tableNameMargin
                )}
              >
                *
              </span>
            </p>
          </div>
          {tableType === EXPORT_EXISTING_TABLE_TYPE ? (
            <CustomizedDropdown
              disabled={isReadOnly}
              id="pmweb_TableDetails_ExistingTableDropdown"
              className={styles.inputBase}
              value={selectedExistingTable?.toLowerCase()}
              onChange={(event) => existingTableHandler(event.target.value)}
              isNotMandatory={true}
            >
              {existingTableData?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    value={element.TableName?.toLowerCase()}
                  >
                    {element.TableName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          ) : (
            <TextInput
              readOnlyCondition={isReadOnly}
              inputValue={tableName}
              classTag={
                direction === RTL_DIRECTION
                  ? arabicStyles.inputBase
                  : styles.inputBase
              }
              onChangeEvent={(event) => tableNameHandler(event.target.value)}
              name="tableName"
              idTag="pmweb_TableDetails_TableNameInput"
              errorStatement={error?.tableName?.statement}
              errorSeverity={error?.tableName?.severity}
              errorType={error?.tableName?.errorType}
              inlineError={true}
              inputRef={tableNameRef}
              onKeyPress={(e) => {
                FieldValidations(e, 151, tableNameRef.current, 50);
              }}
            />
          )}
        </div>
        <div className={clsx(styles.subDiv, styles.dateFormatDivMargin)}>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.fieldTitle
                : styles.fieldTitle,
              direction === RTL_DIRECTION
                ? arabicStyles.dateFormat
                : styles.dateFormat
            )}
          >
            {t("dateFormat")}
          </p>
          <CustomizedDropdown
            disabled={isReadOnly}
            id="pmweb_TableDetails_DateFormatDropdown"
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.typeInput
                : styles.typeInput
            }
            value={dateFormat}
            onChange={(event) => dateFormatHandler(event.target.value)}
            isNotMandatory={true}
          >
            {dateDropdownOptions &&
              dateDropdownOptions.map((element) => {
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
      </div>
      <p
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.fieldDefinitionHeading
            : styles.fieldDefinitionHeading
        }
      >
        {t("fieldDefinition")}
      </p>
      <div style={{ width: "100%" }}>
        <div className={styles.headingsDiv}>
          <div style={{ width: "15%", display: "flex" }}>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldName
                  : styles.fieldName
              }
            >
              {t("name")}
            </p>
            <span
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.asterisk
                  : styles.asterisk
              }
            >
              *
            </span>
          </div>
          <p
            className={
              direction === RTL_DIRECTION ? arabicStyles.type : styles.type
            }
            style={{ width: "15%" }}
          >
            {t("type")}
          </p>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.constraints
                : styles.constraints
            }
            style={{ width: "30%", minWidth: "22rem" }}
          >
            {t("constraints")}
          </p>
          <p
            className={
              direction === RTL_DIRECTION ? arabicStyles.length : styles.length
            }
            style={{ width: "15%" }}
          >
            {t("length")}
          </p>

          {!showInputFields && !isReadOnly ? (
            <div style={{ width: "25%" }}>
              <button
                id="pmweb_TableDetails_ShowInputStripBtn"
                onClick={() => setShowInputFields(true)}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.addFieldButton
                    : styles.addFieldButton
                }
              >
                <span className={styles.addFieldButtonText}>
                  {t("addField")}
                </span>
              </button>
            </div>
          ) : null}
        </div>
        <div className={styles.dataDiv}>
          {showInputFields ? (
            <div className={styles.inputsDiv}>
              <InputFieldsStrip
                setValue={setMappingDetails}
                mappingDetails={mappingDetails}
                inputBaseValue={fieldName}
                inputBaseHandler={setFieldName}
                dropdownValue={fieldType}
                dropdownHandler={setFieldType}
                dropdownOptions={typeDropdownOptions}
                closeInputStrip={() => setShowInputFields(false)}
                radioTypeValue={constraintType}
                radioTypeHandler={handleConstraintType}
                addHandler={handleAddField}
                documentList={documentList}
                variablesList={variablesList}
                secondInputBase={typeLength}
                secondInputBaseHandler={setTypeLength}
                checkDisabled={checkDisabled}
                isReadOnly={isReadOnly}
              />
            </div>
          ) : null}
        </div>
      </div>
      {activityData &&
      activityData.fieldList &&
      activityData.fieldList.length === 0 ? (
        <div className={styles.emptyStateMainDiv}>
          <img
            className={styles.emptyStateImage}
            src={EmptyStateIcon}
            alt={t("createFields")}
          />
          {!isReadOnly && (
            <p className={styles.emptyStateHeading}>{t("createFields")}</p>
          )}
          <p className={styles.emptyStateText}>
            {t("noDataFieldsCreated")}
            {isReadOnly ? "." : t("pleaseCreateDataFields")}
          </p>
        </div>
      ) : (
        <div className={styles.tableDataDiv}>
          {activityData.fieldList &&
            activityData.fieldList.map((d, index) => {
              return (
                <TableDataStrip
                  activityData={activityData}
                  isReadOnly={isReadOnly}
                  fieldName={d.name}
                  fieldType={d.sTypeInt}
                  attribute={d.attribute}
                  index={index}
                  handleFieldNameChange={handleFieldNameChange}
                  checkFieldNameOnBlur={checkFieldNameOnBlur}
                  handleFieldTypeChange={handleFieldTypeChange}
                  handleAttributeChange={handleAttributeChange}
                  handleDeleteField={handleDeleteField}
                  setActivityData={setActivityData}
                  documentList={documentList}
                  variablesList={variablesList}
                  getVariableType={getVariableType}
                  precision={d.sPercision}
                  length={d.length}
                  handleFieldLength={handleFieldLength}
                  checkLengthOnBlur={checkLengthOnBlur}
                  handleFieldPrecision={handleFieldPrecision}
                  checkPrecisionOnBlur={checkPrecisionOnBlur}
                  checkDisabled={checkDisabled}
                  setGlobalData={setGlobalData}
                  tableType={tableType}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}

export default TableDetails;
