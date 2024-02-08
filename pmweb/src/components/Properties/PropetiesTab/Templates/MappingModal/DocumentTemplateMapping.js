// #BugID - 123281
// #BugDescription - handled to save the reverse DocName
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import "./index.css";
import "../index.css";
import { MenuItem, Select } from "@material-ui/core";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";
import { useSelector } from "react-redux";
import { OpenProcessSliceValue } from "../../../../../redux-store/slices/OpenProcessSlice";

function DocumentTemplateMapping(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let { template, setUpdatedTemplate, isReadOnly } = props;
  const openProcessData = useSelector(OpenProcessSliceValue);
  const [document, setDocument] = useState(null);
  const [docListOptions, setDocListOptions] = useState([]);

  useEffect(() => {
    if (template.DocType) {
      setDocument(template.DocType);
    }
  }, [template]);

  useEffect(() => {
    let temp = JSON.parse(JSON.stringify(openProcessData.loadedData));
    setDocListOptions(temp?.DocumentTypeList);
  }, [openProcessData.loadedData]);

  return (
    <div className={styles.mainDiv}>
      <div className={styles.headerDiv}>
        <p
          className={
            direction === RTL_DIRECTION ? arabicStyles.iconDiv : styles.iconDiv
          }
        ></p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.variableName
              : styles.variableName
          }
        >
          {t("Template") + " " + t("name")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.dataType
              : styles.dataType
          }
        >
          {t("CurrentProcessDocument(s)")}
        </p>
      </div>
      <div className={styles.bodyDiv}>
        <div className={styles.dataDiv}>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.iconDiv
                : styles.iconDiv
            }
          ></p>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.variableNameData
                : styles.variableNameData
            }
          >
            {template.ProductName}
          </p>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.dataTypeValue
                : styles.dataTypeValue
            }
          >
            <label htmlFor={`Current_Process_Document_dropdown`} style={{display:"none"}}>Current_Process_Document_dropdown</label>
            <Select
              className={
                direction === RTL_DIRECTION
                  ? `templatePropSelect ${arabicStyles.templatePropSelect}`
                  : `templatePropSelect ${styles.templatePropSelect}`
              }
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
              inputProps={{
                readOnly: isReadOnly,
                id:"Current_Process_Document_dropdown",
                "aria-label":"Current_Process_Document_dropdown"
              }}
              value={document}
              id="pmweb_oms_document_select"
              onChange={(e) => {
                setDocument(e.target.value);
                setUpdatedTemplate((prev) => {
                  let temp = { ...prev };
                  prev.DocType = e.target.value;

                  temp.DocType = e.target.value;

                  return temp;
                });
              }}
            >
              {docListOptions?.length > 0 ? (
                docListOptions.map((ele) => {
                  return (
                    <MenuItem
                      value={ele.DocName}
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.templateDropdownData
                          : styles.templateDropdownData
                      }
                    >
                      {ele.DocName}
                    </MenuItem>
                  );
                })
              ) : (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.templateDropdownData
                      : styles.templateDropdownData
                  }
                >
                  {t("noRecords")}
                </div>
              )}
            </Select>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DocumentTemplateMapping;
