import React, { useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles } from "@material-ui/core/styles";
import classes from "./Task.module.css";
import { useTranslation } from "react-i18next";
import { Tabs, Tab, Box, Typography, Grid } from "@material-ui/core";
import TaskList from "./TaskList/TaskList";
import { store, useGlobalState } from "state-pool";
import DataMapping from "./DataMapping/DataMapping";
import ManageRights from "./ManageRights/ManageRights";
import AssociateUsers from "./AssociateUsers/AssociateUsers";
import ManageRules from "./ManageRules/ManageRules";
import Modal from "../../../../UI/Modal/Modal";
import EmptyStateIcon from "../../../../assets/ProcessView/EmptyState.svg";
import noSearchResult from "../../../../assets/NoSearchResult.svg";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction";
import SearchBox from "../../../../UI/Search Component";
import { setDependencyErrorMsg } from "../../../../redux-store/actions/Properties/activityAction";
import ObjectDependencies from "../../../../UI/ObjectDependencyModal";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { headerHeight } from "../../../../Constants/appConstants";
import { v4 as uuidv4 } from "uuid";

function Task(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const actProperty = store.getState("activityPropertyData");
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(actProperty);
  const [searchTask, setsearchTask] = useState("");
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [selectedTabValue, setselectedTabValue] = useState(0);
  const [propertyTabValue, setpropertyTabValue] = useState("user");
  const [taskListModal, settaskListModal] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const activityDependencies = useSelector(
    (state) => state.activityReducer.activityDependencies
  );
  // code edited on 28 Aug 2023 for BugId 134616 - Activity checkout functionality for task not working
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo || // modified on 05/09/2023 for BugId 136103
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  let dispatch = useDispatch();
  const useStyles = makeStyles({
    root: {
      flexGrow: 1,
      backgroundColor: "white",
      display: "flex",
      height: "100%",
      direction: direction,
    },
    input: {
      height: "2.0625rem",
    },
    tabs: {
      borderRight: `1px solid rgb(5,5,5,0.5)`,
      height: "100%",
      width: "15.625rem",
    },
    tabsHorizontal: {
      height: "43px",
      borderBottom: "1px solid  rgb(5,5,5,0.2)",
      minHeight: "0px",
    },
    selectedTab: {
      background: "red",
    },
    tabRoot: {
      minWidth: "0px",
      margin: "0 12px !important",
      whiteSpace: "nowrap",
    },
    mainDiv: {
      display: "flex",
      flexDirection: "column",
      /* code edited on 6 July 2023 for issue - save and discard button hide 
      issue in case of tablet(landscape mode)*/
      height: `calc((${windowInnerHeight}px - ${headerHeight}) - 9rem)`,
      direction: direction,
      // minHeight: props.isDrawerExpanded ? "100vh" : "71vh",
      fontFamily: "var(--font_family)",
      width: "100%",
      // maxWidth: "100vw",
      paddingTop: props.isDrawerExpanded ? "0" : "0.4rem",
    },
  });
  const styles = useStyles({ ...props, windowInnerHeight });

  const getTabPanels = (task) => {
    if (propertyTabValue === "user")
      return <AssociateUsers taskInfo={task} isReadOnly={isReadOnly} />;
    else if (propertyTabValue === "dataMap")
      return <DataMapping taskInfo={task} isReadOnly={isReadOnly} />;
    else if (propertyTabValue === "rules")
      return <ManageRules taskInfo={task} isReadOnly={isReadOnly} />;
    else if (propertyTabValue === "rights")
      return (
        <ManageRights
          styling={styles}
          taskInfo={task}
          isReadOnly={isReadOnly}
        />
      );
  };

  const addTasksAssociated = (newTaskList) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap = {
      ...newTaskList,
    };
    setlocalLoadedActivityPropertyData(temp);
  };

  const showFilteredTask = (taskList) => {
    return taskList.filter((val) =>
      val?.taskTypeInfo?.taskName
        .toLowerCase()
        .includes(searchTask.toLowerCase())
    );
  };

  return (
    <div
      className={styles.mainDiv}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTasks?.taskMap &&
      Object.values(
        localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
          ?.objPMWdeskTasks?.taskMap
      ).length > 0 ? (
        <div className={styles.root}>
          {/* added grid on 6/10/2023 for bug_id: 135673 */}
          <Grid container xs={12} justifyContent="space-between">
            <Grid item xs={props.isDrawerExpanded ? 2 : 12}>
              <div
                className="tabs"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  // flex: "1",

                  borderInlineEnd: props.isDrawerExpanded
                    ? "1px solid rgb(5,5,5,0.5)"
                    : "0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "0.5rem 1vw",
                    alignItems: "center",
                  }}
                >
                  <p className={classes.taskHeading}>{t("tasks")}</p>
                  {!isReadOnly && (
                    <AddIcon
                      onClick={() => {
                        settaskListModal(true);
                        if (!props.isDrawerExpanded) {
                          props.expandDrawer(true);
                        }
                      }}
                      tabIndex={0}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          settaskListModal(true);
                          if (!props.isDrawerExpanded) {
                            props.expandDrawer(true);
                          }
                          e.stopPropagation();
                        }
                      }}
                      style={{
                        color: "var(--button_color)",
                        width: "1.25rem",
                        height: "1.25rem",
                        cursor: "pointer",
                      }}
                      id="pmweb_Task_AddTask_Addicon"
                    />
                  )}
                </div>
                <div style={{ width: "95%", marginInline: "2.5%" }}>
                  <SearchBox
                    height="28px"
                    width="100%"
                    placeholder={"Search Here"}
                    setSearchTerm={(data) => setsearchTask(data)}
                    title={"task"}
                    id="pmweb_Task_Task_SearchBox"
                  />
                </div>

                <div
                  className={classes.streamListDiv}
                  //added on 2/1/2024 for bug_id:143208
                  style={{
                    height: `calc((${windowInnerHeight}px - ${headerHeight}) - 14.5rem)`,
                  }}
                  //till here for bug_id:143208
                >
                  {localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                    ?.objPMWdeskTasks?.taskMap &&
                  showFilteredTask(
                    Object.values(
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.wdeskInfo?.objPMWdeskTasks?.taskMap
                    )
                  )?.length > 0 ? (
                    showFilteredTask(
                      Object.values(
                        localLoadedActivityPropertyData?.ActivityProperty
                          ?.wdeskInfo?.objPMWdeskTasks?.taskMap
                      )
                    ).map((val, index) => {
                      return (
                        <div
                          className="flex"
                          style={{
                            marginTop: "0.5rem",
                            cursor: "pointer",
                            padding: "0.5rem 0.75vw",
                            background:
                              selectedTabValue === index
                                ? "#e8f3fa 0% 0% no-repeat padding-box"
                                : "#fff",
                          }}
                          onClick={() => {
                            setselectedTabValue(index);
                            setpropertyTabValue("user");
                          }}
                          tabIndex={0}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              setselectedTabValue(index);
                              e.stopPropagation();
                            }
                          }}
                          id={`pmweb_Task_selectedtabValue_div_${index}`}
                        >
                          <div
                            style={{
                              font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family)",
                            }}
                          >
                            {index + 1}.{" "}
                          </div>
                          <div id={val.taskTypeInfo.taskId}>
                            <h5
                              style={{
                                font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family)",
                                marginInlineStart: "0.25vw",
                              }}
                            >
                              {val.taskTypeInfo.taskName}{" "}
                            </h5>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <React.Fragment>
                      {/*code added on 7 Nov 2022 for BugId 117356 */}
                      <img
                        src={noSearchResult}
                        alt={t("noSearchResult")}
                        style={{ width: "65%", margin: "5rem 3.25vw 0" }}
                      />
                      <p
                        style={{
                          font: "normal normal normal var(--base_text_font_size)/17px var(--font_family)",
                          textAlign: "center",
                        }}
                      >
                        {t("noSearchResult")}
                      </p>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </Grid>
            <Grid item xs={10}>
              {props.isDrawerExpanded ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    // flex: "4",
                  }}
                >
                  {localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                    ?.objPMWdeskTasks?.taskMap &&
                    Object.values(
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.wdeskInfo?.objPMWdeskTasks?.taskMap
                    ).map((task, index) => (
                      <TabPanel
                        style={{ height: "10px", width: "100%" }}
                        value={selectedTabValue}
                        index={index}
                        id="vertical-tab"
                      >
                        <Tabs
                          value={propertyTabValue}
                          onChange={(e, val) => {
                            setpropertyTabValue(val);
                          }}
                          className={styles.tabsHorizontal}
                          id={`pmweb_Task_setpropertytabvalue_tabs_${index}`}
                        >
                          <Tab
                            classes={{ root: styles.tabRoot }}
                            label={t("users")}
                            value="user"
                            id={`pmweb_Task_user_tab_${index}`}
                            tabIndex={0}
                          />
                          {/* Added code on 18-09-2023 for BugId: 136213*/}
                          {(task?.taskTypeInfo?.taskType === 1 ||
                            (task?.taskTypeInfo?.taskType === 2 &&
                              task?.taskTypeInfo.taskGenPropInfo
                                ?.m_strSubPrcType === "U")) && (
                            //till here for BugId: 136213
                            <Tab
                              classes={{ root: styles.tabRoot }}
                              label={t("datamapping")}
                              value="dataMap"
                              id={`pmweb_Task_datamap_tab_${index}`}
                              tabIndex={0}
                            />
                          )}
                          <Tab
                            classes={{ root: styles.tabRoot }}
                            label={t("rules")}
                            value="rules"
                            id={`pmweb_Task_rules_tab_${index}`}
                            tabIndex={0}
                          />
                          <Tab
                            classes={{ root: styles.tabRoot }}
                            label={t("rights")}
                            value="rights"
                            id={`pmweb_Task_rights_tab_${index}`}
                            tabIndex={0}
                          />
                        </Tabs>
                        {getTabPanels(task)}
                      </TabPanel>
                    ))}
                </div>
              ) : null}
            </Grid>
          </Grid>
          {/* till here for bug_id: 135673 */}
        </div>
      ) : (
        <div className={classes.emptyStateMainDiv}>
          <img
            className={classes.emptyStateImage}
            src={EmptyStateIcon}
            alt={t("noTasksAssociated")}
            style={{
              marginTop: "6rem",
            }}
          />
          <p
            className={classes.emptyStateText}
            style={{ marginBottom: "0", marginTop: "0.375rem" }}
          >
            {t("noTasksAssociated")}
          </p>
          <p className={classes.emptyStateText}>{t("pleaseAssociateTasks")}</p>
          {!isReadOnly && (
            <button
              id="AR_Add_Rule_Locally"
              className={classes.addRuleLocallyButton}
              onClick={() => {
                if (!props.isDrawerExpanded) {
                  props.expandDrawer(true);
                }
                settaskListModal(true);
              }}
            >
              {t("AssociateTask")}
            </button>
          )}
        </div>
      )}

      {taskListModal && (
        <Modal
          show={taskListModal}
          //Bug 122253 - Case Workdesk issues
          //[30-03-2023] Commented the backDropStyle
          // backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            width: "40vw",
            top: "30%",
            left: "32vw",
            padding: "0",
            boxShadow: "none",
          }}
          children={
            <TaskList
              tasksAssociated={
                localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                  ?.objPMWdeskTasks?.taskMap
              }
              selectedTaskToAssoc={(list) => addTasksAssociated(list)}
              setShowDependencyModal={setShowDependencyModal}
              closeModal={() => settaskListModal(false)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  settaskListModal(false);
                  e.stopPropagation();
                }
              }}
              isReadOnly={isReadOnly}
            />
          }
        />
      )}
      {/*code edited on 10 Feb 2023 for BugId 123476*/}
      {showDependencyModal ? (
        <Modal
          show={showDependencyModal}
          style={{
            width: "45vw",
            left: "28%",
            top: "26.5%",
            padding: "0",
          }}
          hideBackdrop={true}
          children={
            <ObjectDependencies
              processAssociation={activityDependencies}
              cancelFunc={() => {
                dispatch(setDependencyErrorMsg(null));
                setShowDependencyModal(false);
              }}
            />
          }
        />
      ) : null}
    </div>
  );
}

export function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${uuidv4()}`}
      aria-labelledby={`vertical-tab`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
    // code added on 28 Aug 2023 for BugId 134616 - Activity checkout functionality for task not working
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Task);
