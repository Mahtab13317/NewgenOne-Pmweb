// Changes made to solve Bug 113657 - Process Report: Not able to download archived reports in Process report
import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./ProjectReport.css";
import GenrateReport from "./GenrateReport";
import ArchiveReport from "./ArchivedReport";
import arabicStyles from "./ArabicStyles.module.css";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import {
  handleKeyHelp,
  openWebHelpInPmWeb,
} from "../../../AppHeader/AppHeader";
import QuestionMarkIcon from "../../../../assets/HomePage/HS_Question Mark.svg";
import CloseIcon from "@material-ui/icons/Close";
//import FocusTrap from "focus-trap-react";
import { IconButton, Tooltip } from "@material-ui/core";
import { FocusTrap } from "@mui/base";
import { useState } from "react";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-`} /* Added on 7/9/2023 for BUGID: 135862 */
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography id={`scrollable-auto-tab-${index}`}>
            {children}
          </Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#f6f5f5",
  },
  tab: {
    marginRight: "45px",
    padding: "0px",
    fontSize: "20px",
    color: "black",
    minWidth: "0px",
    minHeight: "2.5rem",
    height: "19px",
  },
  tabs: {
    minHeight: "0",
  },
  selectedTab: {
    color: "var(--selected_tab_color)",
    fontWeight: "700 !important",
  },
}));

function ProjectReport(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const generateRef = useRef();
  const archiveRef = useRef();
  const [btnDisable, setBtnDisable] = useState(false); //Added on 26/10/2023, bug_id: 138512

  const tabChangeHandler = (event, newValue) => {
    if (newValue !== undefined) {
      setValue(newValue);
    }
  };

  const changeTab = () => {
    setValue(1);
  };
  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        {
          props.setshowProcessReport(null);
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <FocusTrap open>
      <div>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1vw",
          }}
        >
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.processReport
                : "processReport"
            }
          >
            {t("processReport")}
          </p>
          <div style={{ display: "flex", gap: "0.25vw", alignItems: "center" }}>
            {/* changes on 06-09-2023 to resolve the bug id 134916 */}
            <Tooltip title={t("help")}>
              <IconButton
                onClick={() => openWebHelpInPmWeb("?rhmapno=1409")}
                //  tabIndex={0}
                onKeyDown={(e) => handleKeyHelp(e, "?rhmapno=1409")}
                id="pmweb_processReport_helpIcon"
                disableFocusRipple
                disableTouchRipple
              >
                <img
                  src={QuestionMarkIcon}
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    cursor: "pointer",
                  }}
                  alt="Help"
                  // onClick={() => openWebHelpInPmWeb("?rhmapno=1409")}
                  // tabIndex={0}
                  // onKeyDown={(e) => handleKeyHelp(e, "?rhmapno=1409")}
                  // id="pmweb_processReport_helpIcon"
                />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="CloseIcon"
              id="pmweb_processReport_CloseModalIcon"
              onClick={() => props.setshowProcessReport(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  props.setshowProcessReport(null);
                  e.stopPropagation();
                }
              }}
              disableFocusRipple
              disableTouchRipple
              disabled={btnDisable}
            >
              <CloseIcon
                id="pmweb_processReport_CloseModalIcon"
                onClick={() => props.setshowProcessReport(null)}
                style={{
                  height: "1.25rem",
                  width: "1.25rem",
                  cursor: "pointer",
                }}
              />
            </IconButton>
          </div>
        </div>

        <p className="hrLineProjectCreation" />
        <div
          className={`${classes.root} processSubTab processViewTabsReport`}
          style={{ direction: props.direction }}
        >
          <AppBar
            className="processSubTabBarStyleReport"
            style={{
              boxShadow: "none",
            }}
            position="static"
            color="default"
          >
            <Tabs
              orientation={null}
              value={value}
              onChange={tabChangeHandler}
              border="null"
              className="processViewSubTabsReport"
              classes={{ root: classes.tabs }}
              disabled={btnDisable} //Modified on 26/10/2023, bug_id: 138512
            >
              <Tab
                className="processSubOneTabStyle"
                classes={{
                  root: classes.tab,
                  selected: classes.selectedTab,
                }}
                id="pmweb_projectreport_generatereport_Tab"
                label={t("genrateReport")}
                tabIndex={0}
                ref={generateRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    generateRef.current.click();
                    e.stopPropagation();
                  }
                }}
                disabled={btnDisable} //Modified on 26/10/2023, bug_id: 138512
              />
              <Tab
                className="processSubOneTabStyle"
                classes={{
                  root: classes.tab,
                  selected: classes.selectedTab,
                }}
                id="pmweb_projectreport_generatereport_archivedReport"
                label={t("archivedReport")}
                tabIndex={0}
                ref={archiveRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    archiveRef.current.click();
                    e.stopPropagation();
                  }
                }}
                disabled={btnDisable} //Modified on 26/10/2023, bug_id: 138512
              />
            </Tabs>
          </AppBar>
          <TabPanel
            className="processSubTabContentStyle"
            value={value}
            index={0}
            id={`scrollable-auto-tab-`} /* Added on 7/9/2023 for BUGID: 135862 */
          >
            <GenrateReport
              setShowModal={props.setshowProcessReport}
              openProcessType={props.openProcessType}
              changeTab={changeTab}
              onKeyChangeTab={(e) => {
                if (e.key === "Enter") {
                  changeTab();
                  e.stopPropagation();
                }
              }}
              setBtnDisable={setBtnDisable} //Modified on 26/10/2023, bug_id: 138512
            />
          </TabPanel>
          <TabPanel
            className="processSubTabContentStyle"
            value={value}
            index={1}
            id={`scrollable-auto-tab-`} /* Added on 7/9/2023 for BUGID: 135862 */
          >
            <ArchiveReport setShowModal={props.setshowProcessReport} />
          </TabPanel>
        </div>
      </div>
    </FocusTrap>
  );
}

export default ProjectReport;
