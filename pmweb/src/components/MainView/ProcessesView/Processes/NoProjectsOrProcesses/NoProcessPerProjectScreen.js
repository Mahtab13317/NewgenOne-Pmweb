// Changes made to fix 113436 => Project Property: Project level property should be available even if the no process is created in the project like Properties, settings, requirements, audit trail
/*code updated on 13 Dec 2022 for BugId 112906*/
import React from "react";
//import emptyStatePic from "../../../../../assets/ProcessView/EmptyState.svg";
import emptyStatePic from "../../../../../assets/ProcessView/NoDataExist.svg";
import "./noProcessOrProjects.css";
import { useTranslation } from "react-i18next";
import {
  APP_HEADER_HEIGHT,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";
import { useSelector } from "react-redux";

function NoProcessPerProjectScreen(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  return (
    <div
      className="noProjectsScreen"
      style={{
        //  height: "75vh",
        height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`,
        marginTop: "15px",
        background: "#fff",
      }}
    >
      <img
        alt={t("processList.noProcessesCreated")}
        src={emptyStatePic}
        style={{
          marginTop: "75px",
          transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
        }}
      />
      <p className="noProjectsScreenPTag" style={{ fontWeight: "600" }}>
        {t("processList.noProcessesCreated")}
      </p>
      {/* <h2>{t("processList.noProcessesAreAvailable")}</h2>
      <p>
        {t("processList.noProcessesInSelectedProject")}
        <span>
          {t("processList.createNewProcess")} {props.selectedProjectName}{" "}
          {t("processList.toGetStarted")}
        </span>
      </p> */}
    </div>
  );
}

export default NoProcessPerProjectScreen;
