import React from "react";
import "./ProcessesView.css";
import Home from "../Home/Home";
import Settings from "./Settings/Settings";
import Template from "../Templates/Template";
import ProjectsAndProcesses from "./ProjectsAndProcesses";
import { useTranslation } from "react-i18next";
import AuditLogs from "../AuditLogs/AuditLogs";

const ProcessesView = (props) => {
  let { t } = useTranslation();
  return (
    <div className="processesView" style={{ direction: `${t("HTML_DIR")}` }}>
      {props.selectedNavigation === "navigationPanel.processes" ? (
        <React.Fragment>
          <ProjectsAndProcesses />
        </React.Fragment>
      ) : null}
      {props.selectedNavigation === "navigationPanel.home" ? (
        <React.Fragment>
          <Home />
        </React.Fragment>
      ) : null}
      {props.selectedNavigation === "navigationPanel.templates" ? (
        <React.Fragment>
          <Template />
        </React.Fragment>
      ) : null}
      {props.selectedNavigation === "navigationPanel.settings" ? (
        <React.Fragment>
          <Settings />
        </React.Fragment>
      ) : null}
      {props.selectedNavigation === "navigationPanel.auditLog" ? (
        <React.Fragment>
          <AuditLogs />
        </React.Fragment>
      ) : null}
    </div>
  );
};

export default ProcessesView;
