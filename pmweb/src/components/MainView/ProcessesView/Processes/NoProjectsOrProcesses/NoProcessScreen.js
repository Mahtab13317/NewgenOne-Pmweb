import React from "react";
import "./noProcessOrProjects.css";
import { useTranslation } from "react-i18next";
import emptyStatePic from "../../../../../assets/ProcessView/EmptyState.svg";
import { tileProcess } from "../../../../../utility/HomeProcessView/tileProcess.js";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";

function NoProjectScreen(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  return (
    <div className="noProjectsScreen" style={{ marginTop: "130px" }}>
      <img
        src={emptyStatePic}
        style={{ transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null }}
        alt={t("emptyState")}
      />
      <h2 className="noProjectsScreenHeading">
        {t("processList.No")} {tileProcess(props.selectedProcessCode)[1]}{" "}
        {t("processList.processesAreAvailable")}
      </h2>
      <p className="noProjectScreenPTag">
        {t("processList.youDontHaveAny")}{" "}
        {tileProcess(props.selectedProcessCode)[1]}{" "}
        {t("processList.noProcessCreatedOrShared")}{" "}
        <span className="noProjectScreenSpan">
          {t("processList.createAnewProcessToViewInProcesses")}{" "}
          {props.processType} {t("processList.processes")}.
        </span>
      </p>
    </div>
  );
}

export default NoProjectScreen;
