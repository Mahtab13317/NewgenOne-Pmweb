import React, { useState, useEffect } from "react";
import { Radio, MenuItem, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import CustomizedDropdown from "../../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { setToastDataFunc } from "../../../../../../redux-store/slices/ToastDataHandlerSlice";
import { store, useGlobalState } from "state-pool";
import { getVariableObject } from "../../../../../../utility/abstarctView/getVarObjByName";
import {
  COMPLEX_VARTYPE,
  RTL_DIRECTION,
} from "../../../../../../Constants/appConstants";
import { CustomInputBase } from "../TableDataStrip";
import arabicStyles from "./ArabicStyles.module.css";

//Function to make complex variables
export const getComplex = (variable) => {
  let varList = [];
  let varRelationMapArr = variable?.RelationAndMapping
    ? variable.RelationAndMapping
    : variable["Relation&Mapping"];
  varRelationMapArr?.Mappings?.Mapping?.forEach((el) => {
    if (el.VariableType === "11") {
      let tempList = getComplex(el);
      tempList.forEach((ell) => {
        varList.push({
          ...ell,
          SystemDefinedName: `${variable.VariableName}.${ell.VariableName}`,
          VariableName: `${variable.VariableName}.${ell.VariableName}`,
        });
      });
    } else {
      varList.push({
        DefaultValue: "",
        ExtObjectId: el.ExtObjectId ? el.ExtObjectId : variable.ExtObjectId,
        SystemDefinedName: `${variable.VariableName}.${el.VariableName}`,
        Unbounded: el.Unbounded,
        VarFieldId: el.VarFieldId,
        VarPrecision: el.VarPrecision,
        VariableId: el.VariableId,
        VariableLength: el.VariableLength,
        VariableName: `${variable.VariableName}.${el.VariableName}`,
        VariableScope: el.VariableScope
          ? el.VariableScope
          : variable.VariableScope,
        VariableType: el.VariableType,
      });
    }
  });
  return varList;
};

function MappingDataModal(props) {
  let { t } = useTranslation();
  const {
    index,
    isOpen,
    activityData,
    setActivityData,
    setValue,
    handleClose,
    fieldName,
    isReadOnly,
    documentList,
    variablesList,
    mappingDetails,
    setGlobalData,
    fieldType,
  } = props;
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [typeValue, setTypeValue] = useState("0");
  const [mappedField, setMappedField] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [docList, setDocList] = useState([]);
  const [length, setLength] = useState("0");
  const [alignment, setAlignment] = useState("L");
  const [quoteFlag, setQuoteFlag] = useState("N");
  const [exportAllDocsFlag, setExportAllDocsFlag] = useState("N");
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

  // Function that runs when the component runs.
  useEffect(() => {
    getDataDropdownOptions();
    setDocList(documentList);
  }, []);

  // Function that runs when the component loads.
  useEffect(() => {
    if (activityData && activityData.mappingList) {
      let temp = JSON.parse(JSON.stringify(activityData));
      temp?.mappingList?.forEach((element) => {
        if (
          element?.m_objExportMappedFieldInfo?.fieldName?.toLowerCase() ===
          fieldName?.toLowerCase()
        ) {
          setTypeValue(element?.m_objExportMappedFieldInfo?.docTypeId);
          setMappedField(element?.m_objExportMappedFieldInfo?.mappedFieldName);
          setLength(element?.m_objExportMappedFieldInfo?.fieldLength);
          setExportAllDocsFlag(
            element?.m_objExportMappedFieldInfo?.exportAllDocs
          );
          setAlignment(element?.m_objExportMappedFieldInfo?.alignment);
          setQuoteFlag(element?.m_objExportMappedFieldInfo?.quoteflag);
        }
      });
    }
  }, [activityData]);

  // Function that runs when the component loads.
  useEffect(() => {
    if (mappingDetails) {
      setMappedField(mappingDetails?.mappedField);
      setTypeValue(mappingDetails?.mappingType);
      setQuoteFlag(mappingDetails?.quoteflag);
      setAlignment(mappingDetails?.alignment);
      setExportAllDocsFlag(mappingDetails?.exportAllDocsFlag);
      setLength(mappingDetails?.length);
    }
  }, [mappingDetails]);

  // Added on 31-10-23 for Bug 132050
  // Function to get filtered variables based on variable type.
  const getFilteredVariablesBasedOnType = (data, type) => {
    let tempList = [];
    if (type === "10") {
      tempList = data;
    } else if (type === "4") {
      tempList = data?.filter(
        (element) =>
          element.VariableType === "3" || element.VariableType === "4"
      );
    } else {
      tempList = data?.filter((element) => element.VariableType === type);
    }
    return tempList;
  };
  // Till here for Bug 132050

  // Modified on 31-10-23 for Bug 132050
  // Function to get dropdown options.
  const getDataDropdownOptions = () => {
    let tempVarList = [];
    let filteredData = [];
    let filteredVarData = [];

    if (fieldType) {
      filteredVarData = getFilteredVariablesBasedOnType(
        variablesList?.filter((d) => d.VariableType !== "11"),
        fieldType
      );
      filteredVarData?.forEach((element) => {
        tempVarList?.push(element.VariableName);
      });
    }

    variablesList?.forEach((_var) => {
      if (
        _var.VariableType === COMPLEX_VARTYPE &&
        _var.VariableScope === "I" &&
        _var.ExtObjectId > 1
      ) {
        let tempList = getComplex(_var);
        if (fieldType) {
          filteredData = getFilteredVariablesBasedOnType(tempList, fieldType);
          tempList = filteredData;
        }
        tempList?.forEach((el) => {
          tempVarList.push(el.VariableName);
        });
      }
    });
    setDropdownOptions(tempVarList);
  };
  // Till here for Bug 132050

  // Function that runs when a component loads.
  useEffect(() => {
    if (typeValue === "0") {
      getDataDropdownOptions();
    } else {
      let docArr = [];
      docList &&
        docList.forEach((element) => {
          docArr.push(element.DocName);
        });
      setDropdownOptions(docArr);
    }
  }, [variablesList, typeValue]);

  // Function that gets called when the user clicks on ok button.
  const handleSaveChanges = () => {
    if (length !== "") {
      if (index > -1) {
        let mappingIndex;
        let temp = JSON.parse(JSON.stringify(activityData));
        temp?.mappingList?.forEach((element, ind) => {
          if (element?.m_objExportMappedFieldInfo?.fieldName === fieldName) {
            mappingIndex = ind;
          }
        });
        if (typeValue == 1) {
          localLoadedProcessData?.DocumentTypeList?.map((el) => {
            if (el.DocName == mappedField) {
              temp.mappingList[
                mappingIndex
              ].m_objExportMappedFieldInfo.docTypeId = el.DocTypeId;
            }
          });
        } else {
          temp.mappingList[mappingIndex].m_objExportMappedFieldInfo.varFieldId =
            getVariableObject(localLoadedProcessData, mappedField).VarFieldId;
          temp.mappingList[mappingIndex].m_objExportMappedFieldInfo.variableId =
            getVariableObject(localLoadedProcessData, mappedField).VariableId;
        }
        temp.mappingList[
          mappingIndex
        ].m_objExportMappedFieldInfo.mappedFieldName = mappedField;
        temp.mappingList[mappingIndex].m_objExportMappedFieldInfo.alignment =
          alignment;
        temp.mappingList[mappingIndex].m_objExportMappedFieldInfo.fieldLength =
          length;
        temp.mappingList[mappingIndex].m_objExportMappedFieldInfo.quoteflag =
          quoteFlag;
        temp.mappingList[
          mappingIndex
        ].m_objExportMappedFieldInfo.exportAllDocs = exportAllDocsFlag;
        setActivityData(temp);
        setGlobalData(temp);
        handleClose();
      } else {
        const obj = {
          mappingType: typeValue,
          mappedField: mappedField,
          length: length,
          alignment: alignment,
          quoteflag: quoteFlag,
          exportAllDocsFlag: exportAllDocsFlag,
        };
        setValue({ ...obj });
        handleClose();
      }
    } else {
      dispatch(
        setToastDataFunc({
          message: t("pleaseEnterValidLength"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  // Function that handles type.
  const handleType = (event) => {
    setTypeValue(event.target.value);
    setMappedField("");
    if (event.target.value === "0") {
      getDataDropdownOptions();
    } else {
      let docArr = [];
      docList &&
        docList.forEach((element) => {
          docArr.push(element.DocName);
        });
      setDropdownOptions(docArr);
    }
  };

  // Function that gets called when the user clicks on cancel button in mapping modal.
  const cancelChanges = () => {
    handleClose();
    if (activityData === undefined) {
      return;
    }
    let temp = JSON.parse(JSON.stringify(activityData || {}));
    // code edited on 14 Jan 2023 for BugId 121929
    if (index > -1) {
      setMappedField(
        temp?.mappingList[index]?.m_objExportMappedFieldInfo?.mappedFieldName
      );
      setTypeValue(
        temp?.mappingList[index]?.m_objExportMappedFieldInfo?.docTypeId
      );
      setQuoteFlag(
        temp?.mappingList[index]?.m_objExportMappedFieldInfo?.quoteflag
      );
      setAlignment(
        temp?.mappingList[index]?.m_objExportMappedFieldInfo?.alignment
      );
      setExportAllDocsFlag(
        temp?.mappingList[index]?.m_objExportMappedFieldInfo?.exportAllDocs
      );
      setLength(
        temp?.mappingList[index]?.m_objExportMappedFieldInfo?.fieldLength
      );
    } else {
      setValue({
        alignment: "L",
        exportAllDocsFlag: "N",
        length: "0",
        mappedField: "",
        mappingType: "0",
        quoteflag: "N",
      });
    }
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSaveChanges();
    } else if (e.keyCode === 27) {
      handleClose();
      e.stopPropagation();
    }
  };

  // Function that runs when the handleKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div>
      <div className={styles.headingsDiv}>
        <div className={styles.flexRow}>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.heading
                : styles.heading
            }
          >
            {t("mapping")}
          </p>
          <ClearOutlinedIcon
            id="pmweb_MDM_CloseModalIcon"
            tabIndex={isOpen ? 0 : -1}
            fontSize="small"
            onClick={handleClose}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.closeModal
                : styles.closeModal
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleClose();
                e.stopPropagation();
              }
            }}
          />
        </div>
      </div>
      <div
        className={
          direction === RTL_DIRECTION ? arabicStyles.subDiv : styles.subDiv
        }
      >
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalSubHeading
              : styles.modalSubHeading
          }
        >
          {t("mappingType")}
        </p>
        <div className={styles.flexRow}>
          <Radio
            autoFocus
            tabIndex={isOpen ? 0 : -1}
            disabled={isReadOnly}
            id="pmweb_MDM_DataRadio"
            checked={typeValue === "0"}
            onChange={handleType}
            value={"0"}
            size="small"
          />
          <p className={styles.text}>{t("data")}</p>
          <Radio
            disabled={isReadOnly}
            tabIndex={isOpen ? 0 : -1}
            id="pmweb_MDM_DocumentRadio"
            checked={typeValue !== "0"}
            onChange={handleType}
            value={"1"}
            size="small"
          />
          <p className={styles.text}>{t("document")}</p>
        </div>
        <div className={styles.flexRow}>
          <div className={styles.flexColumn}>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.mappedField
                  : styles.mappedField
              }
            >
              {t("mappedField")}
            </p>
            <CustomizedDropdown
              disabled={isReadOnly}
              id="pmweb_MDM_MappedField"
              tabIndex={isOpen ? 0 : -1}
              className={styles.typeInput}
              value={mappedField}
              onChange={(event) => setMappedField(event.target.value)}
              isNotMandatory={true}
            >
              {dropdownOptions &&
                dropdownOptions?.map((element) => {
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
            <div className={styles.flexRow}>
              <p
                className={clsx(
                  direction === RTL_DIRECTION
                    ? arabicStyles.mappedField
                    : styles.mappedField,
                  direction === RTL_DIRECTION
                    ? arabicStyles.length
                    : styles.length
                )}
              >
                {t("length")}
              </p>
              <span className={styles.asterisk}>*</span>
            </div>
            <CustomInputBase
              id="pmweb_MDM_LengthInput"
              tabIndex={isOpen ? 0 : -1}
              disabled={typeValue !== "0"}
              variant="outlined"
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.inputBase
                  : styles.inputBase
              }
              value={length}
              type="number"
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
        </div>
        <div className={styles.flexRow}>
          <div className={styles.flexRow}>
            <Checkbox
              disabled={isReadOnly}
              id="pmweb_MDM_QuotesCheckbox"
              tabIndex={isOpen ? 0 : -1}
              readOnly={typeValue !== "0"}
              size="small"
              checked={quoteFlag === "Y"}
              onChange={() =>
                setQuoteFlag((prevState) => {
                  let temp = "Y";
                  if (temp === prevState) {
                    temp = "N";
                  }
                  return temp;
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setQuoteFlag((prevState) => {
                    let temp = "Y";
                    if (temp === prevState) {
                      temp = "N";
                    }
                    return temp;
                  });
                  e.stopPropagation();
                }
              }}
            />
            <p
              className={styles.quotesText}
              style={{
                textAlign: direction === RTL_DIRECTION && "right",
              }}
            >
              {t("quotes")}
            </p>
          </div>
          {typeValue !== "0" && (
            <div className={styles.flexRow}>
              <Checkbox
                disabled={isReadOnly}
                id="pmweb_MDM_ExportAllDocumentsCheckbox"
                tabIndex={isOpen ? 0 : -1}
                readOnly={typeValue !== "0"}
                size="small"
                checked={exportAllDocsFlag === "Y"}
                onChange={() =>
                  setExportAllDocsFlag((prevState) => {
                    let temp = "Y";
                    if (temp === prevState) {
                      temp = "N";
                    }
                    return temp;
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setExportAllDocsFlag((prevState) => {
                      let temp = "Y";
                      if (temp === prevState) {
                        temp = "N";
                      }
                      return temp;
                    });
                    e.stopPropagation();
                  }
                }}
              />
              <p className={styles.exportAllDocText}>
                {t("exportAllDocuments")}
              </p>
            </div>
          )}
        </div>
        <div className={styles.flexColumn}>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.mappedField
                : styles.mappedField
            }
          >
            {t("alignment")}
          </p>
          <div className={styles.flexRow}>
            <Radio
              id="pmweb_MDM_LeftAlignmentCheckbox"
              checked={alignment === "L"}
              tabIndex={isOpen ? 0 : -1}
              value={"L"}
              size="small"
              disabled={isReadOnly || typeValue !== "0"}
              onChange={(event) => setAlignment(event.target.value)}
            />
            <p className={styles.text}>{t("left")}</p>
            <Radio
              id="pmweb_MDM_RightAlignmentCheckbox"
              checked={alignment === "R"}
              tabIndex={isOpen ? 0 : -1}
              value={"R"}
              size="small"
              disabled={isReadOnly || typeValue !== "0"}
              onChange={(event) => setAlignment(event.target.value)}
            />
            <p className={styles.text}>{t("right")}</p>
          </div>
        </div>
      </div>
      {!isReadOnly ? (
        <div className={styles.buttonsDiv}>
          <button
            id="pmweb_MDM_CancelChangesBtn"
            tabIndex={isOpen ? 0 : -1}
            onClick={cancelChanges}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.cancelButton
                : styles.cancelButton
            }
          >
            <span className={styles.cancelButtonText}>{t("cancel")}</span>
          </button>
          <button
            id="pmweb_MDM_SaveChangesBtn"
            tabIndex={isOpen ? 0 : -1}
            disabled={length === ""}
            onClick={handleSaveChanges}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.okButton
                : styles.okButton
            }
          >
            <span className={styles.okButtonText}>{t("save")}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default MappingDataModal;
