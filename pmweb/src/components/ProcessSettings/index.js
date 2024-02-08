import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Box,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import IncludeFeature from "./IncludeFeature";
import QueueSwimlanes from "./QueueSwimlanes/QueueSwimlanes";
import TriggerType from "./TriggerType/index";
import { useTranslation } from "react-i18next";
import "./index.css";
import {
  RTL_DIRECTION,
  userRightsMenuNames,
} from "../../Constants/appConstants";
import ProcessProperties from "./ProcessProperties";
import DeployProcess from "../DeployProcess/DeployProcess";
import Templates from "./Templates";
import { connect, useSelector } from "react-redux";
import { UserRightsValue } from "../../redux-store/slices/UserRightsSlice";
import {
  getLocalProjectRights,
  getMenuNameFlag,
} from "../../utility/UserRightsFunctions";
import AuditLogs from "../MainView/AuditLogs/AuditLogs";
import { store, useGlobalState } from "state-pool";
import { LatestVersionOfProcess } from "../../utility/abstarctView/checkLatestVersion";
import { v4 as uuidv4 } from "uuid";

// Function to make TabPanel.
export function TabPanel(props) {
  const { children, value, index, ...other } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${uuidv4()}`}
      // aria-labelledby={`vertical-tab`}
      {...other}
    >
      {value === index && (
        <Box
          style={{
            // height: "100vh",
            textAlign: direction === RTL_DIRECTION ? "right" : "left",
            padding: "0rem",
            minWidth: "4.5rem",
          }}
          p={3}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

// Function used for tabs.
export function tabProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export const useStylesCustom = makeStyles(() => ({
  selectedTab: {
    backgroundColor: "#0072c614",
    fontWeight: "700 !important",
  },
  selectedTabRtl: {
    backgroundColor: "#0072c614",
    fontWeight: "700 !important",
    "& .wrapper": {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      flexDirection: "row",
    },
  },
  flexContainer: {
    "& .wrapper": {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
  },
  flexContainerRtl: {
    "& .wrapper": {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      flexDirection: "row",
    },
  },
  tabs: {
    "& .wrapper": {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
  },
  tabsRtl: {
    "& .wrapper": {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      flexDirection: "row",
    },
  },
  wrapper: {
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  wrapperRtl: {
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
}));

function ProcessSettings(props) {
  const userRightsValue = useSelector(UserRightsValue);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let { t } = useTranslation();
  const { openProcessID, openProcessName, openProcessType } = props;
  const [value, setValue] = useState(0);
  const [propertiesArr, setPropertiesArr] = useState([]);
  const direction = `${t("HTML_DIR")}`;
  const { isReadOnly } = props;
  const classes = useStylesCustom({ direction });
  const [divWidth, setDivWidth] = useState(
    window.innerWidth < 800 ? "16.6vw" : "15vw"
  ); //code added on 25-09-2023 for BugID: 38195

  // Boolean that decides whether include feature tab will be shown or not.
  const includeFeatureFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.includeWindow
  );

  // Boolean that decides whether register template tab will be visible or not.
  const registerTemplateFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.registerTemplate
  );

  // Boolean that decides whether register trigger tab will be visible or not.
  const registerTriggerRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.registerTrigger
  );

  // Boolean that decides whether audit trail tab will be visible or not.
  let auditTrailRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.auditTrail
  );
  if (localLoadedProcessData?.RIGHTS) {
    auditTrailRightsFlag = getMenuNameFlag(
      userRightsValue?.menuRightsList,
      userRightsMenuNames.auditTrail
    )
      ? getLocalProjectRights(localLoadedProcessData?.RIGHTS?.AT)
      : false;
  }

  // Array that contains all the tabs and their labels.
  const arr = [
    {
      label: t("general"),
      component: (
        <ProcessProperties
          openProcessID={openProcessID}
          openProcessName={openProcessName}
          openProcessType={openProcessType}
          isReadOnly={
            isReadOnly ||
            LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
              +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for Bugid 136103
          }
        />
      ),
    },
    {
      label: t("deployProperties"),
      component: (
        <DeployProcess
          deployFrom="Settings"
          isReadOnly={
            isReadOnly ||
            LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
              +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for Bugid 136103
          }
        />
      ),
    },
    {
      label: t("features"),
      component: (
        <IncludeFeature
          openProcessID={openProcessID}
          openProcessName={openProcessName}
          openProcessType={openProcessType}
          isReadOnly={
            isReadOnly ||
            LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
              +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for Bugid 136103
          }
        />
      ),
    },
    {
      label: t("defaultQueues"),
      component: (
        <QueueSwimlanes processType={openProcessType} isReadOnly={isReadOnly} />
      ),
    },
    {
      label: t("templates"),
      component: (
        <Templates
          isReadOnly={
            isReadOnly ||
            LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
              +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for Bugid 136103
          }
        />
      ),
    },
    {
      label: t("triggerType"),
      component: (
        <TriggerType
          isReadOnly={
            isReadOnly ||
            LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
              +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for Bugid 136103
          }
        />
      ),
    },
    {
      label: t("auditLogs"),
      component: (
        <AuditLogs
          // status={localLoadedProcessData.ProcessType}
          // processId={localLoadedProcessData.ProcessDefId}
          // projectId={localLoadedProcessData.ProjectId}
          // version={localLoadedProcessData.VersionNo}
          // processName={localLoadedProcessData.ProcessName}

          readOnly={true}
        />
      ),
    },
  ];

  // Function that runs when the component loads.
  useEffect(() => {
    let tempArr = [...arr];
    if (!includeFeatureFlag) {
      let featureIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("features")) {
          featureIndex = index;
        }
      });
      tempArr.splice(featureIndex, 1);
    }
    if (!registerTemplateFlag) {
      let registerTemplateIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("templates")) {
          registerTemplateIndex = index;
        }
      });
      tempArr.splice(registerTemplateIndex, 1);
    }
    if (!registerTriggerRightsFlag) {
      let registerTriggerIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("triggerType")) {
          registerTriggerIndex = index;
        }
      });
      tempArr.splice(registerTriggerIndex, 1);
    }
    if (!auditTrailRightsFlag || isReadOnly) {
      let auditTrailIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("auditLogs")) {
          auditTrailIndex = index;
        }
      });
      tempArr.splice(auditTrailIndex, 1);
    }
    setPropertiesArr(tempArr);
  }, [
    auditTrailRightsFlag,
    includeFeatureFlag,
    registerTemplateFlag,
    registerTriggerRightsFlag,
    isReadOnly,
  ]);

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  //code added on 25-09-2023 for BugID: 38195
  // UseEffect used to resize the width in responsive mode.
  useEffect(() => {
    const handleResize = () => {
      // Update the width when the window is resized
      setDivWidth(window.innerWidth < 800 ? "16.6vw" : "15vw");
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // till here for BugID: 38195
  return (
    <>
      {localLoadedProcessData === null ? (
        <CircularProgress style={{ marginTop: "40vh", marginLeft: "50%" }} />
      ) : (
        <div
          style={{ display: "flex", flexDirection: "row", height: "91.84vh" }}
        >
          <div
            className="tabs"
            // code edited on 29 April 2022 for BugId 108418
            style={{ width: divWidth, background: "#FFF", marginTop: "4px" }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              style={{ height: "100%" }}
              value={value}
              onChange={handleChange}
            >
              {propertiesArr?.map((tab, index) => (
                <Tab
                  className={
                    direction === "rtl"
                      ? "processSettingTabrtl"
                      : "processSettingTab"
                  }
                  label={t(tab.label)}
                  classes={{
                    selected: classes.selectedTab,
                  }}
                  {...tabProps(index)}
                />
              ))}
            </Tabs>
          </div>
          {/* code edited on 29 April 2022 for BugId 108418 */}
          <div
            style={{
              width: "85vw",
              marginTop: "5px",
              /*Bug 117802 : [08-02-2023] Added background property*/
              background: "#f8f8f8",
            }}
            id="vertical-tab"
          >
            {propertiesArr.map((tabPanel, index) => (
              <TabPanel
                style={{ padding: "0.625rem" }}
                value={value}
                index={index}
              >
                {tabPanel.component}
              </TabPanel>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    openProcessVersion: state.openProcessClick.selectedVersion,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(ProcessSettings);
