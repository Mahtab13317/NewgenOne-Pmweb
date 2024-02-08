import React from "react";
import { useTranslation } from "react-i18next";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import "./Toolbox.css";
import Tool from "./Tool";
import SearchIcon from "@material-ui/icons/Search";
import { makeStyles } from "@material-ui/core/styles";
import { searchFunc_expanded } from "../../../../utility/bpmnView/searchFunction_expanded";
import { useEffect } from "react";
import { TASK_TEMPLATES_HEAD } from "../../../../Constants/bpmnView";
import { Divider, Grid, Typography } from "@material-ui/core";
import { AddPlusIcon } from "../../../../utility/AllImages/AllImages";
let uniqueClass = [
  "_a11",
  "_b22",
  "_c33",
  "_d44",
  "_e55",
  "_f66",
  "_g77",
  "_h88",
];

const useStyles = makeStyles({
  rootList: {
    width: "100%",
    justifyContent: "space-around",
  },
  rootListItem: {
    marginTop: "2px",
    marginBottom: "2px",
    height: "30px",
    padding: "0 0.5vw",
  },
  rootToolListItemInExpandedView: {
    width: "100%",
    padding: "0 !important",
    "& img": {
      width: "15px",
      height: "15px",
      opacity: "1 !important",
    },
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
  selectedListItem: {
    backgroundColor: "#0072C60D !important",
  },
});

function ToolsList(props) {
  const classes = useStyles();
  let { t } = useTranslation();
  let toolMap = new Map();
  let toolTypeList = props.toolTypeList;
  const {
    getGtTools,
    handleGtClick,
    handleCreateGlobalTemplate,
    setShowModal,
  } = props;

  // code updated on 17 Nov 2022 for BugId 118748
  useEffect(() => {
    toolMap.clear();
  }, [props.expandedView, props.searchedVal, props.toolTypeList]);

  for (let itr of toolTypeList) {
    if (!itr.show || itr.show != "0") {
      let tools = itr.tools?.map((toolElem) => ({
        tool: (
          <Tool
            showToolTip={props.showToolTip}
            expandedView={props.expandedView}
            graph={props.graph}
            title={t(toolElem.title)}
            icon={toolElem.icon}
            styleGraph={toolElem.styleName}
            swimlaneLayer={props.swimlaneLayer}
            milestoneLayer={props.milestoneLayer}
            setProcessData={props.setProcessData}
            activityType={toolElem.activityTypeId}
            activitySubType={toolElem.activitySubTypeId}
            setNewId={props.setNewId}
            view={props.view}
            searchedVal={props.searchedVal}
            caseEnabled={props.caseEnabled}
          />
        ),
        label: toolElem.styleName,
        activityId: toolElem.activityTypeId,
        activitySubId: toolElem.activitySubTypeId,
      }));
      let toolsDiv = (
        <div className={props.toolContainer}>
          {tools?.map((eachTool, index) => (
            <div>{eachTool.tool}</div>
          ))}
        </div>
      );
      if (!toolMap.has(itr.title)) {
        toolMap.set(itr.title, { tools, toolsDiv });
      }
    }
  }

  return (
    <div
      id={props.toolTypeContainerExpanded}
      className={props.toolTypeContainerExpandedClass}
      style={props.style}
    >
      <List className={props.expandedList}>
        {props.search ? (
          <div
            style={{
              border: "1px solid #C4C4C4",
              width: "95%",
              height: "var(--line_height)", // code edited on 29 August 2022 for BugId 114896
              display: "flex",
              alignItems: "center",
              margin: "0 2.5% 0.5rem", // code edited on 29 August 2022 for BugId 114896
            }}
          >
            {/*code edited on 3 June 2022 for BugId 110210 */}
            <input
              onKeyUp={() => searchFunc_expanded(props.searchedVal)}
              id="userInput_expanded"
              value={props.searchedVal}
              onChange={(e) => props.setSearchedVal(e.target.value)}
              autoComplete="off"
              type="text"
              placeholder="Search"
              style={{
                color: "black",
                border: "none",
                outline: "none",
                flexGrow: "1",
                width: "100%",
              }}
            />
            <SearchIcon
              // code edited on 29 August 2022 for BugId 114896
              style={{ height: "1.25rem", width: "1.25rem", margin: "0 0.5vw" }}
            />
          </div>
        ) : null}
        <div
          className={props.innerList}
          id="expandedToolBox_ActList"
          style={props.innerStyle}
          onScroll={props.scrollHandler}
        >
          {toolTypeList?.map((element, index) =>
            !element.show || element.show != "0" ? (
              <div id={t(element.title)}>
                <ListItem
                  button
                  id={index}
                  tabIndex={-1}
                  className={`mainMenuHeading ${props.mainMenu} ${uniqueClass[index]}`}
                  classes={{
                    root: classes.rootListItem,
                    selected: classes.selectedListItem,
                    gutters: classes.listItemGutters,
                  }}
                  selected={props.toolboxDisplay === element.title}
                >
                  <span
                    className={`${props.mainMenu} ${uniqueClass[index]} tooltypeHeading`}
                    id={index}
                  >
                    {t(element.title)}
                  </span>
                </ListItem>
                <List
                  className={props.oneToolList}
                  classes={{ root: classes.rootList }}
                >
                  {toolMap
                    .get(element.title)
                    ?.tools?.map((eachTool, index1) => (
                      <ListItem
                        onClick={() => {
                          if (props.bFromActivitySelection)
                            props.selectedActivityName(
                              eachTool.activityId,
                              eachTool.activitySubId
                            );
                        }}
                        className={`${props.subActivities} ${uniqueClass[index]}`}
                        key={index1}
                        classes={{
                          root: classes.rootToolListItemInExpandedView,
                          gutters: props.expandedView
                            ? classes.listItemGutters
                            : null,
                        }}
                      >
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            width: "100%",
                          }}
                        >
                          {eachTool.tool}
                        </p>
                      </ListItem>
                    ))}
                  {element.title === TASK_TEMPLATES_HEAD &&
                  !props.bFromActivitySelection ? (
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
                                {`${t("global")} ${t("task")} ${t(
                                  "templates"
                                )}`}
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
                          <div>
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
                              onClick={() => setShowModal(true)}
                              tabIndex={0}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  setShowModal(true);
                                }
                              }}
                            >
                              {`${t("import")}/${t("export")} ${t(
                                "global"
                              )} ${t("task")} ${t("Template")}`}
                            </Typography>
                          </Grid>
                        </Grid>
                      </div>
                    </React.Fragment>
                  ) : null}
                </List>
              </div>
            ) : null
          )}
          {/* This is to add extra white space in scrolling List */}
          {props.bFromActivitySelection ? null : (
            <div style={{ height: props.extraDivHeight }}></div>
          )}
        </div>
      </List>
    </div>
  );
}
export default ToolsList;
