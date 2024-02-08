// #BugID - 124660
// #BugDescription - handled to show timOut fields

import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { Tab, Tabs } from "@material-ui/core";
import { TabPanel } from "../../../../ProcessSettings";
import Toast from "../../../../../UI/ErrorToast";
import "./index.css";
import ForwardTemplateMapping from "./ForwardTemplateMapping";
import DocumentTemplateMapping from "./DocumentTemplateMapping";
import CloseIcon from "@material-ui/icons/Close";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";

function MappingModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { schemaList, template, cancelFunc, okFunc, isReadOnly } = props;
  const [value, setValue] = useState(0);
  const [timeout, setTimeout] = useState(template?.Timeout);
  const [updatedTemplate, setUpdatedTemplate] = useState(null);
  const [commonError, setCommonError] = useState(null);
  const [checked, setChecked] = useState({});
  const [isValidMap, setIsValidMap] = useState(true);

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
   
    setUpdatedTemplate(template);
    if (template.Timeout !== null || template.Timeout !== undefined) {
      setTimeout(template.Timeout);
    }
  }, [template]);

  const saveMappingCalled = () => {
    let isValidObj = validateFunction();
    if (isValidObj.isValid) {
      okFunc(updatedTemplate);
      cancelFunc();
    } else {
      setCommonError({
        label: isValidObj.error,
        errorType: "error",
      });
    }
  };

  const validateFunction = () => {
    if (timeout === null || timeout === undefined) {
      return {
        isValid: false,
        error: t("timeoutError"),
      };
    } else {
     
      if (
        !updatedTemplate.FwdVarMapping ||
        updatedTemplate.FwdVarMapping?.length === 0
      ) {
        return {
          isValid: false,
          error: t("PleaseDefineAtleastOneForwardMapping"),
        };
      } else {

        //Modified on 25/10/2023, bug_id:135746
        if (!isValidMap) {
          return {
            isValid: false,
            error: `${t("allMapforAllVar")}`,
          };
        } else {
          let isMandatoryCheck = true;
          let mandatoryField = null;
          updatedTemplate.FwdVarMapping.forEach((el) => {
            if (
              +el.minOccurs > 0 &&
              (!el.mappedName || el.mappedName?.trim() === "") &&
              isMandatoryCheck
            ) {
              isMandatoryCheck = false;
              mandatoryField = el.templateVarName;
            }
          });
          if (!isMandatoryCheck) {
            return {
              isValid: false,
              error: `${t("PleaseDefineMappingFor")} ${mandatoryField}`,
            };
          } else {
            let isChecked = false;
            let minMapping = false;
            updatedTemplate.FwdVarMapping.forEach((el) => {
              if (
                checked[el.templateVarName]?.isChecked &&
                el.mappedName?.trim() === "" &&
                !isChecked
              ) {
                isChecked = true;
                mandatoryField = el.templateVarName;
              }
            });
            if (isChecked) {
              return {
                isValid: false,
                error: `${t("PleaseDefineMappingFor")} ${mandatoryField}`,
              };
            } else {
              updatedTemplate.FwdVarMapping.forEach((el) => {
                if (el.mappedName?.trim() !== "") {
                  minMapping = true;
                }
              });
              if (!minMapping || Object.keys(checked).length === 0) {
                return {
                  isValid: false,
                  error: t("PleaseDefineAtleastOneForwardMapping"),
                };
              } else {
                return {
                  isValid: true,
                  error: null,
                };
              }
            }
          }
        }
        //till here for  bug_id:135746

      /*   let isMandatoryCheck = true;
          let mandatoryField = null;
          updatedTemplate.FwdVarMapping.forEach((el) => {
            if (
              +el.minOccurs > 0 &&
              (!el.mappedName || el.mappedName?.trim() === "") &&
              isMandatoryCheck
            ) {
              isMandatoryCheck = false;
              mandatoryField = el.templateVarName;
            }
          });
          if (!isMandatoryCheck) {
            return {
              isValid: false,
              error: `${t("PleaseDefineMappingFor")} ${mandatoryField}`,
            };
          } else {
            let isChecked = false;
            let minMapping = false;
            updatedTemplate.FwdVarMapping.forEach((el) => {
              if (
                checked[el.templateVarName]?.isChecked &&
                el.mappedName?.trim() === "" &&
                !isChecked
              ) {
                isChecked = true;
                mandatoryField = el.templateVarName;
              }
            });
            if (isChecked) {
              return {
                isValid: false,
                error: `${t("PleaseDefineMappingFor")} ${mandatoryField}`,
              };
            } else {
              updatedTemplate.FwdVarMapping.forEach((el) => {
                if (el.mappedName?.trim() !== "") {
                  minMapping = true;
                }
              });
              if (!minMapping || Object.keys(checked).length === 0) {
                return {
                  isValid: false,
                  error: t("PleaseDefineAtleastOneForwardMapping"),
                };
              } else {
                return {
                  isValid: true,
                  error: null,
                };
              }
            }
          } */
      }
    }
  };

  return (
    <div>
      <div className={styles.modalHeader}>
        <h3
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalHeading
              : styles.modalHeading
          }
        >
          {t("Define") + " " + t("mapping")}
        </h3>
        <CloseIcon
          onClick={cancelFunc}
          className={styles.closeIcon}
          id="pmweb_oms_mapping_cancel"
          tabIndex={0}
          onKeyUp={props.onKeyUp}
        />
      </div>
      <div className={styles.modalSubHeader}>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.invocationDiv
              : styles.invocationDiv
          }
        >
          <span className={styles.modalLabel}>{t("InvocationType")}</span>
          <input
            aria-label="InvocationType"
            value={t("Synchronous")}
            className={styles.modalInput}
            disabled={true}
          />
        </div>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalDiv
              : styles.modalDiv
          }
        >
          <span className={styles.modalLabel}>
            {t("Timeout")} <span className={styles.starIcon}>*</span>
          </span>
          <input
            aria-label="Timeout"
            type="number"
            min="0"
            max="100"
            value={timeout}
            onChange={(e) => {
              setTimeout(e.target.value);
              setUpdatedTemplate((prev) => {
                let temp = { ...prev };
                prev.Timeout = e.target.value;
                temp.Timeout = e.target.value;
                return temp;
              });
            }}
            id="pmweb_oms_mapping_timeout"
            className={styles.modalInput}
            disabled={isReadOnly}
          />
          <span className={styles.labelIntervals}>{t("seconds")}</span>
        </div>
      </div>
      <Tabs
        value={value}
        onChange={handleChange}
        className={`${styles.tabs} oms_templateTabs`}
        id="pmweb_oms_mapping_tabs"
      >
        <Tab
          className={styles.dataModelTab}
          label={t("forwardMapping")}
          tabIndex={0}
        />
        <Tab
          className={styles.dataModelTab}
          label={t("document") + " " + t("mapping")}
          tabIndex={0}
        />
      </Tabs>
      <div>
        <TabPanel className="oms_templateTabPanel" value={value} index={0}>
          <ForwardTemplateMapping
            schemaList={schemaList}
            template={template}
            setUpdatedTemplate={setUpdatedTemplate}
            checked={checked}
            setChecked={setChecked}
            isReadOnly={isReadOnly}
            setIsValidMap={setIsValidMap} //Added on 25/10/2023, bug_id:135746
          />
        </TabPanel>
        <TabPanel className="oms_templateTabPanel" value={value} index={1}>
          <DocumentTemplateMapping
            template={template}
            setUpdatedTemplate={setUpdatedTemplate}
            isReadOnly={isReadOnly}
          />
        </TabPanel>
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.modalFooter
            : styles.modalFooter
        }
      >
        <button
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.cancelButton
              : styles.cancelButton
          }
          onClick={cancelFunc}
          disabled={isReadOnly}
          id="pmweb_oms_mapping_cancelbutton"
        >
          {t("cancel")}
        </button>
        <button
          className={styles.okButton}
          onClick={saveMappingCalled}
          disabled={isReadOnly}
          id="pmweb_oms_mapping_saveMappingButton"
        >
          {t("ok")}
        </button>
      </div>
      {commonError !== null ? (
        <Toast
          open={commonError !== null}
          closeToast={() => setCommonError(null)}
          message={commonError.label}
          severity={commonError.errorType}
        />
      ) : null}
    </div>
  );
}

export default MappingModal;
