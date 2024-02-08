// Changes made to fix 113436 => Project Property: Project level property should be available even if the no process is created in the project like Properties, settings, requirements, audit trail
// Changes made to solve bug with ID Bug 112353 - After Process importing the changes of imported process are reflecting only after the reopening of the process
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly
import React from "react";
import "../Projects/projects.css";
import ProcessesHeader from "../Processes/ProcessesHeader/ProcessesHeader";
import MainTab from "../Processes/ProcessesListByProject/ProcessListByProjectMainTab";
import ProcessListByType_search_Filter from "./ProcessesListByType/ProcessListByType_search&Filter";
import NoProcessListScreen from "../Processes/NoProjectsOrProcesses/NoProcessScreen";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { CircularProgress } from "@material-ui/core";

function Processes(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let processListToRender;
  let processListPerProjectToRender;
  let processListLength = [
    props.allProcessesPerProject?.length,
    props.allProcessesPerProject?.filter((process) => {
      return process.ProcessType == "L";
    })?.length,
    props.allProcessesPerProject?.filter((process) => {
      return process.ProcessType == "R" && process.ProcessState == "Disabled";
    })?.length,
    props.allProcessesPerProject?.filter((process) => {
      return process.ProcessType == "RP";
    })?.length,
    /*     props.allProcessesPerProject?.filter((process) => {
      return process.ProcessType == "E";
    }).length, */
    props.allProcessesPerProject?.filter((process) => {
      return process.ProcessType == "R" && process.ProcessState == "Enabled";
    })?.length, //code updated on 28 September 2022 for BugId 112936
    props.allProcessesPerProject?.filter((process) => {
      return process.ProcessType == "EP";
    }).length,
  ];

  if (
    props.clickedProcessTileAtHome &&
    props.clickedProcessTileAtHome.title == 0
  ) {
    processListToRender = (
      <NoProcessListScreen selectedProcessCode={props.selectedProcessCode} />
    );
  } else {
    processListToRender = (
      <ProcessListByType_search_Filter
        selectedProcessCount={props.selectedProcessCount}
        processTypeList={props.processTypeList}
        selectedProcessCode={props.selectedProcessCode}
        selectedProcessTile={props.selectedProcessTile}
        processList={props.allProcessesPerProject}
        pinnedDataList={props.pinnedDataList}
        draftProcess={props.draftProcess}
        deployedProcess={props.deployedProcess}
        enableProcess={props.enableProcess}
        tabValue={props.tabValue}
      />
    );
  }

  processListPerProjectToRender = (
    <>
      {props.spinnerProcess ? (
        <CircularProgress style={{ marginTop: "40vh", marginLeft: "50%" }} />
      ) : (
        <MainTab
          tabValue={props.tabValue}
          pinnedProcessesPerProject={props.pinnedProcessesPerProject}
          allProcessesPerProject={props.allProcessesPerProject}
          processListLength={processListLength}
          selectedProjectId={props.selectedProjectId}
          selectedProject={props.selectedProject}
          selectedProcessCode={props.selectedProcessCode}
          selectedProjectRights={props?.selectedProjectRights}
        />
      )}
    </>
  );

  return (
    <div
      className={direction === RTL_DIRECTION ? "processes_rtl" : "processes"}
    >
      <ProcessesHeader
        projectType={props.projectType}
        projectList={props.projectList}
        setProjectList={props.setProjectList}
        selectedProjectId={props.selectedProjectId}
        selectedProjectDesc={props.selectedProjectDesc}
        selectedProcessCode={props.selectedProcessCode}
        selectedProject={props.selectedProject}
        allProcessesPerProject={props.allProcessesPerProject}
        selectedProcessTile={props.selectedProcessTile}
        selectedProcessCount={props.selectedProcessCount}
        tabValue={props.tabValue}
        selectedProjectRights={props?.selectedProjectRights}
        projectAfterImport={props?.projectAfterImport} //Modified on 11/10/2023, bug_id:126848
      />
      {props.selectedProject
        ? processListPerProjectToRender
        : processListToRender}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    selectedTabAtNavPanel: state.selectedTabAtNavReducer.selectedTab,
    defaultProcessTileIndex:
      state.defaultProcessTileReducer.defaultProcessTileIndex,
    clickedProcessTileAtHome:
      state.clickedProcessTileReducer.selectedProcessTile,
  };
};
export default connect(mapStateToProps, null)(Processes);
