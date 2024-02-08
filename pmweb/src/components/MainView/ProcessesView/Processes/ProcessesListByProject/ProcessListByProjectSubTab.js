// Changes made to fix 113436 => Project Property: Project level property should be available even if the no process is created in the project like Properties, settings, requirements, audit trail
// Changes made to solve Bug 115456 -> Process Search: Searching not working for Processes listed under the projects
import React, { useState } from "react";
import Tab from "../../../../../UI/Tab/Tab";
import { useTranslation } from "react-i18next";
import SearchBox from "../../../../../UI/Search Component/index";
import "../../Projects/projects.css";
import ProcessListByProjectTable from "./ProcessesListByProjectTable";
import DeployedIcon from "../../../../../assets/HomePage/HS_Deployed.svg";
import EnabledIcon from "../../../../../assets/HomePage/HS_Enabled.svg";
import FilterImage from "../../../../../assets/ProcessView/PT_Sorting.svg";
import NoprocessesPerproject from "../NoProjectsOrProcesses/NoProcessPerProjectScreen.js";
import SortingModal from "./sortByModal.js";
import Modal from "../../../../../UI/Modal/Modal";
import {
  APP_HEADER_HEIGHT,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";
import { useMediaQuery } from "@material-ui/core";
import { useSelector } from "react-redux";

function ProcessListByProjectSubTab(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [pinToTopPerProjectcheck, setPinnedCheck] = useState(true);
  const [selectionOne, setSelectionOne] = useState(2);
  const [selectionTwo, setSelectionTwo] = useState(0);
  let [searchTerm, setSearchTerm] = useState("");
  const [showSortingModal, setShowSortingModal] = useState(false);
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  //code changes for 131937
  const matchesTab = useMediaQuery("(max-width:1000px)");
  const matchesLaptop = useMediaQuery("(max-width:1370px)");
  const matchesDesktop = useMediaQuery("(min-width:1371px)");

  const getMaxHeightForProcessTable = () => {
    if (matchesDesktop) {
      return "90%";
    } else if (matchesLaptop) {
      return "72%";
    } else if (matchesTab) {
      return "52%";
    }
  };

  const subTabLabels =
    props.tabValue === 0
      ? []
      : [
          <p
            className="flex"
            style={{ alignItems: "center", padding: "0 0.5vw 0 0.25vw" }}
          >
            <span>
              {`${t("processList.All")} (${props.processListLength[0]})`}
            </span>
          </p>,
          // <p className="flex" style={{ alignItems: "center" }}>
          //   <img src={DraftIcon} className="processDotsOnTab" />
          //   <span>
          //     {`${t("processList.Drafts")} (${props.processListLength[1]})`}
          //   </span>
          // </p>,
          <p
            className="flex"
            style={{ alignItems: "center", padding: "0 0.5vw 0 0.25vw" }}
          >
            <img
              src={DeployedIcon}
              className="processDotsOnTab"
              alt={t("processList.Deployed")}
            />
            <span>
              {`${t("processList.Deployed")} (${props.processListLength[2]})`}
            </span>
          </p>,
          // <p className="flex" style={{ alignItems: "center" }}>
          //   <img className="processDotsOnTab" src={DeployedPending} />
          //   <span>{t("processList.Deployed")}</span>
          // </p>,
          <p
            className="flex"
            style={{ alignItems: "center", padding: "0 0.5vw 0 0.25vw" }}
          >
            <img
              className="processDotsOnTab"
              src={EnabledIcon}
              alt={t("processList.Enabled")}
            />
            <span>
              {`${t("processList.Enabled")} (${props.processListLength[4]})`}
            </span>
          </p>,
          // <p className="flex" style={{ alignItems: "center" }}>
          //   <img className="processDotsOnTab" src={EnabledPending} />
          //   <span>{t("processList.Enabled")}</span>
          // </p>,
        ];

  const subTabElements = [
    pinToTopPerProjectcheck && props.pinnedProcessesPerProject.length > 0 ? (
      <div className="subTabContentToScroll">
        <p className="tableHeading">{t("processList.pinnedProcesses")}</p>
        <ProcessListByProjectTable
          tabValue={props.tabValue}
          selectedProjectId={props.selectedProjectId}
          searchTerm={searchTerm}
          selectionOne={selectionOne}
          selectionTwo={selectionTwo}
          margin="0 0 15px 0"
          showTableHead={true}
          processesPerProject={props.pinnedProcessesPerProject}
        />
        <p className="tableHeading">{t("processList.otherProcesses")}</p>
        <ProcessListByProjectTable
          tabValue={props.tabValue}
          selectedProjectId={props.selectedProjectId}
          selectionOne={selectionOne}
          selectionTwo={selectionTwo}
          showTableHead={false}
          searchTerm={searchTerm}
          processesPerProject={props.allProcessesPerProject}
        />
      </div>
    ) : (
      <ProcessListByProjectTable
        tabValue={props.tabValue}
        selectedProjectId={props.selectedProjectId}
        selectionOne={selectionOne}
        selectionTwo={selectionTwo}
        //code changes for 131937
        maxHeightofTable={getMaxHeightForProcessTable()}
        searchTerm={searchTerm}
        showTableHead={true}
        processesPerProject={props.allProcessesPerProject}
      />
    ),
    // pinToTopPerProjectcheck && props.pinnedProcessesPerProject.length > 0 ? (
    //   <div className="subTabContentToScroll">
    //     <p className="tableHeading">{t("processList.pinnedProcesses")}</p>
    //     <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //       selectionOne={selectionOne}
    //       selectionTwo={selectionTwo}
    //       margin="0 0 15px 0"
    //       showTableHead={true}
    //       searchTerm={searchTerm}
    //       processesPerProject={props.pinnedProcessesPerProject?.filter(
    //         (process) => {
    //           return process.ProcessType == "L";
    //         }
    //       )}
    //     />
    //     <p className="tableHeading">{t("processList.otherProcesses")}</p>
    //     <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //       selectionOne={selectionOne}
    //       selectionTwo={selectionTwo}
    //       showTableHead={false}
    //       searchTerm={searchTerm}
    //       processesPerProject={props.allProcessesPerProject?.filter(
    //         (process) => {
    //           return process.ProcessType == "L";
    //         }
    //       )}
    //     />
    //   </div>
    // ) : (
    //   <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //     selectionOne={selectionOne}
    //     selectionTwo={selectionTwo}
    //     maxHeightofTable="380px"
    //     showTableHead={true}
    //     searchTerm={searchTerm}
    //     processesPerProject={props.allProcessesPerProject?.filter((process) => {
    //       return process.ProcessType == "L";
    //     })}
    //   />
    // ),
    pinToTopPerProjectcheck && props.pinnedProcessesPerProject.length > 0 ? (
      <div className="subTabContentToScroll">
        <p className="tableHeading">{t("processList.pinnedProcesses")}</p>
        <ProcessListByProjectTable
          tabValue={props.tabValue}
          selectedProjectId={props.selectedProjectId}
          selectionOne={selectionOne}
          selectionTwo={selectionTwo}
          margin="0 0 15px 0"
          showTableHead={true}
          searchTerm={searchTerm}
          processesPerProject={props.pinnedProcessesPerProject?.filter(
            (process) => {
              return process.ProcessType == "R";
            }
          )}
        />
        <p className="tableHeading">{t("processList.otherProcesses")}</p>
        <ProcessListByProjectTable
          tabValue={props.tabValue}
          selectedProjectId={props.selectedProjectId}
          selectionOne={selectionOne}
          selectionTwo={selectionTwo}
          showTableHead={false}
          searchTerm={searchTerm}
          processesPerProject={props.allProcessesPerProject?.filter(
            (process) => {
              return process.ProcessType == "R";
            }
          )}
        />
      </div>
    ) : (
      <ProcessListByProjectTable
        tabValue={props.tabValue}
        selectedProjectId={props.selectedProjectId}
        selectionOne={selectionOne}
        selectionTwo={selectionTwo}
        // modified on 09/10/23 for BugId 139102
        // maxHeightofTable="60vh"
        maxHeightofTable={getMaxHeightForProcessTable()}
        showTableHead={true}
        searchTerm={searchTerm}
        processesPerProject={props.allProcessesPerProject?.filter((process) => {
          return (
            process.ProcessType == "R" && process.ProcessState == "Disabled"
          );
        })}
      />
    ),
    // pinToTopPerProjectcheck && props.pinnedProcessesPerProject.length > 0 ? (
    //   <div className="subTabContentToScroll">
    //     <p className="tableHeading">{t("processList.pinnedProcesses")}</p>
    //     <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //       selectionOne={selectionOne}
    //       selectionTwo={selectionTwo}
    //       margin="0 0 15px 0"
    //       showTableHead={true}
    //       searchTerm={searchTerm}
    //       processesPerProject={props.pinnedProcessesPerProject?.filter(
    //         (process) => {
    //           return process.ProcessType == "RP";
    //         }
    //       )}
    //     />
    //     <p className="tableHeading">{t("processList.otherProcesses")}</p>
    //     <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //       selectionOne={selectionOne}
    //       selectionTwo={selectionTwo}
    //       showTableHead={false}
    //       searchTerm={searchTerm}
    //       processesPerProject={props.allProcessesPerProject?.filter(
    //         (process) => {
    //           return process.ProcessType == "RP";
    //         }
    //       )}
    //     />
    //   </div>
    // ) : (
    //   <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //     selectionOne={selectionOne}
    //     selectionTwo={selectionTwo}
    //     maxHeightofTable="380px"
    //     showTableHead={true}
    //     searchTerm={searchTerm}
    //     processesPerProject={props.allProcessesPerProject?.filter((process) => {
    //       return process.ProcessType == "RP";
    //     })}
    //   />
    // ),
    pinToTopPerProjectcheck && props.pinnedProcessesPerProject.length > 0 ? (
      <div className="subTabContentToScroll">
        <p className="tableHeading">{t("processList.pinnedProcesses")}</p>
        <ProcessListByProjectTable
          tabValue={props.tabValue}
          selectedProjectId={props.selectedProjectId}
          selectionOne={selectionOne}
          selectionTwo={selectionTwo}
          margin="0 0 15px 0"
          searchTerm={searchTerm}
          showTableHead={true}
          processesPerProject={props.pinnedProcessesPerProject?.filter(
            (process) => {
              return process.ProcessType == "E";
            }
          )}
        />
        <p className="tableHeading">{t("processList.otherProcesses")}</p>
        <ProcessListByProjectTable
          tabValue={props.tabValue}
          selectedProjectId={props.selectedProjectId}
          selectionOne={selectionOne}
          selectionTwo={selectionTwo}
          showTableHead={false}
          searchTerm={searchTerm}
          processesPerProject={props.allProcessesPerProject?.filter(
            (process) => {
              return process.ProcessType == "E";
            }
          )}
        />
      </div>
    ) : (
      <ProcessListByProjectTable
        tabValue={props.tabValue}
        selectedProjectId={props.selectedProjectId}
        selectionOne={selectionOne}
        selectionTwo={selectionTwo}
        // modified on 09/10/23 for BugId 139102
        // maxHeightofTable="60vh"
        maxHeightofTable={getMaxHeightForProcessTable()}
        showTableHead={true}
        searchTerm={searchTerm}
        processesPerProject={props.allProcessesPerProject?.filter((process) => {
          return (
            process.ProcessType == "R" && process.ProcessState == "Enabled"
          );
        })}
      />
    ),
    // pinToTopPerProjectcheck && props.pinnedProcessesPerProject.length > 0 ? (
    //   <div className="subTabContentToScroll">
    //     <p className="tableHeading">{t("processList.pinnedProcesses")}</p>
    //     <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //       selectionOne={selectionOne}
    //       selectionTwo={selectionTwo}
    //       margin="0 0 15px 0"
    //       showTableHead={true}
    //       searchTerm={searchTerm}
    //       processesPerProject={props.pinnedProcessesPerProject?.filter(
    //         (process) => {
    //           return process.ProcessType == "EP";
    //         }
    //       )}
    //     />
    //     <p className="tableHeading">{t("processList.otherProcesses")}</p>
    //     <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //       selectionOne={selectionOne}
    //       selectionTwo={selectionTwo}
    //       showTableHead={false}
    //       searchTerm={searchTerm}
    //       processesPerProject={props.allProcessesPerProject?.filter(
    //         (process) => {
    //           return process.ProcessType == "EP";
    //         }
    //       )}
    //     />
    //   </div>
    // ) : (
    //   <ProcessListByProjectTable
    // tabValue={props.tabValue}
    //     selectionOne={selectionOne}
    //     selectionTwo={selectionTwo}
    //     maxHeightofTable="380px"
    //     showTableHead={true}
    //     searchTerm={searchTerm}
    //     processesPerProject={props.allProcessesPerProject?.filter((process) => {
    //       return process.ProcessType == "EP";
    //     })}
    //   />
    // ),
  ];

  const clearSearchResult = () => {
    setSearchTerm("");
  };

  const GetSortingOptions = (selectedSortBy, selectedSortOrder) => {
    setSelectionOne(selectedSortBy);
    setSelectionTwo(selectedSortOrder);
  };

  const handleKeySort = (e) => {
    if (e.keyCode === 13) {
      setShowSortingModal(true);
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeySort);
  //   return () => document.removeEventListener("keydown", handleKeySort);
  // },[handleKeySort]);

  return props?.allProcessesPerProject?.length > 0 ? (
    <React.Fragment>
      <div
        style={{
          backgroundColor: "white",
          height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`,
        }}
      >
        <div
          className="filterBox"
          style={{
            justifyContent: "end",
            // background: "white", //#f6f6f6",
            padding: "0 1vw",
            position: props.tabValue === 0 ? "unset" : "absolute",
            // added on 20-09-2023 for bug_id: 137546
            // these changes also resolve bugId: 138188
            right: direction === RTL_DIRECTION ? "unset" : "0.5vw",
            left: direction === RTL_DIRECTION ? "0.5vw" : "unset",
            //till here
            zIndex: "2",

            //Bug 110243 Process listing displayed for projects, the Background color should be white as per design wireframe
            //[09-02-2023] Corrected the screen
            paddingTop: "1rem",
          }}
        >
          {/* <Checkbox onChange={()=>setPinnedCheck(!pinToTopPerProjectcheck)} checked={pinToTopPerProjectcheck} size= 'small' inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />{t('processList.ShowPinnedAtTop')} */}
          <SearchBox
            title={"ProcessesTab_searchProcess"}
            setSearchTerm={setSearchTerm}
            clearSearchResult={clearSearchResult}
            searchIconAlign="right"
            placeholder="Search"
            width="15vw" //Added on 06/02/2024 for bug_id:143271
            style={{
              width: window.innerWidth < 800 ? "133px" : "160px", // added condition to make it responsive on 650px width for bug:138188 on 09-10-2023.
              // minWidth: "200px", code commented to make it responsive on 650px width for bug:138188 on 09-10-2023.
              border: "1px solid #c8c6a7",
              backgroundColor: "white",
              color: "black",
              height: "2.7rem",
            }}
          />
          <div
            className="filterButton"
            type="button"
            onClick={() => setShowSortingModal(true)}
            tabIndex={0}
            onKeyDown={(e) => handleKeySort(e)}
          >
            <img
              src={FilterImage}
              style={{ width: "100%" }}
              alt={t("filterImg")}
            />
          </div>
        </div>
        {showSortingModal ? (
          <Modal
            show={showSortingModal}
            backDropStyle={{ backgroundColor: "transparent" }}
            style={{
              //top: "40%" code modified on 27-09-23 for bugId:138192
              top: window.innerWidth < 820 ? "27%" : "40%",
              left:
                direction === RTL_DIRECTION
                  ? "2%"
                  : window.innerWidth < 820
                  ? "70.2%"
                  : "84%", //till here for bugID:138192
              width: "200px",
              height: "195px",
              padding: "5px",
              zIndex: "1500",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
            }}
            modalClosed={() => setShowSortingModal(false)}
            children={<SortingModal getSortingOptions={GetSortingOptions} />}
          />
        ) : null}
        <div className="projectTable">
          <Tab
            tabType="subTab"
            tabContentStyle="subTabContentStyle"
            tabBarStyle="subTabBarStyle"
            //Bug 110243 Process listing displayed for projects, the Background color should be white as per design wireframe
            //[09-02-2023] Corrected the screen
            oneTabStyle="subOneTabStyle2"
            tabBarColor="white"
            customsSelectedTabStyle={true}
            TabNames={subTabLabels}
            hideIndicator={true}
            TabElement={subTabElements}
          />
        </div>
      </div>
    </React.Fragment>
  ) : (
    <NoprocessesPerproject />
  );
}

export default ProcessListByProjectSubTab;
