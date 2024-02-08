import React, { useState, useEffect } from "react";
import styles from "../../../Properties/PropetiesTab/Templates/MappingModal/index.module.css";
import arabicStyles from "../../../Properties/PropetiesTab/Templates/MappingModal/arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import "../../../Properties/PropetiesTab/Templates/MappingModal/index.css";
import CloseIcon from "@material-ui/icons/Close";
import {
  ENDPOINT_GET_VARIABLE_RULES,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import Rules from "../../../ViewingArea/Tools/Rules/Rules";
import axios from "axios";
import { store, useGlobalState } from "state-pool";
import { CircularProgress, IconButton, useMediaQuery } from "@material-ui/core";

function VariableRuleModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { closeFunc, isReadOnly, processType, variableArr, variableId } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [variableRules, setVariableRules] = useState([]);
  const [loader, setLoader] = useState(true);
  const smallScreen = useMediaQuery("(max-width: 1199px)");

  useEffect(() => {
    axios
      .get(
        SERVER_URL +
          ENDPOINT_GET_VARIABLE_RULES +
          `/${localLoadedProcessData?.ProcessDefId}/${variableId}/${localLoadedProcessData?.ProcessName}/${localLoadedProcessData?.ProcessType}`
      )
      .then((res) => {
        if (res.data.Status === 0) {
          let tempVarRuleList = res?.data?.VariableRules?.Rules
            ? [...res?.data?.VariableRules?.Rules]
            : [];
          setVariableRules(tempVarRuleList);
          setLoader(false);
        }
      });
  }, [variableId]);

  const handleKeyDown = (e) => {
    if (
      (e.keyCode === 13 &&
        (e.target.name === "CloseBtn" || e.target.localName === "body")) ||
      e.keyCode === 27
    ) {
      props.closeFunc(e);
      e.stopPropagation();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
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
          {t("rules")}
        </h3>
        <IconButton
          onClick={closeFunc}
          id="pmweb_primaryVar_varRuleModal_Close"
          aria-label="Close"
        >
          <CloseIcon
            className={styles.closeIcon}
            style={{ width: "1.5rem !important", height: "1.5rem !important" }}
          />
        </IconButton>
      </div>
      <div
        className={styles.modalSubHeader}
        // code added smallscreen changes in height on 27-10-2023 for bug 138226
        style={{
          position: "relative",
          padding: "0",
          height: smallScreen ? "45vh" : "66vh",
        }}
        // till here for bug 138226
      >
        {loader ? (
          <CircularProgress style={{ marginTop: "30vh", marginLeft: "50%" }} />
        ) : (
          <Rules
            ruleDataType={variableArr}
            interfaceRules={variableRules}
            setInterfaceRules={setVariableRules}
            ruleType="I"
            calledFrom="variable"
            ruleDataTableStatement={t("variableRemoveRecords")}
            addRuleDataTableStatement={t("variableAddRecords")}
            ruleDataTableHeading={t("variableList")}
            addRuleDataTableHeading={t("availableVariable")}
            bShowRuleData={true}
            hideGroup={true}
            listName={t("variableList")}
            availableList={t("availableVariable")}
            openProcessType={processType}
            isReadOnly={isReadOnly}
          />
        )}
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.modalFooter
            : styles.modalFooter
        }
      >
        <button
          className={styles.cancelButton}
          onClick={closeFunc}
          id="pmweb_primaryVar_varRuleModal_Close"
          name="CloseBtn"
        >
          {t("Close")}
        </button>
      </div>
    </div>
  );
}

export default VariableRuleModal;
