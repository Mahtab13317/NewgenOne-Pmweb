// #BugID - 125171
// #BugDescription -  Fixed the issue Without for assignment of pmweb menu rights the user is getting all the access for the same and able to peroform operation

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "../../UI/Modal/Modal.js";
import { connect, useDispatch, useSelector } from "react-redux";
import * as actionCreators from "../../redux-store/actions/processView/actions.js";
import ProjectCreation from "../MainView/ProcessesView/Projects/ProjectCreation.js";
import {
  CREATE_PROCESS_FLAG_FROM_PROCESS,
  PREVIOUS_PAGE_CREATE_FROM_NO_PROCESS,
  PREVIOUS_PAGE_CREATE_FROM_PROCESSES,
  PREVIOUS_PAGE_CREATE_FROM_TEMPLATE,
  PREVIOUS_PAGE_GRID,
  PREVIOUS_PAGE_LIST,
  PREVIOUS_PAGE_NO_PROCESS,
  PREVIOUS_PAGE_PROCESS,
  RTL_DIRECTION,
  userRightsMenuNames,
} from "../../Constants/appConstants.js";
import * as actionCreators_template from "../../redux-store/actions/Template";
import {
  previousProcessPageVal,
  setPreviousProcessPage,
} from "../../redux-store/slices/storeProcessPage.js";
import { getMenuNameFlag } from "../../utility/UserRightsFunctions/index.js";
import { UserRightsValue } from "../../redux-store/slices/UserRightsSlice.js";
import { MenuItem, MenuList } from "@material-ui/core";
// import FocusTrap from "focus-trap-react";
// import { Modal } from "@mui/material";
import { FocusTrap } from "@mui/base";
import { brandDetailsValue } from "../../redux-store/slices/brandDetails/brandDetailsSlice.js";

const useStyles = makeStyles((theme) => ({
  drawerClose: {
    overflowX: "hidden",
    height: "100%",
    width: "5.2vw",
    "@media (min-width: 1920px)": {
      width: "3vw",
    },
    "@media (min-width: 1400px) and (max-width: 1919px)": {
      width: "4vw",
    },
    "@media (min-width: 1080px) and (max-width: 1399px)": {
      width: "4.7vw",
    },
    "@media (min-width: 600px) and (max-width: 1079px)": {
      width: "8.5vw",
    },
    backgroundColor: `var(--nav_primary_color)`,
    color: "var(--nav_secondary_color)",
    // marginTop: `${APP_HEADER_HEIGHT}`,
    position: "relative",
    zIndex: 0,
  },
  rootListItem: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "1rem !important",
    paddingBottom: "1rem !important",
    marginTop: "0",
    marginBottom: "0",
    borderLeft: "0.25rem solid transparent",
  },
  selectedListItem: {
    backgroundColor: "#606060 !important", // code edited on 2 March 2023 for BugId 121591 - On the Selection of the left navigation tab, an orange line would be coming at the left side of the tab not completely filled
    borderLeft: "0.25rem solid var(--brand_color1) !important",
  },
  guttersListItem: {
    paddingLeft: "0",
    paddingRight: "0.25rem",
    position: "relative",
    "&:hover": {
      backgroundColor: "#606060 !important",
    },
  },
  rootListItemIcon: {
    justifyContent: "center",
    marginBottom: "0 !important",
  },
  rootListItemImg: {
    width: "2rem",
    height: "2rem",
  },
  createItemImg: {
    width: "3rem",
    height: "3rem",
    backgroundColor: "var(--brand_color1)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    borderRadius: "50%",
  },
  rootListItemIconNoCaption: {
    justifyContent: "center",
    padding: "0.25rem",
    height: "4rem",
  },
  selectedItemText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "var(--font_family)",
    fontSize: "var(--sub_text_font_size)",
    fontWeight: "500", // code edited on 2 March 2023 for BugId 121591 - selected tab text should be semi-bold
  },
  primaryText: {
    color: "#D3D3D3",
    fontSize: "var(--sub_text_font_size)",
    textAlign: "center",
    fontFamily: "var(--font_family)",
    fontWeight: "400", // code edited on 2 March 2023 for BugId 121591 - non-selected tab text should be regular
  },
  popup: {
    top: "0.5rem",
    color: "rgba(0, 0, 0, 0.87)",
    left: (props) => (props.direction === RTL_DIRECTION ? "unset" : "5.2vw"),
    right: (props) => (props.direction === RTL_DIRECTION ? "5.2vw" : "unset"),
    "@media (min-width: 1920px)": {
      left: (props) => (props.direction === RTL_DIRECTION ? "unset" : "3vw"),
      right: (props) => (props.direction === RTL_DIRECTION ? "3vw" : "unset"),
    },
    "@media (min-width: 1400px) and (max-width: 1919px)": {
      left: (props) => (props.direction === RTL_DIRECTION ? "unset" : "4vw"),
      right: (props) => (props.direction === RTL_DIRECTION ? "4vw" : "unset"),
    },
    "@media (min-width: 1080px) and (max-width: 1399px)": {
      left: (props) => (props.direction === RTL_DIRECTION ? "unset" : "4.7vw"),
      right: (props) => (props.direction === RTL_DIRECTION ? "4.7vw" : "unset"),
    },
    "@media (min-width: 600px) and (max-width: 1079px)": {
      left: (props) => (props.direction === RTL_DIRECTION ? "unset" : "8.5vw"),
      right: (props) => (props.direction === RTL_DIRECTION ? "8.5vw" : "unset"),
    },
    position: "absolute",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "1px 0px 12px #00000080",
    border: "1px solid #CFCFCF",
    borderRadius: "1px",
    padding: "0.25vw",
    width: "10rem",
    zIndex: 100,
  },
  subPopup: {
    fontSize: "12px",
    fontFamily: "Open Sans",
    textTransform: "capitalize",
    display: "flex",
    textAlign: "start",
    letterSpacing: "0px",
    color: "#000000",
    padding: "5px 9px",
    "&:hover": {
      background: "rgba(0, 0, 0, 0.04) !important",
      fontWeight: "500",
    },
    background: "#FFFFFF 0% 0% no-repeat padding-box",
  },
  drawerList: {
    paddingTop: "0",
    paddingBottom: "0",
    minHeight: "19rem",
    height: "100%",
    overflow: "auto",
    overflowX: "hidden",
  },
  navBarFooter: {
    position: "absolute",
    bottom: "0",
    width: "100%",
    background: "#222222 0% 0% no-repeat padding-box",
    boxShadow: "0px 3px 6px #ffffffa3",
    padding: "0.5rem 0",
    fontSize: "var(--title_text_font_size)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  poweredStr: {
    textAlign: "center",
    font: "normal normal normal var(--sub_text_font_size)/var(--subtitle_text_font_size) Open Sans",
    letterSpacing: "0px",
    color: "#C4C4C4",
  },
}));

function NavigationPanel(props) {
  //t is our translation function
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const userRightsValue = useSelector(UserRightsValue);
  const classes = useStyles({ direction });
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const previousProcessPage = useSelector(previousProcessPageVal);
  const [navList, setNavList] = useState([]);
  const brandDetails = useSelector(brandDetailsValue);

  props.selectedTabAtNavPanel(props.selectedNavigation); //sent selected Tab at Navigation panel to Redux Store

  if (props.clickedProcessTile) {
    props.setSelection("navigationPanel.processes");
  } else if (
    props.getTemplatePage === PREVIOUS_PAGE_LIST ||
    props.getTemplatePage === PREVIOUS_PAGE_GRID ||
    props.getTemplatePage === PREVIOUS_PAGE_CREATE_FROM_TEMPLATE
  ) {
    props.setSelection("navigationPanel.templates");
  } else if (
    props.getTemplatePage === PREVIOUS_PAGE_CREATE_FROM_NO_PROCESS ||
    props.getTemplatePage === PREVIOUS_PAGE_NO_PROCESS ||
    props.getTemplatePage === PREVIOUS_PAGE_PROCESS ||
    props.getTemplatePage === PREVIOUS_PAGE_CREATE_FROM_PROCESSES ||
    previousProcessPage?.previousProcessPage === PREVIOUS_PAGE_PROCESS // code added on 30 Nov 2022 for BugId 119488
  ) {
    props.setSelection("navigationPanel.processes");
  }

  // Boolean that decides whether audit trail tab will be visible or not.
  let auditTrailRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.auditTrail
  );

  // Boolean that decides whether create project button will be visible or not.
  const createProjectRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProject
  );

  // Boolean that decides whether create process button will be visible or not.
  const createProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProcess
  );
  useEffect(() => {
    document.addEventListener("keydown", logKeyDown);
    return () => {
      document.removeEventListener("keydown", logKeyDown);
    };
  }, []);

  const logKeyDown = (event) => {
    if (event.keyCode === 27) {
      // Check if Escape key w  as pressed
      // Call the close function passed as a prop
      setShowPopup(false);
    }
  };

  useEffect(() => {
    let tempArr = [...props.icons];

    if (!auditTrailRightsFlag) {
      let auditTrailIndex;
      tempArr.forEach((element, index) => {
        if (element.default === "Audit Log") {
          auditTrailIndex = index;
        }
      });

      tempArr.splice(auditTrailIndex, 1);
    }

    if (!createProjectRightsFlag && !createProcessRightsFlag) {
      let projectIndex;
      tempArr.forEach((element, index) => {
        if (element.default === "Create") {
          projectIndex = index;
        }
      });

      tempArr.splice(projectIndex, 1);
    }

    setNavList(tempArr);
  }, [auditTrailRightsFlag, createProjectRightsFlag, createProcessRightsFlag]);

  let iconDisplay = navList.map((element, index) => (
    <>
      <ListItem
        button
        // disabled={element.default === t("Create")}
        classes={{
          root: classes.rootListItem,
          selected: classes.selectedListItem,
          gutters: classes.guttersListItem,
        }}
        key={element.langKey}
        id={`pmweb_NavigationPanel_${index}`}
        //  id= {navList.indexOf(element.default)}
        selected={props.selectedNavigation === element.langKey}
        onClick={() => {
          if (t(element.default) === t("Create")) setShowPopup(true);
          else {
            props.setTemplatePage(null);
            props.setTemplateDetails(
              null,
              null,
              false,
              null,
              null,
              false,
              "",
              []
            );
            // code added on 30 Nov 2022 for BugId 119488
            dispatch(
              setPreviousProcessPage({
                projectId: null,
                previousProcessPage: null,
                tabType: null,
                clickedTile: null,
                clickedTileIndex: null,
                clickedTileCount: null,
              })
            );
            props.setClickedProcessTile(null);
            props.setSelection(element.langKey);
          }
        }}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            t(element.default) === t("Create") &&
            index === 0
          ) {
            setShowPopup(true);
          } else {
            setShowPopup(false);
          }
        }}
        onMouseEnter={() => {
          if (t(element.default) === t("Create")) setShowPopup(true);
          else setShowPopup(false);
        }}
      >
        <ListItemIcon
          classes={{
            root: element.noCaption
              ? classes.rootListItemIconNoCaption
              : classes.rootListItemIcon,
          }}
          id={`pmweb_NavigationPanel_${index}_icon`}
        >
          {/* changes on 07-09-2023 to resolve the bug Id 135114 */}
          {t(element.default) === t("Create") ? (
            <div className={classes.createItemImg}>+</div>
          ) : props.selectedNavigation === element.langKey ? (
            <img
              src={element.selectedIcon}
              alt="icon"
              className={element.noCaption ? null : classes.rootListItemImg}
            />
          ) : (
            <img
              src={element.icon}
              alt="icon"
              className={element.noCaption ? null : classes.rootListItemImg}
            />
          )}
        </ListItemIcon>
        {!element.noCaption ? (
          <span
            className={
              props.selectedNavigation === element.langKey
                ? classes.selectedItemText
                : classes.primaryText
            }
            id={`pmweb_NavigationPanel_${index}_caption`}
          >
            {t(element.langKey, element.default)}
          </span>
        ) : null}
      </ListItem>
      {/* {showPopup && createProjectRightsFlag? (
      // <FocusTrap>
        <div className={classes.popup} >
          <Button
            className={`${classes.subPopup} non-button`}
            id="pmweb_create_Project"
            onClick={() => {
              setShowModal("Project");
              setShowPopup(false);
            }}
            role="button"
            aria-description="Create Project Button"
            autoFocus={true}
          >
            {t("createProject")}
          </Button>
          {createProcessRightsFlag ? (
            <Button
              className={`${classes.subPopup} non-button`}
              id="pmweb_create_Process"
              onClick={() => {
                props.CreateProcessClickFlag(
                  CREATE_PROCESS_FLAG_FROM_PROCESS
                );
                props.setSelectedProject(null, null);
              }}
            >
              {t("CreateProcess")}
            </Button>
          ) : null}
        </div>
      // </FocusTrap>
    ) : null} */}
    </>
  ));

  return (
    <div onMouseLeave={() => setShowPopup(false)}>
      <Drawer
        variant="permanent"
        className={classes.drawerClose}
        anchor={direction === RTL_DIRECTION ? "right" : "left"}
        classes={{
          paper: classes.drawerClose,
        }}
      >
        <List className={classes.drawerList}>{iconDisplay}</List>
        {brandDetails?.poweredByIcon && (
          <div className={classes.navBarFooter}>
            <p className={classes.poweredStr}>{t("PoweredBy")}</p>
            <img
              src={brandDetails?.poweredByIcon}
              alt={t("Newgen")}
              style={{
                maxHeight: "15px",
                maxWidth: "58px",
                filter:
                  "invert(94%) sepia(6%) saturate(0%) hue-rotate(79deg) brightness(105%) contrast(106%)",
              }}
            />
          </div>
        )}
      </Drawer>

      {showPopup && createProjectRightsFlag ? (
        //Added on 23-08-2023 for BUGID: 134082
        <FocusTrap open>
          <MenuList className={classes.popup}>
            <MenuItem
              className={`${classes.subPopup} non-button`}
              style={{ backgroundColor: "white", display: "flex" }}
              id="pmweb_create_Project"
              onClick={() => {
                setShowModal("Project");
                setShowPopup(false);
              }}
              role="button"
              aria-description="Create Project Button"
              // autoFocus={true}
            >
              {t("createProject")}
            </MenuItem>

            {createProcessRightsFlag ? (
              <MenuItem
                className={`${classes.subPopup} non-button`}
                style={{ backgroundColor: "white", display: "flex" }}
                id="pmweb_create_Process"
                onClick={() => {
                  props.CreateProcessClickFlag(
                    CREATE_PROCESS_FLAG_FROM_PROCESS
                  );
                  props.setSelectedProject(null, null);
                }}
              >
                {t("CreateProcess")}
              </MenuItem>
            ) : null}
          </MenuList>
        </FocusTrap>
      ) : null}

      {showModal === "Project" && (
        <Modal
          show={showModal !== null}
          style={{
            width: "30vw",
            left: "50%",
            top: "50%",
            padding: "0",
            transform: "translate(-50%, -50%)",
          }}
          modalClosed={() => setShowModal(null)}
          children={<ProjectCreation setShowModal={setShowModal} />}
        />
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectedTabAtNavPanel: (selectedTab) =>
      dispatch(actionCreators.selectedTab_AtNavPanel(selectedTab)),
    setClickedProcessTile: (processTile) =>
      dispatch(actionCreators.clickedProcessTile(processTile)),
    CreateProcessClickFlag: (flag) =>
      dispatch(actionCreators.createProcessFlag(flag)),
    setSelectedProject: (id, name) => {
      dispatch(actionCreators.selectedProject(id, name));
    },
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
    setTemplateDetails: (category, view, createBtnClick, template) =>
      dispatch(
        actionCreators_template.setTemplateDetails(
          category,
          view,
          createBtnClick,
          template
        )
      ),
  };
};

const mapStateToProps = (state) => {
  return {
    clickedProcessTile: state.clickedProcessTileReducer.selectedProcessTile,
    getTemplatePage: state.templateReducer.template_page,
  };
};

// const replaceDotToUnderScore = (str) => {
//   return str.replaceAll(".", "_");
// };

export default connect(mapStateToProps, mapDispatchToProps)(NavigationPanel);
