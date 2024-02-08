import React from "react";
import "./index.css";
import CloseIcon from "@material-ui/icons/Close";
import { store, useGlobalState } from "state-pool";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";

function DeployProcess(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const closeThisAndShowValidationPopUp = () => {
    // Bug fixed for Bug Id  - 111391 (When Deployment fails the pop up shows "View Details" but nothing happens after clicking on it)
    props.setShowDeployFailModal(false);
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div
        style={{
          width: "100%",
          padding: "1rem 1vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: "var(--subtitle_text_font_size)",
            fontWeight: "600",
          }}
        >
          {t("deployProcess")}
        </p>
        <CloseIcon
          onClick={() => props.setShowDeployFailModal(false)}
          style={{
            height: "1.25rem",
            width: "1.25rem",
            cursor: "pointer",
          }}
          id="pmweb_deployFailedModal_failModal"
        />
      </div>
      <hr />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1vw",
        }}
      >
        <p
          style={{
            fontSize: "var(--base_text_font_size)",
            color: "#606060",
            marginBottom: "2px",
          }}
        >
          {t("ProcessName")}
        </p>
        <p
          style={{
            fontSize: "var(--base_text_font_size)",
            color: "#000000",
            fontWeight: "600",
          }}
        >
          {localLoadedProcessData.ProcessName}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0px 1vw 1.5rem",
        }}
      >
        <p
          style={{
            fontSize: "var(--base_text_font_size)",
            color: "red",
            marginBottom: "2px",
          }}
        >
          {t("deployFailed")}
        </p>
        <p style={{ fontSize: "var(--base_text_font_size)", color: "#606060" }}>
          {t("errorsAndWarningsPresent")}
          <span
            style={{
              color: "var(--link_color)",
              fontSize: "var(--base_text_font_size)",
              cursor: "pointer",
              marginLeft: "2vw",
              fontWeight: "600",
            }}
            onClick={() => closeThisAndShowValidationPopUp()}
            id="pmweb_deployFailedModal_warning"
          >
            {t("viewDetails")}
          </span>
        </p>
      </div>
      <div
        style={{
          width: "100%",
          backgroundColor: "#F5F5F5",
          position: "absolute",
          bottom: "0",
          display: "flex",
          alignItems: "center",
          flexDirection: "row-reverse",
        }}
      >
        <button
          style={{
            width: "54px",
            backgroundColor: "var(--button_color)",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => props.setShowDeployFailModal(false)}
          id={
            direction == RTL_DIRECTION
              ? "pmweb_deployModalFailed_deployFailButtonArabic"
              : "pmweb_deployModalFailed_deployFailButton"
          }
        >
          {t("ok")}
        </button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    templateId: state.openTemplateReducer.templateId,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps)(DeployProcess);
