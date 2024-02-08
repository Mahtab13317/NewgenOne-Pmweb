import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import "./Toolbox.css";
import ExpandIcon from "../../../../../src/assets/bpmnView/ExpandIcon.svg";
import CollapseIcon from "../../../../../src/assets/abstractView/Icons/Collapse.svg";
import Tool from "./Tool";
import ImportExportGlobalTask from "../../../../../src/components/Properties/PropetiesTab/Task/ImportExport_GlobalTask/index.js";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import ToolsList from "./ToolsList";
import { searchFunc_expanded } from "../../../../utility/bpmnView/searchFunction_expanded";
import { searchFunc_collapsed } from "../../../../utility/bpmnView/searchFunction_collapsed";
import Modal from "../../../../UI/Modal/Modal";
import {
  taskTemplates,
  activities,
  intermediateEvents,
  gateway,
  endEvents,
  artefacts,
  caseWorkdesk,
  sapAdapter,
  sharePoint,
  conditionalEvents,
  receive,
  reply,
} from "../../../../utility/bpmnView/toolboxIcon";
import searchIcon from "../../../../assets/bpmnView/toolbox/SearchToolbox.svg";
import {
  getCaseEnabledActivities,
  getStartEvents,
} from "../../../../utility/ViewingArea/CaseEnabledActivities";
import { getSapEnabledActivities } from "../../../../utility/ViewingArea/SapEnabled";
import { store, useGlobalState } from "state-pool";
import {
  RTL_DIRECTION,
  TaskType,
  headerHeight,
} from "../../../../Constants/appConstants";
import { TASK_TEMPLATES_HEAD, style } from "../../../../Constants/bpmnView";
import taskTemplateIcon from "../../../../assets/bpmnViewIcons/TaskTemplate.svg";
import { Divider, Grid, Typography } from "@material-ui/core";
import { AddPlusIcon } from "../../../../utility/AllImages/AllImages";
import CreateGlobalTaskTemplateModal from "../../../Properties/PropetiesTab/GlobalTaskTemplate/CreateGlobalTaskTemplateModal";
import { useDispatch, useSelector } from "react-redux";
import { showDrawer } from "../../../../redux-store/actions/Properties/showDrawerAction";
import { selectedTemplate } from "../../../../redux-store/actions/selectedCellActions";
import { getSelectedCellType } from "../../../../utility/abstarctView/getSelectedCellType";

let toolMap = new Map();
const useStyles = makeStyles({
  rootDivider: {
    width: "80%",
    backgroundColor: "#E9E9E9",
    marginLeft: "10%",
    marginRight: "10%",
  },

  rootList: {
    width: "100%",
    display: "flex",
  },
  rootListItem: {
    cursor: "pointer",
    padding: "0",
    justifyContent: "center !important",
    "&:hover": {
      backgroundColor: "#0072c60d",
    },
    "&:focus-visible": {
      outline: "0",
    },
  },
  selectedListItem: {},
  listItemGutters: {
    paddingLeft: "2px",
    paddingRight: "2px",
  },
  rootToolListItemInExpandedView: {
    width: "100%",
    height: "28px",
    "& img": {
      width: "1.25rem",
      height: "1.25rem",
    },
  },
  rootListItemIcon: {
    width: "100% important",
    maxHeight: "22px",
  },

  listItemIconInExpandedView: {
    minWidth: "22px",
  },
  primaryListItemText: {
    fontSize: "12px",
    color: "#3A3A3A",
    fontFamily: "Open Sans",
    fontWeight: "400",
  },
  primaryListItemTextHeading: {
    fontSize: "14px",
    color: "#FF6600",
    fontFamily: "Open Sans",
    fontWeight: "600",
    marginLeft: "10px",
  },
  expandListItem: {
    position: "unset",
  },
  addIcon: {
    width: "1.25rem",
    height: "1.25rem",
    cursor: "pointer",
    "&:focus-visible": {
      outline: "0",
      border: "1px solid var(--button_color)",
      borderRadius: "2px",
    },
  },
  globalTaskheader: {
    fontSize: "1rem", //code updated on 14 October 2022 for BugId 116442
    color: "#606060",
    fontWeight: "600",
  },
  importExport: {
    color: "var(--link_color)",
    fontWeight: "600",
    fontSize: "var(--base_text_font_size)",
    cursor: "pointer",
    padding: "2px",
    "&:focus-visible": {
      outline: "0",
      border: "1px solid var(--button_color) !important",
      borderRadius: "2px",
    },
  },
});

function Toolbox(props) {
  let { expandedView, setExpandedView, caseEnabled, view } = props;
  const classes = useStyles();
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [showModal, setShowModal] = useState(false);
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);

  const globalTemplates = useSelector(
    (state) => state.globalTaskTemplate.globalTemplates
  );
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] =
    useState(false);

  const handleCreateGlobalTemplate = () => {
    setIsCreateTemplateModalOpen(true);
  };

  const closeCreateGlobalTemplateModal = () => {
    setIsCreateTemplateModalOpen(false);
  };

  //render only after graph has been rendered ,
  //and mxGraph object has been created
  let display = true;

  let onClickHandler = (id) => {
    // code edited on 12 Dec 2022 for BugId 120293
    if (expandedView) {
      let section = document.getElementById(id);
      let offset = section.offsetTop;
      let mainDiv = document.getElementById("expandedToolBox_ActList");
      mainDiv.scrollTop = offset;
    }
  };

  let toolboxContainer = useRef(null);
  let tool = useRef();

  //to display tool of particular type
  let [toolboxDisplay, setToolboxDisplay] = useState("1");
  const [searchedVal, setSearchedVal] = useState("");
  //t is our translation function
  let toolTypeList = [];
  // code edited on 29 July 2022 for BugId 113313 and BugId 113849
  let sharePointFlag = localLoadedProcessData?.SystemProperty
    ? localLoadedProcessData?.SystemProperty[0]?.SHAREPOINTFLAG === "Y"
      ? true
      : false
    : false;
  let conditionalStartFlag =
    localLoadedProcessData?.ConditionalStartVisibility === "N" ? false : true;
  let receiveReplyFlag = "Y";
  // localLoadedProcessData?.ReceiveReplyVisibility === "N" ? false : true;
  let updatedStartEvents = getStartEvents(conditionalStartFlag, [
    conditionalEvents,
  ]);
  let updatedActivities = getCaseEnabledActivities(
    receiveReplyFlag,
    [receive, reply],
    activities
  );
  let updatedIntegrationPointActivities = getSapEnabledActivities(
    localLoadedProcessData?.SAPRequired,
    [sapAdapter],
    sharePointFlag,
    [sharePoint]
  );
  if (
    // This condition runs when process is not case enabled and the user is in abstract view.
    caseEnabled === false &&
    view === "views.abstract"
  ) {
    updatedActivities = getCaseEnabledActivities(
      caseEnabled,
      [caseWorkdesk],
      updatedActivities
    );
    toolTypeList = [
      updatedStartEvents,
      updatedActivities,
      intermediateEvents,
      gateway,
      updatedIntegrationPointActivities,
      endEvents,
    ];
  } else if (
    // This condition runs when process is not case enabled and the user is in Bpmn view.
    caseEnabled === false &&
    view === "views.bpmn"
  ) {
    updatedActivities = getCaseEnabledActivities(
      caseEnabled,
      [caseWorkdesk],
      updatedActivities
    );
    toolTypeList = [
      updatedStartEvents,
      updatedActivities,
      intermediateEvents,
      gateway,
      updatedIntegrationPointActivities,
      endEvents,
      artefacts,
    ];
  } else if (
    // This condition runs when process is case enabled and the user is in Bpmn view.
    caseEnabled === true &&
    view === "views.bpmn"
  ) {
    toolTypeList = [
      taskTemplates,
      updatedStartEvents,
      updatedActivities,
      intermediateEvents,
      gateway,
      updatedIntegrationPointActivities,
      endEvents,
      artefacts,
    ];
  } else if (
    // This condition runs when process is case enabled and the user is in Abstract view.
    caseEnabled === true &&
    view === "views.abstract"
  ) {
    toolTypeList = [
      updatedStartEvents,
      updatedActivities,
      intermediateEvents,
      gateway,
      updatedIntegrationPointActivities,
      endEvents,
    ];
  }

  useEffect(() => {
    let currentToolBoxContainer = toolboxContainer.current;
    if (currentToolBoxContainer) {
      currentToolBoxContainer.addEventListener("mouseleave", hideToolContainer);
    }
    return () => {
      if (currentToolBoxContainer) {
        currentToolBoxContainer.removeEventListener(
          "mouseleave",
          hideToolContainer
        );
      }
    };
  }, []);

  useEffect(() => {
    // code edited on 2 Dec 2022 for BugId 112601
    searchFunc_expanded("");
    searchFunc_collapsed("");
    hideInputBoxAndActivityList();
  }, [props.view]);

  let toggleExpandedView = () => {
    // code edited on 12 Dec 2022 for BugId 120293
    let tooltabs = document.querySelectorAll(".toolTabs");
    for (let i = 0; i < tooltabs.length; i++) {
      tooltabs[i].style.backgroundColor = "";
    }
    if (!expandedView) {
      tooltabs[0].style.backgroundColor = "#0072C60D";
    }
    setExpandedView(!expandedView);
  };

  let hideToolContainer = (evt) => {
    setToolboxDisplay(null);
  };

  let scrollhandler = () => {
    // code edited on 12 Dec 2022 for BugId 120293
    let tooltabs = document.querySelectorAll(".toolTabs");
    let newArr = [];
    let mainDiv = document.getElementById("expandedToolBox_ActList");
    for (let i = 0; i < toolTypeList.length; i++) {
      tooltabs[i].style.backgroundColor = "";
      let tool = toolTypeList[i];
      let section = document.getElementById(t(tool.title));
      newArr.push(section.offsetTop - 4);
    }
    for (var i = 0; i < newArr.length; i++) {
      if (
        newArr[i] <= mainDiv.scrollTop &&
        (mainDiv.scrollTop < newArr[i + 1] || i === newArr.length - 1)
      ) {
        tooltabs[i].style.backgroundColor = "#0072C60D";
      } else {
        tooltabs[i].style.backgroundColor = "";
      }
    }
  };

  let hideInputBoxAndActivityList = () => {
    setSearchedVal("");
    if (document.getElementById("userInput_collapsed")) {
      document.getElementById("userInput_collapsed").style.display = "none";
    }
    if (document.getElementById("closeSearchBoxIcon")) {
      document.getElementById("closeSearchBoxIcon").style.display = "none";
    }
    if (document.querySelector("#toolTypeContainerExpanded")) {
      document.querySelector("#toolTypeContainerExpanded").style.display =
        "none";
    }
  };

  let showInputBox = () => {
    document.getElementById("userInput_collapsed").style.display = "block";
    document.getElementById("closeSearchBoxIcon").style.display = "block";
    document.getElementById("userInput_collapsed").focus();
  };

  let displayToolContainer = (evt, toolType, index) => {
    if (!toolMap.has(toolType.title) || expandedView === false) {
      toolMap.set(toolType.title, getToolContainer(evt, toolType, index));
    }
    setToolboxDisplay(toolType.title);
  };

  const handleGtClick = (gt) => {
    const newGtObj = { ...gt.globalTemplateDetails };

    const taskTemplateInfo = {
      m_arrTaskTemplateVarList: newGtObj.m_arrTaskTemplateVarList || [],
      m_bGlobalTemplate: newGtObj.m_bGlobalTemplate || false,
      m_bGlobalTemplateFormCreated:
        newGtObj.m_bGlobalTemplateFormCreated || false,
      m_bCustomFormAssoc: newGtObj.m_bCustomFormAssoc || false,
      m_strTemplateName: newGtObj.m_strTemplateName,
      m_iTemplateId: newGtObj.m_iTemplateId,
    };
    newGtObj["taskGenPropInfo"]["taskTemplateInfo"] = { ...taskTemplateInfo };

    setlocalLoadedActivityPropertyData({ ...newGtObj });
    dispatch(
      selectedTemplate(
        newGtObj?.taskGenPropInfo?.taskTemplateInfo?.m_iTemplateId,
        newGtObj?.taskGenPropInfo?.taskTemplateInfo?.m_strTemplateName,
        TaskType.globalTask,
        getSelectedCellType("TASKTEMPLATE")
      )
    );
    dispatch(showDrawer(true));
  };

  const getGtTools = () => {
    return globalTemplates
      ?.map((gt) => ({
        ...gt,
        icon: taskTemplateIcon,
        title: gt.m_strTemplateName,
        styleName: style.taskTemplate,
        activitySubType: TaskType.globalTask,
      }))
      .map((toolElem, subIndex) => ({
        globalTemplateDetails: { ...toolElem },
        tool: (
          <React.Fragment key={"gt." + subIndex}>
            <Tool
              graph={props.graph}
              title={t(toolElem.title)}
              desc={t(toolElem.description)}
              icon={toolElem.icon}
              styleGraph={toolElem.styleName}
              expandedView={expandedView}
              swimlaneLayer={props.swimlaneLayer}
              milestoneLayer={props.milestoneLayer}
              setProcessData={props.setProcessData}
              activityType={toolElem.activityTypeId}
              activitySubType={toolElem.activitySubTypeId}
              setNewId={props.setNewId}
              caseEnabled={caseEnabled}
              taskTemplateId={toolElem.m_iTemplateId}
              taskTemplateVar={toolElem.m_arrTaskTemplateVarList} // code added on 13 April 2023 for BugId 126775
            />
          </React.Fragment>
        ),
        label: (
          <React.Fragment key={"." + subIndex}>
            <ListItemText
              primary={t(toolElem.title)}
              classes={{ primary: classes.primaryListItemText }}
            />
          </React.Fragment>
        ),
      }));
  };

  let getToolContainer = (evt, toolType, index) => {
    let tools;

    //tools is an array of object
    tools = toolType.tools?.map((toolElem, subIndex) => ({
      tool: (
        <React.Fragment key={index + "." + subIndex}>
          <Tool
            graph={props.graph}
            title={t(toolElem.title)}
            desc={t(toolElem.description)}
            icon={toolElem.icon}
            styleGraph={toolElem.styleName}
            expandedView={expandedView}
            swimlaneLayer={props.swimlaneLayer}
            milestoneLayer={props.milestoneLayer}
            setProcessData={props.setProcessData}
            activityType={toolElem.activityTypeId}
            activitySubType={toolElem.activitySubTypeId}
            setNewId={props.setNewId}
            caseEnabled={caseEnabled}
          />
        </React.Fragment>
      ),
      label: (
        <React.Fragment key={index + "." + subIndex}>
          <ListItemText
            primary={t(toolElem.title)}
            classes={{ primary: classes.primaryListItemText }}
          />
        </React.Fragment>
      ),
    }));

    //set position of toolContainer
    let showFromTop = true;
    let rect = evt.currentTarget.getBoundingClientRect();
    let top =
      rect.top -
      (toolboxContainer.current
        ? toolboxContainer.current.getBoundingClientRect().top
        : 0);

    // added on 21/10/23 for BugId 139410
    if (
      toolboxContainer.current?.getBoundingClientRect().bottom - rect.bottom <=
      26 * tools?.length //DANGER=>1
    ) {
      showFromTop = false;
    }

    //wraps the array using toolContainer wrapper div
    let toolsDiv = (
      <div
        className={
          direction === RTL_DIRECTION ? "toolContainerArabic" : "toolContainer"
        }
        ref={tool}
        style={{
          // modified on 21/10/23 for BugId 139410
          // top: top + "px",
          top: showFromTop ? top + "px" : "unset",
          bottom: !showFromTop ? "3px" : "unset",
        }}
      >
        {/* only tool ,  not label */}
        {tools?.map((eachTool, index1) => (
          <React.Fragment key={index1 + "-" + toolType.tools[index1].title}>
            <div>{eachTool.tool}</div>
            {toolType.title === TASK_TEMPLATES_HEAD && index1 === 1 ? (
              <React.Fragment>
                <Divider
                  variant="fullWidth"
                  style={{ marginTop: ".5rem", height: "2px" }}
                />
                <div style={{ padding: ".525rem" }}>
                  <Grid container direction="column" spacing={1}>
                    <Grid item container>
                      <Grid item>
                        <Typography className={classes.globalTaskheader}>
                          {`${t("global")} ${t("task")} ${t("templates")}`}
                        </Typography>
                      </Grid>
                      <Grid item style={{ marginLeft: "auto" }}>
                        <AddPlusIcon
                          tabIndex={0}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleCreateGlobalTemplate();
                            }
                          }}
                          className={classes.addIcon}
                          onClick={() => handleCreateGlobalTemplate()}
                        />
                      </Grid>
                    </Grid>
                    <div
                      className="globalTempList"
                      style={{
                        overflowY: "auto",
                        maxHeight: "24rem",
                        height: "100%",
                      }}
                    >
                      {getGtTools().map((gt) => (
                        <div
                          key={gt.titlel}
                          onDoubleClick={() => handleGtClick(gt)}
                        >
                          {gt.tool}
                        </div>
                      ))}
                    </div>

                    <Grid item>
                      <Typography
                        className={classes.importExport}
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            setShowModal(true);
                          }
                        }}
                        onClick={() => setShowModal(true)}
                      >
                        {`${t("import")}/${t("export")} ${t("global")} ${t(
                          "task"
                        )} ${t("Template")}`}
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    );

    return { toolsDiv, tools };
  };

  // code added on 12 Dec 2022 for BugId 120293
  const getExtraHeightDiv = () => {
    if (expandedView) {
      if (searchedVal?.trim() === "") {
        return `calc(100vh - 15rem - 30px - ${
          toolTypeList[toolTypeList.length - 1]?.tools?.length * 26 //DANGER=>1
        }px)`;
      } else {
        let searchedTools = [];
        toolTypeList?.forEach((elem) => {
          let newList = [];
          elem?.tools?.forEach((el) => {
            if (
              t(el.title)
                .toUpperCase()
                .includes(searchedVal?.trim()?.toUpperCase())
            ) {
              newList.push(t(el.title));
            }
          });
          if (newList.length > 0) {
            searchedTools = [...newList];
          }
        });
        return `calc(100vh - 15rem - 30px - ${searchedTools?.length * 26}px)`; //DANGER=>1
      }
    } else {
      if (searchedVal?.trim() === "") {
        return `auto`;
      } else {
        let searchedTools = [];
        toolTypeList?.forEach((elem) => {
          let newList = [];
          elem?.tools?.forEach((el) => {
            if (
              t(el.title)
                .toUpperCase()
                .includes(searchedVal?.trim()?.toUpperCase())
            ) {
              newList.push(t(el.title));
            }
          });
          if (newList.length > 0) {
            searchedTools = [...newList];
          }
        });
        return `calc(100vh - 15rem - 30px - ${searchedTools?.length * 26}px)`; //DANGER=>1
      }
    }
  };

  let toolTypeContainer = (
    <div
      className={
        direction === RTL_DIRECTION
          ? "toolTypeContainerArabic"
          : "toolTypeContainer"
      }
    >
      <List className="collapsedList" classes={{ root: classes.rootList }}>
        {!expandedView ? (
          <React.Fragment>
            <div className="toolBoxIconDiv">
              <ListItem
                classes={{
                  root: classes.rootListItem,
                  gutters: null,
                }}
                tabIndex={0}
                // code added on 12 Dec 2022 for BugId 110091
                onMouseEnter={(e) => hideToolContainer(e)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    showInputBox();
                  }
                }}
              >
                <ListItemIcon>
                  <div
                    id="searchActivity_abstractView"
                    className={`toolSearchTab ${
                      expandedView ? "" : "onHoverTabStyle"
                    }`}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <img
                      onClick={() => showInputBox()}
                      className={classes.rootListItemIcon}
                      src={searchIcon}
                      style={{
                        height: "2.5rem",
                        width: "4rem",
                        maxHeight: "2.5rem",
                      }}
                      alt={t("toolbox.search")}
                      id="searchActivityIcon_abstractView"
                    />
                    <span className="iconLabel"></span>
                  </div>
                </ListItemIcon>
              </ListItem>
            </div>
            <div>
              <input
                autoComplete="off"
                aria-label="search activities"
                onKeyUp={() => searchFunc_collapsed(searchedVal)}
                value={searchedVal}
                onChange={(e) => {
                  setSearchedVal(e.target.value);
                }}
                id="userInput_collapsed"
                className={
                  direction === RTL_DIRECTION
                    ? "userInput_collapsedArabic"
                    : "userInput_collapsed"
                }
                type="text"
                style={{
                  padding: "0px 0.25rem",
                }}
                maxLength={"20"}
                // Changes on 12-09-23 to resolve the bug Id 136603
                placeholder={t("SearchActivities")} //code updated on 14 October 2022 for BugId 117095
              />
              <CloseIcon
                onClick={() => hideInputBoxAndActivityList()}
                id="closeSearchBoxIcon"
                className={
                  direction === RTL_DIRECTION
                    ? "closeSearchBoxIconArabic"
                    : "closeSearchBoxIcon"
                }
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    hideInputBoxAndActivityList();
                  }
                }}
              />
              {/* code updated on 17 Nov 2022 for BugId 118748 */}
              {searchedVal?.trim() !== "" ? (
                <ToolsList
                  style={{
                    marginTop: "37px",
                    zIndex: "200", // code added on 29 Nov 2022 for BugId 118749
                  }}
                  innerStyle={{
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 13.5rem)",
                    height: "auto",
                    position: "relative",
                  }}
                  extraDivHeight={getExtraHeightDiv()}
                  view={props.view}
                  toolTypeList={toolTypeList}
                  scrollHandler={() => scrollhandler()}
                  subActivities="subActivities"
                  oneToolList="oneToolList"
                  mainMenu="mainMenu"
                  expandedList="expandedList"
                  toolContainer="toolContainer"
                  toolTypeContainerExpanded="toolTypeContainerExpanded"
                  toolTypeContainerExpandedClass={
                    direction === RTL_DIRECTION
                      ? "toolTypeContainerExpandedArabic"
                      : "toolTypeContainerExpanded"
                  }
                  expandedView={expandedView}
                  setNewId={props.setNewId}
                  setProcessData={props.setProcessData}
                  toolboxDisplay={toolboxDisplay}
                  graph={props.graph}
                  searchedVal={searchedVal}
                  setSearchedVal={setSearchedVal}
                  caseEnabled={caseEnabled}
                  getGtTools={getGtTools}
                  handleGtClick={handleGtClick}
                  handleCreateGlobalTemplate={handleCreateGlobalTemplate}
                  setShowModal={setShowModal}
                />
              ) : null}
            </div>
          </React.Fragment>
        ) : null}
        {/* added on 21/10/23 for BugId 139410 */}
        <div
          style={{
            height: `calc(${windowInnerHeight}px - ${headerHeight} - 5rem)`,
            overflowY: "auto",
            overflowX: "hidden",
            paddingTop: expandedView ? "1rem" : "0rem",
          }}
        >
          {toolTypeList?.map((element, index) => (
            <div id={index}>
              <ListItem
                classes={{
                  root: classes.rootListItem,
                  gutters: null,
                }}
                onMouseEnter={(event) =>
                  displayToolContainer(event, element, index)
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    displayToolContainer(e, element, index);
                    onClickHandler(t(element.title));
                  }
                }}
                tabIndex={0}
                className="iconToolList"
              >
                <ListItemIcon style={{ justifyContent: "center" }}>
                  <div
                    className={`toolTabs ${
                      expandedView ? "" : "onHoverTabStyle"
                    }`}
                    onClick={() => onClickHandler(t(element.title))}
                  >
                    <img
                      className={classes.rootListItemIcon}
                      src={element.icon}
                      alt={t(element.title)}
                    />
                    <span className="iconLabel">{t(element.title)}</span>
                  </div>
                </ListItemIcon>
              </ListItem>
              {toolboxDisplay !== null &&
              toolMap.has(toolboxDisplay) &&
              expandedView === false &&
              toolboxDisplay === element?.title
                ? toolMap.get(toolboxDisplay).toolsDiv
                : null}
            </div>
          ))}
        </div>
        {expandedView ? (
          <ToolsList
            style={{
              marginTop: "0",
              display: "block",
              zIndex: "99", // code added on 29 Nov 2022 for BugId 118749
            }}
            innerStyle={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 13.5rem)",
              height: "calc(100vh - 13.5rem)",
              position: "relative",
            }}
            extraDivHeight={getExtraHeightDiv()}
            view={props.view}
            toolTypeList={toolTypeList}
            scrollHandler={() => scrollhandler()}
            subActivities="subActivities"
            oneToolList="oneToolList"
            mainMenu="mainMenu"
            expandedList="expandedList"
            toolContainer="toolContainer"
            toolTypeContainerExpanded="toolTypeContainerExpanded"
            toolTypeContainerExpandedClass={
              direction === RTL_DIRECTION
                ? "toolTypeContainerExpandedArabic"
                : "toolTypeContainerExpanded"
            }
            expandedView={expandedView}
            setNewId={props.setNewId}
            setProcessData={props.setProcessData}
            toolboxDisplay={toolboxDisplay}
            graph={props.graph}
            searchedVal={searchedVal}
            setSearchedVal={setSearchedVal}
            caseEnabled={caseEnabled}
            getGtTools={getGtTools}
            handleGtClick={handleGtClick}
            handleCreateGlobalTemplate={handleCreateGlobalTemplate}
            setShowModal={setShowModal}
          />
        ) : null}
        <img
          className={
            expandedView
              ? direction === RTL_DIRECTION
                ? "toggleBtnExpandedArabic"
                : "toggleBtnExpanded"
              : direction === RTL_DIRECTION
              ? "toggleBtnCollapsedArabic"
              : "toggleBtnCollapsed"
          }
          src={expandedView ? CollapseIcon : ExpandIcon}
          alt={expandedView ? t("toolbox.collapse") : t("toolbox.expand")}
          // added on 18/10/23 for BugId 139696
          title={expandedView ? t("toolbox.collapse") : t("toolbox.expand")}
          onClick={toggleExpandedView}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              toggleExpandedView();
            }
          }}
        />
      </List>
    </div>
  );

  return (
    <div ref={toolboxContainer} style={props.style}>
      {display ? (
        <React.Fragment>
          {expandedView && (
            <div
              className="searchContainer"
              style={{
                height: "40px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #C4C4C4",
                width: "19.3vw",
                padding: "0.25rem",
              }}
            >
              <div
                style={{
                  border: "1px solid #C4C4C4",
                  height: "2.7rem",
                  display: "flex",
                  alignItems: "center",
                  outline: "0",
                }}
                tabIndex={0}
              >
                <input
                  onKeyUp={() => searchFunc_expanded(searchedVal)}
                  value={searchedVal}
                  aria-label="search activities"
                  onChange={(e) => {
                    setSearchedVal(e.target.value);
                  }}
                  id="userInput_expanded"
                  autoComplete="off"
                  type="text"
                  placeholder={t("SearchActivities")}
                  autoFocus
                  style={{
                    color: "black",
                    border: "none",
                    padding: "0px 0.25rem",
                    outline: "none",
                    width: "100%",
                  }}
                />
                <SearchIcon
                  style={{
                    height: "1.25rem",
                    width: "1.25rem",
                    color: "#767676",
                  }}
                  className={
                    direction === RTL_DIRECTION ? "searchIconArabic" : ""
                  }
                />
              </div>
            </div>
          )}
          {toolTypeContainer}
        </React.Fragment>
      ) : null}

      {isCreateTemplateModalOpen && (
        <CreateGlobalTaskTemplateModal
          isOpen={isCreateTemplateModalOpen}
          handleClose={closeCreateGlobalTemplateModal}
          globalTemplates={globalTemplates}
        />
      )}
      {showModal && (
        <Modal
          show={showModal}
          backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            top: "20%",
            left: "35%", // modified on 12/09/2023 for BugId 136862
            position: "absolute",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
            height: "auto",
            padding: "0", // added on 12/09/2023 for BugId 136862
          }}
          children={<ImportExportGlobalTask setShowModal={setShowModal} />}
        ></Modal>
      )}
    </div>
  );
}

export default Toolbox;
