// Changes made to solve bug with ID Bug 112353 - After Process importing the changes of imported process are reflecting only after the reopening of the process
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly

import React, { useState, useEffect } from "react";
import "./ProcessesView.css";
import Processes from "./Processes/Processes";
import Projects from "./Projects/Projects";
import axios from "axios";
import {
  ENDPOINT_GETPROJECTLIST_DRAFTS,
  ENDPOINT_GETPROJECTLIST_DEPLOYED,
  SERVER_URL,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_REGISTERED,
  PREVIOUS_PAGE_PROCESS,
} from "../../../Constants/appConstants";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect, useDispatch, useSelector } from "react-redux";
import { setImportExportVal } from "../../../redux-store/slices/ImportExportSlice";
import Tabs from "../../../UI/Tab/Tab";
import {
  projectCreationVal,
  setProjectCreation,
} from "../../../redux-store/slices/projectCreationSlice";
import {
  processFetched,
  processListValue,
} from "../../../redux-store/slices/processListSlice";
import {
  previousProcessPageVal,
  setPreviousProcessPage,
} from "../../../redux-store/slices/storeProcessPage";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";

function ProjectsAndProcesses(props) {
  let { t } = useTranslation();
  const processList = useSelector(processListValue);
  const previousProcessPage = useSelector(previousProcessPageVal);
  const [selectedProcessCode, setSelectedProcessCode] = useState(null);
  const [selectedProcessCount, setSelectedProcessCount] = useState();
  // code edited on 30 Nov 2022 for BugId 119488
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectDesc, setSelectedProjectDesc] = useState();
  const [selectedProcessTile, setSelectedProcessTile] = useState(-1);
  const [projectList, setProjectList] = useState({
    Status: 0,
    Message: "",
    Projects: [],
  });
  const [spinnerProcessList, setspinnerProcessList] = useState(true);
  const [spinner, setSpinner] = useState(true);
  const [spinnerProjects, setSpinnerProjects] = useState(true);
  const [totalProcessCount, setTotalProcessCount] = useState(0);

  // code edited on 30 Nov 2022 for BugId 119488
  const [value, setValue] = useState(
    previousProcessPage?.tabType !== null ? previousProcessPage.tabType : 0
  );
  const projectCreatedVal = useSelector(projectCreationVal);
  const dispatch = useDispatch();

  let selectedProjectName = null;
  let selectedProjectTotalProcessCount = null;
  let selectedProjectRights = null;

  projectList?.Projects?.forEach((project) => {
    if (selectedProjectId === project.ProjectId) {
      selectedProjectName = project.ProjectName;
      selectedProjectTotalProcessCount = project.TotalProcessCount;
      selectedProjectRights = project.RIGHTS;
    }
  });
  const processTypeList = props.processTypeList;
  const pinnedDataList = props.pinnedDataList;
  let selectedTabAtNav = props.selectedTabAtNavPanel;

  useEffect(() => {
    // code added on 30 Nov 2022 for BugId 119488
    // code edited on 06 June 2023 for BugId 119488 and BugId 127429
    setSpinnerProjects(true);
    axios
      .get(
        SERVER_URL +
          `${
            value === 0
              ? ENDPOINT_GETPROJECTLIST_DRAFTS
              : ENDPOINT_GETPROJECTLIST_DEPLOYED
          }`
      )
      .then((res) => {
        if (res.data.Status === 0) {
          let data = res.data;
          setProjectList(data);
          let temp = [];
          res?.data?.Projects?.map((el) => {
            if (el.RIGHTS.V === "Y") {
              temp.push(el.ProjectId);
            }
          });
          // code added on 06 June 2023 for BugId 119488 and BugId 127429
          if (
            data?.Projects?.length > 0 &&
            previousProcessPage?.tabType === value &&
            previousProcessPage?.projectId !== null
          ) {
            setSelectedProjectId(previousProcessPage.projectId);
            // added on 24/01/24 for BugId 142928
            setSelectedProcessTile(-1);
            // till here BugId 142928
          } else if (
            previousProcessPage?.tabType === value &&
            previousProcessPage?.clickedTile !== null &&
            previousProcessPage?.clickedTileCount !== null &&
            previousProcessPage?.clickedTileIndex !== null
          ) {
            getSelectedProcessTile(
              previousProcessPage.clickedTile,
              previousProcessPage.clickedTileCount,
              previousProcessPage.clickedTileIndex
            );
            setSelectedProjectId(null);
          } else {
            // modified on 24/01/24 for BugId 142928
            // setSelectedProjectId(temp[0]);
            if (data?.Projects?.length > 0) {
              setSelectedProjectId(temp[0]);
            }
            setSelectedProcessTile(-1);
            // till here BugId 142928
          }
          setSpinner(false);
          setSpinnerProjects(false);
          dispatch(setImportExportVal({ ProjectList: res.data.Projects }));
        } else {
          setSpinner(false);
          setSpinnerProjects(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setSpinner(false);
      });
  }, [value]);

  //added on 11/10/2023, bug_id:126848

  const projectAfterImport = () => {
    axios
      .get(
        SERVER_URL +
          `${
            value === 0
              ? ENDPOINT_GETPROJECTLIST_DRAFTS
              : ENDPOINT_GETPROJECTLIST_DEPLOYED
          }`
      )
      .then((res) => {
        if (res.data.Status === 0) {
          let data = res.data;
          setProjectList(data);
          let temp = [];
          res?.data?.Projects?.map((el) => {
            if (el.RIGHTS.V === "Y") {
              temp.push(el.ProjectId);
            }
          });
          // code added on 06 June 2023 for BugId 119488 and BugId 127429
          if (
            data?.Projects?.length > 0 &&
            previousProcessPage?.tabType === value &&
            previousProcessPage?.projectId !== null
          ) {
            setSelectedProjectId(previousProcessPage.projectId);
          } else if (
            previousProcessPage?.tabType === value &&
            previousProcessPage?.clickedTile !== null &&
            previousProcessPage?.clickedTileCount !== null &&
            previousProcessPage?.clickedTileIndex !== null
          ) {
            getSelectedProcessTile(
              previousProcessPage.clickedTile,
              previousProcessPage.clickedTileCount,
              previousProcessPage.clickedTileIndex
            );
            setSelectedProjectId(null);
          } else {
            setSelectedProjectId(temp[0]);
          }
          setSpinner(false);
          setSpinnerProjects(false);
          dispatch(setImportExportVal({ ProjectList: res.data.Projects }));
        } else {
          setSpinner(false);
          setSpinnerProjects(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setSpinner(false);
      });
  };

  //till here for bug_id:126848

  //code edited on 28 July 2022 for BugId 110133
  useEffect(() => {
    if (projectCreatedVal.projectCreated) {
      axios
        .get(
          SERVER_URL +
            `${
              value === 0
                ? ENDPOINT_GETPROJECTLIST_DRAFTS
                : ENDPOINT_GETPROJECTLIST_DEPLOYED
            }`
        )
        .then((res) => {
          if (res.data.Status === 0) {
            let data = res.data;
            setProjectList(data);
            let temp = [];
            res?.data?.Projects?.forEach((el) => {
              if (el.RIGHTS.V === "Y") {
                temp.push(el.ProjectId);
              }
            });
            setSelectedProjectId(temp[0]);
            if (data?.Projects?.length > 0) {
              if (projectCreatedVal.projectCreated) {
                let selectedId = null;
                if (projectCreatedVal.projectName !== null) {
                  data?.Projects?.forEach((el) => {
                    if (el.ProjectName === projectCreatedVal.projectName) {
                      selectedId = el.ProjectId;
                    }
                  });
                } else {
                  selectedId =
                    data?.Projects && data?.Projects?.length > 0
                      ? data?.Projects[0]?.ProjectId
                      : null;
                }
                setSelectedProjectId(selectedId);
                dispatch(
                  setProjectCreation({
                    projectCreated: false,
                    projectName: null,
                    projectDesc: null,
                  })
                );
              }
            }
            setSpinner(false);
            dispatch(setImportExportVal({ ProjectList: res.data.Projects }));
          } else {
            setSpinner(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setSpinner(false);
        });
    }
  }, [projectCreatedVal.projectCreated]);

  useEffect(() => {
    setspinnerProcessList(true);
    if (!!selectedProjectId) {
      // code added on 06 June 2023 for BugId 119488 and BugId 127429
      dispatch(
        setPreviousProcessPage({
          previousProcessPage: PREVIOUS_PAGE_PROCESS,
          projectId: selectedProjectId,
          tabType: value,
          clickedTile: null,
          clickedTileIndex: null,
          clickedTileCount: null,
        })
      );
      axios
        .get(
          SERVER_URL +
            `/getprocesslist/${value === 0 ? "L" : "R"}/` +
            selectedProjectId
        )
        .then((res) => {
          if (res.status === 200) {
            setspinnerProcessList(false);
            dispatch(processFetched([...res.data.Processes]));
            setTotalProcessCount(res.data.Processes?.length);
          }
        })
        .catch((err) => console.log(err));
    } else if (selectedProcessCode) {
      axios
        .get(
          SERVER_URL +
            `/getprocesslist/${selectedProcessCode === "L" ? "L" : "R"}/-1`
        )
        .then((res) => {
          if (res.status === 200) {
            dispatch(processFetched([...res.data.Processes]));
          }
        })
        .catch((err) => console.log(err));
    } 
    // added on 24/01/24 for BugId 142928
    else {
      dispatch(processFetched([]));
    }
    // till here BugId 142928

    /* code edited on 2 Aug 2023 for issue - no api call for deployed processes in case processDefId 
    is same for draft and deployed process and also there is only one project for each.*/
  }, [selectedProjectId, selectedProcessCode, value]);

  let pinnedProcessesPerProject = [];

  const getSelectedProcessTile = (
    selectedProcessTileCode,
    selectedProcessTileCount,
    selectedProcessTileIndex
  ) => {
    setSelectedProcessCode(selectedProcessTileCode);
    setSelectedProcessCount(selectedProcessTileCount);
    setSelectedProcessTile(selectedProcessTileIndex);
  };

  return spinner ? (
    <CircularProgress style={{ marginTop: "40vh", marginInlineStart: "50%" }} />
  ) : (
    <React.Fragment>
      <Tabs
        tabType="processSubTab"
        tabContentStyle="processSubTabContentStyle"
        tabBarStyle="processSubTabBarStyle"
        oneTabStyle="processSubOneTabStyleProcessType"
        tabStyling="processTypeViewTabs"
        TabNames={[
          t("processList.Draft").toUpperCase(),
          t("processList.Deployed").toUpperCase(),
        ]}
        TabElement={[]}
        defaultTabValue={previousProcessPage?.tabType} // code added on 30 Nov 2022 for BugId 119488
        setValue={(val) => {
          // added on 24/01/24 for BugId 142928
          if (val !== value) {
            setSelectedProcessCode(null);
            setSelectedProjectId(null);
            dispatch(
              setPreviousProcessPage({
                previousProcessPage: PREVIOUS_PAGE_PROCESS,
                projectId: null,
                tabType: val,
                clickedTile: null,
                clickedTileIndex: null,
                clickedTileCount: null,
              })
            );
          }
          // till here BugId 142928
          setValue(val);
        }}
        style={{ width: "20vw", height: "5rem" }}
      />
      <div className="flex">
        <Grid container xs={12} justifyContent="space-between">
          <Grid item xs={3} className="mainProjectGrid">
            <Projects
              setSelectedProjectDesc={setSelectedProjectDesc}
              getSelectedProcessTile={getSelectedProcessTile}
              processTypeList={
                value === 0
                  ? processTypeList?.filter((el) => {
                      return el.ProcessType === "L";
                    })
                  : processTypeList?.filter((el) => {
                      return el.ProcessType === "R" || el.ProcessType === "E";
                    })
              }
              spinner={spinnerProjects}
              projectList={projectList.Projects}
              tabValue={value}
              selectedProcessTile={selectedProcessTile}
              setSelectedProjectId={setSelectedProjectId}
              defaultProjectId={selectedProjectId}
              totalProcessCount={totalProcessCount}
            />
          </Grid>
          <Grid item xs={9}>
            <Processes
              projectType={
                value === 0 ? PROCESSTYPE_LOCAL : PROCESSTYPE_REGISTERED
              }
              spinnerProcess={spinnerProcessList}
              projectList={projectList.Projects}
              setProjectList={setProjectList}
              selectedProjectDesc={selectedProjectDesc}
              selectedProjectId={selectedProjectId}
              allProcessesPerProject={processList}
              selectedProcessCode={selectedProcessCode}
              setSelectedProcessCode={setSelectedProcessCode}
              selectedProcessCount={selectedProcessCount}
              selectedProcessTile={selectedProcessTile}
              setSelectedProcessCount={setSelectedProcessCount}
              pinnedDataList={pinnedDataList}
              pinnedProcessesPerProject={pinnedProcessesPerProject}
              selectedProjectTotalProcessCount={
                selectedProjectTotalProcessCount
              }
              selectedProject={selectedProjectName}
              processTypeList={processTypeList}
              selectedTabAtNav={selectedTabAtNav}
              tabValue={value}
              selectedProjectRights={selectedProjectRights}
              projectAfterImport={projectAfterImport} //Modified on 11/10/2023, bug_id:126848
            />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    processTypeList: state.processTypesReducer.tileData,
    pinnedDataList: state.processTypesReducer.pinnedData,
    defaultProcessTileIndex:
      state.defaultProcessTileReducer.defaultProcessTileIndex,
    clickedProcessTileAtHome:
      state.clickedProcessTileReducer.selectedProcessTile,
    selectedTabAtNavPanel: state.selectedTabAtNavReducer.selectedTab,
  };
};

export default connect(mapStateToProps, null)(ProjectsAndProcesses);
