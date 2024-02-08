import React from "react";
import "./index.css";
import CloseIcon from "@material-ui/icons/Close";
import { store, useGlobalState } from "state-pool";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";

function DeployProcess(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

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
          onClick={() => props.setShowDeployModal(false)}
          style={{
            height: "1.25rem",
            width: "1.25rem",
            cursor: "pointer",
          }}
          id="pmweb_deploySuccessModal_deployModalFalse"
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
          {/*Code modified on 13-09-2023 for bugId:136507 */}
          {t(localLoadedProcessData.ProcessName)}
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
            marginBottom: "2px",
            color: "#0D6F08",
            fontWeight: "600",
          }}
        >
          {t("deploySuccess")}
        </p>
        <p style={{ fontSize: "var(--base_text_font_size)", color: "#606060" }}>
          {
            //Added  on 11/08/2023, bug_id:134134
          }
          {/*Code modified on 13-09-2023 for bugId:136507 */}
          {t("deployProcessMsg")}
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
          onClick={() => props.setShowDeployModal(false)}
          id={
            direction == RTL_DIRECTION
              ? "pmweb_deploySuccessModal_deployButtonArabic"
              : "pmweb_deploySuccessModal_deployButton"
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

export default connect(mapStateToProps, null)(DeployProcess);
