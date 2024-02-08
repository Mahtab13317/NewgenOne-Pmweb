import React, { useState, useRef, useEffect } from "react";
import "./projects.css";
import ProcessTiles from "../ProcessTiles/ProcessTiles";
import TableData from "../../../../UI/ProjectTableData/TableData";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import FileIcon from "../../../../assets/HomePage/processIcon.svg";
import SearchProject from "../../../../UI/Search Component/index";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoProjectScreen from "../Processes/NoProjectsOrProcesses/NoProjectScreen";
import { connect, useDispatch, useSelector } from "react-redux";
import FilterImage from "../../../../assets/ProcessView/PT_Sorting.svg";
import Modal from "../../../../UI/Modal/Modal.js";
import ProjectCreation from "./ProjectCreation.js";
import {
  getMenuNameFlag,
  getProjectsByRights,
} from "../../../../utility/UserRightsFunctions";
import {
  PREVIOUS_PAGE_PROCESS,
  RTL_DIRECTION,
  SPACE,
  userRightsMenuNames,
} from "../../../../Constants/appConstants";
import { UserRightsValue } from "../../../../redux-store/slices/UserRightsSlice";
import SortingModal from "../../../MainView/ProcessesView/Processes/ProcessesListByProject/sortByModal.js";
import secureLocalStorage from "react-secure-storage";
import { setPreviousProcessPage } from "../../../../redux-store/slices/storeProcessPage";
import { CircularProgress } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { shortenRuleStatement } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LightTooltip } from "../../../../UI/StyledTooltip";

let useStyles = makeStyles({
  root: {
    fontFamily: "Open Sans , sans-serif",
    fontWeight: "600",
    fontSize: "16px",
  },
  svgIconSmall: {
    fontSize: "1.12rem",
  },
  projectName: {
    fontSize: "13px",
    // width: "12.75vw",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
});

function Projects(props) {
  const userRightsValue = useSelector(UserRightsValue);
  let selectedTileFromHome = props.selectedTile;
  const classes = useStyles();
  let projectHeadRef = useRef(null);
  let parentRef = useRef(null);
  const dispatch = useDispatch();
  const [selectionOne, setSelectionOne] = useState(2);
  const [selectionTwo, setSelectionTwo] = useState(0);
  const [showSortingModal, setShowSortingModal] = useState(false);
  let [topButton, setTopButton] = useState(false);
  let [processType, setProcessType] = useState(null);
  let [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(null);

  // Boolean that decides whether create project button will be visible or not.
  const createProjectRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProject
  );

  const CreateProjectHandler = () => {
    setShowModal(true);
  };
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const headCells = [
    {
      id: "fileIcon",
      label: t("processView.ProcessName"),
      styleTdCell: {
        minWidth: "0px",
        transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
      },
    },
    {
      id: "projectName",
      label: t("processView.ProcessName"),
      styleTdCell: { width: "75.5%", height: "30px" },
    },
    {
      id: "projectCount",
      label: t("processView.ProcessName"),
      styleTdCell: { width: "17%", height: "30px" },
    },
  ];

  /*****************************************************************************************
   * @author asloob_ali BUG ID:110128 Blank screen opens when clicked on name option of Sort By
   * Reason:wrong assigned values while sorting project list.
   * Resolution : now removed wrong assignation.
   * Date : 20/09/2022
   ****************/
  const handleSort = (a, b) => {
    return a.ProjectName.localeCompare(b.ProjectName);
  };
  let projectList = props.projectList
    ? [...getProjectsByRights(props.projectList)]
    : [];

  if (selectionOne == 2) {
    if (selectionOne == 2 && selectionTwo == 0) {
      projectList.sort(handleSort);
    } else if (selectionOne == "2" && selectionTwo == "1") {
      projectList.sort(handleSort).reverse();
    }
  } else if (selectionOne == "0" || selectionOne == "1") {
    let temp = [...projectList];
    if (selectionOne == "0") {
      temp = [
        ...projectList.filter((el) => {
          return el.LastModifiedBy == secureLocalStorage.getItem("username");
        }),
      ];
    }
    const newTemp = temp.map((obj) => {
      return {
        ...obj,
        LastModifiedOn: new Date(obj.LastModifiedOn).getTime(),
      };
    });
    function compare(a, b) {
      if (a.LastModifiedOn < b.LastModifiedOn) {
        return -1;
      }
      if (a.LastModifiedOn > b.LastModifiedOn) {
        return 1;
      }
      return 0;
    }
    const newTempAsc = newTemp.sort(compare);
    if (
      (selectionOne == "1" && selectionTwo == "0") ||
      (selectionOne == "0" && selectionTwo == "0")
    ) {
      projectList = [...newTempAsc];
    } else if (
      (selectionOne == "1" && selectionTwo == "1") ||
      (selectionOne == "0" && selectionTwo == "1")
    ) {
      projectList = [...newTempAsc.reverse()];
    }
  }
  // ========================================

  let rows = projectList.map((projectData, index) => ({
    rowId: projectData.ProjectId,
    rowData: projectData,
    fileIcon: (
      <img
        src={FileIcon}
        style={{ marginTop: "4px", marginLeft: "4px" }}
        alt="File"
      ></img>
    ),
    projectDesc: projectData.ProjectDescription,
    projectName: (
      <div className={classes.projectName}>
        {/* Changes made to solve Bug 136154 */}
        <LightTooltip
          id="pmweb_projectname_Tooltip"
          arrow={true}
          enterDelay={500}
          placement="bottom-start"
          title={projectData.ProjectName}
        >
          <span>{shortenRuleStatement(projectData.ProjectName, 20)}</span>
        </LightTooltip>
        {/* till here dated 5thSept */}
      </div>
    ),
    projectCount: (
      // <ProjectTooltip
      //   enterDelay={500}
      //   title={
      //     <React.Fragment>
      //       <OnHoverList
      //         processTypeList={projectData.Processes}
      //         allProcessesPerProject={props.allProcessesPerProject}
      //       />
      //     </React.Fragment>
      //   }
      // >
      <span className="processCount" style={{ paddingLeft: "0.7vw" }}>
        {projectData.TotalProcessCount}
      </span>
      // </ProjectTooltip>
    ),
  }));

  const scrollToTop = () => {
    document.querySelector(".projects").scrollTo(0, 0);
    document.querySelector(".backToTopButton").style.display = "none";
    setTopButton(false);
  };

  useEffect(() => {
    parentRef.current.addEventListener("scroll", () => {
      let topHigh = document
        .querySelector(".searchbar_N_Header")
        .getBoundingClientRect().top;
      if (topHigh <= 50) {
        setTopButton(true);
      } // excluded 50px from top which is margin-top for project component
      else setTopButton(false);
    });
  });

  useEffect(() => {
    setProcessType(null);
  }, [props.tabValue]);

  let filteredRows = rows?.filter((row) => {
    if (searchTerm === "") {
      return row;
    } else if (
      // modified on 18/09/23 for BugId 136154
      // row.projectName.props.children.toLowerCase().includes(searchTerm.toLowerCase())
      row.rowData?.ProjectName?.toLowerCase().includes(searchTerm.toLowerCase())
      // till here BugId 136154
    ) {
      return row;
    }
  });

  const getSelectedProcessTile = (
    selectedProcessTileCode,
    selectedProcessTileCount,
    selectedProcessTileIndex
  ) => {
    // code added on 06 June 2023 for BugId 119488 and BugId 127429
    dispatch(
      setPreviousProcessPage({
        previousProcessPage: PREVIOUS_PAGE_PROCESS,
        projectId: null,
        tabType: props.tabValue,
        clickedTile: selectedProcessTileCode,
        clickedTileIndex: selectedProcessTileIndex,
        clickedTileCount: selectedProcessTileCount,
      })
    );
    props.getSelectedProcessTile(
      selectedProcessTileCode,
      selectedProcessTileCount,
      selectedProcessTileIndex
    );
    setProcessType(selectedProcessTileCode);
  };

  const onProjectClick = (data) => {
    const projectId = data.rowId;
    setProcessType(null);
    props.setSelectedProjectId(projectId);
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

  const handleKeyAdd = (e) => {
    if (e.keyCode === 13) {
      CreateProjectHandler();
      e.stopPropagation();
    }
  };

  return (
    <div
      id="pmweb_processesTab_Projects"
      className="projects"
      ref={parentRef}
      style={{
        direction: `${t("HTML_DIR")}`,

        /*Bug 138333 - Added display and flexDirection property*/
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* code added on 22 June 2022 for BugId 111210*/}
      <ProcessTiles
        selectedProjectId={props.defaultProjectId}
        setSelectedProjectId={props.setSelectedProjectId}
        selectedTileFromHome={selectedTileFromHome}
        getSelectedProcessTile={getSelectedProcessTile}
        processTypeList={props.processTypeList}
        selectedProcessTile={props.selectedProcessTile}
        tabValue={props.tabValue} // code added on 06 June 2023 for BugId 119488 and BugId 127429
      />
      <div className="searchbar_N_Header" ref={projectHeadRef}>
        <div className="project_Header_Adder">
          <h4
            style={{
              fontWeight: "600",
              fontSize: "var(--subtitle_text_font_size)",
            }}
          >
            {t("projectList.ProjectHeading")}
            {SPACE}
            {`(${
              props.projectList
                ? getProjectsByRights(props.projectList)?.length
                : 0
            })`}
          </h4>
          {/**code added on 04-07-2023 for bug id 131481 */}
          {createProjectRightsFlag && !props.tabValue && (
            // code changes on 05-09-2023 for bug Id 135241
            <AddIcon
              onClick={() => CreateProjectHandler()}
              onKeyDown={(e) => handleKeyAdd(e)}
              tabIndex={0}
              id="pmweb_create_Project"
              style={{ color: "var(--link_color)", fontSize: "23" }}
              className="createProject"
              role="CreateProject"
              aria-label="Create Project Button"
              aria-description="Create Project Button"
            ></AddIcon>
          )}
        </div>
        <div className="searchBarNFilter">
          <div>
            <SearchProject
              setSearchTerm={setSearchTerm}
              title={"projects"}
              placeholder={t("search")}
              width="15vw"
              style={{ marginRight: "6px" }}
            />
          </div>

          <div
            className="filterButton"
            onClick={() => setShowSortingModal(true)}
            onKeyDown={(e) => handleKeySort(e)}
            id="pmweb_processesTab_SortModal"
            tabIndex={0}
            role="sort"
            aria-label="Button"
            aria-description="Sort By"
          >
            <img src={FilterImage} style={{ width: "100%" }} alt="FilterBtn" />
          </div>
          {showSortingModal ? (
            <Modal
              show={showSortingModal}
              backDropStyle={{ backgroundColor: "transparent" }}
              style={{
                top: window.innerWidth < 820 ? "21%" : "30%",
                left: direction === RTL_DIRECTION ? "66%" : "21.5%",
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
        </div>
      </div>
      {/*code edited on 14 Dec 2022 for BugId 117979*/}
      {props.spinner ? (
        <CircularProgress
          style={{ marginTop: "20vh", marginInlineStart: "8vw" }}
        />
      ) : (
        <div className="projectTable_ListDiv">
          <TableData
            setSelectedProjectDesc={props.setSelectedProjectDesc}
            selectionPossible={!processType}
            selectedRow={props.defaultProjectId}
            defaultScreen={<NoProjectScreen />}
            getSelectedRow={onProjectClick}
            updateTablePosition={[]}
            parenrRef={parentRef}
            upperHeaderRef={projectHeadRef}
            extendHeight={true}
            hideHeader={true}
            divider={false}
            tableHead={headCells}
            tabValue={props.tabValue}
            rows={searchTerm === "" ? rows : filteredRows}
            // added on 04/09/2023 for BugId 135251
            nameKey="ProjectName"
            countKey="TotalProcessCount"
          />
        </div>
      )}
      {topButton ? (
        <button onClick={scrollToTop} className="backToTopButton">
          <div style={{ display: "flex", alignItems: "center" }}>
            <ExpandLessIcon />
            {t("projectList.BackToTopButtonText")}
          </div>
        </button>
      ) : null}
      {/*modal for projectcreation*/}

      {showModal ? (
        <Modal
          show={showModal !== null}
          style={{
            // width: "30vw",
            left: "50%",
            top: "50%",
            padding: "0",
            transform: "translate(-50%, -50%)",
          }}
          modalClosed={() => setShowModal(null)}
          children={<ProjectCreation setShowModal={setShowModal} />}
        />
      ) : null}
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    selectedTile: state.clickedProcessTileReducer.selectedProcessTile,
    defaultProcessTileIndex:
      state.defaultProcessTileReducer.defaultProcessTileIndex,
  };
};
export default connect(mapStateToProps)(Projects);
