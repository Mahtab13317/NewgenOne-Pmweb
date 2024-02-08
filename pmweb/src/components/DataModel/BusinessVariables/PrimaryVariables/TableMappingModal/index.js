import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { Divider, Stepper, Step, StepButton } from "@material-ui/core";
import TableDetailsStep from "./TableDetailsStep";
import TableMappingStep from "./TableMappingStep";
import TableRelationshipStep from "./TableRelationshipStep";
import {
  TABLE_STEP,
  MAPPING_STEP,
  RELATIONSHIP_STEP,
  RTL_DIRECTION,
  ENDPOINT_GET_COLUMN_LIST,
  SERVER_URL,
} from "../../../../../Constants/appConstants";

function TableMappingModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const steps = [t("tableDetails"), t("mapping"), t("relationship")];
  const {
    isDataModal,
    openProcessID,
    aliasName,
    handleClose,
    tableName,
    mappingDataField,
    relationAndMapping,
  } = props;
  const [activeStep, setActiveStep] = useState(0);
  const [childTableName, setChildTableName] = useState("");
  const [childVariableName, setChildVariableName] = useState("");
  const [columnData, setColumnData] = useState([]);
  const [tableDetailColumnData, setTableDetailColumnData] = useState([]);

  useEffect(() => {
    if (isDataModal) {
      const obj = {
        processDefID: openProcessID,
        tableName: tableName,
        allColumnsReq: "Y",
        regMode: "N",
      };
      axios.post(SERVER_URL + ENDPOINT_GET_COLUMN_LIST, obj).then((res) => {
        if (res.data.Status === 0) {
          setTableDetailColumnData(res.data.Columns);
        }
      });
    }
  }, []);

  // Function to handle step change when the user goes from one step to another.
  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  // Function that runs when the user goes to the previous step using the previous button.
  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Function that runs when the user goes to the next step using the next button.
  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.headingsDiv
            : styles.headingsDiv
        }
      >
        <p
          className={
            direction === RTL_DIRECTION ? arabicStyles.heading : styles.heading
          }
        >
          {t("tableCreationAndMapping")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.aliasNameHeading
              : styles.aliasNameHeading
          }
        >
          {aliasName}
        </p>
      </div>
      <Divider className={styles.divider} />
      <Stepper className={styles.steps} nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepButton
              id={`${"table_mapping_step_" + index}`}
              className={styles.stepButton}
              color="inherit"
              onClick={handleStep(index)}
            >
              <p className={styles.stepName}>{label}</p>
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <Divider className={styles.divider} />
      {activeStep === TABLE_STEP && (
        <div>
          <TableDetailsStep
            aliasName={aliasName}
            tableNameValue={tableName}
            setChildTableName={setChildTableName}
            setChildVariableName={setChildVariableName}
            setColumnData={setColumnData}
            tableDetailColumnData={tableDetailColumnData}
            relationAndMapping={relationAndMapping}
          />
        </div>
      )}
      {activeStep === MAPPING_STEP && (
        <div>
          <TableMappingStep
            childTableName={childTableName}
            aliasName={aliasName}
            columnData={columnData}
            mappingDataField={mappingDataField}
          />
        </div>
      )}
      {activeStep === RELATIONSHIP_STEP && (
        <div>
          <TableRelationshipStep
            childTableName={childTableName}
            relationAndMapping={relationAndMapping}
          />
        </div>
      )}

      <div className={styles.buttonsDiv}>
        <div>
          <button
            id="table_mapping_previous_step_button"
            disabled={activeStep === 0}
            onClick={handlePreviousStep}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.previousButton
                : styles.previousButton
            }
          >
            <span className={styles.previousButtonText}>{t("previous")}</span>
          </button>
          <button
            id="table_mapping_next_step_button"
            disabled={activeStep === 2}
            onClick={handleNextStep}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.nextButton
                : styles.nextButton
            }
          >
            <span className={styles.nextButtonText}>{t("next")}</span>
          </button>
        </div>
        <div>
          <button
            id="table_mapping_cancel_button"
            onClick={handleClose}
            className={styles.cancelButton}
          >
            <span className={styles.cancelButtonText}>{t("cancel")}</span>
          </button>
          <button
            id="table_mapping_done_button"
            onClick={handleClose}
            className={styles.okButton}
          >
            <span className={styles.okButtonText}>{t("done")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableMappingModal;
