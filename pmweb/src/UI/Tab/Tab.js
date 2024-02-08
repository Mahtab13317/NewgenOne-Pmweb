// #BugID - 122318
// #BugDescription - Design issue fixed for workdesk exception.
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { ReplaceSpaceToUnderScore } from "../../utility/ReplaceChar";
import { v4 as uuidv4 } from "uuid";
function TabPanel(props) {
  const { children, value, TabNames, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        //Bug 138355 - Added height in both Box and Typography
        <Box p={3} style={{ height: "95%" }}>
          <Typography style={{ height: "100%" }}>{children}</Typography>
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
    color: "#606060",
    minWidth: "0px",
    minHeight: "2.5rem",
    height: "19px",
  },
  tabs: {
    minHeight: "0",
  },
  selectedTab: {
    color: "#000000", //changes made for contrast issue
    fontWeight: "600 !important",
  },

  //Bug 110243 Process listing displayed for projects, the Background color should be white as per design wireframe
  //[09-02-2023] Corrected the screen
  selectedTab2: {
    color: "var(--selected_tab_color) !important",
    fontWeight: "600 !important",
    border: "1px solid #0072C6 !important",
    background: "#0072C627 0% 0% no-repeat padding-box !important",
  },
  hideIndicator: {
    display: "none",
  },
}));

export default function ScrollableTabsButtonAuto(props) {
  const { calledFrom } = props;
  const classes = useStyles();
  const [value, setValue] = React.useState(
    props.defaultTabValue !== undefined && props.defaultTabValue !== null
      ? props.defaultTabValue
      : 0
  );

  const tabChangeHandler = (event, newValue) => {
    if (newValue !== undefined) {
      setValue(newValue);

      /*Bug 123919 - safari>>email>>getting error in saving email property
      [27-03-2023] */
      if (props.onTabChange) {
        props.onTabChange(newValue);
      }
    }
  };

  //set default value of tabs, if any
  useEffect(() => {
    if (props.defaultTabValue !== undefined && props.defaultTabValue !== null) {
      setValue(props.defaultTabValue);
    }
  }, [props.defaultTabValue]);

  //update value of selected tab to parent
  useEffect(() => {
    if (props.setValue) {
      props.setValue(value);
    }
  }, [value]);
  console.log(props.TabNames, "zxcv");
  return (
    <div
      className={`${classes.root} ${props.tabType} ${props.tabStyling} tabStyling`}
      style={{ direction: props.direction }}
    >
      <AppBar
        className={`${props.tabBarStyle} ${props?.tabLength}`}
        style={{
          boxShadow: "none",
        }}
        position="static"
        //Bug 110243 Process listing displayed for projects, the Background color should be white as per design wireframe
        //[09-02-2023] Corrected the screen
        color={props.tabBarColor ? props.tabBarColor : "default"}
      >
        {console.log(value, "tex")}
        <Tabs
          orientation={props.orientation ? props.orientation : null}
          value={value}
          onChange={tabChangeHandler}
          // id={`pmweb_${value}`}
          border="null"
          className={props.tabsStyle}
          classes={{
            root: classes.tabs,
            indicator: props.hideIndicator ? classes.hideIndicator : "",
          }}
          variant="scrollable"
          //Bug 110243 Process listing displayed for projects, the Background color should be white as per design wireframe
          //[09-02-2023] Corrected the screen
          style={{ backgroundColor: props.tabBarColor, ...props.tabListStyle }} // code edited on 5 April 2023 for BugId 112610
        >
          {props.TabNames
            ? props.TabNames.map((tabName, index) => {
                return (
                  <Tab
                    className={props.oneTabStyle}
                    classes={{
                      root: classes.tab,

                      //Bug 110243 Process listing displayed for projects, the Background color should be white as per design wireframe
                      //[09-02-2023] Corrected the screen
                      selected: props.customsSelectedTabStyle
                        ? classes.selectedTab2
                        : classes.selectedTab,
                    }}
                    label={tabName}
                    tabIndex={0}
                    id={
                      calledFrom === "Properties"
                        ? `pmweb_${calledFrom}_${index}`
                        : `pmweb_${tabName}`
                    }
                    role="tab"
                    aria-label={`${tabName}`}
                  />
                );
              })
            : null}
        </Tabs>
      </AppBar>
      {props.TabElement
        ? props.TabElement.map((element, i) => {
            return (
              <TabPanel
                className={props.tabContentStyle}
                value={value}
                index={i}
              >
                {element}
              </TabPanel>
            );
          })
        : null}
    </div>
  );
}
